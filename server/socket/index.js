const { Message, Channel, Server, User } = require('../models');
const { verifySocketToken } = require('../middleware/auth');
const webpush = require('web-push');
const { getSubscriptions, removeSubscription } = require('../storage/pushSubscriptions');

// Configure VAPID once
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@chatspark.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Store online users: Map<socketId, { userId, user }>
const onlineUsers = new Map();
// Store user sockets: Map<userId, Set<socketId>>
const userSockets = new Map();
// Store typing users: Map<channelId, Set<userId>>
const typingUsers = new Map();

const getServerId = (serverRef) => {
  if (!serverRef) return null;
  if (typeof serverRef === 'string') return serverRef;
  return serverRef._id || serverRef.id || null;
};

const initializeSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const user = await verifySocketToken(token);
      
      if (!user) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.username} (${socket.id})`);

    // Add to online users
    onlineUsers.set(socket.id, { userId: user._id.toString(), user });
    
    // Track user sockets
    if (!userSockets.has(user._id.toString())) {
      userSockets.set(user._id.toString(), new Set());
    }
    userSockets.get(user._id.toString()).add(socket.id);

    // Update user status to online
    try {
      const currentUser = await User.findById(user._id);
      if (currentUser) {
        currentUser.status = 'online';
        await currentUser.save();
      }
    } catch (error) {
      console.error(`Error updating user status for ${user.username}:`, error.message);
      // Continue even if status update fails
    }

    // Join user's server rooms
    const userWithServers = await User.findById(user._id);
    const serverRefs = Array.isArray(userWithServers?.servers) ? userWithServers.servers : [];
    serverRefs.forEach((serverRef) => {
      const serverId = getServerId(serverRef);
      if (serverId) socket.join(`server:${serverId}`);
    });

    // Broadcast user online status to all servers
    serverRefs.forEach((serverRef) => {
      const serverId = getServerId(serverRef);
      if (!serverId) return;
      socket.to(`server:${serverId}`).emit('user:online', {
        userId: user._id,
        username: user.username,
        status: 'online'
      });
    });

    // Join a specific channel - verify user is a member of the server
    socket.on('channel:join', async (channelId) => {
      try {
        const channel = await Channel.findById(channelId);
        if (!channel) return;

        // Get the server that owns this channel
        const server = await Server.findById(channel.server);
        if (!server) return;

        // Check if user is a member of this server
        const isMember = server.members.some(
          m => m.user.toString() === user._id.toString()
        );

        if (!isMember) {
          console.log(`${user.username} denied access to channel: ${channelId} (not a server member)`);
          return;
        }

        socket.join(`channel:${channelId}`);
        console.log(`${user.username} joined channel: ${channelId}`);
      } catch (error) {
        console.error('Error joining channel:', error);
      }
    });

    // Leave a channel
    socket.on('channel:leave', (channelId) => {
      socket.leave(`channel:${channelId}`);
      
      // Remove from typing users
      if (typingUsers.has(channelId)) {
        typingUsers.get(channelId).delete(user._id.toString());
        io.to(`channel:${channelId}`).emit('typing:update', {
          channelId,
          users: Array.from(typingUsers.get(channelId))
        });
      }
    });

    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { channelId, content } = data;
        console.log('[Socket] Received message:send', { channelId, content, user: user.username });

        if (!content || !content.trim()) return;

        const channel = await Channel.findById(channelId);
        if (!channel) return;

        const server = await Server.findById(channel.server);
        
        // Check if user is a member
        const member = server.members.find(
          m => m.user.toString() === user._id.toString()
        );

        if (!member) return;

        // Check write permission
        if (!channel.permissions.write.includes(member.role)) return;

        // Create message
        const message = new Message({
          content: content.trim(),
          author: user._id,
          channel: channelId,
          server: channel.server
        });
        await message.save();

        // Create a message object with populated author
        const messageWithAuthor = {
          _id: message._id,
          content: message.content,
          author: {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            status: user.status
          },
          channel: message.channel,
          server: message.server,
          attachments: message.attachments,
          edited: message.edited,
          editedAt: message.editedAt,
          deleted: message.deleted,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        };

        console.log('[Socket] Message created:', message._id, 'in channel:', channelId, 'by:', user.username);

        // Remove user from typing
        if (typingUsers.has(channelId)) {
          typingUsers.get(channelId).delete(user._id.toString());
        }

        // Emit message to all users in the channel
        io.to(`channel:${channelId}`).emit('message:new', messageWithAuthor);

        // Update typing status
        io.to(`channel:${channelId}`).emit('typing:update', {
          channelId,
          users: typingUsers.has(channelId) ? Array.from(typingUsers.get(channelId)) : []
        });

        // Send push notifications to ALL server members (let SW suppress if app is focused)
        if (process.env.VAPID_PUBLIC_KEY) {
          const offlineMembers = server.members.filter(m => {
            const memberId = m.user.toString();
            if (memberId === user._id.toString()) return false; // skip sender
            return true; // send to everyone else — SW suppresses if app is open & focused
          });

          for (const member of offlineMembers) {
            const subs = getSubscriptions(member.user.toString());
            for (const sub of subs) {
              webpush.sendNotification(sub, JSON.stringify({
                title: `#${channel.name} — ${server.name}`,
                body: `${user.username}: ${content.trim().slice(0, 100)}`,
                channelId,
                url: '/channels/@me'
              })).catch(err => {
                // Subscription expired — clean it up
                if (err.statusCode === 410) removeSubscription(member.user.toString(), sub.endpoint);
              });
            }
          }
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Handle message delete
    socket.on('message:delete', async (messageId) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        // Check if user is the author or server admin
        const server = await Server.findById(message.server);
        const member = server.members.find(
          m => m.user.toString() === user._id.toString()
        );

        const isAuthor = message.author.toString() === user._id.toString();
        const isAdmin = member && ['owner', 'admin'].includes(member.role);

        if (!isAuthor && !isAdmin) return;

        message.deleted = true;
        await message.save();

        io.to(`channel:${message.channel}`).emit('message:deleted', {
          messageId,
          channelId: message.channel
        });

      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (channelId) => {
      if (!typingUsers.has(channelId)) {
        typingUsers.set(channelId, new Set());
      }
      typingUsers.get(channelId).add(user._id.toString());

      socket.to(`channel:${channelId}`).emit('typing:update', {
        channelId,
        users: Array.from(typingUsers.get(channelId))
      });
    });

    socket.on('typing:stop', (channelId) => {
      if (typingUsers.has(channelId)) {
        typingUsers.get(channelId).delete(user._id.toString());

        socket.to(`channel:${channelId}`).emit('typing:update', {
          channelId,
          users: Array.from(typingUsers.get(channelId))
        });
      }
    });

    // Handle status update
    socket.on('status:update', async (status) => {
      if (!['online', 'idle', 'dnd', 'offline'].includes(status)) return;

      const currentUser = await User.findById(user._id);
      if (currentUser) {
        currentUser.status = status;
        await currentUser.save();
      }

      // Broadcast to all servers
      const userWithServers = await User.findById(user._id);
      const statusServerRefs = Array.isArray(userWithServers?.servers) ? userWithServers.servers : [];
      statusServerRefs.forEach((serverRef) => {
        const serverId = getServerId(serverRef);
        if (!serverId) return;
        io.to(`server:${serverId}`).emit('user:status', {
          userId: user._id,
          status
        });
      });
    });

    // Handle joining a new server
    socket.on('server:join', async (serverId) => {
      socket.join(`server:${serverId}`);
      
      const server = await Server.findById(serverId);
      
      if (server) {
        io.to(`server:${serverId}`).emit('server:member_joined', {
          serverId,
          user: {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            status: 'online'
          }
        });
      }
    });

    // Handle leaving a server
    socket.on('server:leave', (serverId) => {
      socket.leave(`server:${serverId}`);
      
      io.to(`server:${serverId}`).emit('server:member_left', {
        serverId,
        userId: user._id
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${user.username} (${socket.id})`);

      // Remove from online users
      onlineUsers.delete(socket.id);

      // Remove socket from user's socket set
      const userSocketSet = userSockets.get(user._id.toString());
      if (userSocketSet) {
        userSocketSet.delete(socket.id);

        // If user has no more active sockets, set to offline
        if (userSocketSet.size === 0) {
          userSockets.delete(user._id.toString());
          const currentUser = await User.findById(user._id);
          if (currentUser) {
            currentUser.status = 'offline';
            await currentUser.save();
          }

          // Broadcast offline status
          const userWithServers = await User.findById(user._id);
          const offlineServerRefs = Array.isArray(userWithServers?.servers) ? userWithServers.servers : [];
          offlineServerRefs.forEach((serverRef) => {
            const serverId = getServerId(serverRef);
            if (!serverId) return;
            io.to(`server:${serverId}`).emit('user:offline', {
              userId: user._id,
              username: user.username
            });
          });
        }
      }

      // Clean up typing indicators
      typingUsers.forEach((users, channelId) => {
        if (users.has(user._id.toString())) {
          users.delete(user._id.toString());
          io.to(`channel:${channelId}`).emit('typing:update', {
            channelId,
            users: Array.from(users)
          });
        }
      });
    });
  });
};

module.exports = { initializeSocket };
