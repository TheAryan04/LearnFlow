import crypto from 'crypto';
import { db, uid, nowIso } from './core.js';

const BASE = (process.env.INTEGRATION_PROXY_URL || '').trim() || 'https://integrations.emergentagent.com';
const STORAGE_URL = `${BASE.replace(/\/$/, '')}/objstore/api/v1/storage`;
const APP_NAME = 'learnflow';
let storageKey = null;

export async function initStorage(force = false) {
  if (storageKey && !force) return storageKey;
  const res = await fetch(`${STORAGE_URL}/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emergent_key: process.env.EMERGENT_LLM_KEY }),
  });
  if (!res.ok) throw new Error(`Storage init failed: ${res.status}`);
  storageKey = (await res.json()).storage_key;
  return storageKey;
}

async function storageRequest(path, options, retry = true) {
  const res = await fetch(`${STORAGE_URL}/objects/${path}`, { ...options, headers: { ...options.headers, 'X-Storage-Key': await initStorage() } });
  if (res.status === 404 && retry) {
    await initStorage(true);
    return storageRequest(path, options, false);
  }
  if (!res.ok) throw new Error(`Storage request failed: ${res.status}`);
  return res;
}

// Uploads a multer memory file; returns public metadata pointing at /api/files/:id.
export async function saveUpload(file, ownerId, courseId) {
  if (!file) return null;
  const ext = (file.originalname.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const path = `${APP_NAME}/uploads/${ownerId}/${crypto.randomUUID()}.${ext}`;
  const contentType = file.mimetype || 'application/octet-stream';
  const res = await storageRequest(path, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file.buffer });
  const stored = await res.json();
  const record = {
    id: uid('file'), storagePath: stored.path || path, originalFilename: file.originalname, contentType,
    size: file.size, ownerId, courseId, isDeleted: false, createdAt: nowIso(),
  };
  await db.collection('files').insertOne(record);
  return { id: record.id, name: file.originalname, url: `/api/files/${record.id}`, size: file.size, type: contentType };
}

export async function readFile(record) {
  const res = await storageRequest(record.storagePath, { method: 'GET', headers: {} });
  return Buffer.from(await res.arrayBuffer());
}
