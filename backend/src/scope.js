import { db, find } from './core.js';

// Course ids visible to the user, or null for admins (everything).
export async function scopedCourseIds(user) {
  if (user.role === 'student') return (await find('enrolments', { userId: user.id })).map((e) => e.courseId);
  if (user.role === 'instructor') return (await find('courses', { instructorId: user.id })).map((c) => c.id);
  return null;
}

export const inScope = (items, ids, key = 'courseId') => (ids === null ? items : items.filter((i) => ids.includes(i[key])));

export async function userNames() {
  const users = await db.collection('users').find({}, { projection: { _id: 0, id: 1, name: 1 } }).toArray();
  return Object.fromEntries(users.map((u) => [u.id, u.name]));
}
