import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import YouTube from 'react-youtube';
import humanizeDuration from 'humanize-duration';
import { motion } from 'framer-motion';
import {
  Star,
  Clock,
  Users,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  Share2,
  ShieldCheck,
  Award,
  Sparkles, ArrowRight } from 'lucide-react';
import { fetchCourseById } from '../../redux/slices/coursesSlice';
import { enrolCourse, fetchEnrolments } from '../../redux/slices/enrolmentsSlice';
import QuillViewer from '../../components/common/QuillViewer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/layout/Navbar';
import { useToast } from '../../components/common/Toast';
import FloatingElements from '../../components/ui/FloatingElements';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import { formatPrice } from '../../utils/currency';

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { selectedCourse: course, loading } = useSelector((state) => state.courses);
  const { enrolments } = useSelector((state) => state.enrolments);
  const { user } = useSelector((state) => state.auth);

  const [expandedSections, setExpandedSections] = useState({ 0: true });

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
    }
  }, [id, dispatch]);

  const isEnrolled = enrolments.some((e) => e.courseId === id);

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if (user?.role === 'Student') dispatch(fetchEnrolments(user.id));
  }, [dispatch, user?.id, user?.role]);

  const handleEnrol = async () => {
    if (!user) return navigate('/sign-in');
    if (user.role !== 'Student') return toast.info('Only student accounts can enrol in courses.');
    try {
      await dispatch(enrolCourse({ userId: user.id, courseId: id })).unwrap();
      toast.success('You are enrolled. Enjoy the course.');
      navigate(`/student/course/${id}/learn`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not enrol right now');
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-5 sm:px-8 py-12">
          <LoadingSpinner message="Loading course curriculum..." />
        </div>
      </div>
    );
  }

  const durationFormatted = course.durationMs
    ? humanizeDuration(course.durationMs, { units: ['h', 'm'], round: true })
    : '2 hours 30 mins';

  const youtubeOptions = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors duration-700">
      <FloatingElements className="pointer-events-none" />
      <Navbar />

      <section className="max-w-7xl mx-auto w-full px-5 sm:px-8 pt-14 lg:pt-20 pb-16 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 animate-slide-up">
          <Link to="/courses" className="text-sm text-ink-500 hover:text-ink-900" data-testid="course-detail-back-link">← Catalogue</Link>
          <p className="lf-eyebrow mt-8 mb-4">{course.category} · {formatPrice(course.price)}</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink-900 leading-[1.02]" data-testid="course-detail-title">{course.title}</h1>
          <p className="mt-6 text-lg text-ink-600 leading-relaxed max-w-2xl">
            A structured curriculum with lessons, assignments and live discussion — taught by {course.instructorName}.
          </p>
          <dl className="mt-10 grid grid-cols-3 max-w-lg border-t border-ink-900">
            {[['Rating', `${course.rating || 4.9}`], ['Duration', durationFormatted], ['Students', course.enrolledCount ? course.enrolledCount.toLocaleString() : '—']].map(([k, v]) => (
              <div key={k} className="pt-4 pr-4">
                <dt className="lf-eyebrow">{k}</dt>
                <dd className="font-serif text-2xl text-ink-900 mt-2">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            {isEnrolled ? (
              <Link to={`/student/course/${id}/learn`} className="lf-btn-primary !px-6 !py-3" data-testid="course-detail-continue-button"><Play className="w-4 h-4" /> Continue learning</Link>
            ) : (
              <button onClick={handleEnrol} className="lf-btn-primary !px-6 !py-3" data-testid="course-detail-enrol-button">Enrol in this course <ArrowRight className="w-4 h-4" /></button>
            )}
            <div className="flex items-center gap-3">
              <img src={course.instructorAvatar} alt={course.instructorName} className="w-10 h-10 rounded-full object-cover bg-surface" />
              <div>
                <p className="text-xs text-ink-500">Taught by</p>
                <p className="text-sm text-ink-900">{course.instructorName}</p>
              </div>
            </div>
          </div>
        </div>
        <figure className="lg:col-span-5 animate-fade-in">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-rule">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover saturate-[0.85]" />
          </div>
        </figure>
      </section>

      <section className="py-20 border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={reveal.hidden}
                animate={reveal.visible}
                className="bg-black rounded-xl overflow-hidden aspect-video shadow-2xl"
              >
                <YouTube
                  videoId={course.previewYoutubeId || 'bMknfKXIFA8'}
                  opts={{ height: '100%', width: '100%', playerVars: { autoplay: 0, modestbranding: 1, rel: 0 } }}
                  className="w-full h-full"
                  iframeClassName="w-full h-full"
                />
              </motion.div>

              <GlassCard variant="strong" className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Course Overview & Curriculum Notes</h2>
                </div>
                <QuillViewer content={course.description} />
              </GlassCard>

              <GlassCard variant="default" className="p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20 dark:border-white/10">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Course Curriculum</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {course.curriculum?.length || 0} sections • structured for mastery
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {course.curriculum && course.curriculum.length > 0 ? (
                    course.curriculum.map((section, sIdx) => {
                      const isExpanded = !!expandedSections[sIdx];
                      return (
                        <div
                          key={section.sectionId || sIdx}
                          className="border border-white/20 dark:border-white/10 rounded-xl overflow-hidden group"
                        >
                          <button
                            onClick={() => toggleSection(sIdx)}
                            className="w-full flex items-center justify-between p-4 bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                          >
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">
                              {section.title}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-400">
                                {section.lessons?.length || 0} lessons
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-2 divide-y divide-white/10 dark:divide-white/10 bg-white/5 dark:bg-white/5">
                              {section.lessons?.map((lesson, lIdx) => (
                                <div
                                  key={lesson.id || lIdx}
                                  className="flex items-center justify-between p-3 text-xs text-slate-500 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                      <Play className="w-3 h-3 fill-current" />
                                    </div>
                                    <span className="font-medium truncate">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">
                                    {lesson.durationMs ? humanizeDuration(lesson.durationMs, { units: ['m'], round: true }) : '15 mins'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-slate-400 italic text-center py-8">Curriculum details updating soon.</p>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <GlassCard variant="strong" className="p-7 rounded-xl shadow-xl sticky top-24">
                <div className="mb-5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Enrollment Fee</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatPrice(course.price)}
                  </div>
                </div>

                {isEnrolled ? (
                  <Link
                    to={`/student/course/${id}/learn`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-accent hover:bg-accent-600 transition-all shadow-lg shadow-accent/20 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Continue Course Player
                  </Link>
                ) : (
                  <button
                    onClick={handleEnrol}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-terra-600 shadow-glow transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Enrol in Course
                  </button>
                )}

                <div className="mt-7 pt-6 border-t border-white/20 dark:border-white/10 space-y-3 text-xs text-slate-500 dark:text-slate-400">
                  {[{
                    icon: CheckCircle2,
                    text: 'Full lifetime curriculum access',
                  }, {
                    icon: ShieldCheck,
                    text: 'Verified completion certificate',
                  }, {
                    icon: Award,
                    text: 'Graded assignments & instructor remarks',
                  }].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-accent shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard variant="default" className="p-7 rounded-xl">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider block mb-4">
                  Instructor
                </span>
                <div className="flex items-center gap-4 mb-5">
                  <img
                    src={course.instructorAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                    alt={course.instructorName}
                    className="w-12 h-12 rounded-full object-cover ring-3 ring-accent/30 shadow-lg"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{course.instructorName}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Senior Academic Mentor</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Dedicated to hands-on software craft. Author of production software architectures
                  and high-performance web systems.
                </p>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      <GlassCard variant="glow" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-16 -mx-4 sm:mx-0 lg:mx-0">
        <div className="text-center max-w-2xl mx-auto">
          <motion.span
            initial={reveal.hidden}
            animate={reveal.visible}
            className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-3"
          >
            Learner Reviews
          </motion.span>
          <motion.h2
            initial={reveal.hidden}
            animate={reveal.visible}
            transition={{ delay: 0.1 }}
            className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-8 tracking-tight"
          >
            What our students say
          </motion.h2>

          <div className="space-y-5">
            {course.reviews && course.reviews.length > 0 ? (
              course.reviews.map((rev) => (
                <motion.div
                  key={rev.id}
                  initial={reveal.hidden}
                  animate={reveal.visible}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-xl glass border border-white/20 dark:border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-10 h-10 rounded-full object-cover border border-white/30 dark:border-white/10"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{rev.userName}</p>
                        <div className="flex gap-1 text-amber-400">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm italic">No reviews yet for this course.</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
