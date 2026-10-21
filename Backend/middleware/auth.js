import jwt from 'jsonwebtoken';
import { db } from '../data/db.js';

export function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(503).json({ success: false, message: 'Authentication is not configured' });
  }

  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, secret);
    const user = db.get('users').find((item) => item.id === payload.id);
    if (!user || user.status === 'Deactivated') {
      return res.status(401).json({ success: false, message: 'Account is unavailable' });
    }

    req.user = {
      id: user.id,
      role: String(user.role).toLowerCase(),
    };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  const allowedRoles = roles.map((role) => role.toLowerCase());
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}