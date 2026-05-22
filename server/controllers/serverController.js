const { Server, Channel, User } = require('../models');

const toPublicUser = (user) => {
  if (!user) return null;
  const safe = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const id = safe._id || safe.id;
  return {
    id,
    _id: id,
    username: safe.username,
    email: safe.email,
    avatar: safe.avatar ?? null,
    status: safe.status || 'offline',
    customStatus: safe.customStatus || '',
    aboutMe: safe.aboutMe || ''
  };
};

const buildServerResponse = async (server) => {
  if (!server) return null;

  const channelObjects = [];
  for (const channelId of server.channels || []) {
    const channel = await Channel.findById(channelId);
    if (channel) channelObjects.push(channel);
  }
  channelObjects.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const ownerUser = await User.findById(server.owner);
  const owner = toPublicUser(ownerUser);

  const members = [];
  for (const member of server.members || []) {
    const memberId = typeof member.user === 'object'
      ? (member.user._id || member.user.id)
      : member.user;
    const memberUser = memberId ? await User.findById(memberId) : null;
    members.push({
      ...member,
      user: memberUser ? toPublicUser(memberUser) : {
        id: memberId,
        _id: memberId,
        username: 'Unknown User',
        email: '',
        avatar: null,
        status: 'offline',
        customStatus: '',
        aboutMe: ''
      },
      joinedAt: member.joinedAt || server.createdAt
    });
  }

  return {
    _id: server._id,
    name: server.name,
    description: server.description,
    icon: server.icon,
    owner,
    members,
    channels: channelObjects,
    inviteCode: server.inviteCode,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt
  };
};

// @desc    Create a new server
// @route   POST /api/servers
// @access  Private
const createServer = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    // Create server with owner as first member
    const server = new Server({
      name,
      description,
      icon,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner'
      }]
    });
    await server.save();

    // Create default general channel
    const generalChannel = new Channel({
      name: 'general',
      type: 'text',
      server: server._id,
      description: 'General discussion'
    });
    await generalChannel.save();

    // Add channel to server
    server.channels.push(generalChannel._id);
    await server.save();

    // Add server to user's servers
    const user = await User.findById(req.user._id);
    console.log(`[createServer] User found:`, user ? user.username : 'NOT FOUND');
    if (user) {
      console.log(`[createServer] User's servers before:`, user.servers);
      user.servers.push(server._id);
      await user.save();
      console.log(`[createServer] User's servers after:`, user.servers);
    } else {
      console.error(`[createServer] ERROR: Could not find user ${req.user._id}`);
    }

    const populatedServer = await Server.findById(server._id);
    const responseServer = await buildServerResponse(populatedServer);

    res.status(201).json({
      success: true,
      server: responseServer
    });
  } catch (error) {
    console.error('Create server error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating server',
      error: error.message
    });
  }
};

// @desc    Get all servers for current user
// @route   GET /api/servers
// @access  Private
const getServers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log(`[getServers] User: ${user.username}, User's servers array:`, user.servers);
    
    // Get all servers where user is a member
    const servers = [];
    if (user.servers && user.servers.length > 0) {
      for (const serverId of user.servers) {
        const server = await Server.findById(serverId);
        if (server) {
          const responseServer = await buildServerResponse(server);
          if (responseServer) servers.push(responseServer);
        }
      }
    }

    console.log(`[getServers] Returning ${servers.length} servers for ${user.username}`);
    res.json({
      success: true,
      servers: servers
    });
  } catch (error) {
    console.error('Get servers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching servers',
      error: error.message
    });
  }
};

// @desc    Get a single server
// @route   GET /api/servers/:id
// @access  Private
const getServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if user is a member
    const isMember = server.members.some((m) => {
      const memberId = typeof m.user === 'object'
        ? (m.user._id || m.user.id)
        : m.user;
      return memberId?.toString() === req.user._id.toString();
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this server'
      });
    }

    const responseServer = await buildServerResponse(server);

    res.json({
      success: true,
      server: responseServer
    });
  } catch (error) {
    console.error('Get server error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching server',
      error: error.message
    });
  }
};

// @desc    Update server
// @route   PUT /api/servers/:id
// @access  Private (owner/admin only)
const updateServer = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if user is owner or admin
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this server'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;

    // Update server fields
    if (name) server.name = name;
    if (description !== undefined) server.description = description;
    if (icon !== undefined) server.icon = icon;
    
    await server.save();

    const responseServer = await buildServerResponse(server);

    res.json({
      success: true,
      server: responseServer
    });
  } catch (error) {
    console.error('Update server error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating server',
      error: error.message
    });
  }
};

