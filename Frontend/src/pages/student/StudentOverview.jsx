import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CalendarCheck,
  Award,
  ArrowRight,
  Play,
  Clock,
  Sparkles,
  FileCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { fetchEnrolments } from '../../redux/slices/enrolmentsSlice';
import { fetchAssignments } from '../../redux/slices/assignmentsSlice';
import { fetchAttendance } from '../../redux/slices/attendanceSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import GlassCard from '../../components/ui/GlassCard';
import TiltCard from '../../components/ui/TiltCard';
import Badge from '../../components/ui/Badge';
import CircularProgress from '../../components/common/CircularProgress';
import ProgressBar from '../../components/common/ProgressBar';
import FloatingElements from '../../components/ui/FloatingElements';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function StudentOverview() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enrolments } = useSelector((state) => state.enrolments);
  const { assignments } = useSelector((state) => state.assignments);
  const { studentStats } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchEnrolments(user?.id || 'user_student_1'));
    dispatch(fetchAssignments());
    dispatch(fetchAttendance({ studentId: user?.id || 'user_student_1' }));
  }, [dispatch, user]);

  const ongoingCourses = enrolments.filter((e) => e.progress < 100);
  const completedCourses = enrolments.filter((e) => e.progress === 100);
  const upcomingAssignments = assignments.slice(0, 3);

  const avgCompletion =
    enrolments.length > 0
      ? Math.round(
          enrolments.reduce((acc, curr) => acc + (curr.progress || 0), 0) /
            enrolments.length
        )
      : 0;

  return (
    <DashboardLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10 relative"
      >
        <FloatingElements count={3} />

        <motion.div variants={item} className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-600 to-accent/80" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 right-20 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-10 w-64 h-64 bg-accent/30 rounded-full blur-3xl animate-pulse-slow" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-xs font-bold mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-white">Welcome back, {user?.name || 'Alex'}!</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white"
            >
              Ready to continue your journey?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-base text-slate-100 leading-relaxed max-w-2xl"
            >
              You have {ongoingCourses.length} courses in progress. Complete upcoming assignments to accelerate your learning path.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                to="/student/courses"
                className="group inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm bg-white text-primary hover:shadow-glow transition-all"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                Resume Learning
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/student/assignments"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-semibold text-sm glass-strong text-white hover:bg-white/20 transition-all"
              >
                View Assignments
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={BookOpen}
              value={`${enrolments.length}`}
              label="Enrolled Courses"
              variant="primary"
            />
            <StatCard
              icon={TrendingUp}
              value={`${avgCompletion}%`}
              label="Avg Completion"
              variant="accent"
            />
            <StatCard
              icon={CalendarCheck}
              value={`${studentStats?.attendanceRate || 88}%`}
              label="Attendance Rate"
              variant="success"
            />
            <StatCard
              icon={FileCheck}
              value={`${upcomingAssignments.length}`}
              label="Active Assignments"
              variant="warning"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={item} className="lg:col-span-2 space-y-6">
            <SectionHeader
              title="My Learning Progress"
              description="Continue where you left off across your enrolled courses"
              action={
                <Link
                  to="/student/courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold glass hover:glass-strong transition-all"
                >
                  See all ({enrolments.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            <div className="space-y-4">
              {enrolments.length === 0 ? (
                <GlassCard className="p-10 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-300 mb-4">No active courses enrolled yet</p>
                  <Link to="/courses" className="text-accent font-semibold hover:underline">
                    Browse Catalog
                  </Link>
                </GlassCard>
              ) : (
                enrolments.map((enrol) => {
                  const course = enrol.course || {};
                  return (
                    <TiltCard key={enrol.id} intensity={12}>
                      <GlassCard className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 hover:shadow-glow transition-all group">
                        <div className="relative w-full sm:w-40 h-28 rounded-2xl overflow-hidden shrink-0">
                          <img
                            src={course.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80"}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        <div className="flex-1 w-full min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <Badge variant="accent">{course.category || 'Development'}</Badge>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              {enrol.progress}%
                            </span>
                          </div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate mb-1">
                            {course.title || 'Course'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Instructor: {course.instructorName || 'Dr. Marcus Vance'}
                          </p>
                          <ProgressBar percent={enrol.progress} showLabel={false} strokeWidth={5} />
                        </div>

                        <Link
                          to={`/student/course/${course.id || enrol.courseId}/learn`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-xs font-bold shrink-0 hover:shadow-glow transition-all group/btn"
                        >
                          <Play className="w-3.5 h-3.5 fill-current group-hover/btn:scale-110 transition-transform" />
                          Resume
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </GlassCard>
                    </TiltCard>
                  );
                })
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="space-y-6">
            <SectionHeader
              title="Upcoming Deadlines"
              description="Stay on top of your assignments"
              action={
                <Link
                  to="/student/assignments"
                  className="text-xs font-bold text-accent hover:underline"
                >
                  View all
                </Link>
              }
            />

            <GlassCard className="p-5 space-y-3">
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                  All caught up!
                </div>
              ) : (
                upcomingAssignments.map((asg) => (
                  <motion.div
                    key={asg.id}
                    whileHover={{ x: 4 }}
                    className="p-4 rounded-2xl glass hover:glass-strong transition-all border border-white/40 dark:border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="warning" className="text-[9px]">Due Soon</Badge>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {asg.maxMarks} pts
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {asg.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-3">
                      {asg.courseTitle}
                    </p>
                    <div className="pt-3 border-t border-white/40 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(asg.deadline).toLocaleDateString()}</span>
                      </div>
                      <Link
                        to={`/student/assignments/${asg.id}/submit`}
                        className="text-xs font-bold text-accent hover:underline flex items-center gap-1 group"
                      >
                        Submit
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
