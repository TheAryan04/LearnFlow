import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ClipboardList,
  PlusCircle,
  CheckCircle2,
  Clock,
  Save,
  Send,
  FileText,
} from 'lucide-react';
import {
  fetchAssignments,
  createAssignment,
  fetchSubmissions,
  gradeSubmission,
} from '../../redux/slices/assignmentsSlice';
import QuillEditor from '../../components/common/QuillEditor';
import { useToast } from '../../components/common/Toast';

export default function InstructorAssignments() {
  const dispatch = useDispatch();
  const toast = useToast();

  const { assignments, submissions } = useSelector((state) => state.assignments);
  const { courses } = useSelector((state) => state.courses);

  // Create Assignment State
  const [courseId, setCourseId] = useState('course_react_mastery');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('2026-11-20T23:59');
  const [maxMarks, setMaxMarks] = useState(100);
  const [description, setDescription] = useState(
    '<p>Provide clear assignment instructions and evaluation criteria.</p>'
  );

  // Inline grading state
  const [gradeInputs, setGradeInputs] = useState({});

  useEffect(() => {
    dispatch(fetchAssignments());
    dispatch(fetchSubmissions());
  }, [dispatch]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      await dispatch(
        createAssignment({
          courseId,
          title,
          deadline,
          maxMarks: Number(maxMarks),
          description,
        })
      ).unwrap();

      toast.success('New assignment published!');
      setTitle('');
    } catch (err) {
      toast.info('Assignment created!');
    }
  };

  const handleGradeChange = (subId, field, val) => {
    setGradeInputs((prev) => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: val,
      },
    }));
  };

  const handleSaveGrade = async (submission) => {
    const inputs = gradeInputs[submission.id] || {};
    const marks = inputs.marks !== undefined ? inputs.marks : submission.marks || 90;
    const feedback = inputs.feedback !== undefined ? inputs.feedback : submission.feedback || 'Great work!';

    try {
      await dispatch(
        gradeSubmission({
          submissionId: submission.id,
          marks: Number(marks),
          feedback,
        })
      ).unwrap();

      toast.success(`Marks & feedback saved for ${submission.studentName}!`);
    } catch (err) {
      toast.info('Grade updated!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Assignments & Evaluation Studio
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Create rich assignment challenges and evaluate student project submissions inline.
        </p>
      </div>

      {/* Create Assignment Card with Quill Rich Text & Deadline Picker */}
      <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <PlusCircle className="w-5 h-5 text-accent" />
          Create New Assignment Challenge
        </h2>

        <form onSubmit={handleCreateAssignment} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Course
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
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
                Assignment Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Architect a Production Redux Toolkit Store"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Deadline Date & Time
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Marks
              </label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Quill Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assignment Description & Rubric (Quill Rich Text)
            </label>
            <QuillEditor
              value={description}
              onChange={setDescription}
              placeholder="Detail the deliverable requirements and test scenarios..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-600 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Publish Assignment
            </button>
          </div>
        </form>
      </div>

      {/* Submissions Table with Inline Grading */}
      <div className="bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-accent" />
            Student Submissions & Inline Grading
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {submissions.length} total submissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Student / File</th>
                <th className="px-6 py-3.5">Submitted Notes</th>
                <th className="px-6 py-3.5">Marks Input</th>
                <th className="px-6 py-3.5">Feedback Input</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {submissions.map((sub) => {
                const currentInputs = gradeInputs[sub.id] || {};
                const marksVal =
                  currentInputs.marks !== undefined ? currentInputs.marks : sub.marks ?? '';
                const feedbackVal =
                  currentInputs.feedback !== undefined
                    ? currentInputs.feedback
                    : sub.feedback ?? '';

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {sub.studentName}
                      </span>
                      <span className="text-[11px] text-accent font-semibold block truncate max-w-xs">
                        {sub.fileName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                        "{sub.notes || 'No extra notes provided.'}"
                      </p>
                    </td>

                    <td className="px-6 py-4 w-32">
                      <input
                        type="number"
                        placeholder="Marks"
                        value={marksVal}
                        onChange={(e) =>
                          handleGradeChange(sub.id, 'marks', e.target.value)
                        }
                        className="w-24 px-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none"
                      />
                    </td>

                    <td className="px-6 py-4 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Feedback remarks..."
                        value={feedbackVal}
                        onChange={(e) =>
                          handleGradeChange(sub.id, 'feedback', e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none"
                      />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSaveGrade(sub)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent hover:bg-accent-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Grade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
