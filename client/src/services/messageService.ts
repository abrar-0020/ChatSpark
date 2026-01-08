import api from './api';
import { Message } from '../types';

export const messageService = {
  async getMessages(channelId: string, limit = 50, before?: string): Promise<{ success: boolean; messages: Message[] }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    
    const response = await api.get(`/channels/${channelId}/messages?${params}`);
    return response.data;
  },

  async createMessage(channelId: string, content: string): Promise<{ success: boolean; message: Message }> {
    const response = await api.post(`/channels/${channelId}/messages`, { content });
    return response.data;
  },

  async deleteMessage(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  async editMessage(id: string, content: string): Promise<{ success: boolean; message: Message }> {
    const response = await api.put(`/messages/${id}`, { content });
    return response.data;
  }
};

export default messageService;
