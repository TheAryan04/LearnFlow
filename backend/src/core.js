import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const client = new MongoClient(process.env.MONGO_URL);
export const db = client.db(process.env.DB_NAME);
export const connectDb = () => client.connect();

export const PROJ = { projection: { _id: 0, _order: 0 } };

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const uid = (prefix) => `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
export const nowIso = () => new Date().toISOString();
export const today = () => nowIso().slice(0, 10);

export function num(value, field, { int = false, max } = {}) {
  const out = Number(value);
  if (value === null || value === '' || !Number.isFinite(out)) throw new ApiError(400, `${field} must be a number`);
  if (out < 0) throw new ApiError(400, `${field} cannot be negative`);
  if (max !== undefined && out > max) throw new ApiError(400, `${field} must be between 0 and ${max}`);
  return int ? Math.trunc(out) : out;
}

export const find = (col, query = {}) => db.collection(col).find(query, PROJ).sort({ _order: -1 }).toArray();
export const findOne = (col, query) => db.collection(col).findOne(query, PROJ);

export async function insert(col, item) {
  await db.collection(col).insertOne({ ...item, _order: Date.now() / 1000 });
  return item;
}

export async function update(col, id, changes) {
  await db.collection(col).updateOne({ id }, { $set: changes });
  return findOne(col, { id });
}

export const publicUser = (user) => {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return rest;
};

export const ok = (res, data, extra = {}) => res.json({ success: true, ...extra, data });
export const created = (res, data, extra = {}) => res.status(201).json({ success: true, ...extra, data });
