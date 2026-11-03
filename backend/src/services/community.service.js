import { ApiError, db, find, findOne, insert, update, uid, nowIso, publicUser } from '../core.js';
import { canAccessCourse } from '../realtime.js';
import { scopedCourseIds } from '../scope.js';

const visibleTo = (user) => ({ $or: [{ userId: null }, { userId: { $exists: false } }, { userId: user.id }] });

export async function listUsers(user, requestedRole) {
  const role = user.role === 'instructor' ? 'student' : requestedRole;
  let users = (await find('users')).map(publicUser);
  if (role) users = users.filter((item) => item.role.toLowerCase() === String(role).toLowerCase());
  return users;
}

export async function changeUserRole(userId, requestedRole) {
  const role = String(requestedRole || '').toLowerCase();
  if (!['student', 'instructor', 'admin'].includes(role)) throw new ApiError(400, 'Invalid user role');
  if (!(await findOne('users', { id: userId }))) throw new ApiError(404, 'User not found');
  return publicUser(await update('users', userId, { role: role[0].toUpperCase() + role.slice(1) }));
}

export async function changeUserStatus(actor, userId, requestedStatus) {
  const user = await findOne('users', { id: userId });
  if (!user) throw new ApiError(404, 'User not found');
  if (user.id === actor.id) throw new ApiError(400, 'You cannot deactivate your own account');
  const status = requestedStatus || (user.status === 'Active' ? 'Deactivated' : 'Active');
  if (!['Active', 'Deactivated'].includes(status)) throw new ApiError(400, 'Status must be Active or Deactivated');
  return publicUser(await update('users', userId, { status }));
}

export const listNotifications = (user) => find('notifications', visibleTo(user));

export async function markAllNotificationsRead(user) {
  await db.collection('notifications').updateMany(visibleTo(user), { $set: { read: true } });
  return find('notifications', visibleTo(user));
}

export async function markNotificationRead(user, notificationId) {
  const notification = await findOne('notifications', { id: notificationId });
  if (!notification || (notification.userId && notification.userId !== user.id)) {
    throw new ApiError(404, 'Notification not found');
  }
  return update('notifications', notificationId, { read: true });
}

export async function listDiscussions(user, courseId) {
  if (!courseId) throw new ApiError(400, 'courseId is required');
  if (!(await canAccessCourse(user, courseId))) throw new ApiError(403, 'You do not have access to this course');
  return (await find('discussions', { courseId }))
    .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
}

export async function createDiscussion(user, { courseId, message }) {
  if (!courseId || !String(message || '').trim()) throw new ApiError(400, 'courseId and message are required');
  if (!(await canAccessCourse(user, courseId))) throw new ApiError(403, 'You do not have access to this course');
  const post = {
    id: uid('disc'), courseId, userId: user.id, userName: user.name, userAvatar: user.avatar,
    role: user.role[0].toUpperCase() + user.role.slice(1),
    message: String(message).trim().slice(0, 4000), timestamp: nowIso(),
  };
  await insert('discussions', post);
  return post;
}

export async function adminStats() {
  return {
    totalUsers: await db.collection('users').countDocuments(),
    totalCourses: await db.collection('courses').countDocuments(),
    totalEnrolments: await db.collection('enrolments').countDocuments(),
    activeThisMonth: await db.collection('users').countDocuments({ joinedDate: { $gte: today().slice(0, 7) + '-01' } }),
    // Revenue is not modelled yet; do not present fabricated financial figures.
  };
}

export async function instructorStats(user) {
  const courseIds = (await scopedCourseIds(user)) ?? (await find('courses')).map((course) => course.id);
  const assignmentIds = (await find('assignments', { courseId: { $in: courseIds } })).map((item) => item.id);
  const enrolments = await find('enrolments', { courseId: { $in: courseIds } });
  return {
    totalStudents: new Set(enrolments.map((item) => item.userId)).size,
    coursesPublished: await db.collection('courses').countDocuments({ instructorId: user.id, status: 'published' }),
    pendingToGrade: await db.collection('submissions').countDocuments({
      status: 'Pending', assignmentId: { $in: assignmentIds },
    }),
    totalRevenue: null,
    monthlyRevenue: null,
  };
}
