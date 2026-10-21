import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

import { initDB } from './data/db.js';
import coursesRoutes from './routes/courses.js';
import enrolmentsRoutes from './routes/enrolments.js';
import assignmentsRoutes from './routes/assignments.js';
import attendanceRoutes from './routes/attendance.js';
import resultsRoutes from './routes/results.js';
import usersRoutes from './routes/users.js';
import materialsRoutes from './routes/materials.js';
import statsRoutes from './routes/stats.js';
import notificationsRoutes from './routes/notifications.js';
import discussionsRoutes from './routes/discussions.js';
import authRoutes from './routes/auth.js';
import { db } from './data/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize persistent database
initDB();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io with full CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.use((socket, next) => {
  try {
    const payload = jwt.verify(socket.handshake.auth?.token || '', process.env.JWT_SECRET);
    const user = db.get('users').find((item) => item.id === payload.id);
    if (!user || user.status === 'Deactivated') {
      return next(new Error('Authentication required'));
    }
    socket.data.user = { id: user.id, name: user.name, role: String(user.role).toLowerCase() };
    next();
  } catch {
    next(new Error('Authentication required'));
  }
});

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pass Socket.io to route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LearnFlow LMS API Server (Real-Time & Persistent)',
    version: '2.0.0',
    socketsConnected: io.engine.clientsCount,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrolments', enrolmentsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/discussions', discussionsRoutes);

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.io Client Connected]: ${socket.id}`);

  // Join course lecture discussion room
  socket.on('join_course_room', (courseId) => {
    if (!canAccessCourse(socket.data.user, courseId)) return;
    socket.join(`course_${courseId}`);
    console.log(`👥 Socket ${socket.id} joined course room: course_${courseId}`);
  });

  // Leave course room
  socket.on('leave_course_room', (courseId) => {
    socket.leave(`course_${courseId}`);
    console.log(`👋 Socket ${socket.id} left course room: course_${courseId}`);
  });

  // Live messaging
  socket.on('send_message', (data) => {
    if (!data?.courseId || !socket.rooms.has(`course_${data.courseId}`) || !String(data.message || '').trim()) return;
    io.to(`course_${data.courseId}`).emit('receive_message', {
      courseId: data.courseId,
      userId: socket.data.user.id,
      userName: socket.data.user.name,
      role: socket.data.user.role,
      message: String(data.message).trim().slice(0, 4000),
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.io Client Disconnected]: ${socket.id}`);
  });
});

function canAccessCourse(user, courseId) {
  if (user.role === 'admin') return true;
  if (user.role === 'instructor') {
    return db.get('courses').some((course) => course.id === courseId && course.instructorId === user.id);
  }
  return db.get('enrolments').some((enrolment) => enrolment.userId === user.id && enrolment.courseId === courseId);
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[LearnFlow API Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

server.listen(PORT, () => {
  console.log(`🚀 LearnFlow Real-Time API Server running at http://localhost:${PORT}`);
  console.log(`📡 WebSocket server active with Socket.io`);
});
