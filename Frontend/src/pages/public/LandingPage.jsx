import React, { Suspense, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import humanizeDuration from 'humanize-duration';
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Sparkles,
  Play,
  TrendingUp,
  Shield,
  Star,
  Clock,
  Monitor,
  Zap,
} from 'lucide-react';
import { fetchCourses } from '../../redux/slices/coursesSlice';
import { enrolCourse } from '../../redux/slices/enrolmentsSlice';
import { useToast } from '../../components/common/Toast';
import Navbar from '../../components/layout/Navbar';
import FloatingElements from '../../components/ui/FloatingElements';
import Hero3D, { HeroFallback } from '../../components/ui/Hero3D';
import GlassCard from '../../components/ui/GlassCard';
import TiltCard from '../../components/ui/TiltCard';
import Marquee from '../../components/ui/Marquee';

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

const featureItems = [
  {
    icon: Monitor,
    title: 'Immersive 3D Visuals',
    desc: 'Course progress and curriculum rendered in interactive 3D — watch your learning journey come to life.',
    color: 'from-primary to-accent',
    textColor: 'text-primary',
  },
  {
    icon: TrendingUp,
    title: 'Smart Progress Tracking',
    desc: 'Linear and circular progress meters give instant visual feedback for completion, assignments, and attendance.',
    color: 'from-accent to-emerald-500',
    textColor: 'text-accent',
  },
  {
    icon: Zap,
    title: 'Automated Results & GPA',
    desc: 'Algorithmic engine computes tier grades (A+, A, B, C) and cumulative GPA cards ready for instant download.',
    color: 'from-emerald-500 to-primary',
    textColor: 'text-emerald-500',
  },
];

