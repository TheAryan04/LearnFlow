import {
  listUsers, changeUserRole, changeUserStatus, listNotifications,
  markAllNotificationsRead, markNotificationRead, listDiscussions,
  createDiscussion, adminStats, instructorStats,
} from '../services/community.service.js';
import { ok, created } from '../utils/core.js';
import { emit } from '../realtime.js';

export async function listUsersHandler(req, res) {
  const users = await listUsers(req.user, req.query.role);
  ok(res, users, { count: users.length });
}
export async function changeUserRoleHandler(req, res) {
  ok(res, await changeUserRole(req.user, req.params.id, req.body?.role));
}
export async function changeUserStatusHandler(req, res) {
  ok(res, await changeUserStatus(req.user, req.params.id, req.body?.status));
}
export async function listNotificationsHandler(req, res) {
  const items = await listNotifications(req.user);
  ok(res, items, { count: items.length });
}
export async function markAllNotificationsReadHandler(req, res) {
  ok(res, await markAllNotificationsRead(req.user), { message: 'All notifications marked as read' });
}
export async function markNotificationReadHandler(req, res) {
  ok(res, await markNotificationRead(req.user, req.params.id));
}
export async function listDiscussionsHandler(req, res) {
  const items = await listDiscussions(req.user, req.query.courseId);
  ok(res, items, { count: items.length });
}
export async function createDiscussionHandler(req, res) {
  const post = await createDiscussion(req.user, req.body || {});
  emit('receive_message', post, `course_${post.courseId}`);
  created(res, post);
}
export async function adminStatsHandler(_req, res) {
  ok(res, await adminStats());
}
export async function instructorStatsHandler(req, res) {
  ok(res, await instructorStats(req.user));
}
export async function healthHandler(_req, res) {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'LearnFlow LMS API' });
}
