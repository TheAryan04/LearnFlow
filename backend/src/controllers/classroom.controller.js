import { listAttendance, recordAttendance, listResults, publishResult } from '../services/classroom.service.js';
import { ok, created, uid } from '../utils/core.js';
import { emit, emitToUser, notify } from '../realtime.js';

export async function listAttendanceHandler(req, res) {
  const data = await listAttendance(req.user, req.query);
  ok(res, data, Array.isArray(data) ? { count: data.length } : {});
}

export async function recordAttendanceHandler(req, res) {
  const entry = await recordAttendance(req.user, req.body || {});
  emit('attendance_updated', entry, `course_${entry.courseId}`);
  await notify({
    id: uid('notif'), title: 'Attendance Logged',
    message: `Attendance for ${entry.courseTitle} on ${entry.date} has been recorded.`,
    date: 'Just now', read: false, type: 'info',
  });
  res.status(201).json({ success: true, message: 'Attendance recorded successfully', data: entry });
}

export async function listResultsHandler(req, res) {
  ok(res, await listResults(req.user, req.query));
}

export async function publishResultHandler(req, res) {
  const entry = await publishResult(req.user, req.body || {});
  emitToUser(entry.studentId, 'result_published', entry);
  await notify({
    id: uid('notif'), userId: entry.studentId, title: 'Final Grade Published',
    message: `Your final score for ${entry.courseTitle} has been published: ${entry.grade} (${entry.totalMarks}/100).`,
    date: 'Just now', read: false, type: 'success',
  });
  created(res, entry, { message: 'Result published successfully' });
}
