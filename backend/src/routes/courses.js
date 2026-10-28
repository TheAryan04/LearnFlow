import { Router } from 'express';
import { ApiError, db, find, findOne, insert, update, uid, num, ok, created } from '../core.js';
import { requireRole } from '../auth.js';
import { emit } from '../realtime.js';

const YT_RE = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
const youtubeId = (url) => (String(url || '').match(YT_RE) || [])[1] || null;
const EDITABLE = ['title', 'category', 'price', 'thumbnail', 'description', 'curriculum', 'previewYoutubeUrl', 'status', 'level', 'language', 'shortDescription', 'featured'];
const SORTS = { popular: ['enrolledCount', -1], 'price-low': ['price', 1], 'price-high': ['price', -1], rating: ['rating', -1] };

export async function ownedCourse(courseId, user) {
  const course = await findOne('courses', { id: courseId });
  if (!course) throw new ApiError(404, 'Course not found');
  if (user.role !== 'admin' && course.instructorId !== user.id) throw new ApiError(403, "Cannot modify another instructor's course");
  return course;
}

const router = Router();

router.get('/courses', async (req, res) => {
  const { search, category, sort } = req.query;
  let courses = await find('courses', { status: 'published' });
  if (category && category !== 'All') courses = courses.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    courses = courses.filter((c) => [c.title, c.category, c.instructorName].some((v) => v.toLowerCase().includes(q)));
  }
  if (SORTS[sort]) {
    const [key, dir] = SORTS[sort];
    courses.sort((a, b) => ((a[key] || 0) - (b[key] || 0)) * dir);
  }
  ok(res, courses, { count: courses.length });
});

router.get('/courses/all', requireRole('instructor', 'admin'), async (req, res) => {
  const courses = await find('courses', req.user.role === 'admin' ? {} : { instructorId: req.user.id });
  ok(res, courses, { count: courses.length });
});

router.get('/courses/:id', async (req, res) => {
  const course = await findOne('courses', { id: req.params.id });
  if (!course) throw new ApiError(404, 'Course not found');
  ok(res, course);
});

router.post('/courses', requireRole('instructor', 'admin'), async (req, res) => {
  const body = req.body || {};
  if (!body.title) throw new ApiError(400, 'Course title is required');
  let owner = await findOne('users', { id: req.user.id });
  if (req.user.role === 'admin' && body.instructorId) {
    owner = await findOne('users', { id: body.instructorId, role: 'Instructor' });
    if (!owner) throw new ApiError(400, 'Instructor not found');
  }
  const preview = body.previewYoutubeUrl || 'https://www.youtube.com/watch?v=bMknfKXIFA8';
  const course = {
    id: uid('course'), title: body.title, category: body.category || 'Development',
    price: num(body.price ?? 0, 'Price'), rating: 5.0, reviewCount: 0,
    instructorId: owner.id, instructorName: owner.name, instructorAvatar: owner.avatar,
    thumbnail: body.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    durationMs: 7200000, enrolledCount: 0, status: body.status || 'draft', featured: false,
    previewYoutubeUrl: preview, previewYoutubeId: youtubeId(preview) || 'bMknfKXIFA8',
    description: body.description || '<p>Welcome to this course.</p>', curriculum: body.curriculum || [], reviews: [],
  };
  for (const k of ['level', 'language', 'shortDescription']) if (k in body) course[k] = body[k];
  await insert('courses', course);
  emit('course_published', course);
  created(res, course);
});

router.put('/courses/:id', requireRole('instructor', 'admin'), async (req, res) => {
  await ownedCourse(req.params.id, req.user);
  const changes = Object.fromEntries(Object.entries(req.body || {}).filter(([k]) => EDITABLE.includes(k)));
  if ('featured' in changes && req.user.role !== 'admin') delete changes.featured;
  if ('price' in changes) changes.price = num(changes.price, 'Price');
  if (youtubeId(changes.previewYoutubeUrl)) changes.previewYoutubeId = youtubeId(changes.previewYoutubeUrl);
  const updated = await update('courses', req.params.id, changes);
  emit('course_updated', updated);
  ok(res, updated);
});

router.delete('/courses/:id', requireRole('instructor', 'admin'), async (req, res) => {
  await ownedCourse(req.params.id, req.user);
  await db.collection('courses').deleteOne({ id: req.params.id });
  emit('course_deleted', req.params.id);
  res.json({ success: true, message: 'Course deleted successfully' });
});

export default router;
