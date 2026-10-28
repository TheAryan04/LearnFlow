      <section className="max-w-7xl mx-auto w-full px-5 sm:px-8 pt-14 lg:pt-20 pb-16 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 animate-slide-up">
          <Link to="/courses" className="text-sm text-ink-500 hover:text-ink-900" data-testid="course-detail-back-link">← Catalogue</Link>
          <p className="lf-eyebrow mt-8 mb-4">{course.category} · {course.price ? `$${course.price}` : 'Free'}</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink-900 leading-[1.02]" data-testid="course-detail-title">{course.title}</h1>
          <p className="mt-6 text-lg text-ink-600 leading-relaxed max-w-2xl">
            A structured curriculum with lessons, assignments and live discussion — taught by {course.instructorName}.
          </p>
          <dl className="mt-10 grid grid-cols-3 max-w-lg border-t border-ink-900">
            {[['Rating', `${course.rating || 4.9}`], ['Duration', durationFormatted], ['Students', course.enrolledCount ? course.enrolledCount.toLocaleString() : '—']].map(([k, v]) => (
              <div key={k} className="pt-4 pr-4">
                <dt className="lf-eyebrow">{k}</dt>
                <dd className="font-serif text-2xl text-ink-900 mt-2">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            {isEnrolled ? (
              <Link to={`/student/course/${id}/learn`} className="lf-btn-primary !px-6 !py-3" data-testid="course-detail-continue-button"><Play className="w-4 h-4" /> Continue learning</Link>
            ) : (
              <button onClick={handleEnrol} className="lf-btn-primary !px-6 !py-3" data-testid="course-detail-enrol-button">Enrol in this course <ArrowRight className="w-4 h-4" /></button>
            )}
            <div className="flex items-center gap-3">
              <img src={course.instructorAvatar} alt={course.instructorName} className="w-10 h-10 rounded-full object-cover bg-surface" />
              <div>
                <p className="text-xs text-ink-500">Taught by</p>
                <p className="text-sm text-ink-900">{course.instructorName}</p>
              </div>
            </div>
          </div>
        </div>
        <figure className="lg:col-span-5 animate-fade-in">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-rule">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover saturate-[0.85]" />
          </div>
        </figure>
      </section>
