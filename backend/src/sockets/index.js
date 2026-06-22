const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  // Same JWT used for REST auth, just passed in the handshake instead of a header
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { rows } = await db.query(`SELECT id, role FROM users WHERE id = $1`, [decoded.id]);
      if (!rows[0]) return next(new Error('User no longer exists'));

      socket.userId = rows[0].id;
      socket.userRole = rows[0].role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Private room per user — this is how we target notifications at one student
    socket.join(`user:${socket.userId}`);
  });

  console.log('[Socket] Socket.IO initialized');
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized — call initSocket(server) first');
  return io;
}

function emitToStudent(studentId, event, payload) {
  if (!io) return;
  io.to(`user:${studentId}`).emit(event, payload);
}

function emitToStudents(studentIds, event, payload) {
  if (!io) return;
  for (const id of studentIds) io.to(`user:${id}`).emit(event, payload);
}

module.exports = { initSocket, getIO, emitToStudent, emitToStudents };