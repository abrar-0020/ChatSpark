import { io, Socket } from 'socket.io-client';

const LOCAL_SOCKET_URL = 'http://localhost:5000';
const PROD_SOCKET_URL = 'https://chatspark.onrender.com';

const resolveSocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
  const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

  if (import.meta.env.DEV || isLocalHost) {
    return configuredUrl || LOCAL_SOCKET_URL;
  }

  if (configuredUrl && !/localhost|127\.0\.0\.1/.test(configuredUrl)) {
    return configuredUrl;
  }

  return PROD_SOCKET_URL;
};

const SOCKET_URL = resolveSocketUrl();

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  connect(token: string): Promise<Socket> {
    return new Promise((resolve) => {
      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        // Don't reject - still resolve to allow auth to continue
        // Socket will auto-reconnect
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      // Add timeout to prevent hanging - resolve anyway after 3 seconds
      setTimeout(() => {
        if (this.socket) {
          console.log('Socket connection timeout, continuing anyway...');
          resolve(this.socket);
        }
      }, 3000);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  emit(event: string, ...args: unknown[]): void {
    if (this.socket) {
      this.socket.emit(event, ...args);
    }
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
      
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event)!.add(callback);
    }
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
        this.listeners.get(event)?.delete(callback);
      } else {
        this.socket.off(event);
        this.listeners.delete(event);
      }
    }
  }

  // Channel methods
  joinChannel(channelId: string): void {
    this.emit('channel:join', channelId);
  }

  leaveChannel(channelId: string): void {
    this.emit('channel:leave', channelId);
  }

  // Message methods
  sendMessage(channelId: string, content: string): void {
    this.emit('message:send', { channelId, content });
  }

  deleteMessage(messageId: string): void {
    this.emit('message:delete', messageId);
  }

  // Typing methods
  startTyping(channelId: string): void {
    this.emit('typing:start', channelId);
  }

  stopTyping(channelId: string): void {
    this.emit('typing:stop', channelId);
  }

  // Status methods
  updateStatus(status: string): void {
    this.emit('status:update', status);
  }

  // Server methods
  joinServer(serverId: string): void {
    this.emit('server:join', serverId);
  }

  leaveServer(serverId: string): void {
    this.emit('server:leave', serverId);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
