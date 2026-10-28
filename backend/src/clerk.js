import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { verifyToken } from '@clerk/backend';

const SECRET_KEY = process.env.CLERK_SECRET_KEY;
const PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
const AUTHORIZED_PARTIES = (process.env.CLERK_AUTHORIZED_PARTIES || '').split(',').map((s) => s.trim()).filter(Boolean);

// pk_<env>_<base64("frontend-api-host$")> → https://frontend-api-host
const frontendApi = (() => {
  const encoded = PUBLISHABLE_KEY.split('_')[2];
  if (!encoded) return null;
  const host = Buffer.from(encoded, 'base64').toString('utf8').replace(/\$$/, '');
  return host ? `https://${host}` : null;
})();

export const clerkConfigured = Boolean(SECRET_KEY || frontendApi);

let jwks = { keys: {}, fetchedAt: 0 };

async function publicKeyFor(kid) {
  const stale = Date.now() - jwks.fetchedAt > 10 * 60 * 1000;
  if (!jwks.keys[kid] || stale) {
    const res = await fetch(`${frontendApi}/.well-known/jwks.json`);
    if (!res.ok) throw new Error('Could not load Clerk signing keys');
    const { keys } = await res.json();
    jwks = {
      fetchedAt: Date.now(),
      keys: Object.fromEntries(keys.map((k) => [k.kid, crypto.createPublicKey({ key: k, format: 'jwk' }).export({ type: 'spki', format: 'pem' })])),
    };
  }
  return jwks.keys[kid];
}

async function verifyNetworkless(token) {
  const decoded = jwt.decode(token, { complete: true });
  const key = decoded?.header?.kid && (await publicKeyFor(decoded.header.kid));
  if (!key) throw new Error('Unknown signing key');
  return jwt.verify(token, key, { algorithms: ['RS256'], issuer: frontendApi, clockTolerance: 5 });
}

// Returns verified Clerk session claims, or null.
export async function verifyClerkToken(token) {
  if (!clerkConfigured || !token) return null;
  try {
    const claims = SECRET_KEY
      ? await verifyToken(token, { secretKey: SECRET_KEY, ...(AUTHORIZED_PARTIES.length ? { authorizedParties: AUTHORIZED_PARTIES } : {}) })
      : await verifyNetworkless(token);
    if (!claims?.sub) return null;
    if (AUTHORIZED_PARTIES.length && claims.azp && !AUTHORIZED_PARTIES.includes(claims.azp)) return null;
    return claims;
  } catch {
    return null;
  }
}
