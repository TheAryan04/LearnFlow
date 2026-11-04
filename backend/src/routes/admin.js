import { Router } from 'express';
import { requireRole } from '../auth.js';
import { adminReportHandler } from '../controllers/admin.controller.js';

const router = Router();
router.get('/admin/reports/:type', requireRole('admin'), adminReportHandler);
export default router;
