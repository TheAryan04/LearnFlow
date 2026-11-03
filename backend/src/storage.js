import crypto from 'node:crypto';
import { mkdir, readFile as fsReadFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, uid, nowIso } from './core.js';

// Local filesystem storage keeps the MVP independent of third-party AI or
// object-storage credentials. Set FILE_STORAGE_DIR to override this location.
const DEFAULT_STORAGE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
const STORAGE_DIR = path.resolve(process.env.FILE_STORAGE_DIR || DEFAULT_STORAGE_DIR);

function resolveStoragePath(storagePath) {
  const absolutePath = path.resolve(STORAGE_DIR, storagePath);
  if (absolutePath !== STORAGE_DIR && !absolutePath.startsWith(`${STORAGE_DIR}${path.sep}`)) {
    const error = new Error('Invalid storage path');
    error.status = 400;
    throw error;
  }
  return absolutePath;
}

// Saves a multer memory file and returns public metadata pointing at /api/files/:id.
export async function saveUpload(file, ownerId, courseId) {
  if (!file) return null;

  const ext = (file.originalname.split('.').pop() || 'bin')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'bin';
  const storagePath = path.posix.join(
    String(ownerId),
    `${crypto.randomUUID()}.${ext}`
  );
  const absolutePath = resolveStoragePath(storagePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, file.buffer, { flag: 'wx' });

  const contentType = file.mimetype || 'application/octet-stream';
  const record = {
    id: uid('file'),
    storagePath,
    originalFilename: file.originalname,
    contentType,
    size: file.size,
    ownerId,
    courseId,
    isDeleted: false,
    createdAt: nowIso(),
  };

  try {
    await db.collection('files').insertOne(record);
  } catch (error) {
    // Avoid leaving an orphaned file when metadata persistence fails.
    await unlink(absolutePath).catch(() => {});
    throw error;
  }

  return {
    id: record.id,
    name: file.originalname,
    url: `/api/files/${record.id}`,
    size: file.size,
    type: contentType,
  };
}

export async function readFile(record) {
  return readFileFromDisk(record.storagePath);
}

async function readFileFromDisk(storagePath) {
  return fsReadFile(resolveStoragePath(storagePath));
}
