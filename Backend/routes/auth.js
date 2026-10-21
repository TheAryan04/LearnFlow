import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import uniqid from 'uniqid';
import { db } from '../data/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function publicUser(user) {
  const { passwordHash, ...profile } = user;
  return profile;
}

function createSession(user, res) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(503).json({ success: false, message: 'Authentication is not configured' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, role: String(user.role).toLowerCase() },
    secret,
    { expiresIn: '7d' }
  );
  res.json({ success: true, data: { user: publicUser(user), token } });
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'student' } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedRole = String(role).toLowerCase();

    if (!String(name || '').trim() || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    if (!['student', 'instructor'].includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Role must be student or instructor' });
    }
    if (db.get('users').some((user) => user.email.toLowerCase() === normalizedEmail)) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = {
      id: `user_${uniqid()}`,
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      role: normalizedRole[0].toUpperCase() + normalizedRole.slice(1),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(name).trim())}`,
      joinedDate: new Date().toISOString().slice(0, 10),
      status: 'Active',
    };
    db.insert('users', user);
    createSession(user, res);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    const user = db.get('users').find((item) => item.email.toLowerCase() === normalizedEmail);
    if (!user?.passwordHash || user.status === 'Deactivated' || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    createSession(user, res);
  } catch (error) {
    next(error);
  }
});

router.post('/demo', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  const role = String(req.body.role || '').toLowerCase();
  const user = db.get('users').find((item) => String(item.role).toLowerCase() === role);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Demo account not found' });
  }
  createSession(user, res);
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.get('users').find((item) => item.id === req.user.id);
  res.json({ success: true, data: publicUser(user) });
});

export default router;