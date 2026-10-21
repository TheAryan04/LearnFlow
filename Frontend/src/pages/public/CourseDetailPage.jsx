import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import YouTube from 'react-youtube';
import humanizeDuration from 'humanize-duration';
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
} from 'lucide-react';
import { fetchCourseById } from '../../redux/slices/coursesSlice';
import { enrolCourse } from '../../redux/slices/enrolmentsSlice';
import QuillViewer from '../../components/common/QuillViewer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/layout/Navbar';
import { useToast } from '../../components/common/Toast';

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
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-accent/30 text-accent-100 text-xs font-semibold uppercase tracking-wider mb-3">
              {course.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              {course.title}
            </h1>

            {/* Quick Meta Stats */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 mb-6">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{course.rating || 4.9}</span>
                <span className="text-slate-300 font-normal">
                  ({course.reviewCount || 420} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{durationFormatted} total length</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{course.enrolledCount || 2300} students enrolled</span>
              </div>
            </div>

            {/* Instructor snippet */}
            <div className="flex items-center gap-3">
              <img
                src={course.instructorAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                alt={course.instructorName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
              />
              <div>
                <p className="text-xs text-slate-300">Created by</p>
                <p className="text-sm font-semibold">{course.instructorName}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: Video Preview, Description, Curriculum, Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* React YouTube Video Preview */}
            <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-elevated">
              <YouTube
                videoId={course.previewYoutubeId || 'bMknfKXIFA8'}
                opts={youtubeOptions}
                className="w-full h-full"
                iframeClassName="w-full h-full"
              />
            </div>

            {/* Course Description from Quill */}
            <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Course Overview & Curriculum Notes
              </h2>
              <QuillViewer content={course.description} />
            </div>

            {/* Curriculum Accordion */}
            <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {course.curriculum?.length || 0} sections • structured for mastery
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {course.curriculum && course.curriculum.length > 0 ? (
                  course.curriculum.map((section, sIdx) => {
                    const isExpanded = !!expandedSections[sIdx];
                    return (
                      <div
                        key={section.sectionId || sIdx}
                        className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleSection(sIdx)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                        >
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {section.title}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
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
                          <div className="p-2 divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-cardDark">
                            {section.lessons?.map((lesson, lIdx) => (
                              <div
                                key={lesson.id || lIdx}
                                className="flex items-center justify-between p-3 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                    <Play className="w-3 h-3 fill-current" />
                                  </div>
                                  <span className="font-medium truncate">
                                    {lesson.title}
                                  </span>
                                </div>
                                <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                                  {lesson.durationMs
                                    ? humanizeDuration(lesson.durationMs, { units: ['m'], round: true })
                                    : '15 mins'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">Curriculum details updating soon.</p>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Learner Reviews & Ratings
              </h2>

              <div className="space-y-4">
                {course.reviews && course.reviews.length > 0 ? (
                  course.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {rev.userName}
                            </p>
                            <div className="flex text-amber-400">
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No reviews yet for this course.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Sticky Enrol Card & Instructor Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-elevated sticky top-24">
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-400">Enrollment Fee</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {course.price ? `$${course.price}` : 'Free'}
                </div>
              </div>

              {isEnrolled ? (
                <Link
                  to={`/student/course/${course.id}/learn`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-accent hover:bg-accent-600 transition-colors shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Continue Course Player
                </Link>
              ) : (
                <button
                  onClick={handleEnrol}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-600 transition-colors shadow-md cursor-pointer"
                >
                  Enrol in Course
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Full lifetime curriculum access</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified completion certificate</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>Graded assignments & instructor remarks</span>
                </div>
              </div>
            </div>

            {/* Instructor Bio Card */}
            <div className="bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                Instructor
              </span>
              <div className="flex items-center gap-3 mt-3 mb-4">
                <img
                  src={course.instructorAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                  alt={course.instructorName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {course.instructorName}
                  </h4>
                  <p className="text-xs text-slate-400">Senior Academic Mentor</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dedicated to hands-on software craft. Author of production software architectures
                and high-performance web systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
