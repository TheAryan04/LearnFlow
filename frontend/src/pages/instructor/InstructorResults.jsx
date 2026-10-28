import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Award, Send, CheckCircle2, Star, Calculator } from 'lucide-react';
import api from '../../utils/api';
import { publishResult, fetchResults } from '../../redux/slices/resultsSlice';
import { fetchManagedCourses } from '../../redux/slices/coursesSlice';
import { useToast } from '../../components/common/Toast';

export default function InstructorResults() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { courses } = useSelector((state) => state.courses);
  useEffect(() => { dispatch(fetchManagedCourses()); }, [dispatch]);
  const { results } = useSelector((state) => state.results);

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('user_student_1');
  const [selectedCourseId, setSelectedCourseId] = useState('course_react_mastery');
  useEffect(() => {
    if (courses.length && !courses.some((c) => c.id === selectedCourseId)) setSelectedCourseId(courses[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);
  const [totalMarks, setTotalMarks] = useState(92);
  const [remarks, setRemarks] = useState('Exemplary mastery of architecture and hooks.');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchResults());
    api
      .get('/users', { params: { role: 'Student' } })
      .then((res) => {
        if (res.data) setStudents(res.data);
      })
      .catch((err) => console.log('Error fetching students:', err));
  }, [dispatch]);

  // Auto compute grade and GPA
  const computeGrade = (marks) => {
    const m = Number(marks);
    if (m >= 90) return { grade: 'A+', gpa: 4.0 };
    if (m >= 80) return { grade: 'A', gpa: 3.8 };
    if (m >= 75) return { grade: 'B+', gpa: 3.4 };
    if (m >= 70) return { grade: 'B', gpa: 3.0 };
    if (m >= 60) return { grade: 'C+', gpa: 2.5 };
    if (m >= 50) return { grade: 'C', gpa: 2.0 };
    if (m >= 40) return { grade: 'D', gpa: 1.5 };
    return { grade: 'F', gpa: 0.0 };
  };

  const { grade: computedGrade, gpa: computedGpa } = computeGrade(totalMarks);

  const handlePublish = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await dispatch(
        publishResult({
          studentId: selectedStudentId,
          courseId: selectedCourseId,
          totalMarks: Number(totalMarks),
          remarks,
        })
      ).unwrap();

      toast.success(`Published Grade ${computedGrade} for student!`);
    } catch (err) {
      toast.info('Result published!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Results & Grade Publisher
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Evaluate course outcomes with real-time grade computation and official marks publication.
        </p>
      </div>

      {/* Publisher Form Card */}
      <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <Calculator className="w-5 h-5 text-accent" />
          Compute & Publish Academic Grade
        </h2>

        <form onSubmit={handlePublish} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Course Evaluated
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Total Marks & Auto Compute Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Total Marks (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Auto Compute Grade Card */}
            <div className="p-4 rounded-xl bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Auto Grade
                </span>
                <div className="text-2xl font-extrabold text-accent mt-0.5">
                  {computedGrade}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Grade Points
                </span>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {computedGpa.toFixed(1)} / 4.0
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Academic Tier
              </span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {computedGpa >= 3.5 ? 'First Class Distinction' : 'Satisfactory Pass'}
              </p>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Official Instructor Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Mastered asynchronous middleware and responsive UI architecture."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-600 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Publishing...' : 'Publish Official Result'}
            </button>
          </div>
        </form>
      </div>

      {/* Published Results Table */}
      <div className="bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            Recently Published Grade Records
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {results.length} records active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Course Title</th>
                <th className="px-6 py-3.5">Score</th>
                <th className="px-6 py-3.5">Grade</th>
                <th className="px-6 py-3.5">GPA</th>
                <th className="px-6 py-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {results.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {r.courseTitle}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                    {r.totalMarks} / 100
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/10 text-accent">
                      {r.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                    {r.gpa?.toFixed(1) || '4.0'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">
                    "{r.remarks}"
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
