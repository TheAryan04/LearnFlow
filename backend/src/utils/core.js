import crypto from 'crypto';
import { ApiError } from './errors.js';

export { ApiError };

export const uid = (prefix) => `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
export const nowIso = () => new Date().toISOString();
export const today = () => nowIso().slice(0, 10);

export function num(value, field, { int = false, max } = {}) {
  const out = Number(value);
  if (value === null || value === '' || !Number.isFinite(out)) {
    throw new ApiError(400, `${field} must be a number`);
  }
  if (out < 0) throw new ApiError(400, `${field} cannot be negative`);
  if (max !== undefined && out > max) throw new ApiError(400, `${field} must be between 0 and ${max}`);
  return int ? Math.trunc(out) : out;
}

export const publicUser = (user) => {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return rest;
};

export const ok = (res, data, extra = {}) => res.json({ success: true, ...extra, data });
export const created = (res, data, extra = {}) => res.status(201).json({ success: true, ...extra, data });
