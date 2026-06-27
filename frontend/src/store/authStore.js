import { create } from 'zustand';
import { authApi } from '@/api/services';
import useNotificationStore from '@/store/notificationStore';

const useAuthStore = create((set, get) => ({
  user:    JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
  error:   null,

  // ── Actions ────────────────────────────────────────────────────────────────
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, loading: false });
      useNotificationStore.getState().initSocket(data.accessToken);
      useNotificationStore.getState().fetch();
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.register(payload);
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, loading: false });
      useNotificationStore.getState().initSocket(data.accessToken);
      useNotificationStore.getState().fetch();
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  loginWithGoogle: async (credential) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.googleLogin({ credential });
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, loading: false });
      useNotificationStore.getState().initSocket(data.accessToken);
      useNotificationStore.getState().fetch();
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Google Sign-In failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.clear();
    useNotificationStore.getState().teardownSocket();
    set({ user: null, error: null });
  },

  onboard: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.onboard(payload);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Onboarding failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // Called on app boot to restore a session from a stored token — also the
  // place we reconnect the notification socket after a page refresh.
  fetchMe: async () => {
    try {
      const { data } = await authApi.me();
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user });
      const token = localStorage.getItem('accessToken');
      if (token) {
        useNotificationStore.getState().initSocket(token);
        useNotificationStore.getState().fetch();
      }
    } catch {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),

  // Helpers
  isAdmin:   () => get().user?.role === 'admin',
  isPremium: () => get().user?.is_premium === true,
}));

export default useAuthStore;