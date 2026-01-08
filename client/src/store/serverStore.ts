import { create } from 'zustand';
import { Server, Channel, User } from '../types';
import { serverService, socketService } from '../services';

interface ServerState {
  servers: Server[];
  activeServer: Server | null;
  activeChannel: Channel | null;
  isLoading: boolean;
  error: string | null;
  onlineUsers: Map<string, boolean>;
  
  fetchServers: () => Promise<void>;
  setActiveServer: (server: Server | null) => void;
  setActiveChannel: (channel: Channel | null) => void;
  createServer: (name: string, description?: string) => Promise<Server>;
  joinServer: (inviteCode: string) => Promise<Server>;
  leaveServer: (serverId: string) => Promise<void>;
  deleteServer: (serverId: string) => Promise<void>;
  createChannel: (serverId: string, name: string, type?: string) => Promise<Channel>;
  deleteChannel: (channelId: string) => Promise<void>;
  updateServer: (server: Server) => void;
  addServer: (server: Server) => void;
  removeServer: (serverId: string) => void;
  updateOnlineStatus: (userId: string, isOnline: boolean) => void;
  updateMemberStatus: (userId: string, status: 'online' | 'idle' | 'dnd' | 'offline') => void;
  addMember: (serverId: string, user: User) => void;
  removeMember: (serverId: string, userId: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  activeServer: null,
  activeChannel: null,
  isLoading: false,
  error: null,
  onlineUsers: new Map(),

  fetchServers: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await serverService.getServers();
      
      if (response.success) {
        set({ servers: response.servers, isLoading: false });
        
        // Set first server as active if none selected
        const { activeServer } = get();
        if (!activeServer && response.servers.length > 0) {
          const firstServer = response.servers[0];
          set({ activeServer: firstServer });
          
          // Set first channel as active
          if (firstServer.channels.length > 0) {
            set({ activeChannel: firstServer.channels[0] });
          }
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch servers',
        isLoading: false
      });
    }
  },

  setActiveServer: (server: Server | null) => {
    set({ activeServer: server });
    
    // Auto-select first channel
    if (server && server.channels.length > 0) {
      set({ activeChannel: server.channels[0] });
    } else {
      set({ activeChannel: null });
    }
  },

  setActiveChannel: (channel: Channel | null) => {
    set({ activeChannel: channel });
  },

  createServer: async (name: string, description?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serverService.createServer({ name, description });
      
      if (response.success) {
        const newServer = response.server;
        set(state => ({
          servers: [...state.servers, newServer],
          activeServer: newServer,
          activeChannel: newServer.channels[0] || null,
          isLoading: false
        }));
        
        // Join server room via socket
        socketService.joinServer(newServer._id);
        
        return newServer;
      }
      throw new Error('Failed to create server');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to create server',
        isLoading: false
      });
      throw error;
    }
  },

  joinServer: async (inviteCode: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serverService.joinServer(inviteCode);
      
      if (response.success) {
        const newServer = response.server;
        set(state => ({
          servers: [...state.servers, newServer],
          activeServer: newServer,
          activeChannel: newServer.channels[0] || null,
          isLoading: false
        }));
        
        // Join server room via socket
        socketService.joinServer(newServer._id);
        
        return newServer;
      }
      throw new Error('Failed to join server');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to join server',
        isLoading: false
      });
      throw error;
    }
  },

  leaveServer: async (serverId: string) => {
    try {
      set({ isLoading: true, error: null });
      await serverService.leaveServer(serverId);
      
      // Leave server room via socket
      socketService.leaveServer(serverId);
      
      set(state => {
        const updatedServers = state.servers.filter(s => s._id !== serverId);
        const newActiveServer = state.activeServer?._id === serverId
          ? updatedServers[0] || null
          : state.activeServer;
        
        return {
          servers: updatedServers,
          activeServer: newActiveServer,
          activeChannel: newActiveServer?.channels[0] || null,
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to leave server',
        isLoading: false
      });
      throw error;
    }
  },

  deleteServer: async (serverId: string) => {
    try {
      set({ isLoading: true, error: null });
      await serverService.deleteServer(serverId);
      
      set(state => {
        const updatedServers = state.servers.filter(s => s._id !== serverId);
        const newActiveServer = state.activeServer?._id === serverId
          ? updatedServers[0] || null
          : state.activeServer;
        
        return {
          servers: updatedServers,
          activeServer: newActiveServer,
          activeChannel: newActiveServer?.channels[0] || null,
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to delete server',
        isLoading: false
      });
      throw error;
    }
  },

  createChannel: async (serverId: string, name: string, type?: string) => {
    try {
      const response = await serverService.createChannel(serverId, { name, type });
      
      if (response.success) {
        const newChannel = response.channel;
        
        set(state => ({
          servers: state.servers.map(server => {
            if (server._id === serverId) {
              return { ...server, channels: [...server.channels, newChannel] };
            }
            return server;
          }),
          activeServer: state.activeServer?._id === serverId
            ? { ...state.activeServer, channels: [...state.activeServer.channels, newChannel] }
            : state.activeServer
        }));
        
        return newChannel;
      }
      throw new Error('Failed to create channel');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({ error: err.response?.data?.message || 'Failed to create channel' });
      throw error;
    }
  },

  deleteChannel: async (channelId: string) => {
    try {
      await serverService.deleteChannel(channelId);
      
      set(state => {
        const updatedServers = state.servers.map(server => ({
          ...server,
          channels: server.channels.filter(c => c._id !== channelId)
        }));
        
        const updatedActiveServer = state.activeServer
          ? {
              ...state.activeServer,
              channels: state.activeServer.channels.filter(c => c._id !== channelId)
            }
          : null;
        
        const newActiveChannel = state.activeChannel?._id === channelId
          ? updatedActiveServer?.channels[0] || null
          : state.activeChannel;
        
        return {
          servers: updatedServers,
          activeServer: updatedActiveServer,
          activeChannel: newActiveChannel
        };
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({ error: err.response?.data?.message || 'Failed to delete channel' });
      throw error;
    }
  },

  updateServer: (server: Server) => {
    set(state => ({
      servers: state.servers.map(s => s._id === server._id ? server : s),
      activeServer: state.activeServer?._id === server._id ? server : state.activeServer
    }));
  },

  addServer: (server: Server) => {
    set(state => ({
      servers: [...state.servers, server]
    }));
  },

  removeServer: (serverId: string) => {
    set(state => ({
      servers: state.servers.filter(s => s._id !== serverId),
      activeServer: state.activeServer?._id === serverId ? null : state.activeServer,
      activeChannel: state.activeServer?._id === serverId ? null : state.activeChannel
    }));
  },

  updateOnlineStatus: (userId: string, isOnline: boolean) => {
    set(state => {
      const newOnlineUsers = new Map(state.onlineUsers);
      newOnlineUsers.set(userId, isOnline);
      return { onlineUsers: newOnlineUsers };
    });
  },

  updateMemberStatus: (userId: string, status: 'online' | 'idle' | 'dnd' | 'offline') => {
    set(state => ({
      servers: state.servers.map(server => ({
        ...server,
        members: server.members.map(member => 
          (member.user._id || member.user.id) === userId
            ? { ...member, user: { ...member.user, status } }
            : member
        )
      })),
      activeServer: state.activeServer
        ? {
            ...state.activeServer,
            members: state.activeServer.members.map(member =>
              (member.user._id || member.user.id) === userId
                ? { ...member, user: { ...member.user, status } }
                : member
            )
          }
        : null
    }));
  },

  addMember: (serverId: string, user: User) => {
    set(state => ({
      servers: state.servers.map(server => {
        if (server._id === serverId) {
          return {
            ...server,
            members: [...server.members, { user, role: 'member' as const, joinedAt: new Date().toISOString() }]
          };
        }
        return server;
      }),
      activeServer: state.activeServer?._id === serverId
        ? {
            ...state.activeServer,
            members: [...state.activeServer.members, { user, role: 'member' as const, joinedAt: new Date().toISOString() }]
          }
        : state.activeServer
    }));
  },

  removeMember: (serverId: string, userId: string) => {
    set(state => ({
      servers: state.servers.map(server => {
        if (server._id === serverId) {
          return {
            ...server,
            members: server.members.filter(m => (m.user._id || m.user.id) !== userId)
          };
        }
        return server;
      }),
      activeServer: state.activeServer?._id === serverId
        ? {
            ...state.activeServer,
            members: state.activeServer.members.filter(m => (m.user._id || m.user.id) !== userId)
          }
        : state.activeServer
    }));
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    servers: [],
    activeServer: null,
    activeChannel: null,
    isLoading: false,
    error: null,
    onlineUsers: new Map()
  })
}));

export default useServerStore;
