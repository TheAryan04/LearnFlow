import { ApiError, db, find, findOne, insert, update, uid, today, num } from '../core.js';
import { scopedCourseIds, inScope, userNames } from '../scope.js';

export async function listEnrolments(user, { userId, courseId }) {
  const query = {};
  if (user.role === 'student') query.userId = user.id;
  else if (userId) query.userId = userId;
  if (courseId) query.courseId = courseId;
  const items = inScope(
    await find('enrolments', query),
    user.role === 'instructor' ? await scopedCourseIds(user) : null
  );
  const courses = Object.fromEntries((await find('courses')).map((course) => [course.id, course]));
  const names = await userNames();
  return items.map((enrolment) => ({
    ...enrolment,
    course: courses[enrolment.courseId] || {},
    studentName: names[enrolment.userId] || 'Student',
  }));
}

export async function enrolStudent(user, courseId) {
  if (!courseId) throw new ApiError(400, 'courseId is required');
  const course = await findOne('courses', { id: courseId });
  if (!course || course.status !== 'published') throw new ApiError(404, 'Course not found');
  const existing = await findOne('enrolments', { userId: user.id, courseId });
  if (existing) return { enrolment: { ...existing, course }, alreadyEnrolled: true };

  const firstLesson = course.curriculum?.[0]?.lessons?.[0]?.id || 'les_101';
  const enrolment = {
    id: uid('enrol'), userId: user.id, courseId, enrolledDate: today(),
    progress: 0, completedLessons: [], lastAccessedLessonId: firstLesson,
  };
  await insert('enrolments', enrolment);
  await db.collection('courses').updateOne({ id: courseId }, { $inc: { enrolledCount: 1 } });
  return { enrolment: { ...enrolment, course }, alreadyEnrolled: false };
}

export async function updateStudentProgress(user, enrolmentId, body) {
  const enrolment = await findOne('enrolments', { id: enrolmentId });
  if (!enrolment) throw new ApiError(404, 'Enrolment not found');
  if (enrolment.userId !== user.id) throw new ApiError(403, "Cannot update another student's progress");

  const { lessonId, completed = true, progress: rawProgress } = body || {};
  let done = [...(enrolment.completedLessons || [])];
  if (lessonId) {
    if (completed && !done.includes(lessonId)) done.push(lessonId);
    if (!completed) done = done.filter((id) => id !== lessonId);
  }

  const course = (await findOne('courses', { id: enrolment.courseId })) || {};
  const total = (course.curriculum || []).reduce((count, section) => count + (section.lessons || []).length, 0);
  const progress = rawProgress != null
    ? num(rawProgress, 'Progress', { max: 100 })
    : total ? Math.round((done.length / total) * 100) : 100;

  return update('enrolments', enrolmentId, {
    completedLessons: done,
    progress,
    lastAccessedLessonId: lessonId || enrolment.lastAccessedLessonId,
  });
}

export async function unenrolStudent(user, enrolmentId) {
  const enrolment = await findOne('enrolments', { id: enrolmentId });
  if (!enrolment) throw new ApiError(404, 'Enrolment not found');
  if (enrolment.userId !== user.id) throw new ApiError(403, "Cannot unenrol another student");
  await db.collection('enrolments').deleteOne({ id: enrolmentId, userId: user.id });
  await db.collection('courses').updateOne(
    { id: enrolment.courseId, enrolledCount: { $gt: 0 } },
    { $inc: { enrolledCount: -1 } }
  );
  return { id: enrolmentId, courseId: enrolment.courseId };
}
