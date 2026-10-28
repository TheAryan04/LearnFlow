import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  BookOpen,
  Calendar,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';
import api from '../../utils/api';
import ProgressBar from '../../components/common/ProgressBar';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import FloatingElements from '../../components/ui/FloatingElements';

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 26 },
  },
};

const STATUS_FILTERS = [
  { key: 'All', label: 'All Records', icon: Layers },
  { key: 'In Training', label: 'In Training', icon: TrendingUp },
  { key: 'Completed', label: 'Completed', icon: Award },
];

const STUDENT_NAMES = {
  user_student_1: 'Alex Johnson',
  user_student_2: 'Sarah Chen',
};

const resolveStudentName = (userId) => STUDENT_NAMES[userId] || 'Sarah Chen';

export default function AdminEnrolments() {
  const [enrolments, setEnrolments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .get('/enrolments')
      .then((res) => {
        if (res.data) setEnrolments(res.data);
      })
      .catch((err) => console.log('Error fetching enrolments:', err))
      .finally(() => setLoading(false));
  }, []);

  const isComplete = (enrol) => enrol.progress === 100;

  const filteredEnrolments = useMemo(
    () =>
      enrolments.filter((enrol) => {
        const hay = `${enrol.course?.title || ''} ${enrol.userId || ''} ${enrol.studentName || ''}`.toLowerCase();
        if (query && !hay.includes(query.toLowerCase())) return false;
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Completed') return isComplete(enrol);
        return !isComplete(enrol);
      }),
    [enrolments, statusFilter, query]
  );

  const completedCount = enrolments.filter(isComplete).length;
  const inTrainingCount = enrolments.length - completedCount;
  const averageProgress = enrolments.length
    ? Math.round(enrolments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrolments.length)
    : 0;
  const uniqueCourses = new Set(enrolments.map((e) => e.courseId || e.course?.id)).size;

  const metricCards = [
    {
      icon: ShieldCheck,
      value: enrolments.length.toLocaleString(),
      label: 'Enrolment Records',
      variant: 'primary',
      trend: { positive: true, label: 'Live registry sync' },
    },
    {
      icon: TrendingUp,
      value: inTrainingCount.toLocaleString(),
      label: 'In Training',
      variant: 'accent',
      trend: { positive: true, label: 'Cohorts in progress' },
    },
    {
      icon: CheckCircle2,
      value: completedCount.toLocaleString(),
      label: 'Completed',
      variant: 'success',
      trend: { positive: true, label: 'Certified learners' },
    },
    {
      icon: Award,
      value: `${averageProgress}%`,
      label: 'Average Progress',
      variant: 'warning',
      trend: { positive: true, label: `${uniqueCourses} distinct courses` },
    },
  ];

  const renderStatusBadge = (enrol) => {
    const complete = isComplete(enrol);
    return (
      <Badge variant={complete ? 'success' : 'accent'} size="md">
        <span className="inline-flex items-center gap-1">
          {complete && <CheckCircle2 className="w-3 h-3" />}
          {complete ? 'Completed' : 'In Training'}
        </span>
      </Badge>
    );
  };

  const renderStudent = (enrol) => {
    const name = enrol.studentName || resolveStudentName(enrol.userId);
    const initials = name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 shrink-0 rounded-full bg-terra-600 text-white flex items-center justify-center text-[11px] font-extrabold shadow-soft">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 dark:text-white truncate">{name}</p>
          <p className="text-[10px] font-mono text-slate-400 truncate">{enrol.userId}</p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="relative">
        <FloatingElements className="!z-0" />

        <div className="relative z-10 space-y-8">
          <SectionHeader
            title="Active Student Enrolments Registry"
            description="Monitor learner progression, curriculum consumption percentages, and intake dates across every cohort."
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

          <GlassCard className="p-4 sm:p-5">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by course or student" className="lf-input sm:max-w-xs mb-3" data-testid="admin-enrolments-search-input" />
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {STATUS_FILTERS.map((filter) => {
                const isActiveFilter = statusFilter === filter.key;
                const FilterIcon = filter.icon;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key)}
                    className={`relative shrink-0 px-4 py-2 text-xs font-semibold rounded-2xl transition-colors duration-300 cursor-pointer ${
                      isActiveFilter
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-accent'
                    }`}
                  >
                    {isActiveFilter && (
                      <motion.span
                        layoutId="admin-enrolment-status-pill"
                        className="absolute inset-0 rounded-2xl bg-terra-600 shadow-glow"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      <FilterIcon className="w-3.5 h-3.5" />
                      {filter.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard variant="strong" className="overflow-hidden">
            <div className="px-5 sm:px-7 py-5 border-b border-white/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                Enrolment Records
                <Badge variant="accent" size="sm">
                  {filteredEnrolments.length}
                </Badge>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {loading ? 'Syncing registry...' : 'Registry synced'}
              </span>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-white/40 dark:bg-white/5 uppercase text-[10px] text-slate-400 font-bold border-b border-white/40 dark:border-white/10">
                  <tr>
                    <th className="px-7 py-4">Student</th>
                    <th className="px-7 py-4">Enrolled Course</th>
                    <th className="px-7 py-4">Intake Date</th>
                    <th className="px-7 py-4 w-64">Completion Progress %</th>
                    <th className="px-7 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40 dark:divide-white/10">
                  {filteredEnrolments.map((enrol, idx) => (
                    <motion.tr
                      key={enrol.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.35 }}
                      className="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors duration-300"
                    >
                      <td className="px-7 py-4">{renderStudent(enrol)}</td>

                      <td className="px-7 py-4">
                        <div className="flex items-center gap-2.5 max-w-xs">
                          <BookOpen className="w-4 h-4 text-accent shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {enrol.course?.title || enrol.courseId}
                          </span>
                        </div>
                      </td>

                      <td className="px-7 py-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {enrol.enrolledDate}
                        </span>
                      </td>

                      <td className="px-7 py-4">
                        <ProgressBar percent={enrol.progress || 0} strokeWidth={4} />
                      </td>

                      <td className="px-7 py-4 text-right">{renderStatusBadge(enrol)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-white/40 dark:divide-white/10">
              {filteredEnrolments.map((enrol, idx) => (
                <motion.div
                  key={enrol.id}
                  initial={reveal.hidden}
                  animate={reveal.visible}
                  transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                  className="p-5 space-y-4"
                >
                  {renderStudent(enrol)}

                  <div className="flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {enrol.course?.title || enrol.courseId}
                    </span>
                  </div>

                  <ProgressBar percent={enrol.progress || 0} strokeWidth={4} />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {renderStatusBadge(enrol)}
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {enrol.enrolledDate}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredEnrolments.length === 0 && (
              <div className="px-6 py-14 text-center">
                <Sparkles className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {loading ? 'Loading enrolment records...' : 'No enrolments match this status filter.'}
                </p>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary dark:text-accent flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Cohort completion pulse</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {completedCount} of {enrolments.length} enrolments have reached full curriculum consumption.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-56">
              <ProgressBar percent={averageProgress} strokeWidth={6} />
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
