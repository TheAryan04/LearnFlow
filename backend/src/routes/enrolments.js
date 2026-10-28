import { Router } from 'express';
import { ApiError, db, find, findOne, insert, update, uid, today, num, ok, created } from '../core.js';
import { currentUser, requireRole } from '../auth.js';
import { emit } from '../realtime.js';
import { scopedCourseIds, inScope, userNames } from '../scope.js';

const router = Router();

router.get('/enrolments', currentUser, async (req, res) => {
  const { userId, courseId } = req.query;
  const query = {};
  if (req.user.role === 'student') query.userId = req.user.id;
  else if (userId) query.userId = userId;
  if (courseId) query.courseId = courseId;
  const items = inScope(await find('enrolments', query), req.user.role === 'instructor' ? await scopedCourseIds(req.user) : null);
  const courses = Object.fromEntries((await find('courses')).map((c) => [c.id, c]));
  const names = await userNames();
  const data = items.map((e) => ({ ...e, course: courses[e.courseId] || {}, studentName: names[e.userId] || 'Student' }));
  ok(res, data, { count: data.length });
});

router.post('/enrolments', requireRole('student'), async (req, res) => {
  const courseId = req.body?.courseId;
  if (!courseId) throw new ApiError(400, 'courseId is required');
  const course = await findOne('courses', { id: courseId });
  if (!course || course.status !== 'published') throw new ApiError(404, 'Course not found');
  const existing = await findOne('enrolments', { userId: req.user.id, courseId });
  if (existing) return res.json({ success: true, message: 'Already enrolled', data: { ...existing, course } });
  const firstLesson = course.curriculum?.[0]?.lessons?.[0]?.id || 'les_101';
  const enrolment = {
    id: uid('enrol'), userId: req.user.id, courseId, enrolledDate: today(),
    progress: 0, completedLessons: [], lastAccessedLessonId: firstLesson,
  };
  await insert('enrolments', enrolment);
  await db.collection('courses').updateOne({ id: courseId }, { $inc: { enrolledCount: 1 } });
  emit('new_enrolment', { userId: req.user.id, courseId });
  created(res, { ...enrolment, course });
});

router.put('/enrolments/:id/progress', requireRole('student'), async (req, res) => {
  const enrolment = await findOne('enrolments', { id: req.params.id });
  if (!enrolment) throw new ApiError(404, 'Enrolment not found');
  if (enrolment.userId !== req.user.id) throw new ApiError(403, "Cannot update another student's progress");
  const { lessonId, completed = true, progress: rawProgress } = req.body || {};
  let done = [...(enrolment.completedLessons || [])];
  if (lessonId) {
    if (completed && !done.includes(lessonId)) done.push(lessonId);
    if (!completed) done = done.filter((x) => x !== lessonId);
  }
  const course = (await findOne('courses', { id: enrolment.courseId })) || {};
  const total = (course.curriculum || []).reduce((n, s) => n + (s.lessons || []).length, 0);
  const progress = rawProgress != null ? num(rawProgress, 'Progress', { max: 100 }) : total ? Math.round((done.length / total) * 100) : 100;
  const updated = await update('enrolments', req.params.id, {
    completedLessons: done, progress, lastAccessedLessonId: lessonId || enrolment.lastAccessedLessonId,
  });
  emit('progress_updated', updated, `user_${req.user.id}`);
  ok(res, updated);
});

export default router;
