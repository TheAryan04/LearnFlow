p = '/app/frontend/src/pages/public/CourseDetailPage.jsx'
s = open(p).read()
a = s.index('      <section className="relative py-20 lg:py-32 overflow-hidden">')
b = s.index('      </section>', a) + len('      </section>')
new = open('/app/scripts/detail_hero.jsx').read().rstrip('\n')
s = s[:a] + new + s[b:]
s = s.replace('<section className="py-20 border-y border-white/20 dark:border-white/10">', '<section className="py-20 border-t border-rule">')
open(p, 'w').write(s)
print('ok')
