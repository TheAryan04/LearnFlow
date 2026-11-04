import { db, uid } from './core.js';
import { notify } from './realtime.js';

const HOUR = 60 * 60 * 1000;
const REMINDER_WINDOW = 24 * HOUR;

export async function sendUpcomingAssignmentReminders() {
  const now = new Date();
  const horizon = new Date(now.getTime() + REMINDER_WINDOW);
  const assignments = await db.collection('assignments').find({
    deadline: { $gte: now.toISOString(), $lte: horizon.toISOString() },
  }).toArray();

  for (const assignment of assignments) {
    const enrolments = await db.collection('enrolments')
      .find({ courseId: assignment.courseId }).project({ userId: 1 }).toArray();
    const userIds = [...new Set(enrolments.map((item) => item.userId).filter(Boolean))];
    for (const userId of userIds) {
      const alreadySent = await db.collection('notifications').findOne({
        userId, assignmentId: assignment.id, type: 'assignment_deadline',
      });
      if (alreadySent) continue;
      const hoursLeft = Math.max(1, Math.ceil((new Date(assignment.deadline).getTime() - now.getTime()) / HOUR));
      await notify({
        id: uid('notif'), userId, assignmentId: assignment.id,
        title: 'Assignment Deadline Approaching',
        message: `"${assignment.title}" is due in approximately ${hoursLeft} hour(s).`,
        date: 'Just now', read: false, type: 'assignment_deadline',
      });
    }
  }
}

export function startDeadlineNotifications() {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await sendUpcomingAssignmentReminders();
    } catch (error) {
      console.error('Assignment deadline reminder job failed:', error);
    } finally {
      running = false;
    }
  };
  void run();
  const timer = setInterval(run, HOUR);
  timer.unref?.();
  return () => clearInterval(timer);
}
