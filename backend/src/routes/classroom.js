import { Router } from 'express';
import { currentUser, requireRole } from '../auth.js';
import {
  listAttendanceHandler, recordAttendanceHandler, listResultsHandler, publishResultHandler,
} from '../controllers/classroom.controller.js';

const router = Router();

router.get('/attendance', currentUser, listAttendanceHandler);
router.post('/attendance', requireRole('instructor', 'admin'), recordAttendanceHandler);
router.get('/results', currentUser, listResultsHandler);
router.post('/results', requireRole('instructor', 'admin'), publishResultHandler);

export default router;
