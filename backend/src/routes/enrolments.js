import { Router } from 'express';
import { currentUser, requireRole } from '../auth.js';
import {
  listEnrolmentsHandler, enrolStudentHandler, updateStudentProgressHandler, unenrolStudentHandler,
} from '../controllers/enrolments.controller.js';

const router = Router();

router.get('/enrolments', currentUser, listEnrolmentsHandler);
router.post('/enrolments', requireRole('student'), enrolStudentHandler);
router.put('/enrolments/:id/progress', requireRole('student'), updateStudentProgressHandler);
router.delete('/enrolments/:id', requireRole('student'), unenrolStudentHandler);

export default router;
