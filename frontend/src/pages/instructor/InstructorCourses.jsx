import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Eye, Search, Users, Star, BookOpen } from 'lucide-react';
import humanizeDuration from 'humanize-duration';
import { fetchManagedCourses, updateCourse, deleteCourse } from '../../redux/slices/coursesSlice';
import { useToast } from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/LoadingSpinner';

const FILTERS = ['All', 'Published', 'Draft'];

function CourseRow({ course, onToggle, onDelete }) {
  const published = course.status === 'published';
  const duration = course.durationMs ? humanizeDuration(course.durationMs, { units: ['h', 'm'], round: true }) : '2 hours';
  return (
    <li className="py-5 border-b border-rule grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center" data-testid={`instructor-course-row-${course.id}`}>
      <div className="md:col-span-6 flex items-center gap-4 min-w-0">
        <img src={course.thumbnail} alt={course.title} className="w-20 h-14 rounded-md object-cover saturate-[0.85] shrink-0" />
        <div className="min-w-0">
          <Link to={`/courses/${course.id}`} className="font-serif text-lg text-ink-900 hover:text-terra-700 transition-colors line-clamp-1">{course.title}</Link>
          <p className="text-xs text-ink-500">{course.category} · {duration} · {course.price ? `$${course.price}` : 'Free'}</p>
        </div>
      </div>
      <div className="md:col-span-2 text-sm text-ink-600 flex md:flex-col gap-3 md:gap-0.5">
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-ink-400" />{course.enrolledCount}</span>
        <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-ochre-500" />{course.rating}</span>
      </div>
      <div className="md:col-span-2">
        <button
          onClick={() => onToggle(course)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${published ? 'border-moss-200 bg-moss-100 text-moss-700 hover:bg-moss-200' : 'border-rule bg-surface text-ink-600 hover:bg-surface-hover'}`}
          title="Toggle publish status"
          data-testid={`instructor-course-toggle-${course.id}`}
        >
          {published ? 'Published' : 'Draft'}
        </button>
      </div>
      <div className="md:col-span-2 flex md:justify-end gap-1">
        <Link to={`/courses/${course.id}`} className="p-2 rounded-md text-ink-500 hover:bg-surface hover:text-ink-900" title="Preview" data-testid={`instructor-course-preview-${course.id}`}><Eye className="w-4 h-4" /></Link>
        <Link to={`/instructor/courses/${course.id}/edit`} className="p-2 rounded-md text-ink-500 hover:bg-surface hover:text-ink-900" title="Edit" data-testid={`instructor-course-edit-${course.id}`}><Edit className="w-4 h-4" /></Link>
        <button onClick={() => onDelete(course)} className="p-2 rounded-md text-ink-500 hover:bg-rust-50 hover:text-rust-600" title="Delete" data-testid={`instructor-course-delete-${course.id}`}><Trash2 className="w-4 h-4" /></button>
      </div>
    </li>
  );
}

export default function InstructorCourses() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { courses, loading } = useSelector((s) => s.courses);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => { dispatch(fetchManagedCourses()); }, [dispatch]);

  const visible = useMemo(() => courses.filter((c) => {
    if (filter !== 'All' && (c.status === 'published') !== (filter === 'Published')) return false;
    return !query || `${c.title} ${c.category}`.toLowerCase().includes(query.toLowerCase());
  }), [courses, filter, query]);

  const handleToggle = async (course) => {
    const status = course.status === 'published' ? 'draft' : 'published';
    try {
      await dispatch(updateCourse({ id: course.id, data: { status } })).unwrap();
      toast.success(status === 'published' ? 'Course published.' : 'Course moved to drafts.');
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await dispatch(deleteCourse(course.id)).unwrap();
      toast.success('Course deleted.');
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="lf-eyebrow mb-4">Teaching</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900">My courses</h1>
          <p className="text-ink-500 mt-3">Publish, edit or retire the courses you teach.</p>
        </div>
        <Link to="/instructor/courses/create" className="lf-btn-primary" data-testid="instructor-courses-create-button"><PlusCircle className="w-4 h-4" /> New course</Link>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-b border-ink-900 pb-4">
        <div className="flex gap-1" role="tablist">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${filter === f ? 'bg-ink-900 text-ink-50' : 'text-ink-600 hover:bg-surface'}`} data-testid={`instructor-courses-filter-${f.toLowerCase()}`}>{f}</button>
          ))}
        </div>
        <label className="relative sm:w-72">
          <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your courses" className="lf-input !pl-9" data-testid="instructor-courses-search-input" />
        </label>
      </div>

      {loading && !courses.length ? (
        <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Write your first course — add a curriculum, lessons and a preview video." actionLabel="Create a course" actionLink="/instructor/courses/create" />
      ) : visible.length === 0 ? (
        <p className="font-serif italic text-ink-500 py-6" data-testid="instructor-courses-no-match">No courses match that search.</p>
      ) : (
        <ul data-testid="instructor-courses-list">{visible.map((c) => <CourseRow key={c.id} course={c} onToggle={handleToggle} onDelete={handleDelete} />)}</ul>
      )}
    </div>
  );
}
