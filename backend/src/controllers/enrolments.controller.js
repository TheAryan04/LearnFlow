import { listEnrolments, enrolStudent, updateStudentProgress, unenrolStudent } from '../services/enrolment.service.js';
import { ok, created } from '../utils/core.js';
import { emit } from '../realtime.js';

export async function listEnrolmentsHandler(req, res) {
  const items = await listEnrolments(req.user, req.query);
  ok(res, items, { count: items.length });
}

export async function enrolStudentHandler(req, res) {
  const { enrolment, alreadyEnrolled } = await enrolStudent(req.user, req.body?.courseId);
  if (alreadyEnrolled) return res.json({ success: true, message: 'Already enrolled', data: enrolment });
  emit('new_enrolment', { userId: req.user.id, courseId: enrolment.courseId });
  created(res, enrolment);
}

export async function updateStudentProgressHandler(req, res) {
  const updated = await updateStudentProgress(req.user, req.params.id, req.body);
  emit('progress_updated', updated, `user_${req.user.id}`);
  ok(res, updated);
}

export async function unenrolStudentHandler(req, res) {
  const removed = await unenrolStudent(req.user, req.params.id);
  emit('student_unenrolled', { userId: req.user.id, courseId: removed.courseId });
  res.json({ success: true, message: 'You have been unenrolled from this course', data: removed });
}
