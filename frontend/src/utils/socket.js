import { io } from 'socket.io-client';
import { getAuthToken } from './api';

export const socket = io(process.env.REACT_APP_BACKEND_URL, {
  path: '/api/socket.io',
  auth: (cb) => getAuthToken().then((token) => cb({ token })),
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export const connectSocket = () => {
  socket.disconnect();
  socket.connect();
};

export const disconnectSocket = () => socket.disconnect();

// Kept for existing callers: (re)connects when a session exists.
export const setSocketToken = (token) => (token ? connectSocket() : disconnectSocket());

if (localStorage.getItem('learnflow_user')) connectSocket();

export const joinCourseRoom = (courseId) => courseId && socket.emit('join_course_room', courseId);
export const leaveCourseRoom = (courseId) => courseId && socket.emit('leave_course_room', courseId);
export const sendCourseMessage = (data) => socket.emit('send_message', data);

export default socket;
