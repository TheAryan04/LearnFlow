import express from 'express';
import { db } from '../data/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/notifications
router.get('/', (req, res) => {
  const notifications = db.get('notifications').filter((item) => !item.userId || item.userId === req.user.id);
  res.json({ success: true, count: notifications.length, data: notifications });
});

// PUT /api/notifications/read-all
router.put('/read-all', (req, res) => {
  const notifications = db.get('notifications');
  const updated = notifications.map((n) =>
    !n.userId || n.userId === req.user.id ? { ...n, read: true } : n
  );
  db.set('notifications', updated);
  res.json({ success: true, message: 'All notifications marked as read', data: updated });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req, res) => {
  const notification = db.get('notifications').find((item) => item.id === req.params.id);
  if (notification?.userId && notification.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  const updated = db.update('notifications', (n) => n.id === req.params.id, { read: true });
  res.json({ success: true, data: updated });
});

export default router;
