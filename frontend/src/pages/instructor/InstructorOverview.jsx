import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, BookOpen, ClipboardList, IndianRupee, PlusCircle, CalendarCheck, Award, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import { fetchSubmissions } from '../../redux/slices/assignmentsSlice';
import StatCard from '../../components/ui/StatCard';

const WORKFLOWS = [
  { to: '/instructor/courses/create', label: 'Write a new course', hint: 'Curriculum, lessons and videos', icon: PlusCircle },
  { to: '/instructor/attendance', label: "Mark today's attendance", hint: 'Present, late or absent', icon: CalendarCheck },
  { to: '/instructor/results', label: 'Publish final results', hint: 'Grades are computed for you', icon: Award },
];

export default function InstructorOverview() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { submissions } = useSelector((s) => s.assignments);
  const [stats, setStats] = useState(null);
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    dispatch(fetchSubmissions());
    api.get('/stats/instructor').then((res) => setStats(res.data)).catch(() => {});
    api.get('/courses/all').then((res) => setMyCourses(res.data)).catch(() => {});
  }, [dispatch]);

  const pending = submissions.filter((s) => s.status === 'Pending');

  return (
    <div className="space-y-14">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="lf-eyebrow mb-4">Instructor studio</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900" data-testid="instructor-overview-title">
            Hello, <em className="text-terra-700">{user?.name}</em>.
          </h1>
          <p className="text-ink-500 mt-3">Your courses, grading queue and classroom tools at a glance.</p>
        </div>
        <Link to="/instructor/courses/create" className="lf-btn-primary" data-testid="instructor-create-course-button">
          <PlusCircle className="w-4 h-4" /> New course
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
        <StatCard icon={Users} value={stats ? stats.totalStudents.toLocaleString() : '—'} label="Total students" />
        <StatCard icon={BookOpen} value={myCourses.length} label="Your courses" />
        <StatCard icon={ClipboardList} value={pending.length} label="To grade" variant="warning" />
        <StatCard icon={IndianRupee} value={stats?.totalRevenue || '—'} label="Revenue" variant="success" trend={stats ? { positive: true, label: `${stats.monthlyRevenue} this month` } : null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section>
          <h2 className="font-serif text-2xl text-ink-900 pb-4 border-b border-ink-900">Workflows</h2>
          <ul>
            {WORKFLOWS.map(({ to, label, hint, icon: Icon }) => (
              <li key={to}>
                <Link to={to} className="group flex items-center gap-4 py-5 border-b border-rule" data-testid={`instructor-workflow-${to.split('/').pop()}`}>
                  <Icon className="w-4 h-4 text-terra-600" />
                  <span className="flex-1">
                    <span className="block text-ink-900">{label}</span>
                    <span className="block text-xs text-ink-500">{hint}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-ink-400 group-hover:translate-x-1 group-hover:text-terra-700 transition-transform" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-2">
          <div className="flex items-end justify-between pb-4 border-b border-ink-900">
            <h2 className="font-serif text-2xl text-ink-900">Waiting for your review</h2>
            <Link to="/instructor/assignments" className="text-sm text-terra-700 lf-link" data-testid="instructor-view-submissions-link">All submissions ({submissions.length})</Link>
          </div>
          {pending.length === 0 ? (
            <p className="py-8 font-serif italic text-ink-500">Nothing to grade — every submission has been reviewed.</p>
          ) : (
            <ul>
              {pending.map((sub) => (
                <li key={sub.id} className="flex items-center justify-between gap-4 py-5 border-b border-rule" data-testid={`instructor-pending-${sub.id}`}>
                  <div className="min-w-0">
                    <p className="text-ink-900">{sub.studentName}</p>
                    <p className="text-xs text-ink-500 truncate">{sub.assignment?.title || sub.fileName} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <Link to="/instructor/assignments" className="lf-btn-secondary !py-2 shrink-0">Grade</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
