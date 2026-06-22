import { io } from 'socket.io-client';

let socket = null;

// ASSUMPTION: I don't have your api/client.js, so I can't see your axios
// baseURL. Point this at the same backend host (without the /api suffix).
// If you already have an env var for this (e.g. VITE_API_URL), reuse it
// instead of adding a new one.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function connectSocket(token) {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}