import React from 'react';
import { Link } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import { Star, ArrowUpRight } from 'lucide-react';
import { formatPrice } from '../../utils/currency';

const clamp = (n) => Math.min(100, Math.max(0, Math.round(n)));

export default function CourseCard({ course, isEnrolled = false, progress = 0, onEnrol }) {
  if (!course) return null;
  const duration = course.durationMs ? humanizeDuration(course.durationMs, { units: ['h', 'm'], round: true }) : '2 hours';

  return (
    <article className="group flex flex-col h-full" data-testid={`course-card-${course.id}`}>
      <Link to={`/courses/${course.id}`} className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-surface">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover saturate-[0.85] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {isEnrolled && (
          <span className="absolute top-3 left-3 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-medium text-moss-700">Enrolled</span>
        )}
      </Link>

      <div className="pt-5 flex-1 flex flex-col">
        <p className="lf-eyebrow mb-2">{course.category} · {duration}</p>
        <Link to={`/courses/${course.id}`} className="font-serif text-xl leading-snug text-ink-900 group-hover:text-terra-700 transition-colors line-clamp-2" data-testid={`course-card-title-${course.id}`}>
          {course.title}
        </Link>
        <p className="mt-2 text-sm text-ink-500">{course.instructorName}</p>

        {isEnrolled && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-ink-500 mb-1.5"><span>Progress</span><span className="tabular-nums text-ink-800">{clamp(progress)}%</span></div>
            <div className="h-1 bg-ink-200 rounded-full overflow-hidden">
              <div className="h-full bg-terra-600 rounded-full transition-[width] duration-700" style={{ width: `${clamp(progress)}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-5 flex items-center justify-between border-t border-rule mt-5">
          {isEnrolled ? (
            <span className="text-xs text-moss-700 font-medium">In progress</span>
          ) : (
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-xl text-ink-900">{formatPrice(course.price)}</span>
              <span className="flex items-center gap-1 text-xs text-ink-500"><Star className="w-3 h-3 fill-ochre-500 text-ochre-500" />{course.rating || 4.9}</span>
            </div>
          )}
          {isEnrolled ? (
            <Link to={`/student/course/${course.id}/learn`} className="inline-flex items-center gap-1 text-sm font-medium text-terra-700 hover:gap-2 transition-[gap]" data-testid={`course-card-continue-${course.id}`}>
              Continue <ArrowUpRight className="w-4 h-4" />
            </Link>
          ) : (
            <button onClick={() => onEnrol && onEnrol(course.id)} className="inline-flex items-center gap-1 text-sm font-medium text-terra-700 hover:gap-2 transition-[gap]" data-testid={`course-card-enrol-${course.id}`}>
              Enrol <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
