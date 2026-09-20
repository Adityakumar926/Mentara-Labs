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

  loginWithGoogle: async (payload, role = null, mode = 'login') => {
    set({ loading: true, error: null });
    try {
      const body = typeof payload === 'object'
        ? { ...payload, role, mode }
        : { credential: payload, role, mode };
      const { data } = await authApi.googleLogin(body);
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, loading: false });
      useNotificationStore.getState().initSocket(data.accessToken);
      useNotificationStore.getState().fetch();
      return data.user;
    } catch (err) {
      const errorData = err.response?.data;
      const msg = errorData?.message ?? 'Google Sign-In failed';
      set({ error: msg, loading: false });
      const customError = new Error(msg);
      if (errorData?.code) customError.code = errorData.code;
      throw customError;
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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

  setAuthData: ({ accessToken, refreshToken, user }) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      useNotificationStore.getState().initSocket(accessToken);
      useNotificationStore.getState().fetch();
    }
  },

  // Helpers
  isAdmin:   () => get().user?.role === 'admin',
  isPremium: () => get().user?.is_premium === true,
}));

export default useAuthStore;