import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowRight, BookOpen, Presentation, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CourseCard from '../../components/course/CourseCard';
import Marquee from '../../components/ui/Marquee';
import { Skeleton } from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { fetchCourses } from '../../redux/slices/coursesSlice';
import { enrolCourse } from '../../redux/slices/enrolmentsSlice';
import { ROLES } from '../../utils/constants';

const HERO = 'https://images.unsplash.com/photo-1643148636630-0b0fb138fc74?crop=entropy&cs=srgb&fm=jpg&q=80&w=1400';

const ANNOUNCEMENTS = [
  { text: 'New cohort of React 19 & Next.js opens for enrolment' },
  { text: 'Live Q&A rooms are now available inside every course' },
  { text: 'Results and GPA cards can be downloaded as transcripts' },
  { text: 'Instructors can now post materials in a single step' },
];

const ROLES_COPY = [
  { icon: BookOpen, title: 'For students', body: 'Follow your courses lesson by lesson, hand in assignments, and see attendance and results in one calm place.' },
  { icon: Presentation, title: 'For instructors', body: 'Build a curriculum, share materials, mark attendance and grade submissions without leaving the page.' },
  { icon: ShieldCheck, title: 'For administrators', body: 'Keep an eye on users, courses and enrolments, and export clean reports whenever you need them.' },
];

const NOTES = [
  { quote: 'The lesson view stays out of the way. I actually finish what I start now.', who: 'Sophia Martinez', role: 'Product designer' },
  { quote: 'Grading, attendance and results finally live in the same notebook.', who: 'Dr. Marcus Vance', role: 'Instructor' },
];

function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 lg:pt-24 pb-16 grid lg:grid-cols-12 gap-12 items-end">
      <div className="lg:col-span-7 animate-slide-up">
        <p className="lf-eyebrow mb-6">Vol. 01 — A learning journal</p>
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-ink-900 leading-[0.98] tracking-tight">
          Study with <em className="text-terra-700">clarity</em>,<br className="hidden sm:block" /> not clutter.
        </h1>
        <p className="mt-8 text-lg text-ink-600 max-w-xl leading-relaxed">
          LearnFlow brings courses, assignments, attendance and results together for students, instructors and administrators — quietly, and in real time.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link to="/courses" className="lf-btn-primary !px-6 !py-3" data-testid="hero-browse-courses-button">Browse the catalogue <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/sign-in" className="lf-btn-ghost !py-3" data-testid="hero-try-demo-button">Try a demo account</Link>
        </div>
      </div>
      <figure className="lg:col-span-5 animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="aspect-[4/5] overflow-hidden rounded-lg border border-rule">
          <img src={HERO} alt="Open notebook on a study desk" className="w-full h-full object-cover saturate-[0.8]" />
        </div>
        <figcaption className="mt-3 text-xs text-ink-500 font-serif italic">Fig. 1 — Where the work happens.</figcaption>
      </figure>
    </section>
  );
}

function FeaturedCourses({ courses, loading, onEnrol }) {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
      <div className="flex items-end justify-between gap-6 mb-12 pb-6 border-b border-rule">
        <div>
          <p className="lf-eyebrow mb-3">Chapter II</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-ink-900">Featured courses</h2>
        </div>
        <Link to="/courses" className="text-sm text-terra-700 lf-link whitespace-nowrap" data-testid="featured-view-all-link">View all</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14" data-testid="featured-courses-grid">
        {loading && !courses.length
          ? [0, 1, 2].map((i) => <div key={i} className="space-y-4"><Skeleton className="aspect-[4/3]" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-6 w-4/5" /></div>)
          : courses.map((c) => <CourseCard key={c.id} course={c} onEnrol={onEnrol} />)}
      </div>
    </section>
  );
}

function ForEveryone() {
  return (
    <section className="bg-surface border-y border-rule">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <p className="lf-eyebrow mb-3">Chapter I</p>
          <h2 className="font-serif text-4xl text-ink-900 leading-tight">One notebook, three kinds of reader.</h2>
        </div>
        <div className="lg:col-span-8 grid sm:grid-cols-3 gap-10">
          {ROLES_COPY.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="border-t border-ink-900 pt-5">
              <span className="font-serif text-ink-400 text-sm">0{i + 1}</span>
              <Icon className="w-5 h-5 text-terra-600 mt-3 mb-4" />
              <h3 className="font-serif text-2xl text-ink-900 mb-2">{title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Notes() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid md:grid-cols-2 gap-14">
      {NOTES.map((n) => (
        <blockquote key={n.who} className="border-l-2 border-terra-600 pl-8">
          <p className="font-serif italic text-3xl text-ink-800 leading-snug">"{n.quote}"</p>
          <footer className="mt-5 text-sm text-ink-500">{n.who} · {n.role}</footer>
        </blockquote>
      ))}
    </section>
  );
}

function Closing() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="rounded-xl bg-ink-900 text-ink-50 px-8 sm:px-14 py-16 grid md:grid-cols-2 gap-8 items-end">
        <h2 className="font-serif text-4xl sm:text-5xl leading-tight">Turn the page on <em className="text-terra-300">scattered</em> learning.</h2>
        <div className="md:justify-self-end flex gap-3">
          <Link to="/sign-up" className="lf-btn bg-ink-50 text-ink-900 hover:bg-white" data-testid="closing-signup-button">Create a free account</Link>
          <Link to="/courses" className="lf-btn border border-ink-700 text-ink-100 hover:bg-ink-800" data-testid="closing-catalogue-button">Catalogue</Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { courses, loading } = useSelector((s) => s.courses);
  const { user, isAuthenticated, role } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchCourses()); }, [dispatch]);

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
      <main className="flex-1">
        <Hero />
        <div className="border-y border-rule bg-paper"><div className="max-w-7xl mx-auto px-5 sm:px-8"><Marquee items={ANNOUNCEMENTS} /></div></div>
        <FeaturedCourses courses={courses.slice(0, 6)} loading={loading} onEnrol={handleEnrol} />
        <ForEveryone />
        <Notes />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
