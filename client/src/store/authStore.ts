import { create } from 'zustand';
import { User } from '../types';
import { authService, socketService } from '../services';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateStatus: (status: 'online' | 'idle' | 'dnd' | 'offline') => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login({ email, password });
      
      console.log('[AuthStore] Login response:', response);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // Set auth state first, then connect socket (don't block on socket)
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Connect socket in background (don't await)
        socketService.connect(response.token).catch(err => {
          console.warn('Socket connection failed, but auth continues:', err);
        });
      } else {
        throw new Error('No token received');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register({ username, email, password });
      
      console.log('[AuthStore] Register response:', response);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // Set auth state first, then connect socket (don't block on socket)
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Connect socket in background (don't await)
        socketService.connect(response.token).catch(err => {
          console.warn('Socket connection failed, but auth continues:', err);
        });
      } else {
        throw new Error('No token received');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Registration failed',
        isLoading: false
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      socketService.disconnect();
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      // Clear all other stores
      // Import dynamically to avoid circular dependency
      import('./serverStore').then(({ useServerStore }) => {
        useServerStore.getState().reset();
      });
      import('./messageStore').then(({ useMessageStore }) => {
        useMessageStore.getState().reset();
      });
    }
  },

  checkAuth: async () => {
    const token = get().token;
    
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      set({ isLoading: true });
      const response = await authService.getMe();
      
      if (response.user) {
        // Set auth state first
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Connect socket in background (don't await)
        socketService.connect(token).catch(err => {
          console.warn('Socket connection failed during checkAuth:', err);
        });
      } else {
        throw new Error('No user data received');
      }
    } catch {
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      const response = await authService.updateProfile(data);
      if (response.success) {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...response.user } });
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  updateStatus: async (status: 'online' | 'idle' | 'dnd' | 'offline') => {
    try {
      await authService.updateStatus(status);
      socketService.updateStatus(status);
      
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, status } });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
