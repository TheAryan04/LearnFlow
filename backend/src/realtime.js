import { Server } from 'socket.io';
import { db, insert, nowIso } from './core.js';
import { resolveToken } from './auth.js';

let io = null;

export async function canAccessCourse(user, courseId) {
  const role = user.role.toLowerCase();
  if (role === 'admin') return true;
  if (role === 'instructor') return Boolean(await db.collection('courses').findOne({ id: courseId, instructorId: user.id }));
  return Boolean(await db.collection('enrolments').findOne({ userId: user.id, courseId }));
}

export const emit = (event, payload, room) => {
  if (!io) return;
  (room ? io.to(room) : io).emit(event, payload);
};

export const emitToUser = (userId, event, payload) => emit(event, payload, `user_${userId}`);

export async function notify(notif) {
  await insert('notifications', notif);
  emit('notification', notif, notif.userId ? `user_${notif.userId}` : undefined);
}

export function initRealtime(server) {
  io = new Server(server, { path: '/api/socket.io', cors: { origin: '*' } });

  io.use(async (socket, next) => {
    const { user } = await resolveToken(socket.handshake.auth?.token);
    if (!user || user.status === 'Deactivated') return next(new Error('Authentication required'));
    socket.data.user = user;
    next();
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    socket.join(`user_${user.id}`);

    socket.on('join_course_room', async (courseId) => {
      if (courseId && (await canAccessCourse(user, courseId))) socket.join(`course_${courseId}`);
    });

    socket.on('leave_course_room', (courseId) => socket.leave(`course_${courseId}`));

    socket.on('send_message', (data) => {
      const room = `course_${data?.courseId}`;
      const message = String(data?.message || '').trim();
      if (!message || !socket.rooms.has(room)) return;
      io.to(room).emit('receive_message', {
        courseId: data.courseId, userId: user.id, userName: user.name, role: user.role,
        message: message.slice(0, 4000), timestamp: nowIso(),
      });
    });
  });
}
