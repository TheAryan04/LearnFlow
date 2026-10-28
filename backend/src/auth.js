import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createClerkClient } from '@clerk/backend';
import { verifyClerkToken } from './clerk.js';
import { ApiError, db, findOne, insert, update, uid, today, publicUser, ok, PROJ } from './core.js';

const JWT_SECRET = process.env.JWT_SECRET;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const DEMO_ENABLED = (process.env.ENABLE_DEMO_LOGIN || 'false').toLowerCase() === 'true';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const DEMO_ACCOUNTS = { student: 'alex.student@learnflow.edu', instructor: 'marcus.vance@learnflow.edu', admin: 'admin@learnflow.edu' };

const clerk = CLERK_SECRET_KEY ? createClerkClient({ secretKey: CLERK_SECRET_KEY }) : null;

async function clerkUserId(token) {
  return (await verifyClerkToken(token))?.sub || null;
}

function demoUserId(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    return payload.kind === 'demo' ? payload.id : null;
  } catch {
    return null;
  }
}

// Returns { user, clerkId } — user is null when a valid Clerk session has no LearnFlow profile yet.
export async function resolveToken(token) {
  if (!token) return { user: null, clerkId: null };
  const demoId = DEMO_ENABLED ? demoUserId(token) : null;
  if (demoId) return { user: await findOne('users', { id: demoId }), clerkId: null };
  const clerkId = await clerkUserId(token);
  if (!clerkId) return { user: null, clerkId: null };
  return { user: await findOne('users', { clerkId }), clerkId };
}

const bearer = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

const toSession = (user) => ({ id: user.id, role: user.role.toLowerCase(), name: user.name, avatar: user.avatar });

export async function currentUser(req, _res, next) {
  const token = bearer(req);
  if (!token) throw new ApiError(401, 'Authentication required');
  const { user, clerkId } = await resolveToken(token);
  if (!user && clerkId) throw new ApiError(403, 'Finish setting up your account', 'ONBOARDING_REQUIRED');
  if (!user || user.status === 'Deactivated') throw new ApiError(401, 'Invalid or expired session');
  req.user = toSession(user);
  next();
}

export const requireRole = (...roles) => [
  currentUser,
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) throw new ApiError(403, 'Insufficient permissions');
    next();
  },
];

// Profile data comes from Clerk's Backend API when the secret key is available, otherwise from
// verified session claims (email/name/image), falling back to client-supplied display details.
async function clerkProfile(claims, body) {
  if (clerk) {
    const p = await clerk.users.getUser(claims.sub);
    return {
      email: (p.primaryEmailAddress?.emailAddress || p.emailAddresses?.[0]?.emailAddress || '').toLowerCase(),
      emailVerified: true,
      name: [p.firstName, p.lastName].filter(Boolean).join(' ') || p.username,
      avatar: p.imageUrl,
      metaRole: p.unsafeMetadata?.role,
    };
  }
  const claimEmail = typeof claims.email === 'string' ? claims.email.toLowerCase() : '';
  return {
    email: claimEmail || String(body.email || '').toLowerCase().slice(0, 200),
    emailVerified: Boolean(claimEmail),
    name: (typeof claims.name === 'string' && claims.name.trim()) || String(body.name || '').slice(0, 120),
    avatar: (typeof claims.image === 'string' && claims.image) || (/^https:\/\//.test(body.avatar || '') ? body.avatar : undefined),
    metaRole: body.role,
  };
}

async function syncClerkUser(claims, body = {}) {
  const profile = await clerkProfile(claims, body);
  const name = profile.name || profile.email.split('@')[0] || 'Learner';
  const isAdmin = profile.emailVerified && profile.email && ADMIN_EMAILS.includes(profile.email);
  const existing = await findOne('users', { clerkId: claims.sub });
  if (existing) {
    const changes = { name, email: profile.email || existing.email, avatar: profile.avatar || existing.avatar };
    if (isAdmin && existing.role !== 'Admin') changes.role = 'Admin';
    return update('users', existing.id, changes);
  }
  const requested = String(body.role || profile.metaRole || 'student').toLowerCase();
  const role = isAdmin ? 'Admin' : requested === 'instructor' ? 'Instructor' : 'Student';
  return insert('users', {
    id: uid('user'), clerkId: claims.sub, name, email: profile.email, role,
    avatar: profile.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
    joinedDate: today(), status: 'Active',
  });
}

export const authRouter = Router();

authRouter.post('/auth/sync', async (req, res) => {
  const claims = await verifyClerkToken(bearer(req));
  if (!claims) throw new ApiError(401, 'Sign in with Clerk first');
  const user = await syncClerkUser(claims, req.body || {});
  if (user.status === 'Deactivated') throw new ApiError(403, 'This account has been deactivated');
  ok(res, { user: publicUser(user) });
});

authRouter.post('/auth/demo', async (req, res) => {
  if (!DEMO_ENABLED) throw new ApiError(404, 'Not found');
  const email = DEMO_ACCOUNTS[String(req.body?.role || '').toLowerCase()];
  const user = email && (await db.collection('users').findOne({ email, status: { $ne: 'Deactivated' } }, PROJ));
  if (!user) throw new ApiError(404, 'Demo account not found');
  const token = jwt.sign({ id: user.id, kind: 'demo' }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
  ok(res, { user: publicUser(user), token });
});

authRouter.get('/auth/me', currentUser, async (req, res) => {
  ok(res, publicUser(await findOne('users', { id: req.user.id })));
});

authRouter.get('/auth/config', (_req, res) => ok(res, { demoEnabled: DEMO_ENABLED }));
