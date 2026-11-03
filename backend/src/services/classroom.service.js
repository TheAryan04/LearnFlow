import { ApiError, db, find, findOne, insert, update, uid, today, num } from '../core.js';
import { scopedCourseIds, inScope } from '../scope.js';
import { ownedCourse } from './course.service.js';

const GRADES = [[90, 'A+', 4.0], [80, 'A', 3.8], [75, 'B+', 3.4], [70, 'B', 3.0], [60, 'C+', 2.5], [50, 'C', 2.0], [40, 'D', 1.5]];
const computeGrade = (marks) => (GRADES.find(([limit]) => marks >= limit) || [0, 'F', 0.0]).slice(1);

export async function listAttendance(user, { courseId, studentId }) {
  let records = await find('attendance', courseId ? { courseId } : {});
  if (user.role === 'instructor') records = inScope(records, await scopedCourseIds(user));
  if (studentId) {
    const sid = user.role === 'student' ? user.id : studentId;
    const counts = { Present: 0, Late: 0, Absent: 0 };
    const history = [];
    for (const session of records) {
      const record = (session.records || []).find((item) => item.studentId === sid);
      if (!record) continue;
      counts[record.status in counts ? record.status : 'Absent'] += 1;
      history.push({ sessionId: session.id, courseId: session.courseId, courseTitle: session.courseTitle, date: session.date, status: record.status });
    }
    const total = history.length;
    return {
      totalSessions: total, presentCount: counts.Present, lateCount: counts.Late, absentCount: counts.Absent,
      attendanceRate: total ? Math.round(((counts.Present + counts.Late * 0.5) / total) * 100) : 100, history,
    };
  }
  if (user.role === 'student') {
    records = records
      .map((session) => ({ ...session, records: (session.records || []).filter((record) => record.studentId === user.id) }))
      .filter((session) => session.records.length);
  }
  return records;
}

export async function recordAttendance(user, { courseId, date, records = [] }) {
  if (!courseId || !date) throw new ApiError(400, 'courseId and date are required');
  const course = await ownedCourse(courseId, user);
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new ApiError(400, 'date must be a valid YYYY-MM-DD date');
  }
  if (!Array.isArray(records)) throw new ApiError(400, 'records must be an array');
  const seen = new Set();
  for (const record of records) {
    if (!record?.studentId || seen.has(record.studentId)) throw new ApiError(400, 'Each attendance record must contain a unique studentId');
    seen.add(record.studentId);
    if (!['Present', 'Late', 'Absent'].includes(record.status)) throw new ApiError(400, 'Attendance status must be Present, Late, or Absent');
    const enrolled = await db.collection('enrolments').findOne({ userId: record.studentId, courseId });
    if (!enrolled) throw new ApiError(400, 'Attendance can only be recorded for enrolled students');
  }
  const existing = await findOne('attendance', { courseId, date });
  const entry = { id: existing?.id || uid('att'), courseId, courseTitle: course.title, date, records };
  if (existing) await update('attendance', entry.id, entry);
  else await insert('attendance', entry);
  return entry;
}

export async function listResults(user, { studentId }) {
  const query = user.role === 'student' ? { studentId: user.id } : studentId ? { studentId } : {};
  let results = await find('results', query);
  if (user.role === 'instructor') results = inScope(results, await scopedCourseIds(user));
  const gpa = results.length
    ? Math.round((results.reduce((total, result) => total + Number(result.gpa || 0), 0) / results.length) * 100) / 100
    : 0;
  return { results, cumulativeGpa: gpa, totalGradedCourses: results.length };
}

export async function publishResult(user, { courseId, totalMarks, studentId, remarks }) {
  if (!courseId || totalMarks == null) throw new ApiError(400, 'courseId and totalMarks are required');
  const total = num(totalMarks, 'Total marks', { max: 100 });
  if (!studentId || !(await db.collection('users').findOne({ id: studentId, role: 'Student' }))) {
    throw new ApiError(400, 'A valid studentId is required');
  }
  const course = await ownedCourse(courseId, user);
  if (!(await db.collection('enrolments').findOne({ userId: studentId, courseId }))) {
    throw new ApiError(400, 'This student is not enrolled in the course');
  }
  const [grade, gpa] = computeGrade(total);
  const existing = await findOne('results', { studentId, courseId });
  const entry = {
    id: existing?.id || uid('res'), studentId, courseId, courseTitle: course.title, totalMarks: total, grade, gpa,
    remarks: remarks || `Demonstrated ${grade} tier proficiency.`, publishedDate: today(),
  };
  if (existing) await update('results', entry.id, entry);
  else await insert('results', entry);
  return entry;
}
