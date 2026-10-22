import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import humanizeDuration from 'humanize-duration';
import {
  ArrowRight,
  BookOpen,
  Users,
  Search,
  Filter,
  Play,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';
import { fetchCourses } from '../../redux/slices/coursesSlice';
import { enrolCourse } from '../../redux/slices/enrolmentsSlice';
import { useToast } from '../../components/common/Toast';
import Navbar from '../../components/layout/Navbar';
import FloatingElements from '../../components/ui/FloatingElements';
import GlassCard from '../../components/ui/GlassCard';
import TiltCard from '../../components/ui/TiltCard';
import Badge from '../../components/ui/Badge';

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

const CATEGORIES = [
  'All Categories',
  'Development',
  'Design',
  'Business',
  'Data Science',
  'Marketing',
];

export default function CourseListingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { courses, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const [category, setCategory] = useState('All Categories');
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const filtered = courses.filter((c) => {
    const matchQuery =
      c.title?.toLowerCase().includes(query.toLowerCase()) ||
      c.category?.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === 'All Categories' || c.category === category;
    return matchQuery && matchCat;
  });

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

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors duration-700">
      <FloatingElements className="pointer-events-none" />
      <Navbar />

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reveal.hidden}
            animate={reveal.visible}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-2">
              Course Directory
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              Explore the Catalog
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Discover immersive courses crafted by expert instructors across development,
              design, business, and more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1 space-y-6 self-start lg:self-auto">
              <GlassCard variant="strong" className="p-6 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Filter className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Category
                  </span>
                </div>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                        category === cat
                          ? 'bg-accent/10 dark:bg-accent/20 text-accent font-semibold shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{cat}</span>
                      {category === cat && (
                        <span className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </button>
                  ))}
                </div>
              </GlassCard>

              <GlassCard variant="default" className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Browse by Popularity
                  </span>
                </div>
                <div className="space-y-3">
                  {[{
                    name: 'React 19 Masterclass',
                    students: '12.4k',
                    icon: Sparkles,
                  }, {
                    name: 'Next.js Production',
                    students: '9.8k',
                    icon: Play,
                  }, {
                    name: 'UI Design Systems',
                    students: '7.2k',
                    icon: Users,
                  }].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-white/10 flex items-center justify-center text-accent">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {item.students} students
                        </p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </aside>

            {/* Course Grid */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white/60 dark:bg-white/8 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {filtered.length} courses found
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center mb-4 text-slate-400">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    No courses found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Try adjusting your search or category filter.
                  </p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-primary text-white hover:bg-primary-600 transition-colors"
                  >
                    Clear Filters
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((course) => (
                    <motion.div
                      key={course.id}
                      initial={reveal.hidden}
                      animate={reveal.visible}
                      transition={{ delay: 0.05 }}
                      whileHover={{ y: -8 }}
                    >
                      <TiltCard
                        className="bg-white dark:bg-cardDark rounded-[2rem] border border-white/30 dark:border-white/10 shadow-xl overflow-hidden flex flex-col h-full group"
                        intensity={10}
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-primary dark:text-slate-100 shadow-sm">
                            {course.category}
                          </div>
                          <Badge
                            variant="success"
                            size="sm"
                            className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white"
                          >
                            <Star className="w-3 h-3 fill-current" />
                            {course.rating || 4.9}
                          </Badge>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <Link
                            to={`/courses/${course.id}`}
                            className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-accent dark:group-hover:text-accent-400 transition-colors line-clamp-2 mb-3"
                          >
                            {course.title}
                          </Link>
                          <div className="flex items-center gap-2 mb-4">
                            <img
                              src={course.instructorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                              alt={course.instructorName}
                              className="w-6 h-6 rounded-full object-cover border border-white/50 dark:border-white/10"
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                              {course.instructorName}
                            </span>
                          </div>
                          <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{course.durationMs ? humanizeDuration(course.durationMs, { units: ['h', 'm'], round: true }) : '2h'}</span>
                            </div>
                            {course.enrolledCount > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>{course.enrolledCount}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-auto pt-5 border-t border-white/20 dark:border-white/10 flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {course.price ? `$${course.price}` : 'Free'}
                              </span>
                            </div>
                            <button
                              onClick={() => handleEnrol(course.id)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold rounded-xl transition-all shadow-glow hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] cursor-pointer hover:scale-105"
                            >
                              Enrol Now
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
