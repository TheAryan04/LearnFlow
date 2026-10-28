import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, X } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CourseCard from '../../components/course/CourseCard';
import EmptyState from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { fetchCourses } from '../../redux/slices/coursesSlice';
import { enrolCourse, fetchEnrolments } from '../../redux/slices/enrolmentsSlice';
import { COURSE_CATEGORIES, SORT_OPTIONS, ROLES } from '../../utils/constants';

const SORTERS = {
  popular: (a, b) => b.enrolledCount - a.enrolledCount,
  rating: (a, b) => b.rating - a.rating,
  'price-low': (a, b) => a.price - b.price,
  'price-high': (a, b) => b.price - a.price,
  newest: () => 0,
};

export default function CourseListingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { courses, loading } = useSelector((s) => s.courses);
  const { enrolments } = useSelector((s) => s.enrolments);
  const { user, isAuthenticated, role } = useSelector((s) => s.auth);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('popular');

  useEffect(() => { dispatch(fetchCourses()); }, [dispatch]);
  useEffect(() => { if (role === ROLES.STUDENT && user?.id) dispatch(fetchEnrolments(user.id)); }, [dispatch, role, user?.id]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses
      .filter((c) => category === 'All' || c.category === category)
      .filter((c) => !q || `${c.title} ${c.category} ${c.instructorName}`.toLowerCase().includes(q))
      .sort(SORTERS[sort]);
  }, [courses, category, query, sort]);

  const progressFor = (id) => enrolments.find((e) => e.courseId === id);

  const handleEnrol = async (courseId) => {
    if (!isAuthenticated) return navigate('/sign-in');
    if (role !== ROLES.STUDENT) return navigate(`/courses/${courseId}`);
    try {
      await dispatch(enrolCourse({ userId: user.id, courseId })).unwrap();
      toast.success('You are enrolled. Enjoy the course.');
      navigate(`/student/course/${courseId}/learn`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not enrol right now');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 sm:px-8 pt-14 lg:pt-20">
        <header className="grid lg:grid-cols-12 gap-8 items-end pb-10 border-b border-ink-900 animate-slide-up">
          <div className="lg:col-span-7">
            <p className="lf-eyebrow mb-4">The catalogue</p>
            <h1 className="font-serif text-5xl sm:text-6xl text-ink-900 leading-[1.02]">Every course, <em className="text-terra-700">in one place</em>.</h1>
          </div>
          <p className="lg:col-span-5 text-ink-600 leading-relaxed">Find something worth your evenings. Filter by subject, search by title or instructor, and enrol in a single click.</p>
        </header>

        <div className="py-6 flex flex-col lg:flex-row gap-5 lg:items-center justify-between border-b border-rule">
          <div className="flex flex-wrap gap-1" role="tablist" data-testid="catalogue-category-filters">
            {COURSE_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${category === c ? 'bg-ink-900 text-ink-50' : 'text-ink-600 hover:bg-surface'}`} data-testid={`catalogue-category-${c.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <label className="relative flex-1 lg:w-72">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses or instructors" className="lf-input !pl-9 !pr-8" data-testid="catalogue-search-input" />
              {query && <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-900" aria-label="Clear search" data-testid="catalogue-search-clear"><X className="w-3.5 h-3.5" /></button>}
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="lf-input !w-auto" data-testid="catalogue-sort-select">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <p className="py-5 text-sm text-ink-500" data-testid="catalogue-result-count">{visible.length} {visible.length === 1 ? 'course' : 'courses'}</p>

        {loading && !courses.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
            {[0, 1, 2].map((i) => <div key={i} className="space-y-4"><Skeleton className="aspect-[4/3]" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-6 w-4/5" /></div>)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState icon={Search} title="No courses match" description="Try another subject or a shorter search term." actionLabel="Clear filters" onAction={() => { setCategory('All'); setQuery(''); }} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14" data-testid="catalogue-grid">
            {visible.map((c, i) => {
              const enrol = progressFor(c.id);
              return (
                <div key={c.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <CourseCard course={c} isEnrolled={!!enrol} progress={enrol?.progress || 0} onEnrol={handleEnrol} />
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
