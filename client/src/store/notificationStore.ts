import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  channelId: string;
  channelName: string;
  serverName: string;
  timestamp: number;
  read: boolean;
  senderAvatar?: string | null;
  senderUsername: string;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (n) => {
    const notification: AppNotification = {
      ...n,
      id: `${Date.now()}-${Math.random()}`,
      read: false,
      timestamp: Date.now(),
    };
    set(state => ({
      notifications: [notification, ...state.notifications].slice(0, 100), // keep last 100
    }));
  },

  markAllRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }));
  },

  clearAll: () => set({ notifications: [] }),

  unreadCount: () => get().notifications.filter(n => !n.read).length,
}));
