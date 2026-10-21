import express from 'express';
import uniqid from 'uniqid';
import { db } from '../data/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/attendance
router.get('/', (req, res) => {
  const { courseId, studentId } = req.query;
  const attendanceRecords = db.get('attendance');
  let records = [...attendanceRecords];

  if (courseId) {
    records = records.filter((a) => a.courseId === courseId);
  }

  if (studentId) {
    const requestedStudentId = req.user.role === 'student' ? req.user.id : studentId;
    let totalSessions = 0;
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    const studentHistory = [];

    records.forEach((session) => {
      const studentRecord = session.records?.find((r) => r.studentId === requestedStudentId);
      if (studentRecord) {
        totalSessions++;
        if (studentRecord.status === 'Present') presentCount++;
        else if (studentRecord.status === 'Late') lateCount++;
        else absentCount++;

        studentHistory.push({
          sessionId: session.id,
          courseId: session.courseId,
          courseTitle: session.courseTitle,
          date: session.date,
          status: studentRecord.status,
        });
      }
    });


  if (req.user.role === 'student') {
    records = records
      .map((session) => ({
        ...session,
        records: (session.records || []).filter((record) => record.studentId === req.user.id),
      }))
      .filter((session) => session.records.length > 0);
  }
    const attendanceRate =
      totalSessions > 0
        ? Math.round(((presentCount + lateCount * 0.5) / totalSessions) * 100)
        : 100;

    return res.json({
      success: true,
      data: {
        totalSessions,
        presentCount,
        lateCount,
        absentCount,
        attendanceRate,
        history: studentHistory,
      },
    });
  }

  if (req.user.role === 'student') {
    records = records
      .map((session) => ({
        ...session,
        records: (session.records || []).filter((record) => record.studentId === req.user.id),
      }))
      .filter((session) => session.records.length > 0);
  }

  res.json({ success: true, count: records.length, data: records });
});

// POST /api/attendance
router.post('/', requireRole('instructor', 'admin'), (req, res) => {
  const { courseId, date, records = [] } = req.body;

  if (!courseId || !date) {
    return res.status(400).json({ success: false, message: 'courseId and date are required' });
  }

  const courses = db.get('courses');
  const course = courses.find((c) => c.id === courseId);
  const attendanceRecords = db.get('attendance');
  const existingIndex = attendanceRecords.findIndex(
    (a) => a.courseId === courseId && a.date === date
  );

  const sessionEntry = {
    id: existingIndex !== -1 ? attendanceRecords[existingIndex].id : `att_${uniqid()}`,
    courseId,
    courseTitle: course ? course.title : 'Course Attendance',
    date,
    records,
  };

  if (existingIndex !== -1) {
    db.update('attendance', (a) => a.id === sessionEntry.id, sessionEntry);
  } else {
    db.insert('attendance', sessionEntry);
  }

  // Create real-time notification
  const notif = {
    id: `notif_${uniqid()}`,
    title: 'Attendance Logged',
    message: `Attendance for ${course?.title || 'Course'} on ${date} has been recorded.`,
    date: 'Just now',
    read: false,
    type: 'info',
  };
  db.insert('notifications', notif);

  if (req.io) {
    req.io.emit('attendance_updated', sessionEntry);
    req.io.emit('notification', notif);
  }

  res.status(201).json({
    success: true,
    message: 'Attendance recorded successfully',
    data: sessionEntry,
  });
});

export default router;
