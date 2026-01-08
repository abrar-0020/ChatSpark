import api from './api';
import { Server, Channel } from '../types';

export const serverService = {
  async getServers(): Promise<{ success: boolean; servers: Server[] }> {
    const response = await api.get('/servers');
    return response.data;
  },

  async getServer(id: string): Promise<{ success: boolean; server: Server }> {
    const response = await api.get(`/servers/${id}`);
    return response.data;
  },

  async createServer(data: { name: string; description?: string }): Promise<{ success: boolean; server: Server }> {
    const response = await api.post('/servers', data);
    return response.data;
  },

  async updateServer(id: string, data: Partial<Server>): Promise<{ success: boolean; server: Server }> {
    const response = await api.put(`/servers/${id}`, data);
    return response.data;
  },

  async deleteServer(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/servers/${id}`);
    return response.data;
  },

  async joinServer(inviteCode: string): Promise<{ success: boolean; server: Server }> {
    const response = await api.post(`/servers/join/${inviteCode}`);
    return response.data;
  },

  async leaveServer(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/servers/${id}/leave`);
    return response.data;
  },

  async getInviteCode(id: string): Promise<{ success: boolean; inviteCode: string }> {
    const response = await api.get(`/servers/${id}/invite`);
    return response.data;
  },

  async updateMemberRole(serverId: string, userId: string, role: string): Promise<{ success: boolean; server: Server }> {
    const response = await api.put(`/servers/${serverId}/members/${userId}`, { role });
    return response.data;
  },

  // Channel operations
  async getChannels(serverId: string): Promise<{ success: boolean; channels: Channel[] }> {
    const response = await api.get(`/servers/${serverId}/channels`);
    return response.data;
  },

  async createChannel(serverId: string, data: { name: string; type?: string; description?: string }): Promise<{ success: boolean; channel: Channel }> {
    const response = await api.post(`/servers/${serverId}/channels`, data);
    return response.data;
  },

  async updateChannel(id: string, data: Partial<Channel>): Promise<{ success: boolean; channel: Channel }> {
    const response = await api.put(`/channels/${id}`, data);
    return response.data;
  },

  async deleteChannel(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/channels/${id}`);
    return response.data;
  }
};

export default serverService;
