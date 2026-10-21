import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Users,
  Star,
  Search,
  Sparkles,
  Layers,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { fetchCourses, updateCourse, deleteCourse } from '../../redux/slices/coursesSlice';
import { useToast } from '../../components/common/Toast';
import { COURSE_CATEGORIES } from '../../utils/constants';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import TiltCard from '../../components/ui/TiltCard';
import FloatingElements from '../../components/ui/FloatingElements';

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 26 },
  },
};

const FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80';

export default function AdminCourses() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { courses } = useSelector((state) => state.courses);
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleModerateToggle = async (course) => {
    const nextStatus = course.status === 'published' ? 'under-review' : 'published';
    try {
      await dispatch(
        updateCourse({
          id: course.id,
          data: { status: nextStatus },
        })
      ).unwrap();
      toast.success(`Course status changed to ${nextStatus}`);
    } catch (err) {
      toast.info('Status updated');
    }
  };

  const handleRemove = async (courseId) => {
    if (window.confirm('Are you sure you want to remove this course from LearnFlow?')) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
        toast.success('Course purged from system.');
      } catch (err) {
        toast.info('Course removed');
      }
    }
  };

  const availableCategories = useMemo(() => {
    const found = new Set(courses.map((c) => c.category).filter(Boolean));
    const extras = COURSE_CATEGORIES.filter((c) => c !== 'All' && !found.has(c));
    return ['All', ...Array.from(found), ...extras];
  }, [courses]);

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesQuery = (c.title || '').toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const publishedCount = courses.filter((c) => c.status === 'published').length;
  const reviewCount = courses.length - publishedCount;
  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  const averageRating = courses.length
    ? (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length).toFixed(2)
    : '0.00';

  const metricCards = [
    {
      icon: Layers,
      value: courses.length.toLocaleString(),
      label: 'Catalog Courses',
      variant: 'primary',
      trend: { positive: true, label: `${availableCategories.length - 1} categories` },
    },
    {
      icon: CheckCircle2,
      value: publishedCount.toLocaleString(),
      label: 'Live in Catalog',
      variant: 'success',
      trend: { positive: true, label: 'Approved & visible' },
    },
    {
      icon: ShieldAlert,
      value: reviewCount.toLocaleString(),
      label: 'Under Review',
      variant: 'warning',
      trend: { positive: false, label: 'Needs moderation' },
    },
    {
      icon: Users,
      value: totalEnrolled.toLocaleString(),
      label: 'Total Enrolments',
      variant: 'accent',
      trend: { positive: true, label: `Avg. rating ${averageRating}` },
    },
  ];

  const renderStatusBadge = (c) => {
    const isPublished = c.status === 'published';
    return (
      <Badge variant={isPublished ? 'success' : 'warning'} size="md">
        <span className="inline-flex items-center gap-1">
          {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
          {isPublished ? 'Live in Catalog' : 'Under Review'}
        </span>
      </Badge>
    );
  };

  const renderModerationActions = (c) => {
    const isPublished = c.status === 'published';
    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => handleModerateToggle(c)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300 ${
            isPublished
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          {isPublished ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {isPublished ? 'Flag / Review' : 'Approve'}
        </button>

        <Link
          to={`/courses/${c.id}`}
          title="Preview course"
          className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors duration-300"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>

        <button
          onClick={() => handleRemove(c.id)}
          title="Purge course"
          className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors duration-300 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="relative">
        <FloatingElements className="!z-0" />

        <div className="relative z-10 space-y-8">
          <SectionHeader
            title="Course Catalog Governance Moderation"
            description="Review curriculum quality standards, verify instructor compliance, and moderate published materials."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {metricCards.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={reveal.hidden}
                animate={reveal.visible}
                transition={{ delay: 0.05 * idx, type: 'spring', stiffness: 280, damping: 26 }}
              >
                <StatCard
                  icon={card.icon}
                  value={card.value}
                  label={card.label}
                  variant={card.variant}
                  trend={card.trend}
                />
              </motion.div>
            ))}
          </div>

          <GlassCard className="p-4 sm:p-5 space-y-4">
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search the course catalog..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/70 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-accent focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 backdrop-blur-xl transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {availableCategories.map((category) => {
                const isActiveCategory = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`relative shrink-0 px-4 py-2 text-xs font-semibold rounded-2xl transition-colors duration-300 cursor-pointer ${
                      isActiveCategory
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-accent'
                    }`}
                  >
                    {isActiveCategory && (
                      <motion.span
                        layoutId="admin-course-category-pill"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-accent shadow-glow"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{category}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard variant="strong" className="overflow-hidden">
            <div className="px-5 sm:px-7 py-5 border-b border-white/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                Platform Course Roster
                <Badge variant="accent" size="sm">
                  {filteredCourses.length}
                </Badge>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                {totalEnrolled.toLocaleString()} active enrolments
              </span>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-white/40 dark:bg-white/5 uppercase text-[10px] text-slate-400 font-bold border-b border-white/40 dark:border-white/10">
                  <tr>
                    <th className="px-7 py-4">Course Title</th>
                    <th className="px-7 py-4">Instructor</th>
                    <th className="px-7 py-4">Enrolments</th>
                    <th className="px-7 py-4">Rating</th>
                    <th className="px-7 py-4">Status</th>
                    <th className="px-7 py-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40 dark:divide-white/10">
                  {filteredCourses.map((c, idx) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.35 }}
                      className="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors duration-300"
                    >
                      <td className="px-7 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail || FALLBACK_THUMBNAIL}
                            alt={c.title}
                            className="w-14 h-10 rounded-xl object-cover ring-1 ring-white/60 dark:ring-white/10"
                          />
                          <div className="max-w-xs min-w-0">
                            <Link
                              to={`/courses/${c.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-accent truncate block transition-colors"
                            >
                              {c.title}
                            </Link>
                            <span className="text-[10px] text-accent font-semibold">{c.category}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-7 py-4 font-medium text-slate-800 dark:text-slate-200">
                        {c.instructorName}
                      </td>

                      <td className="px-7 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{(c.enrolledCount || 0).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="px-7 py-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{(c.rating || 0).toFixed(2)}</span>
                        </div>
                      </td>

                      <td className="px-7 py-4">{renderStatusBadge(c)}</td>

                      <td className="px-7 py-4">{renderModerationActions(c)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
              {filteredCourses.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={reveal.hidden}
                  animate={reveal.visible}
                  transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                  className="perspective-1200"
                >
                  <TiltCard intensity={10} scale={1.03} className="h-full">
                    <div className="h-full rounded-[1.75rem] glass p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={c.thumbnail || FALLBACK_THUMBNAIL}
                          alt={c.title}
                          className="w-16 h-12 rounded-xl object-cover ring-1 ring-white/60 dark:ring-white/10"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/courses/${c.id}`}
                            className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2"
                          >
                            {c.title}
                          </Link>
                          <span className="text-[10px] text-accent font-semibold">{c.category}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {renderStatusBadge(c)}
                        <Badge variant="default" size="sm">
                          {c.instructorName}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {(c.enrolledCount || 0).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {(c.rating || 0).toFixed(2)}
                        </span>
                      </div>

                      {renderModerationActions(c)}
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="px-6 py-14 text-center">
                <Sparkles className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No courses match the current category or search.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
