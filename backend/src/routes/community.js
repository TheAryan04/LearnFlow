import { Router } from 'express';
import { currentUser, requireRole } from '../auth.js';
import {
  listUsersHandler, changeUserRoleHandler, changeUserStatusHandler,
  listNotificationsHandler, markAllNotificationsReadHandler, markNotificationReadHandler,
  listDiscussionsHandler, createDiscussionHandler, adminStatsHandler,
  instructorStatsHandler, healthHandler,
} from '../controllers/community.controller.js';

const router = Router();

router.get('/users', requireRole('admin', 'instructor'), listUsersHandler);
router.put('/users/:id/role', requireRole('admin'), changeUserRoleHandler);
router.put('/users/:id/status', requireRole('admin'), changeUserStatusHandler);

router.get('/notifications', currentUser, listNotificationsHandler);
router.put('/notifications/read-all', currentUser, markAllNotificationsReadHandler);
router.put('/notifications/:id/read', currentUser, markNotificationReadHandler);

router.get('/discussions', currentUser, listDiscussionsHandler);
router.post('/discussions', currentUser, createDiscussionHandler);

router.get('/stats/admin', requireRole('admin'), adminStatsHandler);
router.get('/stats/instructor', requireRole('instructor', 'admin'), instructorStatsHandler);
router.get('/health', healthHandler);

export default router;
