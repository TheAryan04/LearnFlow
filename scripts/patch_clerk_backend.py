p = '/app/backend/src/auth.js'
s = open(p).read()

def rep(old, new):
    global s
    assert old in s, old[:80]
    s = s.replace(old, new, 1)

rep("import { verifyToken, createClerkClient } from '@clerk/backend';", "import { createClerkClient } from '@clerk/backend';\nimport { verifyClerkToken } from './clerk.js';")
rep("const AUTHORIZED_PARTIES = (process.env.CLERK_AUTHORIZED_PARTIES || '').split(',').map((s) => s.trim()).filter(Boolean);\n", "")
a = s.index('async function clerkUserId(token) {')
b = s.index('function demoUserId(token) {')
s = s[:a] + '''async function clerkUserId(token) {
  return (await verifyClerkToken(token))?.sub || null;
}

''' + s[b:]

a = s.index('async function syncClerkUser(clerkId, requestedRole) {')
b = s.index('export const authRouter = Router();')
s = s[:a] + '''// Profile data comes from Clerk's Backend API when the secret key is available, otherwise from
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
    avatar: (typeof claims.image === 'string' && claims.image) || (/^https:\\/\\//.test(body.avatar || '') ? body.avatar : undefined),
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

''' + s[b:]

rep('''  const token = bearer(req);
  const clerkId = token && (await clerkUserId(token));
  if (!clerkId) throw new ApiError(401, 'Sign in with Clerk first');
  const user = await syncClerkUser(clerkId, req.body?.role);''', '''  const claims = await verifyClerkToken(bearer(req));
  if (!claims) throw new ApiError(401, 'Sign in with Clerk first');
  const user = await syncClerkUser(claims, req.body || {});''')
open(p, 'w').write(s)

# expose the (public) publishable key to the backend for issuer pinning
fe = dict(l.split('=', 1) for l in open('/app/frontend/.env').read().splitlines() if '=' in l)
be_path = '/app/backend/.env'
be = open(be_path).read()
if 'CLERK_PUBLISHABLE_KEY=' not in be:
    if not be.endswith('\n'):
        be += '\n'
    be += 'CLERK_PUBLISHABLE_KEY=' + fe['REACT_APP_CLERK_PUBLISHABLE_KEY'] + '\n'
    open(be_path, 'w').write(be)
print('ok')
