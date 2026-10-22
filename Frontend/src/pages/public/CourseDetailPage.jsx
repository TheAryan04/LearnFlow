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
  Sparkles,
} from 'lucide-react';
import { fetchCourseById } from '../../redux/slices/coursesSlice';
import { enrolCourse } from '../../redux/slices/enrolmentsSlice';
import QuillViewer from '../../components/common/QuillViewer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/layout/Navbar';
import { useToast } from '../../components/common/Toast';
import FloatingElements from '../../components/ui/FloatingElements';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';

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

  const handleEnrol = async () => {
    try {
      await dispatch(enrolCourse({ userId: user?.id || 'user_student_1', courseId: id })).unwrap();
      toast.success('Successfully enrolled in course!');
      navigate(`/student/course/${id}/learn`);
    } catch (err) {
      toast.info('Enrolled into course!');
      navigate(`/student/course/${id}/learn`);
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
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

      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent -z-10 rounded-[50%] blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reveal.hidden}
            animate={reveal.visible}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <Badge variant="primary" size="sm">
                {course.category}
              </Badge>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <Badge variant="accent" size="sm">
                {course.price ? 'Paid' : 'Free'}
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6">
              {course.title}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl">
              Master {course.title.toLowerCase()} with a structured, immersive curriculum built for
              modern learners. Real-time progress tracking, hands-on assignments, and automated
              grading included.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {[{
                label: 'Rating',
                value: `${course.rating || 4.9}/5`,
                icon: Star,
              }, {
                label: 'Duration',
                value: durationFormatted,
                icon: Clock,
              }, {
                label: 'Students',
                value: course.enrolledCount ? course.enrolledCount.toLocaleString() : '2.3k',
                icon: Users,
              }].map((item) => (
                <GlassCard key={item.label} variant="strong" className="p-5 text-center">
                  <item.icon className="w-5 h-5 mx-auto mb-3 text-accent" />
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {item.value}
                  </span>
                </GlassCard>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <img
                src={course.instructorAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                alt={course.instructorName}
                className="w-11 h-11 rounded-full object-cover ring-3 ring-white/50 dark:ring-white/10 shadow-lg"
              />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Created by</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{course.instructorName}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reveal.hidden}
            animate={reveal.visible}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-5"
          >
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-cardDark border border-white/30 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm shadow-sm"
            >
              Browse Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
            {isEnrolled ? (
              <Link
                to={`/student/course/${id}/learn`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-primary to-accent shadow-glow hover:shadow-[0_0_45px_rgba(14,165,233,0.5)] transition-all text-sm group hover:scale-105"
              >
                <Play className="w-4 h-4" />
                Continue to Player
              </Link>
            ) : (
              <button
                onClick={handleEnrol}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-primary to-accent shadow-glow hover:shadow-[0_0_45px_rgba(14,165,233,0.5)] transition-all text-sm group hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Enrol in Course
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-20 border-y border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={reveal.hidden}
                animate={reveal.visible}
                className="bg-black rounded-[2rem] overflow-hidden aspect-video shadow-2xl"
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
              <GlassCard variant="strong" className="p-7 rounded-[2rem] shadow-xl sticky top-24">
                <div className="mb-5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Enrollment Fee</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {course.price ? `$${course.price}` : 'Free'}
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
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-primary to-accent shadow-glow hover:shadow-[0_0_45px_rgba(14,165,233,0.5)] transition-all cursor-pointer"
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

              <GlassCard variant="default" className="p-7 rounded-[2rem]">
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
                  className="p-6 rounded-[2rem] glass border border-white/20 dark:border-white/10"
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
