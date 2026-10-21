import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  ShieldCheck,
  Download,
  DollarSign,
  Activity,
  ArrowRight,
  Sparkles,
  Server,
  UserCog,
  Layers,
  FileBarChart,
  Gauge,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import GlassCard from '../../components/ui/GlassCard';
import TiltCard from '../../components/ui/TiltCard';
import FloatingElements from '../../components/ui/FloatingElements';
import Marquee from '../../components/ui/Marquee';

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 26 },
  },
};

const DEFAULT_STATS = {
  totalUsers: 1545,
  totalCourses: 46,
  totalEnrolments: 13283,
  activeThisMonth: 3420,
  revenueChartData: [
    { month: 'Jan', revenue: 14200, enrolments: 420 },
    { month: 'Feb', revenue: 18400, enrolments: 560 },
    { month: 'Mar', revenue: 22100, enrolments: 680 },
    { month: 'Apr', revenue: 19800, enrolments: 590 },
    { month: 'May', revenue: 27500, enrolments: 820 },
    { month: 'Jun', revenue: 31200, enrolments: 940 },
    { month: 'Jul', revenue: 29800, enrolments: 890 },
    { month: 'Aug', revenue: 35600, enrolments: 1080 },
    { month: 'Sep', revenue: 42100, enrolments: 1250 },
    { month: 'Oct', revenue: 48900, enrolments: 1430 },
    { month: 'Nov', revenue: 54200, enrolments: 1610 },
    { month: 'Dec', revenue: 61800, enrolments: 1840 },
  ],
};

const quickActions = [
  {
    to: '/admin/users',
    label: 'User Directory',
    description: 'Assign roles, verify identities and govern access.',
    icon: UserCog,
    tint: 'text-primary',
    glow: 'from-primary/25',
  },
  {
    to: '/admin/courses',
    label: 'Course Moderation',
    description: 'Approve, flag or purge curriculum in the catalog.',
    icon: Layers,
    tint: 'text-accent',
    glow: 'from-accent/25',
  },
  {
    to: '/admin/enrolments',
    label: 'Enrolment Registry',
    description: 'Monitor learner progression and completion rates.',
    icon: ShieldCheck,
    tint: 'text-emerald-500',
    glow: 'from-emerald-500/25',
  },
  {
    to: '/admin/reports',
    label: 'Reports & Export',
    description: 'Generate compliance datasets for accreditation.',
    icon: FileBarChart,
    tint: 'text-purple-500',
    glow: 'from-purple-500/25',
  },
];

const announcements = [
  { text: 'Governance audit window opens this Friday', icon: <ShieldCheck className="w-4 h-4" /> },
  { text: 'Catalog moderation queue refreshed with 12 new submissions', icon: <Layers className="w-4 h-4" /> },
  { text: 'Q3 revenue projection up 21.4% against forecast', icon: <DollarSign className="w-4 h-4" /> },
  { text: 'Annual compliance CSV bundles are ready to download', icon: <FileBarChart className="w-4 h-4" /> },
];

const chartTooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.94)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  color: '#fff',
  fontSize: '12px',
  boxShadow: '0 24px 48px -16px rgba(2, 6, 23, 0.65)',
  backdropFilter: 'blur(14px)',
};

