import fs from 'fs';
import path from 'path';
import { db } from './core.js';

const COLLECTIONS = ['users', 'courses', 'enrolments', 'assignments', 'submissions', 'attendance', 'results', 'notifications', 'materials', 'discussions'];

export async function seedAndIndex() {
  if ((await db.collection('users').countDocuments()) === 0) {
    const data = JSON.parse(fs.readFileSync(path.resolve('seed_data.json'), 'utf8'));
    for (const [col, items] of Object.entries(data)) {
      if (items.length) await db.collection(col).insertMany(items.map((item, i) => ({ ...item, _order: items.length - i })));
    }
    console.log('Seeded LearnFlow sample data');
  }
  const indexes = await db.collection('users').indexes();
  if (indexes.some((i) => i.name === 'email_1' && i.unique)) await db.collection('users').dropIndex('email_1');
  await db.collection('users').createIndex({ email: 1 });
  await db.collection('users').createIndex({ clerkId: 1 }, { unique: true, partialFilterExpression: { clerkId: { $type: 'string' } } });
  await Promise.all(COLLECTIONS.map((c) => db.collection(c).createIndex({ id: 1 })));
}
