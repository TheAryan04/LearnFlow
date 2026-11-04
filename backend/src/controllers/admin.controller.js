import { getAdminReport, getAdminStats, listUsers, updateUserRole, updateUserStatus } from '../services/admin.service.js';
import { ok } from '../utils/core.js';

export async function listUsersHandler(req, res) {
  ok(res, await listUsers(req.query));
}
export async function updateUserRoleHandler(req, res) {
  ok(res, await updateUserRole(req.user, req.params.id, req.body?.role));
}
export async function updateUserStatusHandler(req, res) {
  ok(res, await updateUserStatus(req.user, req.params.id, req.body?.status));
}
export async function adminStatsHandler(_req, res) {
  ok(res, await getAdminStats());
}
export async function adminReportHandler(req, res) {
  ok(res, await getAdminReport(req.params.type));
}
