import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CalendarCheck, CheckCircle2, Clock, XCircle, Award } from 'lucide-react';
import { fetchAttendance } from '../../redux/slices/attendanceSlice';
import CircularProgress from '../../components/common/CircularProgress';

export default function StudentAttendance() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { studentStats, loading } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchAttendance({ studentId: user?.id }));
  }, [dispatch, user]);

  const history = studentStats.history || [
    {
      sessionId: 'att_1',
      courseTitle: 'Complete React 19 & Next.js Architecture Bootcamp',
      date: '2025-02-10',
      status: 'Present',
    },
    {
      sessionId: 'att_2',
      courseTitle: 'Complete React 19 & Next.js Architecture Bootcamp',
      date: '2025-02-17',
      status: 'Late',
    },
    {
      sessionId: 'att_3',
      courseTitle: 'UI/UX & Design Systems: From Notion to Figma Pro',
      date: '2025-02-11',
      status: 'Present',
    },
    {
      sessionId: 'att_4',
      courseTitle: 'UI/UX & Design Systems: From Notion to Figma Pro',
      date: '2025-02-18',
      status: 'Present',
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            Late
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            Absent
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Cohort Attendance Registry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Verified presence in live workshops, seminars, and laboratory sessions.
        </p>
      </div>

      {/* Metrics Row with Circular RC Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="sm:col-span-1 bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col items-center justify-center text-center">
          <CircularProgress
            percent={studentStats.attendanceRate || 88}
            size={100}
            strokeWidth={9}
            strokeColor="#2D5A3A"
            label="Rate"
          />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3">
            Overall Standing
          </p>
        </div>

        <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Sessions</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {studentStats.totalSessions || history.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled cohort sessions</p>
        </div>

        <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-semibold uppercase">Present Days</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {studentStats.presentCount || 3}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">On-time attendances</p>
        </div>

        <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-semibold uppercase">Late / Absent</span>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">
            {studentStats.lateCount || 1} / {studentStats.absentCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Allowed absences: 4</p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-accent" />
            Session Attendance History
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {history.length} records logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Course Name</th>
                <th className="px-6 py-3.5">Session Date</th>
                <th className="px-6 py-3.5">Status Record</th>
                <th className="px-6 py-3.5 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {history.map((rec, i) => (
                <tr
                  key={rec.sessionId || i}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">
                    {rec.courseTitle}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono">
                    {rec.date}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(rec.status)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    Verified by Mentor
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
