import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, ArrowRight, FileCheck, TrendingUp, Clock } from 'lucide-react';
import { fetchEnrolments } from '../../redux/slices/enrolmentsSlice';
import { fetchAssignments, fetchSubmissions } from '../../redux/slices/assignmentsSlice';
import { fetchAttendance } from '../../redux/slices/attendanceSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/LoadingSpinner';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function CourseRow({ enrol }) {
  const course = enrol.course || {};
  return (
    <li className="group py-6 border-b border-rule flex flex-col sm:flex-row sm:items-center gap-5" data-testid={`overview-course-${enrol.courseId}`}>
      <img src={course.thumbnail} alt={course.title} className="w-full sm:w-32 h-24 sm:h-20 object-cover rounded-md saturate-[0.85]" />
      <div className="flex-1 min-w-0">
        <p className="lf-eyebrow mb-1">{course.category}</p>
        <h3 className="font-serif text-xl text-ink-900 truncate">{course.title}</h3>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1 bg-ink-200 rounded-full overflow-hidden max-w-xs">
            <div className="h-full bg-terra-600 rounded-full" style={{ width: `${enrol.progress}%` }} />
          </div>
          <span className="text-xs tabular-nums text-ink-600">{Math.round(enrol.progress)}%</span>
        </div>
      </div>
      <Link to={`/student/course/${course.id || enrol.courseId}/learn`} className="lf-btn-secondary shrink-0" data-testid={`overview-resume-${enrol.courseId}`}>
        Resume <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </li>
  );
}

function Deadline({ asg }) {
  return (
    <li className="py-5 border-b border-rule" data-testid={`overview-deadline-${asg.id}`}>
      <p className="text-xs text-ink-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{new Date(asg.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {asg.maxMarks} pts</p>
      <p className="font-serif text-lg text-ink-900 mt-1 leading-snug">{asg.title}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-ink-500 truncate pr-4">{asg.courseTitle}</p>
        <Link to={`/student/assignments/${asg.id}/submit`} className="text-sm text-terra-700 lf-link shrink-0">Submit</Link>
      </div>
    </li>
  );
}

export default function StudentOverview() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { enrolments, loading } = useSelector((s) => s.enrolments);
  const { assignments, submissions } = useSelector((s) => s.assignments);
  const { studentStats } = useSelector((s) => s.attendance);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchEnrolments(user.id));
    dispatch(fetchAssignments());
    dispatch(fetchSubmissions({ studentId: user.id }));
    dispatch(fetchAttendance({ studentId: user.id }));
  }, [dispatch, user?.id]);

  const ongoing = enrolments.filter((e) => e.progress < 100);
  const submittedIds = new Set(submissions.map((s) => s.assignmentId));
  const upcoming = assignments
    .filter((a) => !submittedIds.has(a.id) && new Date(a.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);
  const avg = enrolments.length ? Math.round(enrolments.reduce((a, e) => a + (e.progress || 0), 0) / enrolments.length) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-14">
        <header>
          <p className="lf-eyebrow mb-4">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 leading-tight" data-testid="student-overview-greeting">
            {greeting()}, <em className="text-terra-700">{user?.name?.split(' ')[0]}</em>.
          </h1>
          <p className="text-ink-500 mt-3 max-w-xl">
            {ongoing.length ? `You have ${ongoing.length} course${ongoing.length > 1 ? 's' : ''} in progress and ${upcoming.length} assignment${upcoming.length === 1 ? '' : 's'} open.` : 'Pick a course from the catalogue to begin.'}
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          <StatCard icon={BookOpen} value={enrolments.length} label="Enrolled courses" />
          <StatCard icon={TrendingUp} value={`${avg}%`} label="Avg completion" />
          <StatCard icon={CalendarCheck} value={`${studentStats?.attendanceRate ?? 100}%`} label="Attendance" variant="success" />
          <StatCard icon={FileCheck} value={upcoming.length} label="Open assignments" variant="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <section className="lg:col-span-2">
            <div className="flex items-end justify-between pb-4 border-b border-ink-900">
              <h2 className="font-serif text-2xl text-ink-900">Continue learning</h2>
              <Link to="/student/courses" className="text-sm text-terra-700 lf-link" data-testid="overview-all-courses-link">All courses</Link>
            </div>
            {loading && !enrolments.length ? (
              <div className="space-y-4 pt-6">{[0, 1].map((i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : enrolments.length === 0 ? (
              <EmptyState className="mt-6" title="No courses yet" description="Browse the catalogue and enrol in your first course — it will appear here." actionLabel="Browse catalogue" actionLink="/courses" />
            ) : (
              <ul>{enrolments.map((e) => <CourseRow key={e.id} enrol={e} />)}</ul>
            )}
          </section>

          <aside>
            <div className="flex items-end justify-between pb-4 border-b border-ink-900">
              <h2 className="font-serif text-2xl text-ink-900">Due soon</h2>
              <Link to="/student/assignments" className="text-sm text-terra-700 lf-link" data-testid="overview-all-assignments-link">View all</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="py-8 font-serif italic text-ink-500">No assignments yet — you're all caught up.</p>
            ) : (
              <ul>{upcoming.map((a) => <Deadline key={a.id} asg={a} />)}</ul>
            )}
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
