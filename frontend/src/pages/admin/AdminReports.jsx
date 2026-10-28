import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart,
  Download,
  Users,
  DollarSign,
  BookOpen,
  CalendarCheck,
  Database,
  FileJson,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  Sparkles,
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
import { useToast } from '../../components/common/Toast';
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

const REVENUE_TREND = [
  { month: 'Jan', revenue: 14200, enrolments: 420, activeUsers: 2400 },
  { month: 'Feb', revenue: 18400, enrolments: 560, activeUsers: 2650 },
  { month: 'Mar', revenue: 22100, enrolments: 680, activeUsers: 2890 },
  { month: 'Apr', revenue: 19800, enrolments: 590, activeUsers: 2740 },
  { month: 'May', revenue: 27500, enrolments: 820, activeUsers: 3100 },
  { month: 'Jun', revenue: 31200, enrolments: 940, activeUsers: 3280 },
  { month: 'Jul', revenue: 29800, enrolments: 890, activeUsers: 3200 },
  { month: 'Aug', revenue: 35600, enrolments: 1080, activeUsers: 3350 },
  { month: 'Sep', revenue: 42100, enrolments: 1250, activeUsers: 3400 },
  { month: 'Oct', revenue: 48900, enrolments: 1430, activeUsers: 3420 },
];

const REPORT_CATALOG = [
  {
    id: 'users',
    title: 'Registered Users & Governance Audit',
    description: 'Full list of active learners, instructors, credential roles, and authentication timestamps.',
    icon: Users,
    filename: 'learnflow_users_report.csv',
    jsonFilename: 'learnflow_users_report.json',
    variant: 'primary',
    rows: [
      { ID: 'user_student_1', Name: 'Alex Johnson', Email: 'alex.student@learnflow.edu', Role: 'Student', JoinedDate: '2025-01-15', Status: 'Active' },
      { ID: 'user_student_2', Name: 'Sarah Chen', Email: 'sarah.chen@learnflow.edu', Role: 'Student', JoinedDate: '2025-02-01', Status: 'Active' },
      { ID: 'user_instructor_1', Name: 'Dr. Marcus Vance', Email: 'marcus.vance@learnflow.edu', Role: 'Instructor', JoinedDate: '2024-09-10', Status: 'Active' },
      { ID: 'user_instructor_2', Name: 'Elena Rostova', Email: 'elena.rostova@learnflow.edu', Role: 'Instructor', JoinedDate: '2024-10-05', Status: 'Active' },
      { ID: 'user_admin_1', Name: 'Admin LearnFlow', Email: 'admin@learnflow.edu', Role: 'Admin', JoinedDate: '2024-01-01', Status: 'Active' },
    ],
    csv: `ID,Name,Email,Role,JoinedDate,Status\nuser_student_1,Alex Johnson,alex.student@learnflow.edu,Student,2025-01-15,Active\nuser_student_2,Sarah Chen,sarah.chen@learnflow.edu,Student,2025-02-01,Active\nuser_instructor_1,Dr. Marcus Vance,marcus.vance@learnflow.edu,Instructor,2024-09-10,Active\nuser_instructor_2,Elena Rostova,elena.rostova@learnflow.edu,Instructor,2024-10-05,Active\nuser_admin_1,Admin LearnFlow,admin@learnflow.edu,Admin,2024-01-01,Active`,
  },
  {
    id: 'courses',
    title: 'Course Catalog & Performance Metrics',
    description: 'Course enrollment figures, ratings, pricing tier yields, and curriculum publishing status.',
    icon: BookOpen,
    filename: 'learnflow_courses_catalog_report.csv',
    jsonFilename: 'learnflow_courses_catalog_report.json',
    variant: 'accent',
    rows: [
      { ID: 'course_react_mastery', Title: 'Complete React 19 & Next.js Architecture Bootcamp', Category: 'Development', Price: 49.99, EnrolledStudents: 3820, Rating: 4.9, Status: 'published' },
      { ID: 'course_uiux_design', Title: 'UI/UX & Design Systems: From Notion to Figma Pro', Category: 'Design', Price: 39.99, EnrolledStudents: 2430, Rating: 4.85, Status: 'published' },
      { ID: 'course_python_ai', Title: 'Applied AI & Python Full-Stack Engineering', Category: 'AI & Data', Price: 54.99, EnrolledStudents: 5120, Rating: 4.92, Status: 'published' },
      { ID: 'course_cloud_devops', Title: 'DevOps & Cloud Native Architecture', Category: 'Cloud', Price: 44.99, EnrolledStudents: 1890, Rating: 4.78, Status: 'published' },
    ],
    csv: `ID,Title,Category,Price,EnrolledStudents,Rating,Status\ncourse_react_mastery,Complete React 19 & Next.js Architecture Bootcamp,Development,49.99,3820,4.9,published\ncourse_uiux_design,UI/UX & Design Systems: From Notion to Figma Pro,Design,39.99,2430,4.85,published\ncourse_python_ai,Applied AI & Python Full-Stack Engineering,AI & Data,54.99,5120,4.92,published\ncourse_cloud_devops,DevOps & Cloud Native Architecture,Cloud,44.99,1890,4.78,published`,
  },
  {
    id: 'revenue',
    title: 'Tuition Revenue & Financial Audits',
    description: 'Detailed revenue receipts, monthly payment summaries, and financial cohort trends.',
    icon: DollarSign,
    filename: 'learnflow_financial_revenue_report.csv',
    jsonFilename: 'learnflow_financial_revenue_report.json',
    variant: 'success',
    rows: REVENUE_TREND.map((row) => ({
      Month: row.month,
      GrossRevenue: row.revenue,
      Enrolments: row.enrolments,
      ActiveUsers: row.activeUsers,
    })),
    csv: `Month,GrossRevenue,Enrolments,ActiveUsers\nJan,14200,420,2400\nFeb,18400,560,2650\nMar,22100,680,2890\nApr,19800,590,2740\nMay,27500,820,3100\nJun,31200,940,3280\nJul,29800,890,3200\nAug,35600,1080,3350\nSep,42100,1250,3400\nOct,48900,1430,3420`,
  },
  {
    id: 'attendance',
    title: 'Cohort Attendance & Compliance Registry',
    description: 'Historical records of session dates, present / late / absent counts, and attendance rates.',
    icon: CalendarCheck,
    filename: 'learnflow_cohort_attendance_report.csv',
    jsonFilename: 'learnflow_cohort_attendance_report.json',
    variant: 'warning',
    rows: [
      { SessionID: 'att_1', CourseTitle: 'Complete React 19 & Next.js Bootcamp', Date: '2025-02-10', Student: 'Alex Johnson', Status: 'Present' },
      { SessionID: 'att_2', CourseTitle: 'Complete React 19 & Next.js Bootcamp', Date: '2025-02-17', Student: 'Alex Johnson', Status: 'Late' },
      { SessionID: 'att_3', CourseTitle: 'UI/UX Design Systems', Date: '2025-02-11', Student: 'Alex Johnson', Status: 'Present' },
      { SessionID: 'att_4', CourseTitle: 'UI/UX Design Systems', Date: '2025-02-18', Student: 'Alex Johnson', Status: 'Present' },
    ],
    csv: `SessionID,CourseTitle,Date,Student,Status\natt_1,Complete React 19 & Next.js Bootcamp,2025-02-10,Alex Johnson,Present\natt_2,Complete React 19 & Next.js Bootcamp,2025-02-17,Alex Johnson,Late\natt_3,UI/UX Design Systems,2025-02-11,Alex Johnson,Present\natt_4,UI/UX Design Systems,2025-02-18,Alex Johnson,Present`,
  },
];

