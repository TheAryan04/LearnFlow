import React from 'react';
import { Link } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import { Star, Users, Play, ArrowRight } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import TiltCard from '../ui/TiltCard';

export default function CourseCard({
  course,
  isEnrolled = false,
  progress = 0,
  onEnrol,
}) {
  if (!course) return null;

  const durationFormatted = course.durationMs
    ? humanizeDuration(course.durationMs, { units: ['h', 'm'], round: true })
    : '2 hours';

  return (
    <TiltCard
      className="bg-white dark:bg-cardDark rounded-[3rem] border border-white/30 dark:border-white/10 shadow-xl overflow-hidden flex flex-col h-full group"
      intensity={10}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 group">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/10 dark:to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-1000 ease-out"
          loading="lazy"
        />
        <div className="absolute top-5 left-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-primary dark:text-slate-100 shadow-sm animate-fade-in">
          {course.category}
        </div>
        {isEnrolled && (
          <div className="absolute top-5 right-5 bg-accent text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 animate-slide-up">
            <Play className="w-3.5 h-3.5 fill-current" />
            Enrolled
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-7 flex-1 flex flex-col">
        {/* Title */}
        <Link
          to={`/courses/${course.id}`}
          className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-accent dark:group-hover:text-accent-400 transition-colors line-clamp-2 mb-3"
        >
          {course.title}
        </Link>

        {/* Instructor */}
        <div className="flex items-center gap-2.5 mb-5">
          <img
            src={course.instructorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
            alt={course.instructorName}
            className="w-7 h-7 rounded-full object-cover border border-white/50 dark:border-white/10 shadow-sm"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {course.instructorName}
          </span>
        </div>

        {/* Meta Stats */}
        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 mb-7 flex-wrap">
          <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{course.rating || 4.9}</span>
            <span className="text-slate-400 font-normal">({course.reviewCount || 120})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-slate-400" />
              {durationFormatted}
            </span>
          </div>

          {course.enrolledCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.enrolledCount}</span>
            </div>
          )}
        </div>

        {/* Progress bar if enrolled */}
        {isEnrolled && (
          <div className="mb-5 pt-2 border-t border-white/20 dark:border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span>Course Progress</span>
              <span className="text-accent font-bold">{Math.min(100, Math.max(0, Math.round(progress)))}%</span>
            </div>
            <span className="block h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <span className="block h-full bg-gradient-to-r from-accent to-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, Math.max(0, Math.round(progress)))}%` }} />
            </span>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/20 dark:border-white/10 flex items-center justify-between">
          <div>
            {isEnrolled ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                In Training
              </span>
            ) : (
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {course.price ? `$${course.price}` : 'Free'}
              </span>
            )}
          </div>

          {isEnrolled ? (
            <Link
              to={`/student/course/${course.id}/learn`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-600 text-white text-xs font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:scale-105"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              onClick={() => onEnrol ? onEnrol(course.id) : null}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold rounded-2xl transition-all duration-300 shadow-glow hover:shadow-[0_0_45px_rgba(14,165,233,0.5)] cursor-pointer hover:scale-105"
            >
              Enrol Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
