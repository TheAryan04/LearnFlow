import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, ShieldCheck, Download, Activity, ArrowRight, UserCog, Layers, FileBarChart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { Skeleton } from '../../components/common/LoadingSpinner';
import { formatINR, formatINRShort } from '../../utils/currency';

const ACTIONS = [
  { to: '/admin/users', label: 'Users', description: 'Assign roles and manage access', icon: UserCog },
  { to: '/admin/courses', label: 'Courses', description: 'Publish, unpublish or remove', icon: Layers },
  { to: '/admin/enrolments', label: 'Enrolments', description: 'Follow learner progress', icon: ShieldCheck },
  { to: '/admin/reports', label: 'Reports', description: 'Export clean CSV datasets', icon: FileBarChart },
];

const tooltipStyle = { backgroundColor: '#FFFDF9', border: '1px solid #E7E2D7', borderRadius: 8, fontSize: 12, color: '#1C1917', boxShadow: '0 12px 32px -8px rgba(28,25,23,0.12)' };

function downloadCsv(rows) {
  const csv = ['month,revenue,enrolments', ...rows.map((r) => `${r.month},${r.revenue},${r.enrolments}`)].join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = 'learnflow-revenue.csv';
  link.click();
}

function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="lfRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8C3322" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#8C3322" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#D5CEBF" />
        <XAxis dataKey="month" stroke="#A8A090" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis stroke="#A8A090" tickLine={false} axisLine={false} fontSize={12} tickFormatter={formatINRShort} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => (n === 'Revenue' ? formatINR(v) : v.toLocaleString('en-IN'))} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#8C3322" strokeWidth={1.75} fill="url(#lfRevenue)" />
        <Area type="monotone" dataKey="enrolments" name="Enrolments" stroke="#57534E" strokeWidth={1.25} strokeDasharray="4 3" fill="transparent" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function AdminOverview() {
  const toast = useToast();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats/admin').then((res) => setStats(res.data)).catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chart = stats?.revenueChartData || [];
  const annual = chart.reduce((a, r) => a + r.revenue, 0);
  const fmt = (n) => (n ?? 0).toLocaleString('en-IN');

  return (
    <DashboardLayout>
      <div className="space-y-14">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="lf-eyebrow mb-4">Administration</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-ink-900" data-testid="admin-overview-title">The state of the <em className="text-terra-700">school</em>.</h1>
            <p className="text-ink-500 mt-3">People, courses and revenue across LearnFlow this year.</p>
          </div>
          <button
            onClick={() => { downloadCsv(chart); toast.success('Revenue data exported as CSV.'); }}
            disabled={!chart.length}
            className="lf-btn-secondary"
            data-testid="admin-export-csv-button"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </header>

        {!stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            <StatCard icon={Users} value={fmt(stats.totalUsers)} label="Total users" />
            <StatCard icon={BookOpen} value={fmt(stats.totalCourses)} label="Total courses" />
            <StatCard icon={ShieldCheck} value={fmt(stats.totalEnrolments)} label="Enrolments" variant="success" />
            <StatCard icon={Activity} value={fmt(stats.activeThisMonth)} label="Active this month" variant="warning" />
          </div>
        )}

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-ink-900 mb-6">
            <h2 className="font-serif text-2xl text-ink-900">Revenue & enrolments</h2>
            <p className="text-sm text-ink-500">Annual revenue <span className="font-serif text-xl text-ink-900 ml-2" data-testid="admin-annual-revenue">{formatINR(annual)}</span></p>
          </div>
          {stats ? <RevenueChart data={chart} /> : <Skeleton className="h-[300px]" />}
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink-900 pb-4 border-b border-ink-900">Manage</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {ACTIONS.map(({ to, label, description, icon: Icon }) => (
              <Link key={to} to={to} className="group py-6 pr-6 border-b border-rule sm:[&:not(:nth-child(2n))]:border-r lg:[&:not(:nth-child(4n))]:border-r lg:[&:nth-child(2)]:border-r sm:pl-6 sm:first:pl-0" data-testid={`admin-action-${label.toLowerCase()}`}>
                <Icon className="w-4 h-4 text-terra-600 mb-4" />
                <p className="font-serif text-xl text-ink-900 flex items-center gap-2">{label}<ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform]" /></p>
                <p className="text-sm text-ink-500 mt-1">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
