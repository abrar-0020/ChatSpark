import { useEffect, useRef } from 'react';
import { socketService } from '../services';
import { useAuthStore, useServerStore, useMessageStore, useNotificationStore } from '../store';
import { Message, User } from '../types';

export const useSocket = () => {
  const { user, isAuthenticated, token } = useAuthStore();
  const { updateMemberStatus, addMember, removeMember, activeServer } = useServerStore();
  const { addMessage, deleteMessage, setTypingUsers } = useMessageStore();
  const { addNotification } = useNotificationStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || !user || initializedRef.current) return;
    initializedRef.current = true;

    const setupSocketListeners = () => {
      // New message
      socketService.on('message:new', (message: unknown) => {
        const msg = message as Message;
        addMessage(msg.channel, msg);

        // Record as in-app notification if sender is not the current user
        const senderId = (msg.author as any)?._id || (msg.author as any)?.id || msg.author;
        const currentId = user._id || user.id;
        if (senderId && senderId !== currentId) {
          const state = useServerStore.getState();
          const server = state.servers.find(s => s.channels.some(c => c._id === msg.channel));
          const channel = server?.channels.find(c => c._id === msg.channel);
          addNotification({
            title: `#${channel?.name ?? 'channel'} — ${server?.name ?? ''}`,
            body: msg.content,
            channelId: msg.channel,
            channelName: channel?.name ?? 'channel',
            serverName: server?.name ?? '',
            senderUsername: (msg.author as any)?.username ?? 'Someone',
            senderAvatar: (msg.author as any)?.avatar ?? null,
          });
        }
      });

      // Message deleted
      socketService.on('message:deleted', (data: unknown) => {
        const { messageId, channelId } = data as { messageId: string; channelId: string };
        deleteMessage(channelId, messageId);
      });

      // Typing updates
      socketService.on('typing:update', (data: unknown) => {
        const { channelId, users } = data as { channelId: string; users: string[] };
        // Filter out current user
        const filteredUsers = users.filter(id => id !== (user._id || user.id));
        setTypingUsers(channelId, filteredUsers);
      });

      // User online
      socketService.on('user:online', (data: unknown) => {
        const { userId } = data as { userId: string };
        updateMemberStatus(userId, 'online');
      });

      // User offline
      socketService.on('user:offline', (data: unknown) => {
        const { userId } = data as { userId: string };
        updateMemberStatus(userId, 'offline');
      });

      // User status change
      socketService.on('user:status', (data: unknown) => {
        const { userId, status } = data as { userId: string; status: 'online' | 'idle' | 'dnd' | 'offline' };
        updateMemberStatus(userId, status);
      });

      // Member joined server
      socketService.on('server:member_joined', (data: unknown) => {
        const { serverId, user: newUser } = data as { serverId: string; user: User };
        addMember(serverId, newUser);
      });

      // Member left server
      socketService.on('server:member_left', (data: unknown) => {
        const { serverId, userId } = data as { serverId: string; userId: string };
        removeMember(serverId, userId);
      });

      // Error handling
      socketService.on('error', (error: unknown) => {
        console.error('Socket error:', error);
      });
    };

    setupSocketListeners();

    return () => {
      socketService.off('message:new');
      socketService.off('message:deleted');
      socketService.off('typing:update');
      socketService.off('user:online');
      socketService.off('user:offline');
      socketService.off('user:status');
      socketService.off('server:member_joined');
      socketService.off('server:member_left');
      socketService.off('error');
      initializedRef.current = false;
    };
  }, [isAuthenticated, token, user, updateMemberStatus, addMember, removeMember, addMessage, deleteMessage, setTypingUsers]);

  // Join/leave channel rooms when active channel changes
  useEffect(() => {
    const activeChannel = useServerStore.getState().activeChannel;
    
    if (activeChannel && socketService.isConnected()) {
      socketService.joinChannel(activeChannel._id);
      
      return () => {
        socketService.leaveChannel(activeChannel._id);
      };
    }
  }, [activeServer]);

  return {
    isConnected: socketService.isConnected(),
    joinChannel: socketService.joinChannel.bind(socketService),
    leaveChannel: socketService.leaveChannel.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService)
  };
};

export default useSocket;
