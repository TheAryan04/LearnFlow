import { listPublishedCourses, listManagedCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../services/course.service.js';
import { ok, created, uid } from '../utils/core.js';
import { emit, notify } from '../realtime.js';
import { db } from '../core.js';
import { saveUpload } from '../storage.js';

export async function listCourses(req, res) {
  const courses = await listPublishedCourses(req.query);
  ok(res, courses, { count: courses.length });
}
export async function listAllCourses(req, res) {
  const courses = await listManagedCourses(req.user);
  ok(res, courses, { count: courses.length });
}
export async function showCourse(req, res) {
  ok(res, await getCourse(req.params.id));
}
export async function createCourseHandler(req, res) {
  const course = await createCourse(req.body || {}, req.user);
  if (req.file) {
    if (!req.file.mimetype?.startsWith('image/')) throw new Error('Course thumbnail must be an image');
    const uploaded = await saveUpload(req.file, req.user.id, course.id);
    course.thumbnail = uploaded.url;
    await updateCourse(course.id, req.user, { thumbnail: uploaded.url });
  }
  if (course.status === 'published') {
    emit('course_published', course);
    await notify({
      id: uid('notif'), title: 'New Course Published',
      message: `${course.title} is now available in the LearnFlow catalogue.`,
      date: 'Just now', read: false, type: 'info',
    });
  } else {
    emit('course_created', course);
  }
  created(res, course);
}
export async function updateCourseHandler(req, res) {
  const course = await updateCourse(req.params.id, req.user, req.body);
  emit('course_updated', course);
  if (course.status === 'published') {
    const enrolments = await db.collection('enrolments').find({ courseId: course.id }).project({ userId: 1 }).toArray();
    const recipients = [...new Set(enrolments.map((item) => item.userId).filter(Boolean))];
    await Promise.all(recipients.map((userId) => notify({
      id: uid('notif'), userId, title: 'Course Updated',
      message: `${course.title} has new course information or materials.`,
      date: 'Just now', read: false, type: 'info',
    })));
  }
  ok(res, course);
}
export async function deleteCourseHandler(req, res) {
  await deleteCourse(req.params.id, req.user);
  emit('course_deleted', req.params.id);
  res.json({ success: true, message: 'Course deleted successfully' });
}
