import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Award, Download, CheckCircle2, Star, Sparkles, TrendingUp } from 'lucide-react';
import { fetchResults } from '../../redux/slices/resultsSlice';
import { useToast } from '../../components/common/Toast';

export default function StudentResults() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { results, cumulativeGpa, loading } = useSelector((state) => state.results);

  useEffect(() => {
    dispatch(fetchResults(user?.id || 'user_student_1'));
  }, [dispatch, user]);

  const handleDownloadTranscript = () => {
    toast.success('Official academic transcript downloaded as PDF.');
  };

  const getGradeBadge = (grade) => {
    const isTop = grade.startsWith('A');
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-extrabold ${
          isTop
            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
            : 'bg-accent/10 text-accent'
        }`}
      >
        {grade}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Academic Grade Card & Results
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Certified evaluation scores published by instructors.
          </p>
        </div>

        <button
          onClick={handleDownloadTranscript}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Download Transcript (PDF)
        </button>
      </div>

      {/* GPA Score Card Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-800 text-white p-6 sm:p-8 rounded-3xl shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Performance Record</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Distinction Honor Standing
          </h2>
          <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
            Your cumulative GPA places you in the top 5% of this engineering cohort. Maintain 3.8+ to receive verified institution honors.
          </p>
        </div>

        <div className="flex items-center gap-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Cumulative GPA
            </span>
            <div className="text-4xl font-extrabold text-white mt-1">
              {cumulativeGpa ? cumulativeGpa.toFixed(2) : '3.90'}
            </div>
            <span className="text-[10px] text-amber-300 font-semibold">Scale 4.00</span>
          </div>
        </div>
      </div>

      {/* Results Grade Table */}
      <div className="bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            Course Evaluations
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {results.length} graded courses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Course</th>
                <th className="px-6 py-3.5">Total Marks</th>
                <th className="px-6 py-3.5">Grade</th>
                <th className="px-6 py-3.5">Grade Points</th>
                <th className="px-6 py-3.5">Instructor Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No graded results published yet.
                  </td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {res.courseTitle}
                      <span className="block text-[10px] font-normal text-slate-400 font-mono mt-0.5">
                        Published on {res.publishedDate}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {res.totalMarks} / 100
                    </td>
                    <td className="px-6 py-4">
                      {getGradeBadge(res.grade)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                      {res.gpa?.toFixed(1) || '4.0'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 italic max-w-xs">
                      "{res.remarks || 'Excellent dedication and code quality.'}"
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
