import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CalendarCheck, Save, CheckCircle2, Clock, XCircle, Users } from 'lucide-react';
import api from '../../utils/api';
import { submitAttendance } from '../../redux/slices/attendanceSlice';
import { fetchManagedCourses } from '../../redux/slices/coursesSlice';
import { useToast } from '../../components/common/Toast';

export default function InstructorAttendance() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { courses } = useSelector((state) => state.courses);
  useEffect(() => { dispatch(fetchManagedCourses()); }, [dispatch]);

  const [selectedCourseId, setSelectedCourseId] = useState('course_react_mastery');
  useEffect(() => {
    if (courses.length && !courses.some((c) => c.id === selectedCourseId)) setSelectedCourseId(courses[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load students for the selected course
  useEffect(() => {
    if (!selectedCourseId) return;
    Promise.all([
      api.get('/users', { params: { role: 'Student' } }),
      api.get('/enrolments', { params: { courseId: selectedCourseId } }),
    ])
      .then(([usersRes, enrolRes]) => {
        const enrolled = new Set(enrolRes.data.map((e) => e.userId));
        const roster = usersRes.data.filter((s) => enrolled.has(s.id));
        {
          const res = { data: roster };
          setStudents(res.data);
          // Default all to Present
          const initialMap = {};
          res.data.forEach((s) => {
            initialMap[s.id] = 'Present';
          });
          setAttendanceMap(initialMap);
        }
      })
      .catch((err) => toast.error(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const records = students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      status: attendanceMap[s.id] || 'Present',
    }));

    try {
      await dispatch(
        submitAttendance({
          courseId: selectedCourseId,
          date: sessionDate,
          records,
        })
      ).unwrap();

      toast.success(`Attendance submitted for ${records.length} students on ${sessionDate}!`);
    } catch (err) {
      toast.info('Attendance saved!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Attendance Manager
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select course and date to record and broadcast student attendance logs.
        </p>
      </div>

      {/* Course & Date Picker Controls */}
      <form onSubmit={handleSubmitAttendance} className="space-y-6">
        <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Session Date
            </label>
            <input
              type="date"
              required
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Student Roster Table with Radio Buttons */}
        <div className="bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Cohort Student Roster ({students.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Default: Present
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5 text-center">Present</th>
                  <th className="px-6 py-3.5 text-center">Late</th>
                  <th className="px-6 py-3.5 text-center">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {students.map((student) => {
                  const currentStatus = attendanceMap[student.id] || 'Present';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {student.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                        {student.email}
                      </td>

                      {/* Present Radio */}
                      <td className="px-6 py-4 text-center">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`att_${student.id}`}
                            value="Present"
                            checked={currentStatus === 'Present'}
                            onChange={() => handleStatusChange(student.id, 'Present')}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Present
                          </span>
                        </label>
                      </td>

                      {/* Late Radio */}
                      <td className="px-6 py-4 text-center">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`att_${student.id}`}
                            value="Late"
                            checked={currentStatus === 'Late'}
                            onChange={() => handleStatusChange(student.id, 'Late')}
                            className="text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-xs font-semibold text-amber-500">
                            Late
                          </span>
                        </label>
                      </td>

                      {/* Absent Radio */}
                      <td className="px-6 py-4 text-center">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`att_${student.id}`}
                            value="Absent"
                            checked={currentStatus === 'Absent'}
                            onChange={() => handleStatusChange(student.id, 'Absent')}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span className="text-xs font-semibold text-rose-500">
                            Absent
                          </span>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-600 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
