import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL;

export const socket = io(SOCKET_URL, {
  auth: { token: localStorage.getItem('learnflow_token') },
  path: '/api/socket.io',
  autoConnect: Boolean(localStorage.getItem('learnflow_token')),
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export const setSocketToken = (token) => {
  socket.auth = { token };
  socket.disconnect();
  if (token) socket.connect();
};

socket.on('connect', () => {
  console.log('⚡ [LearnFlow Client Connected to Real-Time WebSockets]:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔌 [LearnFlow Client Disconnected from WebSockets]');
});

export const joinCourseRoom = (courseId) => {
  if (courseId) {
    socket.emit('join_course_room', courseId);
  }
};

export const leaveCourseRoom = (courseId) => {
  if (courseId) {
    socket.emit('leave_course_room', courseId);
  }
};

export const sendCourseMessage = (data) => {
  socket.emit('send_message', data);
};

export default socket;
