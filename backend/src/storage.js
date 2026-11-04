import crypto from 'node:crypto';
import { mkdir, readFile as fsReadFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import { db, uid, nowIso } from './core.js';

// Cloudinary stores new uploads. Legacy local files remain readable during migration.
const DEFAULT_STORAGE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
const STORAGE_DIR = path.resolve(process.env.FILE_STORAGE_DIR || DEFAULT_STORAGE_DIR);
let cloudinaryConfigured = false;

function configureCloudinary() {
  if (cloudinaryConfigured) return;

  // The SDK reads CLOUDINARY_URL automatically. Individual variables are also supported.
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    const error = new Error(
      'Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
    );
    error.status = 503;
    throw error;
  }
  cloudinaryConfigured = true;
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

function resolveLegacyStoragePath(storagePath) {
  const absolutePath = path.resolve(STORAGE_DIR, storagePath);
  if (absolutePath !== STORAGE_DIR && !absolutePath.startsWith(`${STORAGE_DIR}${path.sep}`)) {
    const error = new Error('Invalid storage path');
    error.status = 400;
    throw error;
  }
  return absolutePath;
}

// Uploads a multer memory file to Cloudinary; metadata remains in MongoDB.
export async function saveUpload(file, ownerId, courseId) {
  if (!file) return null;
  configureCloudinary();

  const publicId = crypto.randomUUID();
  const asset = await uploadBuffer(file.buffer, {
    folder: `learnflow/uploads/${String(ownerId)}`,
    public_id: publicId,
    resource_type: 'auto',
    type: 'upload',
    overwrite: false,
    use_filename: false,
    unique_filename: false,
  });

  const contentType = file.mimetype || 'application/octet-stream';
  const record = {
    id: uid('file'),
    storageProvider: 'cloudinary',
    cloudinaryPublicId: asset.public_id,
    cloudinaryResourceType: asset.resource_type,
    cloudinaryUrl: asset.secure_url,
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
    // Roll back the remote asset if MongoDB cannot persist its metadata.
    await cloudinary.uploader.destroy(asset.public_id, {
      resource_type: asset.resource_type,
      type: 'upload',
    }).catch(() => {});
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
  if (record.storageProvider === 'cloudinary' && record.cloudinaryUrl) {
    const response = await fetch(record.cloudinaryUrl);
    if (!response.ok) {
      const error = new Error(`Cloudinary file retrieval failed: ${response.status}`);
      error.status = response.status === 404 ? 404 : 502;
      throw error;
    }
    return Buffer.from(await response.arrayBuffer());
  }

  // Backward compatibility for files uploaded before the Cloudinary migration.
  return fsReadFile(resolveLegacyStoragePath(record.storagePath));
}
