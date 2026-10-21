import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ClipboardList,
  DollarSign,
  PlusCircle,
  CalendarCheck,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../utils/api';
import { fetchCourses } from '../../redux/slices/coursesSlice';
import { fetchSubmissions } from '../../redux/slices/assignmentsSlice';

export default function InstructorOverview() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courses } = useSelector((state) => state.courses);
  const { submissions } = useSelector((state) => state.assignments);

  const [stats, setStats] = useState({
    totalStudents: 11370,
    coursesPublished: 4,
    pendingToGrade: 2,
    totalRevenue: '$42,850',
    monthlyRevenue: '$6,420',
  });

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchSubmissions());

    api
      .get('/stats/instructor', { params: { instructorId: user?.id || 'user_instructor_1' } })
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch((err) => console.log('Using default instructor stats'));
  }, [dispatch, user]);

  const pendingSubmissions = submissions.filter((s) => s.status === 'Pending');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Faculty Studio
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Instructor Command Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your courses, grade incoming submissions, and log cohort attendance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/instructor/courses/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-600 text-white shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Course
          </Link>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Students
            </span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalStudents.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14% this quarter
          </span>
        </div>

        <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Published Courses
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary dark:text-accent">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {courses.length} Active
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Live in directory</span>
        </div>

        <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Submissions to Grade
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-500">
            {pendingSubmissions.length} Pending
          </p>
          <Link
            to="/instructor/assignments"
            className="text-[11px] text-accent font-semibold hover:underline mt-1 block"
          >
            Review and grade →
          </Link>
        </div>

        <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Estimated Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalRevenue}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {stats.monthlyRevenue} this month
          </span>
        </div>
      </div>

      {/* Quick Launchpad & Pending Grading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Launchpad */}
        <div className="lg:col-span-1 bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Teaching Workflows
          </h2>
          <div className="space-y-2">
            <Link
              to="/instructor/courses/create"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4 text-accent" />
                Add New Curriculum & Video
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              to="/instructor/attendance"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <span className="flex items-center gap-2.5">
                <CalendarCheck className="w-4 h-4 text-emerald-500" />
                Mark Today's Attendance
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              to="/instructor/results"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <span className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-purple-500" />
                Publish Auto-Computed Grades
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Pending Submissions Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Submissions Requiring Evaluation
            </h2>
            <Link
              to="/instructor/assignments"
              className="text-xs font-semibold text-accent hover:underline"
            >
              View manager ({submissions.length})
            </Link>
          </div>

          <div className="space-y-3">
            {pendingSubmissions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                All student submissions are currently graded.
              </p>
            ) : (
              pendingSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {sub.studentName}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      File: {sub.fileName} • Submitted recently
                    </p>
                  </div>
                  <Link
                    to="/instructor/assignments"
                    className="px-3 py-1.5 bg-accent hover:bg-accent-600 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Grade Inline
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
