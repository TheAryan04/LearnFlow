import re, glob, json

F = '/app/frontend/src/'

def patch(path, pairs, regex=False):
    s = open(path).read()
    for old, new in pairs:
        if regex:
            s2 = re.sub(old, new, s)
        else:
            s2 = s.replace(old, new)
        if s2 == s:
            print('NO MATCH', path, old[:50])
        s = s2
    open(path, 'w').write(s)

def add_import(path, line):
    s = open(path).read()
    if line in s:
        return
    idx = [m.end() for m in re.finditer(r"^import .*?;\n", s, re.M | re.S)][-1]
    s = s[:idx] + line + '\n' + s[idx:]
    open(path, 'w').write(s)

PRICE = "{course.price ? `$${course.price}` : 'Free'}"
for p, imp in [('pages/public/CourseDetailPage.jsx', "../../utils/currency"), ('pages/instructor/InstructorCourses.jsx', "../../utils/currency"),
               ('components/course/CourseCard.jsx', "../../utils/currency")]:
    patch(F + p, [(PRICE, "{formatPrice(course.price)}")])
    add_import(F + p, f"import {{ formatPrice }} from '{imp}';")

patch(F + 'pages/instructor/CreateEditCourse.jsx', [('Price ($ USD)', 'Price (₹ INR)'), ('useState(49.99)', 'useState(3999)')])

patch(F + 'pages/admin/AdminOverview.jsx', [
    ("tickFormatter={(v) => `$${v / 1000}k`}", "tickFormatter={formatINRShort}"),
    ("<Tooltip contentStyle={tooltipStyle} />", "<Tooltip contentStyle={tooltipStyle} formatter={(v, n) => (n === 'Revenue' ? formatINR(v) : v.toLocaleString('en-IN'))} />"),
    ("${fmt(annual)}</span>", "{formatINR(annual)}</span>"),
    ("const fmt = (n) => (n ?? 0).toLocaleString();", "const fmt = (n) => (n ?? 0).toLocaleString('en-IN');"),
])
add_import(F + 'pages/admin/AdminOverview.jsx', "import { formatINR, formatINRShort } from '../../utils/currency';")

s = open(F + 'pages/admin/AdminReports.jsx').read()
s = re.sub(r"revenue: (\d+),", lambda m: f"revenue: {int(m.group(1)) * 83},", s)
s = s.replace("value: `$${totalRevenue.toLocaleString()}`", "value: formatINR(totalRevenue)")
s = s.replace("Gross revenue ($ USD)", "Gross revenue (₹ INR)")
s = s.replace("tickFormatter={(val) => `$${val / 1000}k`}", "tickFormatter={formatINRShort}")
s = s.replace("name === 'revenue' ? `$${val.toLocaleString()}` : val.toLocaleString()", "name === 'revenue' ? formatINR(val) : val.toLocaleString('en-IN')")
s = s.replace("GrossRevenue: row.revenue,", "GrossRevenueINR: row.revenue,")
open(F + 'pages/admin/AdminReports.jsx', 'w').write(s)
add_import(F + 'pages/admin/AdminReports.jsx', "import { formatINR, formatINRShort } from '../../utils/currency';")

for p in glob.glob(F + 'pages/**/*.jsx', recursive=True):
    s = open(p).read()
    if 'DollarSign' in s:
        open(p, 'w').write(s.replace('DollarSign', 'IndianRupee'))

# StudentAttendance fake fallbacks
s = open(F + 'pages/student/StudentAttendance.jsx').read()
a = s.index('  const history = studentStats.history || [')
b = s.index('];', a) + 2
s = s[:a] + '  const history = studentStats.history || [];' + s[b:]
s = s.replace('studentStats.attendanceRate || 88', 'studentStats.attendanceRate ?? 100')
s = s.replace('studentStats.totalSessions || history.length', 'studentStats.totalSessions ?? history.length')
s = s.replace('studentStats.presentCount || 3', 'studentStats.presentCount ?? 0')
s = s.replace('studentStats.lateCount || 1', 'studentStats.lateCount ?? 0')
s = s.replace('studentStats.absentCount || 0', 'studentStats.absentCount ?? 0')
open(F + 'pages/student/StudentAttendance.jsx', 'w').write(s)

patch(F + 'redux/slices/resultsSlice.js', [('totalGradedCourses: 2,', 'totalGradedCourses: 0,')])

patch(F + 'pages/student/CoursePlayerPage.jsx', [(
"""    } catch (err) {
      // Local optimistic fallback
      setMessages((prev) => [
        ...prev,
        { ...payload, id: `msg_${Date.now()}`, timestamp: new Date().toISOString() },
      ]);
      setNewMessage('');
    } finally {""", """    } catch (err) {
      toast.error(err.message || 'Message could not be sent');
    } finally {""")])

# backend: INR prices & revenue, isfinite, progress validation, private broadcasts
B = '/app/backend/server.py'
patch(B, [
    ('import json\n', 'import json\nimport math\n'),
    ('        raise ApiError(400, f"{field} must be a number")\n    if out < 0:',
     '        raise ApiError(400, f"{field} must be a number")\n    if not math.isfinite(out):\n        raise ApiError(400, f"{field} must be a number")\n    if out < 0:'),
    ('        progress = float(body["progress"])', '        progress = num(body["progress"], "Progress")'),
    ('    rev = [14200, 18400, 22100, 19800, 27500, 31200, 29800, 35600, 42100, 48900, 54200, 61800]',
     '    rev = [r * 83 for r in (14200, 18400, 22100, 19800, 27500, 31200, 29800, 35600, 42100, 48900, 54200, 61800)]'),
    ('"totalRevenue": "$42,850", "monthlyRevenue": "$6,420",', '"totalRevenue": "₹35,56,550", "monthlyRevenue": "₹5,32,860",'),
    ('    await sio.emit("assignment_graded", updated)', '    await sio.emit("assignment_graded", updated, room=f"user_{updated[\'studentId\']}")'),
    ('    await sio.emit("result_published", entry)', '    await sio.emit("result_published", entry, room=f"user_{sid}")'),
])

seed = json.load(open('/app/backend/seed_data.json'))
for c in seed['courses']:
    if c['price'] < 1000:
        c['price'] = max(0, round(c['price'] * 83 / 100) * 100 - 1)
json.dump(seed, open('/app/backend/seed_data.json', 'w'), indent=1)
print([c['price'] for c in seed['courses']])
