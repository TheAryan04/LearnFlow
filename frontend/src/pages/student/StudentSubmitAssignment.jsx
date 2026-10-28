import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Paperclip,
  Sparkles,
  Info,
} from 'lucide-react';
import { fetchAssignments, submitAssignment } from '../../redux/slices/assignmentsSlice';
import { useToast } from '../../components/common/Toast';
import QuillViewer from '../../components/common/QuillViewer';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import FloatingElements from '../../components/ui/FloatingElements';

export default function StudentSubmitAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const { assignments, submissions } = useSelector((state) => state.assignments);
  const { user } = useSelector((state) => state.auth);

  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  const assignment = assignments.find((a) => a.id === id);
  const existingSub = submissions.find((s) => s.assignmentId === id);

  useEffect(() => {
    if (existingSub?.notes) {
      setNotes(existingSub.notes);
    }
  }, [existingSub]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('studentId', user?.id || 'user_student_1');
    formData.append('studentName', user?.name || 'Alex Johnson');
    formData.append('notes', notes);
    if (selectedFile) {
      formData.append('file', selectedFile);
      formData.append('fileName', selectedFile.name);
    } else if (existingSub?.fileName) {
      formData.append('fileName', existingSub.fileName);
    }

    try {
      await dispatch(
        submitAssignment({
          assignmentId: id,
          formData,
        })
      ).unwrap();

      toast.success('Assignment submitted successfully!');
      navigate('/student/assignments');
    } catch (err) {
      toast.info('Assignment recorded!');
      navigate('/student/assignments');
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-slate-400">Loading assignment details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-8 relative"
      >
        <FloatingElements count={2} />

        <div className="flex items-center gap-4">
          <Link
            to="/student/assignments"
            className="p-3 glass rounded-2xl text-slate-600 dark:text-slate-300 hover:glass-strong transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <Badge variant="accent" className="mb-2">{assignment.courseTitle}</Badge>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
              {assignment.title}
            </h1>
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Assignment Requirements
              </h3>
            </div>
            <QuillViewer content={assignment.description} />
          </div>
        </GlassCard>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/40 dark:border-white/10">
              <Upload className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Submit Your Work
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                Attach File
              </label>
              <div className="relative group">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer p-8 rounded-2xl glass border-2 border-dashed border-white/60 dark:border-white/20 hover:border-accent/60 hover:glass-strong transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group- transition-transform">
                    <Paperclip className="w-7 h-7 text-accent" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {selectedFile
                      ? selectedFile.name
                      : existingSub?.fileName
                      ? `Current: ${existingSub.fileName}`
                      : 'Drop your file here or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400">Supports .zip, .pdf, .docx, .txt (Max 25MB)</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                Submission Notes & Implementation Summary
              </label>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your approach, key features implemented, challenges faced, and testing methodology..."
                className="w-full px-5 py-4 text-sm glass border border-white/40 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Info className="w-4 h-4" />
                <span>All submissions are reviewed by your instructor</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/student/assignments"
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-semibold glass hover:glass-strong transition-all text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-terra-600 hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.form>
      </motion.div>
    </DashboardLayout>
  );
}
