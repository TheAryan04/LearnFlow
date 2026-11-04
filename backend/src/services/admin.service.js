import { ApiError, db, publicUser } from '../core.js';

const ROLES = new Set(['Student', 'Instructor', 'Admin']);
const STATUSES = new Set(['Active', 'Deactivated']);

export async function listUsers({ role, search } = {}) {
  const query = {};
  if (role && role !== 'All') {
    if (!ROLES.has(role)) throw new ApiError(400, 'Invalid role filter');
    query.role = role;
  }
  if (search) {
    const term = String(search).trim().slice(0, 100);
    if (term) query.$or = [
      { name: { $regex: escapeRegex(term), $options: 'i' } },
      { email: { $regex: escapeRegex(term), $options: 'i' } },
    ];
  }
  const users = await db.collection('users').find(query).sort({ joinedDate: -1 }).toArray();
  return users.map(publicUser);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function updateUserRole(actor, userId, role) {
  if (!ROLES.has(role)) throw new ApiError(400, 'Role must be Student, Instructor, or Admin');
  if (actor.id === userId && role !== 'Admin') throw new ApiError(400, 'You cannot remove your own administrator role');
  const target = await db.collection('users').findOne({ id: userId });
  if (!target) throw new ApiError(404, 'User not found');
  if (target.role === 'Admin' && role !== 'Admin') {
    const admins = await db.collection('users').countDocuments({ role: 'Admin', status: { $ne: 'Deactivated' } });
    if (admins <= 1) throw new ApiError(409, 'The last active administrator cannot be demoted');
  }
  await db.collection('users').updateOne({ id: userId }, { $set: { role, updatedAt: new Date().toISOString() } });
  return publicUser({ ...target, role });
}

export async function updateUserStatus(actor, userId, status) {
  if (!STATUSES.has(status)) throw new ApiError(400, 'Status must be Active or Deactivated');
  if (actor.id === userId && status === 'Deactivated') throw new ApiError(400, 'You cannot deactivate your own account');
  const target = await db.collection('users').findOne({ id: userId });
  if (!target) throw new ApiError(404, 'User not found');
  if (target.role === 'Admin' && status === 'Deactivated') {
    const admins = await db.collection('users').countDocuments({ role: 'Admin', status: { $ne: 'Deactivated' } });
    if (admins <= 1) throw new ApiError(409, 'The last active administrator cannot be deactivated');
  }
  await db.collection('users').updateOne({ id: userId }, { $set: { status, updatedAt: new Date().toISOString() } });
  return publicUser({ ...target, status });
}

export async function getAdminStats() {
  const [users, courses, enrolments, attendance, results] = await Promise.all([
    db.collection('users').find({}, { projection: { role: 1, status: 1, joinedDate: 1 } }).toArray(),
    db.collection('courses').find({}, { projection: { status: 1, price: 1, enrolledCount: 1, createdAt: 1 } }).toArray(),
    db.collection('enrolments').find({}).toArray(),
    db.collection('attendance').find({}).toArray(),
    db.collection('results').find({}).toArray(),
  ]);
  const month = new Date().toISOString().slice(0, 7);
  const activeThisMonth = users.filter((u) => String(u.joinedDate || '').startsWith(month)).length;
  const revenueChartData = [];
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status !== 'Deactivated').length,
    totalStudents: users.filter((u) => u.role === 'Student').length,
    totalInstructors: users.filter((u) => u.role === 'Instructor').length,
    totalAdmins: users.filter((u) => u.role === 'Admin').length,
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === 'published').length,
    totalEnrolments: enrolments.length,
    totalAttendanceSessions: attendance.length,
    totalPublishedResults: results.length,
    activeThisMonth,
    revenueChartData,
    revenueAvailable: false,
  };
}

export async function getAdminReport(type) {
  const collectionNames = new Set([
    'users', 'courses', 'enrolments', 'attendance', 'results', 'assignments', 'submissions',
  ]);
  if (!collectionNames.has(type)) throw new ApiError(404, 'Unknown report type');
  const [rows, users, courses, assignments] = await Promise.all([
    db.collection(type).find({}).toArray(),
    db.collection('users').find({}, { projection: { id: 1, name: 1, email: 1, role: 1 } }).toArray(),
    db.collection('courses').find({}, { projection: { id: 1, title: 1, instructorName: 1, status: 1 } }).toArray(),
    db.collection('assignments').find({}, { projection: { id: 1, title: 1, courseId: 1, deadline: 1, maxMarks: 1 } }).toArray(),
  ]);
  const userById = new Map(users.map((user) => [user.id, user]));
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const assignmentById = new Map(assignments.map((assignment) => [assignment.id, assignment]));

  if (type === 'attendance') {
    return rows.flatMap((session) => (session.records || []).map((record) => ({
      sessionId: session.id, courseId: session.courseId, courseTitle: session.courseTitle,
      date: session.date, studentId: record.studentId,
      studentName: userById.get(record.studentId)?.name || 'Student',
      status: record.status,
    })));
  }

  return rows.map((row) => {
    const { _id, clerkId, passwordHash, ...safe } = row;
    if (type === 'enrolments') {
      const student = userById.get(row.userId) || {};
      const course = courseById.get(row.courseId) || {};
      return { ...safe, studentName: student.name || 'Student', studentEmail: student.email || '', courseTitle: course.title || 'Course' };
    }
    if (type === 'results') {
      const student = userById.get(row.studentId) || {};
      return { ...safe, studentName: student.name || 'Student', studentEmail: student.email || '' };
    }
    if (type === 'submissions') {
      const assignment = assignmentById.get(row.assignmentId) || {};
      const student = userById.get(row.studentId) || {};
      return {
        ...safe, assignmentTitle: assignment.title || 'Assignment',
        courseTitle: courseById.get(assignment.courseId)?.title || 'Course',
        deadline: assignment.deadline || '', studentName: student.name || row.studentName || 'Student',
        studentEmail: student.email || '',
      };
    }
    if (type === 'users') return safe;
    return safe;
  });
}
