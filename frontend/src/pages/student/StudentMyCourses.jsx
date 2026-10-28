import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import humanizeDuration from 'humanize-duration';
import { BookOpen, Search, Play, CheckCircle2, Clock, Sparkles, Grid3x3, List, ArrowRight } from 'lucide-react';
import { fetchEnrolments } from '../../redux/slices/enrolmentsSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SectionHeader from '../../components/ui/SectionHeader';
import GlassCard from '../../components/ui/GlassCard';
import TiltCard from '../../components/ui/TiltCard';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import FloatingElements from '../../components/ui/FloatingElements';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function StudentMyCourses() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enrolments, loading } = useSelector((state) => state.enrolments);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    dispatch(fetchEnrolments(user?.id || 'user_student_1'));
  }, [dispatch, user]);

  const filteredEnrolments = enrolments.filter((e) => {
    const course = e.course || {};
    const matchesQuery =
      course.title?.toLowerCase().includes(query.toLowerCase()) ||
      course.category?.toLowerCase().includes(query.toLowerCase());

    if (!matchesQuery) return false;
    if (filter === 'in-progress') return e.progress < 100;
    if (filter === 'completed') return e.progress === 100;
    return true;
  });

  const tabs = [
    { key: 'all', label: 'All Courses' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <DashboardLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 relative"
      >
        <FloatingElements count={2} />

        <motion.div variants={item}>
          <SectionHeader
            title="My Learning Library"
            description="Pick up right where you left off or review your completed courses"
            action={
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-terra-600 text-white rounded-xl text-xs font-bold hover:shadow-glow transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Explore Catalog
              </Link>
            }
          />
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 glass-strong rounded-2xl w-full lg:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex-1 lg:flex-none px-5 py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                    filter === tab.key
                      ? 'bg-terra-600 text-white shadow-glow'
                      : 'text-slate-600 dark:text-slate-300 hover:glass'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search courses by title or category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-xs glass border border-white/40 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <div className="hidden sm:flex items-center gap-1 p-1 glass-strong rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-slate-400'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-slate-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          {filteredEnrolments.length === 0 ? (
            <GlassCard className="p-12">
              <EmptyState
                icon={BookOpen}
                title="No courses found"
                description="Try adjusting your filters or explore new courses from our catalog"
                actionLabel="Browse Available Courses"
                actionLink="/courses"
              />
            </GlassCard>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredEnrolments.map((enrol, idx) => {
                const course = enrol.course || {};
                const durationFormatted = course.durationMs
                  ? humanizeDuration(course.durationMs, { units: ['h', 'm'], round: true })
                  : '2h 30m';

                return (
                  <motion.div
                    key={enrol.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <TiltCard intensity={10}>
                      <GlassCard className="overflow-hidden h-full flex flex-col group hover:shadow-glow transition-all">
                        <div className="relative aspect-video w-full overflow-hidden">
                          <img
                            src={course.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80"}
                            alt={course.title}
                            className="w-full h-full object-cover group- transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-4 left-4">
                            <Badge variant="default" className="glass-strong">{course.category}</Badge>
                          </div>
                          {enrol.progress === 100 && (
                            <div className="absolute top-4 right-4">
                              <Badge variant="success" className="glass-strong">
                                <CheckCircle2 className="w-3 h-3" />
                                Completed
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                              Instructor: {course.instructorName || 'Dr. Marcus Vance'}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{durationFormatted}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" />
                                <span>{course.lessonsCount || '12'} lessons</span>
                              </div>
                            </div>

                            <div className="space-y-2 mb-6">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-700 dark:text-slate-200">Progress</span>
                                <span className="text-accent">{enrol.progress}%</span>
                              </div>
                              <ProgressBar percent={enrol.progress} showLabel={false} strokeWidth={6} />
                            </div>
                          </div>

                          <Link
                            to={`/student/course/${course.id || enrol.courseId}/learn`}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold text-white bg-terra-600 hover:shadow-glow transition-all group/btn"
                          >
                            <Play className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
                            {enrol.progress === 100 ? 'Review Course' : 'Continue Learning'}
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </GlassCard>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
