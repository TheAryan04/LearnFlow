// Backwards-compatible facade. New modules should import from config/, repositories/ and utils/.
export { db, connectDb, client } from './config/database.js';
export { PROJECTION as PROJ, find, findOne, insert, update } from './repositories/collection.repository.js';
export { ApiError, uid, nowIso, today, num, publicUser, ok, created } from './utils/core.js';
