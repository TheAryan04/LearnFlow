import { ApiError, db, find, findOne, update, uid, nowIso, publicUser } from '../core.js';
import { canAccessCourse } from '../realtime.js';
import { scopedCourseIds } from '../scope.js';

const visibleTo = (user) => ({ $or: [{ userId: null }, { userId: { $exists: false } }, { userId: user.id }] });
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE = [14200, 18400, 22100, 19800, 27500, 31200, 29800, 35600, 42100, 48900, 54200, 61800];
const ENROLMENTS = [420, 560, 680, 590, 820, 940, 890, 1080, 1250, 1430, 1610, 1840];
const USD_TO_INR = 83;

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
  const { insert } = await import('../core.js');
  await insert('discussions', post);
  return post;
}

export async function adminStats() {
  return {
    totalUsers: (await db.collection('users').countDocuments()) + 1540,
    totalCourses: (await db.collection('courses').countDocuments()) + 42,
    totalEnrolments: (await db.collection('enrolments').countDocuments()) + 13280,
    activeThisMonth: 3420,
    revenueChartData: MONTHS.map((month, index) => ({
      month, revenue: REVENUE[index] * USD_TO_INR, enrolments: ENROLMENTS[index],
    })),
  };
}

export async function instructorStats(user) {
  const courseIds = (await scopedCourseIds(user)) ?? (await find('courses')).map((course) => course.id);
  const assignmentIds = (await find('assignments', { courseId: { $in: courseIds } })).map((item) => item.id);
  return {
    totalStudents: 11370,
    coursesPublished: await db.collection('courses').countDocuments({ instructorId: user.id }),
    pendingToGrade: await db.collection('submissions').countDocuments({
      status: 'Pending', assignmentId: { $in: assignmentIds },
    }),
    totalRevenue: '₹35,56,550',
    monthlyRevenue: '₹5,32,860',
  };
}
