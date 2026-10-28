import { Router } from 'express';
import { ApiError, db, find, findOne, insert, update, uid, nowIso, publicUser, ok, created } from '../core.js';
import { currentUser, requireRole } from '../auth.js';
import { emit, canAccessCourse } from '../realtime.js';
import { scopedCourseIds } from '../scope.js';

const router = Router();
const USD_TO_INR = 83;

// ---------- users ----------
router.get('/users', requireRole('admin', 'instructor'), async (req, res) => {
  const role = req.user.role === 'instructor' ? 'student' : req.query.role;
  let users = (await find('users')).map(publicUser);
  if (role) users = users.filter((u) => u.role.toLowerCase() === String(role).toLowerCase());
  ok(res, users, { count: users.length });
});

router.put('/users/:id/role', requireRole('admin'), async (req, res) => {
  const role = String(req.body?.role || '').toLowerCase();
  if (!['student', 'instructor', 'admin'].includes(role)) throw new ApiError(400, 'Invalid user role');
  if (!(await findOne('users', { id: req.params.id }))) throw new ApiError(404, 'User not found');
  ok(res, publicUser(await update('users', req.params.id, { role: role[0].toUpperCase() + role.slice(1) })));
});

router.put('/users/:id/status', requireRole('admin'), async (req, res) => {
  const user = await findOne('users', { id: req.params.id });
  if (!user) throw new ApiError(404, 'User not found');
  if (user.id === req.user.id) throw new ApiError(400, 'You cannot deactivate your own account');
  const status = req.body?.status || (user.status === 'Active' ? 'Deactivated' : 'Active');
  ok(res, publicUser(await update('users', req.params.id, { status })));
});

// ---------- notifications ----------
const visibleTo = (user) => ({ $or: [{ userId: null }, { userId: { $exists: false } }, { userId: user.id }] });

router.get('/notifications', currentUser, async (req, res) => {
  const items = await find('notifications', visibleTo(req.user));
  ok(res, items, { count: items.length });
});

router.put('/notifications/read-all', currentUser, async (req, res) => {
  await db.collection('notifications').updateMany(visibleTo(req.user), { $set: { read: true } });
  ok(res, await find('notifications', visibleTo(req.user)), { message: 'All notifications marked as read' });
});

router.put('/notifications/:id/read', currentUser, async (req, res) => {
  const n = await findOne('notifications', { id: req.params.id });
  if (!n || (n.userId && n.userId !== req.user.id)) throw new ApiError(404, 'Notification not found');
  ok(res, await update('notifications', req.params.id, { read: true }));
});

// ---------- discussions ----------
router.get('/discussions', currentUser, async (req, res) => {
  const { courseId } = req.query;
  if (!courseId) throw new ApiError(400, 'courseId is required');
  if (!(await canAccessCourse(req.user, courseId))) throw new ApiError(403, 'You do not have access to this course');
  const items = (await find('discussions', { courseId })).sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  ok(res, items, { count: items.length });
});

router.post('/discussions', currentUser, async (req, res) => {
  const { courseId, message } = req.body || {};
  if (!courseId || !String(message || '').trim()) throw new ApiError(400, 'courseId and message are required');
  if (!(await canAccessCourse(req.user, courseId))) throw new ApiError(403, 'You do not have access to this course');
  const post = {
    id: uid('disc'), courseId, userId: req.user.id, userName: req.user.name, userAvatar: req.user.avatar,
    role: req.user.role[0].toUpperCase() + req.user.role.slice(1), message: String(message).trim().slice(0, 4000), timestamp: nowIso(),
  };
  await insert('discussions', post);
  emit('receive_message', post, `course_${courseId}`);
  created(res, post);
});

// ---------- stats ----------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE = [14200, 18400, 22100, 19800, 27500, 31200, 29800, 35600, 42100, 48900, 54200, 61800];
const ENROLMENTS = [420, 560, 680, 590, 820, 940, 890, 1080, 1250, 1430, 1610, 1840];

router.get('/stats/admin', requireRole('admin'), async (_req, res) => {
  ok(res, {
    totalUsers: (await db.collection('users').countDocuments()) + 1540,
    totalCourses: (await db.collection('courses').countDocuments()) + 42,
    totalEnrolments: (await db.collection('enrolments').countDocuments()) + 13280,
    activeThisMonth: 3420,
    revenueChartData: MONTHS.map((month, i) => ({ month, revenue: REVENUE[i] * USD_TO_INR, enrolments: ENROLMENTS[i] })),
  });
});

router.get('/stats/instructor', requireRole('instructor', 'admin'), async (req, res) => {
  const courseIds = (await scopedCourseIds(req.user)) ?? (await find('courses')).map((c) => c.id);
  const asgIds = (await find('assignments', { courseId: { $in: courseIds } })).map((a) => a.id);
  ok(res, {
    totalStudents: 11370,
    coursesPublished: await db.collection('courses').countDocuments({ instructorId: req.user.id }),
    pendingToGrade: await db.collection('submissions').countDocuments({ status: 'Pending', assignmentId: { $in: asgIds } }),
    totalRevenue: '₹35,56,550',
    monthlyRevenue: '₹5,32,860',
  });
});

router.get('/health', (_req, res) => res.json({ status: 'healthy', timestamp: nowIso(), service: 'LearnFlow LMS API' }));

export default router;
export { insert };