// @desc    Delete server
// @route   DELETE /api/servers/:id
// @access  Private (owner only)
const deleteServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if user is owner
    if (server.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the server owner can delete the server'
      });
    }

    // Remove server from all members
    await User.updateMany(
      { servers: server._id },
      { $pull: { servers: server._id } }
    );

    // Delete all channels
    await Channel.deleteMany({ server: server._id });

    // Delete server
    await Server.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Server deleted successfully'
    });
  } catch (error) {
    console.error('Delete server error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting server',
      error: error.message
    });
  }
};

// @desc    Join server via invite code
// @route   POST /api/servers/join/:inviteCode
// @access  Private
const joinServer = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    console.log(`[joinServer] User ${req.user.username} attempting to join with code: ${inviteCode}`);

    const server = await Server.findOne({ inviteCode });

    if (!server) {
      console.log(`[joinServer] Invalid invite code: ${inviteCode}`);
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    console.log(`[joinServer] Server found: ${server.name} (${server._id})`);
    console.log(`[joinServer] Server owner: ${server.owner}, Current user: ${req.user._id}`);
    console.log(`[joinServer] Server members:`, server.members.map(m => `${m.user} (${m.role})`));

    // Check if already a member
    const isMember = server.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      console.log(`[joinServer] User ${req.user.username} is already a member of ${server.name}`);
      
      // Also check if server is in user's list, if not, add it (data sync issue)
      const user = await User.findById(req.user._id);
      if (user && !user.servers.includes(server._id)) {
        console.log(`[joinServer] Syncing - adding server to user's servers list`);
        user.servers.push(server._id);
        await user.save();
        
        const responseServer = await buildServerResponse(server);

        return res.json({
          success: true,
          message: 'Server synced successfully',
          server: responseServer
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this server'
      });
    }

    // Add user to server
    server.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date()
    });
    await server.save();
    console.log(`[joinServer] Added ${req.user.username} to server ${server.name}`);

    // Add server to user's servers
    const user = await User.findById(req.user._id);
    if (user) {
      user.servers.push(server._id);
      await user.save();
      console.log(`[joinServer] Added server ${server.name} to user ${req.user.username}'s servers list`);
    }

    const populatedServer = await Server.findById(server._id);
    const responseServer = await buildServerResponse(populatedServer);

    res.json({
      success: true,
      message: 'Joined server successfully',
      server: responseServer
    });
    console.log(`[joinServer] Successfully joined server ${server.name}`);
  } catch (error) {
    console.error('Join server error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining server',
      error: error.message
    });
  }
};

// @desc    Leave server
// @route   POST /api/servers/:id/leave
// @access  Private
const leaveServer = async (req, res) => {
  try {
    console.log(`[leaveServer] User ${req.user.username} attempting to leave server ${req.params.id}`);
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if user is owner
    if (server.owner.toString() === req.user._id.toString()) {
      console.log(`[leaveServer] Cannot leave - ${req.user.username} is the owner of ${server.name}`);
      return res.status(400).json({
        success: false,
        message: 'Server owner cannot leave. Transfer ownership or delete the server.'
      });
    }

    // Remove user from server members
    server.members = server.members.filter(
      m => m.user.toString() !== req.user._id.toString()
    );
    await server.save();

    // Remove server from user's servers
    const user = await User.findById(req.user._id);
    if (user) {
      user.servers = user.servers.filter(s => s.toString() !== server._id.toString());
      await user.save();
    }

    res.json({
      success: true,
      message: 'Left server successfully'
    });
  } catch (error) {
    console.error('Leave server error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving server',
      error: error.message
    });
  }
};

// @desc    Get server invite code
// @route   GET /api/servers/:id/invite
// @access  Private
const getInviteCode = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if user is a member
    const isMember = server.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this server'
      });
    }

    res.json({
      success: true,
      inviteCode: server.inviteCode
    });
  } catch (error) {
    console.error('Get invite code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting invite code',
      error: error.message
    });
  }
};

// @desc    Update member role
// @route   PUT /api/servers/:id/members/:userId
// @access  Private (owner/admin only)
const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id: serverId, userId } = req.params;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if requester is owner or admin
    const requesterMember = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || !['owner', 'admin'].includes(requesterMember.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update member roles'
      });
    }

    // Find target member
    const targetMember = server.members.find(
      m => m.user.toString() === userId
    );

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Cannot change owner role
    if (targetMember.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change owner role'
      });
    }

    targetMember.role = role;
    await server.save();

    const updatedServer = await Server.findById(serverId);
    const responseServer = await buildServerResponse(updatedServer);

    res.json({
      success: true,
      server: responseServer
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member role',
      error: error.message
    });
  }
};

module.exports = {
  createServer,
  getServers,
  getServer,
  updateServer,
  deleteServer,
  joinServer,
  leaveServer,
  getInviteCode,
  updateMemberRole
};
