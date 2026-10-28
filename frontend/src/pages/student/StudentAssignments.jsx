import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  Upload,
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { fetchAssignments, fetchSubmissions } from '../../redux/slices/assignmentsSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SectionHeader from '../../components/ui/SectionHeader';
import GlassCard from '../../components/ui/GlassCard';
import TiltCard from '../../components/ui/TiltCard';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/common/EmptyState';
import FloatingElements from '../../components/ui/FloatingElements';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function StudentAssignments() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { assignments, submissions, loading } = useSelector((state) => state.assignments);

  useEffect(() => {
    dispatch(fetchAssignments());
    dispatch(fetchSubmissions({ studentId: user?.id }));
  }, [dispatch, user]);

  const getSubmissionForAssignment = (asgId) => {
    return submissions.find((s) => s.assignmentId === asgId);
  };

  const calculateDaysLeft = (deadline) => {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Past Deadline', urgent: true };
    if (days === 0) return { text: 'Due Today', urgent: true };
    if (days <= 3) return { text: `${days} days left`, urgent: true };
    return { text: `${days} days left`, urgent: false };
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 relative"
      >
        <FloatingElements count={2} />

        <motion.div variants={item}>
          <SectionHeader
            title="Assignments Hub"
            description="Review prompts, meet deadlines, and track your submissions with feedback"
            action={
              <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-xl text-xs font-bold">
                <FileCheck className="w-4 h-4 text-accent" />
                <span>{assignments.length} Total Assignments</span>
              </div>
            }
          />
        </motion.div>

        {assignments.length === 0 ? (
          <motion.div variants={item}>
            <GlassCard className="p-12">
              <EmptyState
                icon={FileCheck}
                title="No assignments posted"
                description="There are currently no active assignments across your enrolled courses"
              />
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((asg, idx) => {
              const sub = getSubmissionForAssignment(asg.id);
              const isGraded = sub?.status === 'Graded';
              const isSubmitted = !!sub;
              const daysLeft = calculateDaysLeft(asg.deadline);

              return (
                <motion.div
                  key={asg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <TiltCard intensity={12}>
                    <GlassCard className="p-6 h-full flex flex-col justify-between group hover:shadow-glow transition-all">
                      <div>
                        <div className="flex items-start justify-between mb-4 gap-3">
                          <Badge variant="accent">{asg.courseTitle}</Badge>
                          {isGraded ? (
                            <Badge variant="success">
                              <Award className="w-3 h-3" />
                              {sub.marks}/{asg.maxMarks}
                            </Badge>
                          ) : isSubmitted ? (
                            <Badge variant="warning">
                              <Clock className="w-3 h-3" />
                              Under Review
                            </Badge>
                          ) : (
                            <Badge variant="default">Pending</Badge>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                          {asg.title}
                        </h3>

                        <div
                          className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: asg.description }}
                        />

                        {isGraded && sub?.feedback && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 mb-4 rounded-2xl glass border border-emerald-200/40 dark:border-emerald-500/20"
                          >
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5" />
                              Instructor Feedback
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                              "{sub.feedback}"
                            </p>
                          </motion.div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-white/40 dark:border-white/10 flex items-center justify-between">
                        <div className={`flex items-center gap-2 text-xs font-semibold ${daysLeft.urgent ? 'text-amber-500' : 'text-slate-400'}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{daysLeft.text}</span>
                          {daysLeft.urgent && !isSubmitted && <AlertCircle className="w-3.5 h-3.5" />}
                        </div>

                        <Link
                          to={`/student/assignments/${asg.id}/submit`}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all group/btn ${
                            isSubmitted
                              ? 'glass hover:glass-strong'
                              : 'bg-terra-600 text-white hover:shadow-glow'
                          }`}
                        >
                          <Upload className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          {isSubmitted ? 'Update Submission' : 'Submit Work'}
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </GlassCard>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
