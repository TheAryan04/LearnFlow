import express from 'express';
import uniqid from 'uniqid';
import { db } from '../data/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

export function computeGrade(marks) {
  const m = Number(marks);
  if (m >= 90) return { grade: 'A+', gpa: 4.0 };
  if (m >= 80) return { grade: 'A', gpa: 3.8 };
  if (m >= 75) return { grade: 'B+', gpa: 3.4 };
  if (m >= 70) return { grade: 'B', gpa: 3.0 };
  if (m >= 60) return { grade: 'C+', gpa: 2.5 };
  if (m >= 50) return { grade: 'C', gpa: 2.0 };
  if (m >= 40) return { grade: 'D', gpa: 1.5 };
  return { grade: 'F', gpa: 0.0 };
}

// GET /api/results
router.get('/', (req, res) => {
  const { studentId } = req.query;
  const results = db.get('results');
  let filtered = [...results];

  if (req.user.role === 'student') {
    filtered = filtered.filter((r) => r.studentId === req.user.id);
  } else if (studentId) {
    filtered = filtered.filter((r) => r.studentId === studentId);
  }

  let totalGpa = 0;
  filtered.forEach((r) => {
    totalGpa += Number(r.gpa || 0);
  });
  const cumulativeGpa = filtered.length > 0 ? (totalGpa / filtered.length).toFixed(2) : '0.00';

  res.json({
    success: true,
    data: {
      results: filtered,
      cumulativeGpa: Number(cumulativeGpa),
      totalGradedCourses: filtered.length,
    },
  });
});

// POST /api/results
router.post('/', requireRole('instructor', 'admin'), (req, res) => {
  const { studentId, courseId, totalMarks, remarks = '' } = req.body;

  if (!courseId || totalMarks === undefined) {
    return res.status(400).json({ success: false, message: 'courseId and totalMarks are required' });
  }

  const courses = db.get('courses');
  const course = courses.find((c) => c.id === courseId);
  const { grade, gpa } = computeGrade(totalMarks);

  const results = db.get('results');
  const existingIndex = results.findIndex(
    (r) => r.studentId === studentId && r.courseId === courseId
  );

  const resultEntry = {
    id: existingIndex !== -1 ? results[existingIndex].id : `res_${uniqid()}`,
    studentId,
    courseId,
    courseTitle: course ? course.title : 'Course Result',
    totalMarks: Number(totalMarks),
    grade,
    gpa,
    remarks: remarks || `Demonstrated ${grade} tier proficiency.`,
    publishedDate: new Date().toISOString().split('T')[0],
  };

  if (existingIndex !== -1) {
    db.update('results', (r) => r.id === resultEntry.id, resultEntry);
  } else {
    db.insert('results', resultEntry);
  }

  // Create real-time notification
  const notif = {
    id: `notif_${uniqid()}`,
    userId: studentId,
    title: 'Final Grade Published',
    message: `Your final score for ${course?.title || 'Course'} has been published: ${resultEntry.grade} (${resultEntry.totalMarks}/100).`,
    date: 'Just now',
    read: false,
    type: 'success',
  };
  db.insert('notifications', notif);

  if (req.io) {
    req.io.emit('result_published', resultEntry);
    req.io.emit('notification', notif);
  }

  res.status(201).json({
    success: true,
    message: 'Result published successfully',
    data: resultEntry,
  });
});

export default router;
