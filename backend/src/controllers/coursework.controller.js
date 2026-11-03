import {
  loadAuthorizedFile, listMaterials, createMaterial, deleteMaterial,
  listAssignments, createAssignment, listSubmissions, submitAssignment, gradeSubmission,
} from '../services/coursework.service.js';
import { ok, created, uid } from '../utils/core.js';
import { emit, emitToUser, notify } from '../realtime.js';

export async function getFileHandler(req, res) {
  const { record, content } = await loadAuthorizedFile(req.user, req.params.id);
  res.set('Content-Type', record.contentType);
  res.set('Content-Disposition', `inline; filename="${record.originalFilename.replace(/"/g, '')}"`);
  res.send(content);
}

export async function listMaterialsHandler(req, res) {
  const items = await listMaterials(req.user, req.query.courseId);
  ok(res, items, { count: items.length });
}
export async function createMaterialHandler(req, res) {
  created(res, await createMaterial(req.user, req.body, req.file));
}
export async function deleteMaterialHandler(req, res) {
  await deleteMaterial(req.user, req.params.id);
  res.json({ success: true, message: 'Material deleted' });
}
export async function listAssignmentsHandler(req, res) {
  const items = await listAssignments(req.user, req.query.courseId);
  ok(res, items, { count: items.length });
}
export async function createAssignmentHandler(req, res) {
  const { assignment, course } = await createAssignment(req.user, req.body || {});
  emit('new_assignment', assignment);
  await notify({
    id: uid('notif'), title: 'New Assignment Posted',
    message: `${course.title}: "${assignment.title}" is now open for submissions.`,
    date: 'Just now', read: false, type: 'info',
  });
  created(res, assignment);
}
export async function listSubmissionsHandler(req, res) {
  const items = await listSubmissions(req.user, req.query);
  ok(res, items, { count: items.length });
}
export async function submitAssignmentHandler(req, res) {
  const { submission, course } = await submitAssignment(req.user, req.params.id, req.body, req.file);
  if (course) emitToUser(course.instructorId, 'new_submission', submission);
  created(res, submission);
}
export async function gradeSubmissionHandler(req, res) {
  const { submission, assignment, marks } = await gradeSubmission(req.user, req.params.id, req.body || {});
  emitToUser(submission.studentId, 'assignment_graded', submission);
  await notify({
    id: uid('notif'), userId: submission.studentId, title: 'Assignment Graded',
    message: `Your submission for ${assignment.title} has been evaluated: ${marks} marks.`,
    date: 'Just now', read: false, type: 'success',
  });
  ok(res, submission);
}
