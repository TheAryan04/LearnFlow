import { ApiError, db, find, findOne, insert, update, uid, today, nowIso, num } from '../core.js';
import { saveUpload, readFile } from '../storage.js';
import { scopedCourseIds, inScope } from '../scope.js';
import { ownedCourse } from './course.service.js';
import { canAccessCourse } from '../realtime.js';

export async function loadAuthorizedFile(user, fileId) {
  const record = await db.collection('files').findOne({ id: fileId, isDeleted: false });
  if (!record) throw new ApiError(404, 'File not found');
  const allowed = user.role === 'admin' || record.ownerId === user.id ||
    (record.courseId && await canAccessCourse(user, record.courseId));
  if (!allowed) throw new ApiError(403, 'You do not have access to this file');
  return { record, content: await readFile(record) };
}

export async function listMaterials(user, courseId) {
  const items = await find('materials', courseId ? { courseId } : {});
  return inScope(items, await scopedCourseIds(user));
}

export async function createMaterial(user, body, file) {
  const { title, courseId = 'course_react_mastery', fileType } = body || {};
  if (!title) throw new ApiError(400, 'Material title is required');
  await ownedCourse(courseId, user);
  const upload = await saveUpload(file, user.id, courseId);
  const material = {
    id: uid('mat'), courseId, title,
    fileType: fileType || (upload?.type ? upload.type.split('/').pop().toUpperCase() : 'PDF'),
    size: upload ? `${(upload.size / 1048576).toFixed(1)} MB` : '3.2 MB',
    uploadedDate: today(), url: upload ? upload.url : '#',
  };
  await insert('materials', material);
  return material;
}

export async function deleteMaterial(user, materialId) {
  const material = await findOne('materials', { id: materialId });
  if (!material) throw new ApiError(404, 'Material not found');
  await ownedCourse(material.courseId, user);
  await db.collection('materials').deleteOne({ id: materialId });
}

export async function listAssignments(user, courseId) {
  return inScope(await find('assignments', courseId ? { courseId } : {}), await scopedCourseIds(user));
}

export async function createAssignment(user, body) {
  if (!body?.title || !body?.courseId) throw new ApiError(400, 'Title and Course are required');
  const course = await ownedCourse(body.courseId, user);
  const assignment = {
    id: uid('asg'), courseId: course.id, courseTitle: course.title, title: body.title,
    description: body.description || '<p>Please complete this assignment.</p>',
    deadline: body.deadline || new Date(Date.now() + 7 * 864e5).toISOString(),
    maxMarks: num(body.maxMarks || 100, 'Max marks', { int: true }), createdAt: today(),
  };
  await insert('assignments', assignment);
  return { assignment, course };
}

export async function listSubmissions(user, { assignmentId, studentId }) {
  const query = {};
  if (assignmentId) query.assignmentId = assignmentId;
  if (user.role === 'student') query.studentId = user.id;
  else if (studentId) query.studentId = studentId;
  const assignments = Object.fromEntries((await find('assignments')).map((assignment) => [assignment.id, assignment]));
  let data = (await find('submissions', query)).map((submission) => ({
    ...submission, assignment: assignments[submission.assignmentId] || {},
  }));
  if (user.role === 'instructor') {
    const ids = await scopedCourseIds(user);
    data = data.filter((submission) => ids.includes(submission.assignment.courseId));
  }
  return data;
}

export async function submitAssignment(user, assignmentId, body, file) {
  const assignment = await findOne('assignments', { id: assignmentId });
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  const existing = await findOne('submissions', { assignmentId: assignment.id, studentId: user.id });
  const upload = await saveUpload(file, user.id, assignment.courseId);
  const submission = {
    id: existing?.id || uid('sub'), assignmentId: assignment.id, studentId: user.id, studentName: user.name,
    submittedAt: nowIso(), fileName: upload ? upload.name : body?.fileName || 'submission_document.pdf',
    fileUrl: upload ? upload.url : '#', notes: body?.notes || 'Completed work submitted.',
    status: 'Pending', marks: null, feedback: null,
  };
  if (existing) await update('submissions', submission.id, submission);
  else await insert('submissions', submission);
  const course = await findOne('courses', { id: assignment.courseId });
  return { submission, course };
}

export async function gradeSubmission(user, submissionId, body) {
  const submission = await findOne('submissions', { id: submissionId });
  const assignment = submission && await findOne('assignments', { id: submission.assignmentId });
  if (!submission || !assignment) throw new ApiError(404, 'Submission not found');
  await ownedCourse(assignment.courseId, user);
  const marks = num(body?.marks, 'Marks', { max: assignment.maxMarks });
  const updated = await update('submissions', submission.id, {
    marks, feedback: body?.feedback || 'Good work!', status: 'Graded',
  });
  return { submission: updated, assignment, marks };
}
