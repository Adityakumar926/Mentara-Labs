import { create } from 'zustand';
import { studentApi } from '@/api/services';
import { connectSocket, disconnectSocket } from '@/lib/socket';

let inFlightPromise = null;
let lastFetchTime = 0;

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async (force = false) => {
    const now = Date.now();
    if (!force && (now - lastFetchTime < 15000) && get().notifications.length > 0) {
      return;
    }
    if (inFlightPromise) {
      return inFlightPromise;
    }

    set({ loading: true });
    inFlightPromise = (async () => {
      try {
        const { data } = await studentApi.getNotifications({ limit: 20 });
        lastFetchTime = Date.now();

        // 1. If backend sends an array directly: res.json([ ... ])
        if (Array.isArray(data)) {
          set({ notifications: data, unreadCount: data.filter(n => !n.is_read).length, loading: false });
        }
        // 2. If backend sends wrapped in a data property: res.json({ success: true, data: [ ... ] })
        else if (data && Array.isArray(data.data)) {
          set({ notifications: data.data, unreadCount: data.unread_count || 0, loading: false });
        }
        // 3. If backend sends exactly what we originally expected: res.json({ notifications: [ ... ] })
        else if (data && Array.isArray(data.notifications)) {
          set({ notifications: data.notifications, unreadCount: data.unread_count || 0, loading: false });
        }
        // 4. Fallback if it's completely unexpected
        else {
          set({ notifications: [], unreadCount: 0, loading: false });
        }
      } catch (error) {
        set({ loading: false });
      } finally {
        inFlightPromise = null;
      }
    })();

    return inFlightPromise;
  },

  markRead: async (id) => {
    const wasUnread = get().notifications.find((n) => n.id === id && !n.is_read);
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
    }));
    try {
      // FIXED: Matches markNotificationRead in services.js
      await studentApi.markNotificationRead(id);
    } catch (error) {
      console.error("🔴 Failed to mark notification as read:", error);
    }
  },

  markAllRead: async () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
    try {
      // FIXED: Matches markAllNotificationsRead in services.js
      await studentApi.markAllNotificationsRead();
    } catch (error) {
      console.error("🔴 Failed to mark all notifications as read:", error);
    }
  },

  initSocket: (token) => {
    const socket = connectSocket(token);
    socket.off('notification:new');
    socket.on('notification:new', (notif) => {
      set((s) => ({
        notifications: [
          { ...notif, id: nextLocalId--, is_read: false, created_at: new Date().toISOString() },
          ...s.notifications,
        ],
        unreadCount: s.unreadCount + 1,
      }));
    });
  },

  teardownSocket: () => {
    disconnectSocket();
    set({ notifications: [], unreadCount: 0 });
  },
}));

export default useNotificationStore;