import { Router } from 'express';
import multer from 'multer';
import { currentUser, requireRole } from '../auth.js';
import {
  getFileHandler, listMaterialsHandler, createMaterialHandler, deleteMaterialHandler,
  listAssignmentsHandler, createAssignmentHandler, listSubmissionsHandler,
  submitAssignmentHandler, gradeSubmissionHandler,
} from '../controllers/coursework.controller.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const router = Router();

router.get('/files/:id', (req, res, next) => {
  if (!req.headers.authorization && req.query.auth) req.headers.authorization = `Bearer ${req.query.auth}`;
  next();
}, currentUser, getFileHandler);

router.get('/materials', currentUser, listMaterialsHandler);
router.post('/materials', requireRole('instructor', 'admin'), upload.single('file'), createMaterialHandler);
router.delete('/materials/:id', requireRole('instructor', 'admin'), deleteMaterialHandler);

router.get('/assignments', currentUser, listAssignmentsHandler);
router.post('/assignments', requireRole('instructor', 'admin'), createAssignmentHandler);
router.get('/assignments/submissions', currentUser, listSubmissionsHandler);
router.post('/assignments/:id/submit', requireRole('student'), upload.single('file'), submitAssignmentHandler);
router.put('/assignments/submissions/:id/grade', requireRole('instructor', 'admin'), gradeSubmissionHandler);

export default router;
