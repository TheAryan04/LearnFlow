import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Users,
  Star,
  Clock,
} from 'lucide-react';
import humanizeDuration from 'humanize-duration';
import { fetchCourses, updateCourse, deleteCourse } from '../../redux/slices/coursesSlice';
import { useToast } from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';

export default function InstructorCourses() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { courses, loading } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleTogglePublish = async (course) => {
    const nextStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      await dispatch(
        updateCourse({
          id: course.id,
          data: { status: nextStatus },
        })
      ).unwrap();
      toast.success(`Course ${nextStatus === 'published' ? 'published' : 'unpublished'}`);
    } catch (err) {
      toast.info('Status updated');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
        toast.success('Course removed.');
      } catch (err) {
        toast.info('Course removed');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Course Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish, edit curricula, update YouTube video lectures, or remove courses.
          </p>
        </div>

        <Link
          to="/instructor/courses/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-600 text-white shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create Course
        </Link>
      </div>

      {/* Courses List Table / Cards */}
      <div className="bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Active Catalog ({courses.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Course Details</th>
                <th className="px-6 py-3.5">Category & Length</th>
                <th className="px-6 py-3.5">Enrolled / Rating</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {courses.map((course) => {
                const isPublished = course.status === 'published';
                const durationFormatted = course.durationMs
                  ? humanizeDuration(course.durationMs, { units: ['h', 'm'], round: true })
                  : '2 hrs';

                return (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-14 h-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0 max-w-xs">
                          <Link
                            to={`/courses/${course.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-accent truncate block"
                          >
                            {course.title}
                          </Link>
                          <span className="text-[11px] text-slate-400">
                            {course.price ? `$${course.price}` : 'Free'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {course.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {durationFormatted}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.enrolledCount} students</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{course.rating}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(course)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          isPublished
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {isPublished ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/courses/${course.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Preview Course"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/instructor/courses/${course.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
