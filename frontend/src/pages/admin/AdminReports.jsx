import React, { useEffect, useState } from 'react';
import { Download, FileBarChart, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const REPORTS = [
  { id: 'users', label: 'Users', description: 'Registered users, roles and account status' },
  { id: 'courses', label: 'Courses', description: 'Course catalogue and publication status' },
  { id: 'enrolments', label: 'Enrolments', description: 'Student course enrolment records' },
  { id: 'attendance', label: 'Attendance', description: 'Recorded attendance sessions' },
  { id: 'results', label: 'Results', description: 'Published grades and GPA records' },
  { id: 'assignments', label: 'Assignments', description: 'Course assignment records' },
  { id: 'submissions', label: 'Submissions', description: 'Student assignment submissions and grades' },
];

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvValue(value) {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

export default function AdminReports() {
  const toast = useToast();
  const [selected, setSelected] = useState('users');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedAt, setLoadedAt] = useState(null);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/reports/${selected}`);
      setRows(Array.isArray(data) ? data : []);
      setLoadedAt(new Date());
    } catch (error) {
      setRows([]);
      toast.error(error.message || 'Unable to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [selected]);

  const exportCsv = () => {
    if (!rows.length) return toast.info('There is no data to export.');
    const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    const csv = [keys.map(csvValue).join(','), ...rows.map((row) => keys.map((key) => csvValue(row[key])).join(','))].join('\n');
    download(csv, `learnflow-${selected}-report.csv`, 'text/csv;charset=utf-8');
    toast.success('Live report exported.');
  };

  const exportJson = () => {
    if (!rows.length) return toast.info('There is no data to export.');
    download(JSON.stringify(rows, null, 2), `learnflow-${selected}-report.json`, 'application/json;charset=utf-8');
    toast.success('Live report exported.');
  };

  const activeReport = REPORTS.find((report) => report.id === selected);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="lf-eyebrow mb-2">Administration</p>
            <h1 className="font-serif text-4xl text-ink-900">Operational reports</h1>
            <p className="mt-2 text-sm text-ink-500">Reports are loaded from the current LearnFlow database, not sample data.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadReport} disabled={loading} className="lf-btn-secondary"><RefreshCw className="h-4 w-4" /> Refresh</button>
            <button onClick={exportCsv} disabled={loading || !rows.length} className="lf-btn-secondary"><Download className="h-4 w-4" /> CSV</button>
            <button onClick={exportJson} disabled={loading || !rows.length} className="lf-btn-primary"><Download className="h-4 w-4" /> JSON</button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REPORTS.map((report) => (
            <button key={report.id} onClick={() => setSelected(report.id)} className={`rounded-2xl border p-4 text-left transition-colors ${selected === report.id ? 'border-terra-600 bg-terra-50' : 'border-rule bg-white hover:border-terra-300'}`}>
              <FileBarChart className="mb-3 h-5 w-5 text-terra-700" />
              <span className="block font-semibold text-ink-900">{report.label}</span>
              <span className="mt-1 block text-xs text-ink-500">{report.description}</span>
            </button>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-rule bg-white">
          <div className="flex items-center justify-between border-b border-rule px-5 py-4">
            <div>
              <h2 className="font-serif text-2xl text-ink-900">{activeReport?.label} report</h2>
              <p className="text-xs text-ink-500">{rows.length} database records{loadedAt ? ` · Refreshed ${loadedAt.toLocaleTimeString()}` : ''}</p>
            </div>
            <span className="text-xs text-ink-500">{loading ? 'Loading…' : 'Live data'}</span>
          </div>
          <div className="overflow-x-auto">
            {loading ? <p className="p-8 text-sm text-ink-500">Loading report…</p> : rows.length ? (
              <table className="min-w-full text-left text-xs">
                <thead className="bg-stone-50 text-[10px] uppercase text-stone-500"><tr>{Object.keys(rows[0]).filter((key) => key !== '_id').map((key) => <th key={key} className="px-4 py-3 font-semibold">{key}</th>)}</tr></thead>
                <tbody>{rows.map((row, index) => <tr key={row.id || index} className="border-t border-rule">{Object.entries(row).filter(([key]) => key !== '_id').map(([key, value]) => <td key={key} className="max-w-xs px-4 py-3 text-ink-700">{value == null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>)}</tr>)}</tbody>
              </table>
            ) : <p className="p-8 text-sm text-ink-500">No records are available for this report yet.</p>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
