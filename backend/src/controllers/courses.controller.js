import { listPublishedCourses, listManagedCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../services/course.service.js';
import { ok, created } from '../utils/core.js';
import { emit } from '../realtime.js';

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
  emit('course_published', course);
  created(res, course);
}
export async function updateCourseHandler(req, res) {
  const course = await updateCourse(req.params.id, req.user, req.body);
  emit('course_updated', course);
  ok(res, course);
}
export async function deleteCourseHandler(req, res) {
  await deleteCourse(req.params.id, req.user);
  emit('course_deleted', req.params.id);
  res.json({ success: true, message: 'Course deleted successfully' });
}
