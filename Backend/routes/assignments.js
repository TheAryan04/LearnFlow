import express from 'express';
import uniqid from 'uniqid';
import multer from 'multer';
import { db } from '../data/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// GET /api/assignments
router.get('/', (req, res) => {
  const { courseId } = req.query;
  const assignments = db.get('assignments');
  let filtered = [...assignments];
  if (courseId) {
    filtered = filtered.filter((a) => a.courseId === courseId);
  }
  if (req.user.role === 'student') {
    const enrolledCourseIds = db.get('enrolments')
      .filter((enrolment) => enrolment.userId === req.user.id)
      .map((enrolment) => enrolment.courseId);
    filtered = filtered.filter((assignment) => enrolledCourseIds.includes(assignment.courseId));
  } else if (req.user.role === 'instructor') {
    const instructorCourseIds = db.get('courses')
      .filter((course) => course.instructorId === req.user.id)
      .map((course) => course.id);
    filtered = filtered.filter((assignment) => instructorCourseIds.includes(assignment.courseId));
  }
  res.json({ success: true, count: filtered.length, data: filtered });
});

// POST /api/assignments
router.post('/', requireRole('instructor', 'admin'), (req, res) => {
  const { courseId, title, description, deadline, maxMarks = 100 } = req.body;

  if (!title || !courseId) {
    return res.status(400).json({ success: false, message: 'Title and Course are required' });
  }

  const courses = db.get('courses');
  const course = courses.find((c) => c.id === courseId);
  if (!course || (req.user.role !== 'admin' && course.instructorId !== req.user.id)) {
    return res.status(403).json({ success: false, message: 'Course is unavailable to this instructor' });
  }

  const newAssignment = {
    id: `asg_${uniqid()}`,
    courseId,
    courseTitle: course ? course.title : 'Course Assignment',
    title,
    description: description || '<p>Please complete this assignment.</p>',
    deadline: deadline || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    maxMarks: Number(maxMarks),
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.insert('assignments', newAssignment);

  // Broadcast real-time notification
  const notif = {
    id: `notif_${uniqid()}`,
    title: 'New Assignment Posted',
    message: `${course?.title || 'Course'}: "${title}" is now open for submissions.`,
    date: 'Just now',
    read: false,
    type: 'info',
  };
  db.insert('notifications', notif);

  if (req.io) {
    req.io.emit('new_assignment', newAssignment);
    req.io.emit('notification', notif);
  }

  res.status(201).json({ success: true, data: newAssignment });
});

// GET /api/assignments/submissions
router.get('/submissions', (req, res) => {
  const { assignmentId, studentId } = req.query;
  const submissions = db.get('submissions');
  const assignments = db.get('assignments');
  let filtered = [...submissions];

  if (assignmentId) {
    filtered = filtered.filter((s) => s.assignmentId === assignmentId);
  }
  if (studentId) {
    filtered = filtered.filter((s) => s.studentId === studentId);
  }
  if (req.user.role === 'student') {
    filtered = filtered.filter((submission) => submission.studentId === req.user.id);
  }

  const populated = filtered.map((sub) => {
    const asg = assignments.find((a) => a.id === sub.assignmentId) || {};
    return {
      ...sub,
      assignment: asg,
    };
  });

  res.json({ success: true, count: populated.length, data: populated });
});

// POST /api/assignments/:id/submit
router.post('/:id/submit', requireRole('student'), upload.single('file'), (req, res) => {
  const assignmentId = req.params.id;
  const { notes = '' } = req.body;
  const studentId = req.user.id;

  const assignments = db.get('assignments');
  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found' });
  }

  const submissions = db.get('submissions');
  const existingIndex = submissions.findIndex(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );

  const newSub = {
    id: existingIndex !== -1 ? submissions[existingIndex].id : `sub_${uniqid()}`,
    assignmentId,
    studentId,
    studentName: db.get('users').find((user) => user.id === studentId)?.name || 'Student',
    submittedAt: new Date().toISOString(),
    fileName: req.file ? req.file.originalname : req.body.fileName || 'submission_document.pdf',
    fileUrl: req.file ? `/uploads/${req.file.filename}` : '#',
    notes: notes || req.body.notes || 'Completed work submitted.',
    status: 'Pending',
    marks: null,
    feedback: null,
  };

  if (existingIndex !== -1) {
    db.update('submissions', (s) => s.id === newSub.id, newSub);
  } else {
    db.insert('submissions', newSub);
  }

  if (req.io) {
    req.io.emit('new_submission', newSub);
  }

  res.status(201).json({ success: true, data: newSub });
});

// PUT /api/assignments/submissions/:submissionId/grade
router.put('/submissions/:submissionId/grade', requireRole('instructor', 'admin'), (req, res) => {
  const { marks, feedback } = req.body;
  const submission = db.get('submissions').find((item) => item.id === req.params.submissionId);
  const assignment = submission && db.get('assignments').find((item) => item.id === submission.assignmentId);
  const course = assignment && db.get('courses').find((item) => item.id === assignment.courseId);
  if (!submission || !assignment) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }
  if (req.user.role !== 'admin' && course?.instructorId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Cannot grade another instructor\'s submission' });
  }
  if (!Number.isFinite(Number(marks)) || Number(marks) < 0 || Number(marks) > assignment.maxMarks) {
    return res.status(400).json({ success: false, message: 'Marks must be between 0 and the assignment maximum' });
  }

  const updated = db.update('submissions', (s) => s.id === req.params.submissionId, (s) => ({
    ...s,
    marks: Number(marks),
    feedback: feedback || 'Good work!',
    status: 'Graded',
  }));

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  // Create real-time notification for student
  const notif = {
    id: `notif_${uniqid()}`,
    userId: updated.studentId,
    title: 'Assignment Graded',
    message: `Your submission for ${assignment.title} has been evaluated: ${updated.marks} marks.`,
    date: 'Just now',
    read: false,
    type: 'success',
  };
  db.insert('notifications', notif);

  if (req.io) {
    req.io.emit('assignment_graded', updated);
    req.io.emit('notification', notif);
  }

  res.json({ success: true, data: updated });
});

export default router;
