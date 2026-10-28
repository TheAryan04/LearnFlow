p = '/app/frontend/src/pages/student/StudentResults.jsx'
s = open(p).read()
a = s.index('      {/* GPA Score Card Banner */}')
b = s.index('      {/* Results Grade Table */}')
new = '''      <section className="grid sm:grid-cols-3 gap-8 border-t border-ink-900 pt-6" data-testid="results-gpa-summary">
        <div>
          <p className="lf-eyebrow">Cumulative GPA</p>
          <p className="font-serif text-6xl text-ink-900 mt-3 tabular-nums" data-testid="results-cumulative-gpa">{results.length ? cumulativeGpa.toFixed(2) : '—'}</p>
          <p className="text-xs text-ink-500 mt-1">on a 4.00 scale</p>
        </div>
        <div>
          <p className="lf-eyebrow">Graded courses</p>
          <p className="font-serif text-6xl text-ink-900 mt-3 tabular-nums">{results.length}</p>
        </div>
        <div className="sm:self-end">
          <p className="font-serif italic text-lg text-ink-600 leading-snug">
            {!results.length ? 'No results have been published yet. They will appear here once your instructor releases them.'
              : cumulativeGpa >= 3.8 ? 'Distinction standing — a remarkable record.'
              : cumulativeGpa >= 3.0 ? 'Good standing — keep the momentum going.'
              : 'Every course is a fresh page. Keep going.'}
          </p>
        </div>
      </section>

'''
s = s[:a] + new + s[b:]
open(p, 'w').write(s)
print('ok')
