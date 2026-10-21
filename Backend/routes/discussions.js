import express from 'express';
import uniqid from 'uniqid';
import { db } from '../data/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/discussions?courseId=...
router.get('/', (req, res) => {
  const { courseId } = req.query;
  const discussions = db.get('discussions');
  let filtered = [...discussions];

  if (courseId) {
    filtered = filtered.filter((d) => d.courseId === courseId);
  }

  // Sort chronologically
  filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  res.json({ success: true, count: filtered.length, data: filtered });
});

// POST /api/discussions
router.post('/', (req, res) => {
  const { courseId, message } = req.body;

  if (!courseId || !message) {
    return res.status(400).json({ success: false, message: 'courseId and message are required' });
  }

  const newPost = {
    id: `disc_${uniqid()}`,
    courseId,
    userId: req.user.id,
    userName: db.get('users').find((user) => user.id === req.user.id)?.name || 'User',
    userAvatar: db.get('users').find((user) => user.id === req.user.id)?.avatar,
    role: req.user.role,
    message,
    timestamp: new Date().toISOString()
  };

  db.insert('discussions', newPost);

  // Emit via Socket.io if available
  if (req.io) {
    req.io.to(`course_${courseId}`).emit('receive_message', newPost);
  }

  res.status(201).json({ success: true, data: newPost });
});

export default router;