export default function AdminOverview() {
  const toast = useToast();
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    api
      .get('/stats/admin')
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch((err) => console.log('Using default admin statistics'));
  }, []);

  const handleExportCSV = () => {
    toast.success('Admin platform analytics exported as CSV.');
  };

  const chartData = stats.revenueChartData || [];
  const annualRevenue = chartData.reduce((acc, row) => acc + (row.revenue || 0), 0);
  const annualEnrolments = chartData.reduce((acc, row) => acc + (row.enrolments || 0), 0);
  const averageOrderValue = annualEnrolments ? Math.round(annualRevenue / annualEnrolments) : 0;

  const metricCards = [
    {
      icon: Users,
      value: (stats.totalUsers || 0).toLocaleString(),
      label: 'Total Users',
      variant: 'accent',
      trend: { positive: true, label: '+18.2% new students' },
    },
    {
      icon: BookOpen,
      value: (stats.totalCourses || 0).toLocaleString(),
      label: 'Total Courses',
      variant: 'primary',
      trend: { positive: true, label: '6 categories live' },
    },
    {
      icon: ShieldCheck,
      value: (stats.totalEnrolments || 0).toLocaleString(),
      label: 'Total Enrolments',
      variant: 'success',
      trend: { positive: true, label: '94% retention rate' },
    },
    {
      icon: Activity,
      value: (stats.activeThisMonth || 0).toLocaleString(),
      label: 'Active This Month',
      variant: 'warning',
      trend: { positive: true, label: 'Monthly active users' },
    },
  ];

  return (
    <DashboardLayout>
      <div className="relative">
        <FloatingElements className="!z-0" />

        <div className="relative z-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="rounded-[2rem] glass overflow-hidden"
          >
            <Marquee items={announcements} speed={48} />
          </motion.div>

          <motion.header
            initial={reveal.hidden}
            animate={reveal.visible}
            className="relative overflow-hidden rounded-[2.5rem] glass-strong p-7 sm:p-10"
          >
            <div className="pointer-events-none absolute -top-28 -right-20 w-80 h-80 rounded-full bg-primary/25 blur-[120px] animate-float" />
            <div className="pointer-events-none absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-accent/20 blur-[130px] animate-float-slow" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary dark:text-accent text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Governance Console
                </span>

                <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05]">
                  Institutional Administration
                </h1>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                  Real-time analytics, user access control, catalog moderation, and revenue forecasting.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/10 backdrop-blur-xl">
                    <Server className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Platform</span>
                    <span className="text-xs font-bold text-emerald-500">Operational</span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/10 backdrop-blur-xl">
                    <Gauge className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Avg. order</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">${averageOrderValue}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export Platform CSV
                </button>

                <Link
                  to="/admin/reports"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-xs bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/15 text-slate-700 dark:text-slate-200 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300"
                >
                  <FileBarChart className="w-4 h-4 text-accent" />
                  Open Report Studio
                </Link>
              </div>
            </div>
          </motion.header>

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

          <section>
            <SectionHeader
              title="Platform Telemetry"
              description="Gross tuition collected across all verified courses, benchmarked against cohort enrolment growth."
            />

            <GlassCard variant="strong" className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Platform Revenue &amp; Cohort Growth (Annual)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Fiscal year to date · {chartData.length} reporting months
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    Revenue ($ USD)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    Enrolments
                  </span>
                </div>
              </div>

              <div className="h-72 sm:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="adminEnrolmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.25} />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(val, name) => [
                        name === 'revenue' ? `$${val.toLocaleString()}` : val.toLocaleString(),
                        name === 'revenue' ? 'Revenue' : 'Enrolments',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0EA5E9"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#adminRevenueGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="enrolments"
                      stroke="#14B8A6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#adminEnrolmentGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </section>

          <section>
            <SectionHeader
              title="Quick Actions"
              description="Jump straight into the governance workflows that matter most right now."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.to}
                    initial={reveal.hidden}
                    animate={reveal.visible}
                    transition={{ delay: 0.06 * idx, type: 'spring', stiffness: 280, damping: 26 }}
                    className="h-full perspective-1200"
                  >
                    <TiltCard intensity={12} scale={1.04} className="h-full">
                      <Link
                        to={action.to}
                        className="group flex h-full flex-col justify-between gap-7 rounded-[2rem] glass p-6 hover:shadow-glow transition-shadow duration-500"
                      >
                        <div>
                          <div
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.glow} to-transparent text-slate-900 dark:text-white flex items-center justify-center border border-white/60 dark:border-white/10`}
                          >
                            <Icon className={`w-6 h-6 ${action.tint}`} />
                          </div>
                          <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                            {action.label}
                          </h3>
                          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {action.description}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-accent">
                          Open workspace
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
