import { create } from 'zustand';
import { studentApi } from '@/api/services';
import { connectSocket, disconnectSocket } from '@/lib/socket';

let nextLocalId = -1;

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const { data } = await studentApi.getNotifications({ limit: 20 });

      console.log("👉 REAL BACKEND RESPONSE DATA:", data);

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
        console.warn("⚠️ Backend returned an unexpected data structure:", data);
        set({ notifications: [], unreadCount: 0, loading: false });
      }

    } catch (error) {
      console.error("🔴 Notification fetch failed:", error);
      set({ loading: false });
    }
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