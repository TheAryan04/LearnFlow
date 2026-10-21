import express from 'express';
import uniqid from 'uniqid';
import { db } from '../data/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/users
router.get('/', requireRole('admin'), (req, res) => {
  const { role } = req.query;
  const users = db.get('users');
  let filtered = [...users];
  if (role) {
    filtered = filtered.filter((u) => u.role.toLowerCase() === role.toLowerCase());
  }
  const publicUsers = filtered.map(({ passwordHash, ...user }) => user);
  res.json({ success: true, count: publicUsers.length, data: publicUsers });
});

// PUT /api/users/:id/role
router.put('/:id/role', requireRole('admin'), (req, res) => {
  const { role } = req.body;
  if (!['student', 'instructor', 'admin'].includes(String(role).toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Invalid user role' });
  }
  const updated = db.update('users', (u) => u.id === req.params.id, { role });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: updated });
});

// PUT /api/users/:id/status
router.put('/:id/status', requireRole('admin'), (req, res) => {
  const { status } = req.body;
  const updated = db.update('users', (u) => u.id === req.params.id, (u) => ({
    ...u,
    status: status || (u.status === 'Active' ? 'Deactivated' : 'Active'),
  }));
  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: updated });
});

export default router;