export default function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const featuredCourses = courses.slice(0, 6);

  const handleEnrol = async (courseId) => {
    try {
      await dispatch(enrolCourse({ userId: user?.id || 'user_student_1', courseId })).unwrap();
      toast.success('Successfully enrolled in course!');
      navigate(`/student/course/${courseId}/learn`);
    } catch (err) {
      toast.info('Enrolled into course!');
      navigate(`/student/course/${courseId}/learn`);
    }
  };

  const announcements = [
    { text: 'New: React 19 & Three.js Masterclass now open for enrolment', icon: <Sparkles className="w-4 h-4" /> },
    { text: 'Live webinar: Advanced Next.js patterns — this Friday', icon: <Play className="w-4 h-4" /> },
    { text: 'GPA & automated results cards now available for download', icon: <Award className="w-4 h-4" /> },
    { text: 'Join 50,000+ active students worldwide', icon: <Users className="w-4 h-4" /> },
  ];

  const testimonials = [
    {
      name: 'Marcus Vance Jr.',
      role: 'Frontend Engineer at Vercel',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      content: 'LearnFlow\'s immersive, distraction-free lesson viewer paired with real-time 3D progress visuals is miles ahead of traditional clunky LMS tools.',
      stars: 5,
    },
    {
      name: 'Sophia Martinez',
      role: 'Product Designer at Figma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      content: 'The attendance breakdown, assignments timeline, and instant grade computation make tracking cohort progress effortless.',
      stars: 5,
    },
    {
      name: 'Daniel Kim',
      role: 'Cloud Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      content: 'Our team uses LearnFlow for onboarding developers. The curriculum builder and Quill note integration save us hours each week.',
      stars: 5,
    },
  ];

  const statItems = [
    { label: 'Active Students', value: '50,000+', icon: Users },
    { label: 'Curated Courses', value: '300+', icon: BookOpen },
    { label: 'Expert Instructors', value: '120+', icon: Award },
    { label: 'Satisfaction Rate', value: '98.4%', icon: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors duration-700 selection:bg-primary/20">
      <FloatingElements className="pointer-events-none" />
      <Navbar />

      {/* Marquee announcements */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl"
      >
        <Marquee items={announcements} speed={45} />
      </motion.div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-40 lg:pt-32 lg:pb-56 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary text-xs font-semibold tracking-wider mb-10 animate-pulse-slow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Learning Experience</span>
            </motion.div>

            <motion.h1
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-8 text-balance"
            >
              Master High-Impact Skills{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                with LearnFlow
              </span>
            </motion.h1>

            <motion.p
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              An immersive, distraction-free learning ecosystem with live 3D progress visuals,
              real-time curriculum tracking, and automated grading. Built for modern students and
              institutions who demand more than a boring LMS.
            </motion.p>

            <motion.div
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-4.5 rounded-3xl font-bold text-white bg-gradient-to-r from-primary to-accent shadow-glow hover:shadow-[0_0_50px_rgba(14,165,233,0.5)] transition-all text-sm group hover:scale-105"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-4.5 rounded-3xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-cardDark border border-white/30 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm shadow-lg hover:scale-105"
              >
                <Play className="w-5 h-5 text-accent fill-current" />
                Explore All Courses
              </Link>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.5 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto"
            >
              {statItems.map((stat) => (
                <GlassCard
                  key={stat.label}
                  variant="strong"
                  className="p-7 text-center hover:shadow-glow transition-shadow duration-500 group cursor-default"
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-3 text-primary dark:text-accent group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-1 leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                    {stat.label}
                  </p>
                </GlassCard>
              ))}
            </motion.div>
          </div>
        </div>

        {/* 3D Hero Visual */}
        <div className="relative mt-24 lg:mt-36 max-w-7xl mx-auto px-4">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 group transform transition duration-700">
            <div className="absolute inset-0 bg-gradient-to-t from-bgDark/90 dark:from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Suspense fallback={<HeroFallback />}>
              <Hero3D />
            </Suspense>
          </div>
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-xs flex justify-center pointer-events-none">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl animate-float">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-100 tracking-wider uppercase">
                Interactive 3D course gallery
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-32 border-y border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span
              initial={reveal.hidden}
              animate={reveal.visible}
              className="text-xs font-bold text-accent uppercase tracking-widest"
            >
              Why LearnFlow
            </motion.span>
            <motion.h2
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white mt-3 mb-6 tracking-tight"
            >
              Designed for Flow, Built for Retention
            </motion.h2>
            <motion.p
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.2 }}
              className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto leading-relaxed"
            >
              Immersive 3D progress visuals, real-time curriculum tracking, and automated grading —
              reimagining how learners study online.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureItems.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={reveal.hidden}
                animate={reveal.visible}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-10 rounded-[3rem] glass hover:shadow-glow transition-shadow duration-500 flex flex-col justify-between group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br {feature.color} flex items-center justify-center text-white shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-32 bg-slate-50/30 dark:bg-slate-900/30 border-y border-white/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <motion.span
                initial={reveal.hidden}
                animate={reveal.visible}
                className="text-xs font-bold text-accent uppercase tracking-widest"
              >
                Handpicked Excellence
              </motion.span>
              <motion.h2
                initial={reveal.hidden}
                animate={reveal.visible}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mt-2"
              >
                Featured Courses
              </motion.h2>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
            >
              Browse all courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={reveal.hidden}
                animate={reveal.visible}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ y: -10 }}
              >
                <TiltCard
                  className="bg-white dark:bg-cardDark rounded-[3rem] border border-white/30 dark:border-white/10 shadow-xl overflow-hidden flex flex-col h-full group"
                  intensity={12}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute top-5 left-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-primary dark:text-slate-100 shadow-sm">
                      {course.category}
                    </div>
                    {course.isEnrolled && (
                      <div className="absolute top-5 right-5 bg-accent text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Enrolled
                      </div>
                    )}
                  </div>
                  <div className="p-7 flex-1 flex flex-col">
                    <Link
                      to={`/courses/${course.id}`}
                      className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-accent transition-colors line-clamp-2 mb-3"
                    >
                      {course.title}
                    </Link>
                    <div className="flex items-center gap-2 mb-4">
                      <img
                        src={course.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={course.instructorName}
                        className="w-7 h-7 rounded-full object-cover border border-white/50 dark:border-white/10"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                        {course.instructorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400 mb-7 flex-wrap">
                      <div className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{course.rating || 4.9}</span>
                        <span className="text-slate-400 font-normal">({course.reviewCount || 120})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-slate-400" />
                          {course.durationMs ? humanizeDuration(course.durationMs, { units: ['h', 'm'], round: true }) : '2h'}
                        </span>
                      </div>
                      {course.enrolledCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.enrolledCount}</span>
                        </div>
                      )}
                    </div>
                    {course.isEnrolled && (
                      <div className="mb-4 pt-2 border-t border-white/20 dark:border-white/10">
                        <div className="flex items-center justify-between text-xs mb-1 font-medium text-slate-600 dark:text-slate-300">
                          <span>Course Progress</span>
                        </div>
                        <span className="block h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <span className="block h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, Math.round(course.progress || 0)))}%` }} />
                        </span>
                        <span className="text-xs font-semibold text-accent mt-1">{Math.min(100, Math.max(0, Math.round(course.progress || 0)))}%</span>
                      </div>
                    )}
                    <div className="mt-auto pt-5 border-t border-white/20 dark:border-white/10 flex items-center justify-between">
                      <div>
                        {course.isEnrolled ? (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">In Training</span>
                        ) : (
                          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {course.price ? `$${course.price}` : 'Free'}
                          </span>
                        )}
                      </div>
                      {course.isEnrolled ? (
                        <Link
                          to={`/student/course/${course.id}/learn`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-600 text-white text-xs font-semibold rounded-2xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
                        >
                          Continue
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnrol(course.id)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold rounded-2xl transition-all shadow-glow hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] cursor-pointer hover:scale-105"
                        >
                          Enrol Now
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span
              initial={reveal.hidden}
              animate={reveal.visible}
              className="text-xs font-bold text-accent uppercase tracking-widest"
            >
              Social Proof
            </motion.span>
            <motion.h2
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white mt-3"
            >
              Loved by Learners & Mentors
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <motion.div
                key={idx}
                initial={reveal.hidden}
                animate={reveal.visible}
                transition={{ delay: 0.2 + idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-10 rounded-[3rem] glass flex flex-col justify-between group hover:border-white/30 transition-border duration-300 border border-white/20 dark:border-white/10"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-6">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8 italic font-medium">
                    "{item.content}"
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-white/20 dark:border-white/10">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover ring-4 ring-white/50 dark:ring-white/10 shadow-lg"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white dark:bg-cardDark border-t border-white/20 dark:border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-glow">
                  LF
                </div>
                <span className="font-extrabold text-xl text-primary dark:text-white tracking-tight font-display">
                  Learn<span className="text-accent">Flow</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                Empowering the future of education with immersive 3D visuals, seamless course
                delivery, and real-time evaluations.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">
                Platform
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/courses" className="hover:text-accent dark:hover:text-accent-400 transition-colors">Course Directory</Link></li>
                <li><Link to="/student" className="hover:text-accent dark:hover:text-accent-400 transition-colors">Student Hub</Link></li>
                <li><Link to="/instructor" className="hover:text-accent dark:hover:text-accent-400 transition-colors">Instructor Studio</Link></li>
                <li><Link to="/admin" className="hover:text-accent dark:hover:text-accent-400 transition-colors">Admin Console</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">
                Company
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/about" className="hover:text-accent dark:hover:text-accent-400 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-accent dark:hover:text-accent-400 transition-colors">Contact Support</Link></li>
                <li><a href="#" className="hover:text-accent dark:hover:text-accent-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent dark:hover:text-accent-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">
                Design System
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
                Primary: <span className="font-mono text-primary font-bold">#0EA5E9</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Accent: <span className="font-mono text-accent font-bold">#14B8A6</span>
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20 dark:border-white/10 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} LearnFlow LMS. All rights reserved. Built with React 19, Tailwind CSS, Three.js, and Framer Motion.
          </div>
        </div>
      </footer>
    </div>
  );
}
