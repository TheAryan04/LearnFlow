import re

def patch(path, pairs):
    s = open(path).read()
    for old, new in pairs:
        if old not in s:
            print('MISSING in', path, ':', old[:60])
            continue
        s = s.replace(old, new, 1)
    open(path, 'w').write(s)

F = '/app/frontend/src/'
patch(F + 'redux/slices/attendanceSlice.js', [(
    "totalSessions: 4,\n      presentCount: 3,\n      lateCount: 1,\n      absentCount: 0,\n      attendanceRate: 88,",
    "totalSessions: 0,\n      presentCount: 0,\n      lateCount: 0,\n      absentCount: 0,\n      attendanceRate: 100,")])
patch(F + 'redux/slices/resultsSlice.js', [("cumulativeGpa: 3.9,", "cumulativeGpa: 0,")])

patch(F + 'pages/instructor/InstructorAttendance.jsx', [(
"""  useEffect(() => {
    api
      .get('/users', { params: { role: 'Student' } })
      .then((res) => {
        if (res.data) {
          setStudents(res.data);""",
"""  useEffect(() => {
    if (!selectedCourseId) return;
    Promise.all([
      api.get('/users', { params: { role: 'Student' } }),
      api.get('/enrolments', { params: { courseId: selectedCourseId } }),
    ])
      .then(([usersRes, enrolRes]) => {
        const enrolled = new Set(enrolRes.data.map((e) => e.userId));
        const roster = usersRes.data.filter((s) => enrolled.has(s.id));
        {
          res = { data: roster };
          setStudents(res.data);"""),
("""      .catch((err) => console.log('Error fetching students:', err));
  }, []);""", """      .catch((err) => toast.error(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);""")])

s = open(F + 'pages/instructor/InstructorAttendance.jsx').read()
s = s.replace("        {\n          res = { data: roster };\n          setStudents(res.data);", "        {\n          const res = { data: roster };\n          setStudents(res.data);")
open(F + 'pages/instructor/InstructorAttendance.jsx', 'w').write(s)

for p in ['pages/student/CoursePlayerPage.jsx', 'pages/student/StudentResults.jsx', 'pages/student/StudentAttendance.jsx',
          'pages/student/StudentAssignments.jsx', 'pages/student/StudentMyCourses.jsx', 'pages/student/StudentSubmitAssignment.jsx']:
    s = open(F + p).read()
    s = s.replace("user?.id || 'user_student_1'", "user?.id")
    open(F + p, 'w').write(s)

patch(F + 'pages/public/LandingPage.jsx', [("courses.slice(0, 6)", "courses.slice(0, 3)")])
patch(F + 'pages/auth/SignInPage.jsx', [("desc: 'Courses & coursework'", "desc: 'Learn & submit'")])
patch(F + 'pages/auth/AuthShell.jsx', [(
    'className="flex items-center px-6 sm:px-12 lg:px-20 py-14"',
    'className="flex items-center px-5 sm:px-8 lg:pr-16 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] py-14"')])
patch(F + 'components/layout/ProtectedRoute.jsx', [
    ("import { ROLES } from '../../utils/constants';", "import { ROLES } from '../../utils/constants';\nimport Navbar from './Navbar';"),
    ('<div className="min-h-screen flex items-center px-6" data-testid="role-restricted">\n        <div className="max-w-lg">',
     '<div className="min-h-screen flex flex-col" data-testid="role-restricted">\n        <Navbar />\n        <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 flex-1 flex items-center"><div className="max-w-lg">'),
    ('        </div>\n      </div>\n    );\n  }\n  return <Outlet />;', '        </div></div>\n      </div>\n    );\n  }\n  return <Outlet />;'),
])
print('done')
