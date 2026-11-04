import { Router } from 'express';
import multer from 'multer';
import { requireRole } from '../auth.js';
import {
  listCourses, listAllCourses, showCourse, createCourseHandler,
  updateCourseHandler, deleteCourseHandler,
} from '../controllers/courses.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/courses', listCourses);
router.get('/courses/all', requireRole('instructor', 'admin'), listAllCourses);
router.get('/courses/:id', showCourse);
router.post('/courses', requireRole('instructor', 'admin'), upload.single('thumbnail'), createCourseHandler);
router.put('/courses/:id', requireRole('instructor', 'admin'), updateCourseHandler);
router.delete('/courses/:id', requireRole('instructor', 'admin'), deleteCourseHandler);

export default router;
