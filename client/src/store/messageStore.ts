import { create } from 'zustand';
import { Message } from '../types';
import { messageService, socketService } from '../services';

interface MessageState {
  messages: Map<string, Message[]>;
  typingUsers: Map<string, string[]>;
  isLoading: boolean;
  error: string | null;
  
  fetchMessages: (channelId: string) => Promise<void>;
  addMessage: (channelId: string, message: Message) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  sendMessage: (channelId: string, content: string) => void;
  setTypingUsers: (channelId: string, userIds: string[]) => void;
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
  clearMessages: (channelId: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: new Map(),
  typingUsers: new Map(),
  isLoading: false,
  error: null,

  fetchMessages: async (channelId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await messageService.getMessages(channelId);
      
      if (response.success) {
        set(state => {
          const newMessages = new Map(state.messages);
          newMessages.set(channelId, response.messages);
          return { messages: newMessages, isLoading: false };
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch messages',
        isLoading: false
      });
    }
  },

  addMessage: (channelId: string, message: Message) => {
    set(state => {
      const newMessages = new Map(state.messages);
      const channelMessages = newMessages.get(channelId) || [];
      
      // Check if message already exists
      if (!channelMessages.find(m => m._id === message._id)) {
        newMessages.set(channelId, [...channelMessages, message]);
      }
      
      return { messages: newMessages };
    });
  },

  deleteMessage: (channelId: string, messageId: string) => {
    set(state => {
      const newMessages = new Map(state.messages);
      const channelMessages = newMessages.get(channelId) || [];
      newMessages.set(channelId, channelMessages.filter(m => m._id !== messageId));
      return { messages: newMessages };
    });
  },

  sendMessage: (channelId: string, content: string) => {
    socketService.sendMessage(channelId, content);
    
    // Stop typing when sending
    get().stopTyping(channelId);
  },

  setTypingUsers: (channelId: string, userIds: string[]) => {
    set(state => {
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.set(channelId, userIds);
      return { typingUsers: newTypingUsers };
    });
  },

  startTyping: (channelId: string) => {
    socketService.startTyping(channelId);
  },

  stopTyping: (channelId: string) => {
    socketService.stopTyping(channelId);
  },

  clearMessages: (channelId: string) => {
    set(state => {
      const newMessages = new Map(state.messages);
      newMessages.delete(channelId);
      return { messages: newMessages };
    });
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    messages: new Map(),
    typingUsers: new Map(),
    isLoading: false,
    error: null
  })
}));

export default useMessageStore;
