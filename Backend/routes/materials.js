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

// GET /api/materials
router.get('/', (req, res) => {
  const { courseId } = req.query;
  const materials = db.get('materials');
  let filtered = [...materials];
  if (courseId) {
    filtered = filtered.filter((m) => m.courseId === courseId);
  }
  if (req.user.role === 'student') {
    const enrolledCourseIds = db.get('enrolments')
      .filter((enrolment) => enrolment.userId === req.user.id)
      .map((enrolment) => enrolment.courseId);
    filtered = filtered.filter((material) => enrolledCourseIds.includes(material.courseId));
  } else if (req.user.role === 'instructor') {
    const instructorCourseIds = db.get('courses')
      .filter((course) => course.instructorId === req.user.id)
      .map((course) => course.id);
    filtered = filtered.filter((material) => instructorCourseIds.includes(material.courseId));
  }
  res.json({ success: true, count: filtered.length, data: filtered });
});

// POST /api/materials
router.post('/', requireRole('instructor', 'admin'), upload.single('file'), (req, res) => {
  const { courseId = 'course_react_mastery', title, fileType } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Material title is required' });
  }
  const course = db.get('courses').find((item) => item.id === courseId);
  if (!course || (req.user.role !== 'admin' && course.instructorId !== req.user.id)) {
    return res.status(403).json({ success: false, message: 'Course is unavailable to this instructor' });
  }

  const newMaterial = {
    id: `mat_${uniqid()}`,
    courseId,
    title,
    fileType: fileType || (req.file ? req.file.mimetype.split('/')[1].toUpperCase() : 'PDF'),
    size: req.file ? `${(req.file.size / (1024 * 1024)).toFixed(1)} MB` : '3.2 MB',
    uploadedDate: new Date().toISOString().split('T')[0],
    url: req.file ? `/uploads/${req.file.filename}` : '#',
  };

  db.insert('materials', newMaterial);
  res.status(201).json({ success: true, data: newMaterial });
});

// DELETE /api/materials/:id
router.delete('/:id', requireRole('instructor', 'admin'), (req, res) => {
  const material = db.get('materials').find((item) => item.id === req.params.id);
  const course = material && db.get('courses').find((item) => item.id === material.courseId);
  if (!material) {
    return res.status(404).json({ success: false, message: 'Material not found' });
  }
  if (req.user.role !== 'admin' && course?.instructorId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Cannot delete another instructor\'s material' });
  }
  const deleted = db.delete('materials', (m) => m.id === req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Material not found' });
  }
  res.json({ success: true, message: 'Material deleted' });
});

export default router;
