import { Router } from 'express';
import multer from 'multer';
import { ApiError, db, find, findOne, insert, update, uid, today, nowIso, num, ok, created } from '../core.js';
import { currentUser, requireRole } from '../auth.js';
import { emit, emitToUser, notify, canAccessCourse } from '../realtime.js';
import { saveUpload, readFile } from '../storage.js';
import { scopedCourseIds, inScope } from '../scope.js';
import { ownedCourse } from './courses.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const router = Router();

router.get('/files/:id', async (req, res, next) => {
  if (!req.headers.authorization && req.query.auth) req.headers.authorization = `Bearer ${req.query.auth}`;
  next();
}, currentUser, async (req, res) => {
  const record = await db.collection('files').findOne({ id: req.params.id, isDeleted: false });
  if (!record) throw new ApiError(404, 'File not found');
  const allowed = req.user.role === 'admin' || record.ownerId === req.user.id || (record.courseId && (await canAccessCourse(req.user, record.courseId)));
  if (!allowed) throw new ApiError(403, 'You do not have access to this file');
  res.set('Content-Type', record.contentType);
  res.set('Content-Disposition', `inline; filename="${record.originalFilename.replace(/"/g, '')}"`);
  res.send(await readFile(record));
});

// ---------- materials ----------
router.get('/materials', currentUser, async (req, res) => {
  const items = inScope(await find('materials', req.query.courseId ? { courseId: req.query.courseId } : {}), await scopedCourseIds(req.user));
  ok(res, items, { count: items.length });
});

router.post('/materials', requireRole('instructor', 'admin'), upload.single('file'), async (req, res) => {
  const { title, courseId = 'course_react_mastery', fileType } = req.body || {};
  if (!title) throw new ApiError(400, 'Material title is required');
  await ownedCourse(courseId, req.user);
  const up = await saveUpload(req.file, req.user.id, courseId);
  const material = {
    id: uid('mat'), courseId, title,
    fileType: fileType || (up?.type ? up.type.split('/').pop().toUpperCase() : 'PDF'),
    size: up ? `${(up.size / 1048576).toFixed(1)} MB` : '3.2 MB', uploadedDate: today(), url: up ? up.url : '#',
  };
  await insert('materials', material);
  created(res, material);
});

router.delete('/materials/:id', requireRole('instructor', 'admin'), async (req, res) => {
  const material = await findOne('materials', { id: req.params.id });
  if (!material) throw new ApiError(404, 'Material not found');
  await ownedCourse(material.courseId, req.user);
  await db.collection('materials').deleteOne({ id: req.params.id });
  res.json({ success: true, message: 'Material deleted' });
});

// ---------- assignments ----------
router.get('/assignments', currentUser, async (req, res) => {
  const items = inScope(await find('assignments', req.query.courseId ? { courseId: req.query.courseId } : {}), await scopedCourseIds(req.user));
  ok(res, items, { count: items.length });
});

router.post('/assignments', requireRole('instructor', 'admin'), async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.courseId) throw new ApiError(400, 'Title and Course are required');
  const course = await ownedCourse(body.courseId, req.user);
  const assignment = {
    id: uid('asg'), courseId: course.id, courseTitle: course.title, title: body.title,
    description: body.description || '<p>Please complete this assignment.</p>',
    deadline: body.deadline || new Date(Date.now() + 7 * 864e5).toISOString(),
    maxMarks: num(body.maxMarks || 100, 'Max marks', { int: true }), createdAt: today(),
  };
  await insert('assignments', assignment);
  emit('new_assignment', assignment);
  await notify({ id: uid('notif'), title: 'New Assignment Posted', message: `${course.title}: "${body.title}" is now open for submissions.`, date: 'Just now', read: false, type: 'info' });
  created(res, assignment);
});

router.get('/assignments/submissions', currentUser, async (req, res) => {
  const { assignmentId, studentId } = req.query;
  const query = {};
  if (assignmentId) query.assignmentId = assignmentId;
  if (req.user.role === 'student') query.studentId = req.user.id;
  else if (studentId) query.studentId = studentId;
  const asgs = Object.fromEntries((await find('assignments')).map((a) => [a.id, a]));
  let data = (await find('submissions', query)).map((s) => ({ ...s, assignment: asgs[s.assignmentId] || {} }));
  if (req.user.role === 'instructor') {
    const ids = await scopedCourseIds(req.user);
    data = data.filter((s) => ids.includes(s.assignment.courseId));
  }
  ok(res, data, { count: data.length });
});

router.post('/assignments/:id/submit', requireRole('student'), upload.single('file'), async (req, res) => {
  const asg = await findOne('assignments', { id: req.params.id });
  if (!asg) throw new ApiError(404, 'Assignment not found');
  const existing = await findOne('submissions', { assignmentId: asg.id, studentId: req.user.id });
  const up = await saveUpload(req.file, req.user.id, asg.courseId);
  const sub = {
    id: existing?.id || uid('sub'), assignmentId: asg.id, studentId: req.user.id, studentName: req.user.name,
    submittedAt: nowIso(), fileName: up ? up.name : req.body?.fileName || 'submission_document.pdf',
    fileUrl: up ? up.url : '#', notes: req.body?.notes || 'Completed work submitted.', status: 'Pending', marks: null, feedback: null,
  };
  if (existing) await update('submissions', sub.id, sub);
  else await insert('submissions', sub);
  const course = await findOne('courses', { id: asg.courseId });
  if (course) emitToUser(course.instructorId, 'new_submission', sub);
  created(res, sub);
});

router.put('/assignments/submissions/:id/grade', requireRole('instructor', 'admin'), async (req, res) => {
  const sub = await findOne('submissions', { id: req.params.id });
  const asg = sub && (await findOne('assignments', { id: sub.assignmentId }));
  if (!sub || !asg) throw new ApiError(404, 'Submission not found');
  await ownedCourse(asg.courseId, req.user);
  const marks = num(req.body?.marks, 'Marks', { max: asg.maxMarks });
  const updated = await update('submissions', sub.id, { marks, feedback: req.body?.feedback || 'Good work!', status: 'Graded' });
  emitToUser(updated.studentId, 'assignment_graded', updated);
  await notify({ id: uid('notif'), userId: updated.studentId, title: 'Assignment Graded', message: `Your submission for ${asg.title} has been evaluated: ${marks} marks.`, date: 'Just now', read: false, type: 'success' });
  ok(res, updated);
});

export default router;
