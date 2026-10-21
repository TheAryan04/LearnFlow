import express from 'express';
import uniqid from 'uniqid';
import { db } from '../data/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/courses
router.get('/', (req, res) => {
  const { search, category, sort } = req.query;
  const courses = db.get('courses');
  let filtered = courses.filter((course) => course.status === 'published');

  if (category && category !== 'All') {
    filtered = filtered.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q)
    );
  }

  if (sort === 'popular') {
    filtered.sort((a, b) => b.enrolledCount - a.enrolledCount);
  } else if (sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
  const courses = db.get('courses');
  const course = courses.find((c) => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  res.json({ success: true, data: course });
});

// POST /api/courses
router.post('/', requireAuth, requireRole('instructor', 'admin'), (req, res) => {
  const {
    title,
    category,
    price = 0,
    thumbnail,
    description,
    curriculum = [],
    previewYoutubeUrl,
    instructorName,
    instructorId,
  } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Course title is required' });
  }

  let previewYoutubeId = 'bMknfKXIFA8';
  if (previewYoutubeUrl) {
    const match = previewYoutubeUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    if (match && match[1]) previewYoutubeId = match[1];
  }

  const newCourse = {
    id: `course_${uniqid()}`,
    title,
    category: category || 'Development',
    price: Number(price) || 0,
    rating: 5.0,
    reviewCount: 0,
    instructorId: req.user.role === 'admin' && instructorId ? instructorId : req.user.id,
    instructorName: db.get('users').find((user) => user.id === req.user.id)?.name || instructorName || 'Instructor',
    instructorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    thumbnail:
      thumbnail ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    durationMs: 7200000,
    enrolledCount: 0,
    status: 'draft',
    featured: false,
    previewYoutubeUrl: previewYoutubeUrl || 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    previewYoutubeId,
    description: description || '<p>Welcome to this course.</p>',
    curriculum,
    reviews: [],
  };

  db.insert('courses', newCourse);

  // Real-time broadcast
  if (req.io) {
    req.io.emit('course_published', newCourse);
  }

  res.status(201).json({ success: true, data: newCourse });
});

// PUT /api/courses/:id
router.put('/:id', requireAuth, requireRole('instructor', 'admin'), (req, res) => {
  const course = db.get('courses').find((item) => item.id === req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  if (req.user.role !== 'admin' && course.instructorId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Cannot edit another instructor\'s course' });
  }

  const updated = db.update('courses', (c) => c.id === req.params.id, (c) => {
    const { instructorId, instructorName, ...changes } = req.body;
    const item = { ...c, ...changes };
    if (req.body.previewYoutubeUrl) {
      const match = req.body.previewYoutubeUrl.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
      );
      if (match && match[1]) item.previewYoutubeId = match[1];
    }
    return item;
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  if (req.io) {
    req.io.emit('course_updated', updated);
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/courses/:id
router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), (req, res) => {
  const course = db.get('courses').find((item) => item.id === req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  if (req.user.role !== 'admin' && course.instructorId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Cannot delete another instructor\'s course' });
  }
  const deleted = db.delete('courses', (c) => c.id === req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  if (req.io) {
    req.io.emit('course_deleted', req.params.id);
  }
  res.json({ success: true, message: 'Course deleted successfully' });
});

export default router;
