import { Router } from 'express';
import { currentUser, requireRole } from '../auth.js';
import {
  listEnrolmentsHandler, enrolStudentHandler, updateStudentProgressHandler,
} from '../controllers/enrolments.controller.js';

const router = Router();

router.get('/enrolments', currentUser, listEnrolmentsHandler);
router.post('/enrolments', requireRole('student'), enrolStudentHandler);
router.put('/enrolments/:id/progress', requireRole('student'), updateStudentProgressHandler);

export default router;