const chartTooltipStyle = {
  backgroundColor: '#FFFDF9',
  borderRadius: '8px',
  border: '1px solid #E7E2D7',
  color: '#1C1917',
  fontSize: '12px',
  boxShadow: '0 12px 32px -8px rgba(28,25,23,0.12)',
};

export default function AdminReports() {
  const toast = useToast();
  const [format, setFormat] = useState('csv');

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename} successfully!`);
  };

  const downloadCSV = (filename, csvContent) => {
    downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
  };

  const downloadJSON = (filename, rows) => {
    downloadFile(filename, JSON.stringify(rows, null, 2), 'application/json;charset=utf-8;');
  };

  const handleExportUsers = () => {
    const report = REPORT_CATALOG[0];
    downloadCSV('learnflow_users_report.csv', report.csv);
  };

  const handleExportCourses = () => {
    const report = REPORT_CATALOG[1];
    downloadCSV('learnflow_courses_catalog_report.csv', report.csv);
  };

  const handleExportRevenue = () => {
    const report = REPORT_CATALOG[2];
    downloadCSV('learnflow_financial_revenue_report.csv', report.csv);
  };

  const handleExportAttendance = () => {
    const report = REPORT_CATALOG[3];
    downloadCSV('learnflow_cohort_attendance_report.csv', report.csv);
  };

  const reportCards = [
    {
      title: 'Registered Users & Governance Audit',
      description: 'Full list of active learners, instructors, credential roles, and authentication timestamps.',
      icon: Users,
      onClick: handleExportUsers,
      filename: 'learnflow_users_report.csv',
    },
    {
      title: 'Course Catalog & Performance Metrics',
      description: 'Course enrollment figures, ratings, pricing tier yields, and curriculum publishing status.',
      icon: BookOpen,
      onClick: handleExportCourses,
      filename: 'learnflow_courses_catalog_report.csv',
    },
    {
      title: 'Tuition Revenue & Financial Audits',
      description: 'Detailed revenue receipts, monthly payment summaries, and financial cohort trends.',
      icon: DollarSign,
      onClick: handleExportRevenue,
      filename: 'learnflow_financial_revenue_report.csv',
    },
    {
      title: 'Cohort Attendance & Compliance Registry',
      description: 'Historical records of session dates, present / late / absent counts, and attendance rates.',
      icon: CalendarCheck,
      onClick: handleExportAttendance,
      filename: 'learnflow_cohort_attendance_report.csv',
    },
  ];

  const totalRevenue = useMemo(
    () => REVENUE_TREND.reduce((acc, row) => acc + row.revenue, 0),
    []
  );

  const totalRows = REPORT_CATALOG.reduce((acc, report) => acc + report.rows.length, 0);

  const metricCards = [
    {
      icon: FileBarChart,
      value: reportCards.length.toString(),
      label: 'Report Bundles',
      variant: 'primary',
      trend: { positive: true, label: 'Compliance ready' },
    },
    {
      icon: Database,
      value: totalRows.toString(),
      label: 'Audited Records',
      variant: 'accent',
      trend: { positive: true, label: 'Across all datasets' },
    },
    {
      icon: TrendingUp,
      value: `$${totalRevenue.toLocaleString()}`,
      label: 'Audited Revenue',
      variant: 'success',
      trend: { positive: true, label: 'Jan — Oct window' },
    },
    {
      icon: ShieldCheck,
      value: '100%',
      label: 'Export Integrity',
      variant: 'warning',
      trend: { positive: true, label: 'Schema validated' },
    },
  ];

  const handleDownload = (report) => {
    if (format === 'json') {
      downloadJSON(report.jsonFilename, report.rows);
      return;
    }
    downloadCSV(report.filename, report.csv);
  };

  return (
    <DashboardLayout>
      <div className="relative">
        <FloatingElements className="!z-0" />

        <div className="relative z-10 space-y-8">
          <SectionHeader
            title="Institutional Reporting Data Export"
            description="Export standardized reports for compliance, academic accreditation, and accounting workflows."
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

          <GlassCard variant="strong" className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Audited Tuition Revenue Trajectory
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Source dataset · financial revenue report
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  Gross revenue ($ USD)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  Enrolments
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8C3322" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#8C3322" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="reportEnrolmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8C3322" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#8C3322" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#A8A090" opacity={0.25} />
                  <XAxis dataKey="month" stroke="#A8A090" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#A8A090"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(val, name) => [
                      name === 'revenue' ? `$${val.toLocaleString()}` : val.toLocaleString(),
                      name === 'revenue' ? 'Gross Revenue' : 'Enrolments',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8C3322"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#reportRevenueGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="enrolments"
                    stroke="#8C3322"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#reportEnrolmentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <section>
            <SectionHeader
              title="Export Bundles"
              description="Choose a delivery format, then download any dataset for accreditation, audit or accounting workflows."
            />

            <div className="flex items-center gap-2 mb-6">
              {[
                { key: 'csv', label: 'CSV Spreadsheet', icon: FileSpreadsheet },
                { key: 'json', label: 'JSON Payload', icon: FileJson },
              ].map((option) => {
                const isActiveFormat = format === option.key;
                const FormatIcon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => setFormat(option.key)}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-2xl transition-colors duration-300 cursor-pointer ${
                      isActiveFormat
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-accent'
                    }`}
                  >
                    {isActiveFormat && (
                      <motion.span
                        layoutId="admin-report-format-pill"
                        className="absolute inset-0 rounded-2xl bg-terra-600 shadow-glow"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      <FormatIcon className="w-3.5 h-3.5" />
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {REPORT_CATALOG.map((report, idx) => {
                const Icon = report.icon;
                const filename = format === 'json' ? report.jsonFilename : report.filename;
                return (
                  <motion.div
                    key={report.id}
                    initial={reveal.hidden}
                    animate={reveal.visible}
                    transition={{ delay: 0.05 * idx, type: 'spring', stiffness: 280, damping: 26 }}
                    className="perspective-1200"
                  >
                    <TiltCard intensity={10} scale={1.03} className="h-full">
                      <div className="h-full rounded-xl glass p-6 flex flex-col justify-between gap-6 hover:shadow-glow transition-shadow duration-500">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 text-primary dark:text-accent flex items-center justify-center border border-white/60 dark:border-white/10">
                              <Icon className="w-6 h-6" />
                            </div>
                            <Badge variant={report.variant} size="sm">
                              {report.rows.length} rows
                            </Badge>
                          </div>

                          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                            {report.title}
                          </h3>
                          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {report.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-[11px] font-mono text-slate-400 truncate">{filename}</span>
                          <button
                            onClick={() => handleDownload(report)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-terra-600 text-white text-xs font-bold shadow-glow hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            {format === 'json' ? 'Download JSON' : 'Export CSV'}
                          </button>
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <GlassCard className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Audit trail ready</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every bundle is generated client-side and downloaded straight to your device.
                </p>
              </div>
            </div>

            <Badge variant="accent" size="md">
              {format === 'json' ? 'JSON payload mode' : 'CSV spreadsheet mode'}
            </Badge>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
