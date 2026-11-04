import { Router } from 'express';
import { requireRole } from '../auth.js';
import { adminReportHandler, adminStatsHandler, listUsersHandler, updateUserRoleHandler, updateUserStatusHandler } from '../controllers/admin.controller.js';

const router = Router();
router.use(requireRole('admin'));
router.get('/stats/admin', adminStatsHandler);
router.get('/users', listUsersHandler);
router.put('/users/:id/role', updateUserRoleHandler);
router.put('/users/:id/status', updateUserStatusHandler);
router.get('/admin/reports/:type', adminReportHandler);
export default router;
