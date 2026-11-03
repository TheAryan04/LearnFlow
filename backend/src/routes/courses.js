import { Router } from 'express';
import { requireRole } from '../auth.js';
import {
  listCourses, listAllCourses, showCourse, createCourseHandler,
  updateCourseHandler, deleteCourseHandler,
} from '../controllers/courses.controller.js';

const router = Router();

router.get('/courses', listCourses);
router.get('/courses/all', requireRole('instructor', 'admin'), listAllCourses);
router.get('/courses/:id', showCourse);
router.post('/courses', requireRole('instructor', 'admin'), createCourseHandler);
router.put('/courses/:id', requireRole('instructor', 'admin'), updateCourseHandler);
router.delete('/courses/:id', requireRole('instructor', 'admin'), deleteCourseHandler);

export default router;
