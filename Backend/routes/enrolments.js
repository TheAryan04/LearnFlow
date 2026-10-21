import express from 'express';
import uniqid from 'uniqid';
import { db } from '../data/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/enrolments
router.get('/', (req, res) => {
  const { userId, courseId } = req.query;
  const enrolments = db.get('enrolments');
  const courses = db.get('courses');
  let filtered = [...enrolments];

  if (req.user.role === 'student') {
    filtered = filtered.filter((enrolment) => enrolment.userId === req.user.id);
  }

  if (userId) {
    filtered = filtered.filter((e) => e.userId === userId);
  }
  if (courseId) {
    filtered = filtered.filter((e) => e.courseId === courseId);
  }

  const populated = filtered.map((e) => {
    const course = courses.find((c) => c.id === e.courseId) || {};
    return {
      ...e,
      course,
    };
  });

  res.json({ success: true, count: populated.length, data: populated });
});

// POST /api/enrolments
router.post('/', requireRole('student'), (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  if (!courseId) {
    return res.status(400).json({ success: false, message: 'courseId is required' });
  }

  const enrolments = db.get('enrolments');
  const existing = enrolments.find((e) => e.userId === userId && e.courseId === courseId);
  if (existing) {
    const courses = db.get('courses');
    const course = courses.find((c) => c.id === courseId);
    return res.json({ success: true, message: 'Already enrolled', data: { ...existing, course } });
  }

  const courses = db.get('courses');
  const course = courses.find((c) => c.id === courseId);
  const firstLessonId = course?.curriculum?.[0]?.lessons?.[0]?.id || 'les_101';

  const newEnrolment = {
    id: `enrol_${uniqid()}`,
    userId,
    courseId,
    enrolledDate: new Date().toISOString().split('T')[0],
    progress: 0,
    completedLessons: [],
    lastAccessedLessonId: firstLessonId,
  };

  db.insert('enrolments', newEnrolment);

  // Increment enrolledCount on course
  if (course) {
    db.update('courses', (c) => c.id === courseId, (c) => ({
      ...c,
      enrolledCount: (c.enrolledCount || 0) + 1,
    }));
  }

  if (req.io) {
    req.io.emit('new_enrolment', { userId, courseId });
  }

  res.status(201).json({ success: true, data: { ...newEnrolment, course } });
});

// PUT /api/enrolments/:id/progress
router.put('/:id/progress', requireRole('student'), (req, res) => {
  const { lessonId, completed = true, progress } = req.body;
  const courses = db.get('courses');

  const updated = db.update('enrolments', (e) => e.id === req.params.id, (enrolment) => {
    if (enrolment.userId !== req.user.id) return enrolment;
    let completedLessons = [...(enrolment.completedLessons || [])];

    if (lessonId) {
      if (completed && !completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      } else if (!completed) {
        completedLessons = completedLessons.filter((id) => id !== lessonId);
      }
    }

    const course = courses.find((c) => c.id === enrolment.courseId);
    let totalLessons = 0;
    course?.curriculum?.forEach((sec) => {
      totalLessons += sec.lessons?.length || 0;
    });

    let computedProgress =
      progress !== undefined
        ? Number(progress)
        : totalLessons > 0
        ? Math.round((completedLessons.length / totalLessons) * 100)
        : 100;

    computedProgress = Math.min(100, Math.max(0, computedProgress));

    return {
      ...enrolment,
      completedLessons,
      progress: computedProgress,
      lastAccessedLessonId: lessonId || enrolment.lastAccessedLessonId,
    };
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Enrolment not found' });
  }
  if (updated.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Cannot update another student\'s progress' });
  }

  if (req.io) {
    req.io.emit('progress_updated', updated);
  }

  res.json({ success: true, data: updated });
});

export default router;
