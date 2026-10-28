import { Router } from 'express';
import { ApiError, db, find, findOne, insert, update, uid, today, num, ok, created } from '../core.js';
import { currentUser, requireRole } from '../auth.js';
import { emit, emitToUser, notify } from '../realtime.js';
import { scopedCourseIds, inScope } from '../scope.js';
import { ownedCourse } from './courses.js';

const GRADES = [[90, 'A+', 4.0], [80, 'A', 3.8], [75, 'B+', 3.4], [70, 'B', 3.0], [60, 'C+', 2.5], [50, 'C', 2.0], [40, 'D', 1.5]];
const computeGrade = (m) => (GRADES.find(([limit]) => m >= limit) || [0, 'F', 0.0]).slice(1);

const router = Router();

// ---------- attendance ----------
router.get('/attendance', currentUser, async (req, res) => {
  const { courseId, studentId } = req.query;
  let records = await find('attendance', courseId ? { courseId } : {});
  if (req.user.role === 'instructor') records = inScope(records, await scopedCourseIds(req.user));
  if (studentId) {
    const sid = req.user.role === 'student' ? req.user.id : studentId;
    const counts = { Present: 0, Late: 0, Absent: 0 };
    const history = [];
    for (const s of records) {
      const rec = (s.records || []).find((r) => r.studentId === sid);
      if (!rec) continue;
      counts[rec.status in counts ? rec.status : 'Absent'] += 1;
      history.push({ sessionId: s.id, courseId: s.courseId, courseTitle: s.courseTitle, date: s.date, status: rec.status });
    }
    const total = history.length;
    return ok(res, {
      totalSessions: total, presentCount: counts.Present, lateCount: counts.Late, absentCount: counts.Absent,
      attendanceRate: total ? Math.round(((counts.Present + counts.Late * 0.5) / total) * 100) : 100, history,
    });
  }
  if (req.user.role === 'student') {
    records = records
      .map((s) => ({ ...s, records: (s.records || []).filter((r) => r.studentId === req.user.id) }))
      .filter((s) => s.records.length);
  }
  ok(res, records, { count: records.length });
});

router.post('/attendance', requireRole('instructor', 'admin'), async (req, res) => {
  const { courseId, date, records = [] } = req.body || {};
  if (!courseId || !date) throw new ApiError(400, 'courseId and date are required');
  const course = await ownedCourse(courseId, req.user);
  const existing = await findOne('attendance', { courseId, date });
  const entry = { id: existing?.id || uid('att'), courseId, courseTitle: course.title, date, records };
  if (existing) await update('attendance', entry.id, entry);
  else await insert('attendance', entry);
  emit('attendance_updated', entry, `course_${courseId}`);
  await notify({ id: uid('notif'), title: 'Attendance Logged', message: `Attendance for ${course.title} on ${date} has been recorded.`, date: 'Just now', read: false, type: 'info' });
  res.status(201).json({ success: true, message: 'Attendance recorded successfully', data: entry });
});

// ---------- results ----------
router.get('/results', currentUser, async (req, res) => {
  const { studentId } = req.query;
  const query = req.user.role === 'student' ? { studentId: req.user.id } : studentId ? { studentId } : {};
  let results = await find('results', query);
  if (req.user.role === 'instructor') results = inScope(results, await scopedCourseIds(req.user));
  const gpa = results.length ? Math.round((results.reduce((a, r) => a + Number(r.gpa || 0), 0) / results.length) * 100) / 100 : 0;
  ok(res, { results, cumulativeGpa: gpa, totalGradedCourses: results.length });
});

router.post('/results', requireRole('instructor', 'admin'), async (req, res) => {
  const { courseId, totalMarks, studentId, remarks } = req.body || {};
  if (!courseId || totalMarks == null) throw new ApiError(400, 'courseId and totalMarks are required');
  const total = num(totalMarks, 'Total marks', { max: 100 });
  if (!studentId || !(await db.collection('users').findOne({ id: studentId, role: 'Student' }))) throw new ApiError(400, 'A valid studentId is required');
  const course = await ownedCourse(courseId, req.user);
  if (!(await db.collection('enrolments').findOne({ userId: studentId, courseId }))) throw new ApiError(400, 'This student is not enrolled in the course');
  const [grade, gpa] = computeGrade(total);
  const existing = await findOne('results', { studentId, courseId });
  const entry = {
    id: existing?.id || uid('res'), studentId, courseId, courseTitle: course.title, totalMarks: total, grade, gpa,
    remarks: remarks || `Demonstrated ${grade} tier proficiency.`, publishedDate: today(),
  };
  if (existing) await update('results', entry.id, entry);
  else await insert('results', entry);
  emitToUser(studentId, 'result_published', entry);
  await notify({ id: uid('notif'), userId: studentId, title: 'Final Grade Published', message: `Your final score for ${course.title} has been published: ${grade} (${total}/100).`, date: 'Just now', read: false, type: 'success' });
  created(res, entry, { message: 'Result published successfully' });
});

export default router;
