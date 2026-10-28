# LearnFlow LMS API regression tests (auth, courses, enrolments, assignments, attendance, results, notifications, discussions, stats, users)
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
PW = "LearnFlow@2026"
STUDENT = "alex.student@learnflow.edu"
INSTRUCTOR = "marcus.vance@learnflow.edu"
ADMIN = "admin@learnflow.edu"


def login(email, pw=PW):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw})
    assert r.status_code == 200, r.text
    return r.json()["data"]


def hdr(tok):
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture(scope="module")
def stu():
    return login(STUDENT)


@pytest.fixture(scope="module")
def ins():
    return login(INSTRUCTOR)


@pytest.fixture(scope="module")
def adm():
    return login(ADMIN)


# ---- auth ----
class TestAuth:
    def test_health(self):
        r = requests.get(f"{API}/health")
        assert r.status_code == 200 and r.json()["status"] == "healthy"

    def test_login_roles(self, stu, ins, adm):
        assert stu["user"]["role"] == "Student"
        assert ins["user"]["role"] == "Instructor"
        assert adm["user"]["role"] == "Admin"
        assert "passwordHash" not in stu["user"]

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": f"nobody_{uuid.uuid4().hex[:6]}@x.com", "password": "bad"})
        assert r.status_code == 401
        assert r.json()["message"] == "Invalid email or password"

    def test_brute_force_lockout(self):
        email = f"test_lock_{uuid.uuid4().hex[:6]}@x.com"
        codes = [requests.post(f"{API}/auth/login", json={"email": email, "password": "x"}).status_code for _ in range(6)]
        assert codes[:5] == [401] * 5 and codes[5] == 429, codes

    def test_demo_login(self):
        for role, exp in (("student", "Student"), ("instructor", "Instructor"), ("admin", "Admin")):
            r = requests.post(f"{API}/auth/demo", json={"role": role})
            assert r.status_code == 200
            assert r.json()["data"]["user"]["role"] == exp

    def test_register_and_me(self):
        email = f"test_{uuid.uuid4().hex[:8]}@learnflow.edu"
        r = requests.post(f"{API}/auth/register", json={"name": "TEST User", "email": email, "password": "Password123", "role": "instructor"})
        assert r.status_code == 200
        d = r.json()["data"]
        assert d["user"]["role"] == "Instructor"
        me = requests.get(f"{API}/auth/me", headers=hdr(d["token"]))
        assert me.status_code == 200 and me.json()["data"]["email"] == email
        dup = requests.post(f"{API}/auth/register", json={"name": "x", "email": email, "password": "Password123"})
        assert dup.status_code == 409
        bad = requests.post(f"{API}/auth/register", json={"name": "x", "email": "a" + email, "password": "Password123", "role": "admin"})
        assert bad.status_code == 400

    def test_me_unauth(self):
        assert requests.get(f"{API}/auth/me").status_code == 401


# ---- courses ----
class TestCourses:
    def test_list_published_and_filters(self):
        r = requests.get(f"{API}/courses")
        assert r.status_code == 200
        data = r.json()["data"]
        assert len(data) > 0 and all(c["status"] == "published" for c in data)
        cat = data[0]["category"]
        r2 = requests.get(f"{API}/courses", params={"category": cat}).json()["data"]
        assert all(c["category"] == cat for c in r2)
        r3 = requests.get(f"{API}/courses", params={"sort": "price-low"}).json()["data"]
        prices = [c.get("price") or 0 for c in r3]
        assert prices == sorted(prices)
        r4 = requests.get(f"{API}/courses", params={"search": "zzzqqq"}).json()
        assert r4["count"] == 0

    def test_get_course(self):
        r = requests.get(f"{API}/courses/course_react_mastery")
        assert r.status_code == 200 and r.json()["data"]["id"] == "course_react_mastery"
        assert requests.get(f"{API}/courses/nope").status_code == 404

    def test_courses_all_scoping(self, ins, adm, stu):
        mine = requests.get(f"{API}/courses/all", headers=hdr(ins["token"])).json()["data"]
        assert all(c["instructorId"] == ins["user"]["id"] for c in mine)
        allc = requests.get(f"{API}/courses/all", headers=hdr(adm["token"])).json()["data"]
        assert len(allc) >= len(mine)
        assert requests.get(f"{API}/courses/all", headers=hdr(stu["token"])).status_code == 403

    def test_course_crud_and_ownership(self, ins, adm, stu):
        assert requests.post(f"{API}/courses", json={"title": "x"}, headers=hdr(stu["token"])).status_code == 403
        r = requests.post(f"{API}/courses", json={"title": "TEST_Course", "price": 10}, headers=hdr(ins["token"]))
        assert r.status_code == 201
        cid = r.json()["data"]["id"]
        assert r.json()["data"]["status"] == "draft"
        pub = requests.get(f"{API}/courses").json()["data"]
        assert cid not in [c["id"] for c in pub]
        u = requests.put(f"{API}/courses/{cid}", json={"status": "published"}, headers=hdr(ins["token"]))
        assert u.status_code == 200 and u.json()["data"]["status"] == "published"
        # another instructor cannot modify
        other = requests.post(f"{API}/auth/register", json={"name": "TEST Other", "email": f"test_o_{uuid.uuid4().hex[:6]}@x.com", "password": "Password123", "role": "instructor"}).json()["data"]
        assert requests.put(f"{API}/courses/{cid}", json={"title": "hack"}, headers=hdr(other["token"])).status_code == 403
        assert requests.delete(f"{API}/courses/{cid}", headers=hdr(other["token"])).status_code == 403
        d = requests.delete(f"{API}/courses/{cid}", headers=hdr(ins["token"]))
        assert d.status_code == 200
        assert requests.get(f"{API}/courses/{cid}").status_code == 404

    def test_create_course_bad_price(self, ins):
        r = requests.post(f"{API}/courses", json={"title": "TEST_bad", "price": "abc"}, headers=hdr(ins["token"]))
        assert r.status_code == 400, f"got {r.status_code}"


# ---- enrolments ----
class TestEnrolments:
    def test_list_and_progress(self, stu):
        r = requests.get(f"{API}/enrolments", headers=hdr(stu["token"]))
        assert r.status_code == 200
        data = r.json()["data"]
        assert all(e["userId"] == stu["user"]["id"] for e in data)
        if data:
            e = data[0]
            p = requests.put(f"{API}/enrolments/{e['id']}/progress", json={"lessonId": e.get("lastAccessedLessonId"), "completed": True}, headers=hdr(stu["token"]))
            assert p.status_code == 200
            assert e.get("lastAccessedLessonId") in p.json()["data"]["completedLessons"]

    def test_enrol_new_student(self):
        reg = requests.post(f"{API}/auth/register", json={"name": "TEST Stu", "email": f"test_s_{uuid.uuid4().hex[:6]}@x.com", "password": "Password123"}).json()["data"]
        r = requests.post(f"{API}/enrolments", json={"courseId": "course_react_mastery"}, headers=hdr(reg["token"]))
        assert r.status_code == 201
        again = requests.post(f"{API}/enrolments", json={"courseId": "course_react_mastery"}, headers=hdr(reg["token"]))
        assert again.json().get("message") == "Already enrolled"
        lst = requests.get(f"{API}/enrolments", headers=hdr(reg["token"])).json()["data"]
        assert len(lst) == 1

    def test_enrol_nonexistent_course(self):
        reg = requests.post(f"{API}/auth/register", json={"name": "TEST Stu2", "email": f"test_s_{uuid.uuid4().hex[:6]}@x.com", "password": "Password123"}).json()["data"]
        r = requests.post(f"{API}/enrolments", json={"courseId": "does_not_exist"}, headers=hdr(reg["token"]))
        assert r.status_code == 404, f"got {r.status_code}"

    def test_instructor_cannot_enrol(self, ins):
        assert requests.post(f"{API}/enrolments", json={"courseId": "course_react_mastery"}, headers=hdr(ins["token"])).status_code == 403


# ---- assignments / submissions / grading ----
class TestAssignments:
    def test_full_flow(self, ins, stu):
        mine = requests.get(f"{API}/courses/all", headers=hdr(ins["token"])).json()["data"]
        enrolled = {e["courseId"] for e in requests.get(f"{API}/enrolments", headers=hdr(stu["token"])).json()["data"]}
        course = next((c for c in mine if c["id"] in enrolled), None)
        assert course, "no shared course between seeded student and instructor"
        r = requests.post(f"{API}/assignments", json={"title": "TEST_Asg", "courseId": course["id"], "maxMarks": 50}, headers=hdr(ins["token"]))
        assert r.status_code == 201
        aid = r.json()["data"]["id"]
        assert requests.post(f"{API}/assignments", json={"title": "x", "courseId": course["id"]}, headers=hdr(stu["token"])).status_code == 403
        lst = requests.get(f"{API}/assignments", headers=hdr(stu["token"])).json()["data"]
        assert aid in [a["id"] for a in lst]
        s = requests.post(f"{API}/assignments/{aid}/submit", data={"notes": "TEST notes"},
                          files={"file": ("test.txt", b"hello", "text/plain")}, headers=hdr(stu["token"]))
        assert s.status_code == 201, s.text
        sub = s.json()["data"]
        assert sub["fileUrl"].startswith("/api/uploads/")
        f = requests.get(f"{BASE_URL}{sub['fileUrl']}")
        assert f.status_code == 200 and f.content == b"hello"
        subs = requests.get(f"{API}/assignments/submissions", params={"assignmentId": aid}, headers=hdr(ins["token"])).json()["data"]
        assert sub["id"] in [x["id"] for x in subs]
        assert requests.put(f"{API}/assignments/submissions/{sub['id']}/grade", json={"marks": 99}, headers=hdr(ins["token"])).status_code == 400
        g = requests.put(f"{API}/assignments/submissions/{sub['id']}/grade", json={"marks": 45, "feedback": "TEST ok"}, headers=hdr(ins["token"]))
        assert g.status_code == 200 and g.json()["data"]["status"] == "Graded" and g.json()["data"]["marks"] == 45
        assert requests.put(f"{API}/assignments/submissions/{sub['id']}/grade", json={"marks": 1}, headers=hdr(stu["token"])).status_code == 403


# ---- attendance / results ----
class TestAttendanceResults:
    def test_attendance(self, ins, stu):
        sid = stu["user"]["id"]
        r = requests.post(f"{API}/attendance", json={"courseId": "course_react_mastery", "date": "2099-01-01",
                                                     "records": [{"studentId": sid, "status": "Present"}]}, headers=hdr(ins["token"]))
        assert r.status_code == 201
        st = requests.get(f"{API}/attendance", params={"studentId": sid}, headers=hdr(stu["token"])).json()["data"]
        assert st["totalSessions"] >= 1 and "attendanceRate" in st
        assert any(h["date"] == "2099-01-01" for h in st["history"])
        assert requests.post(f"{API}/attendance", json={"courseId": "x", "date": "2099-01-01"}, headers=hdr(stu["token"])).status_code == 403

    def test_results(self, ins, stu):
        sid = stu["user"]["id"]
        r = requests.post(f"{API}/results", json={"courseId": "course_react_mastery", "studentId": sid, "totalMarks": 85}, headers=hdr(ins["token"]))
        assert r.status_code == 201
        assert r.json()["data"]["grade"] == "A" and r.json()["data"]["gpa"] == 3.8
        g = requests.get(f"{API}/results", headers=hdr(stu["token"])).json()["data"]
        assert any(x["courseId"] == "course_react_mastery" and x["grade"] == "A" for x in g["results"])
        assert requests.post(f"{API}/results", json={"courseId": "x", "totalMarks": 1}, headers=hdr(stu["token"])).status_code == 403


# ---- notifications / discussions ----
class TestNotifDisc:
    def test_notifications(self, stu):
        r = requests.get(f"{API}/notifications", headers=hdr(stu["token"]))
        assert r.status_code == 200
        ra = requests.put(f"{API}/notifications/read-all", headers=hdr(stu["token"]))
        assert ra.status_code == 200 and all(n["read"] for n in ra.json()["data"])

    def test_discussions(self, stu):
        msg = f"TEST msg {uuid.uuid4().hex[:6]}"
        p = requests.post(f"{API}/discussions", json={"courseId": "course_react_mastery", "message": msg}, headers=hdr(stu["token"]))
        assert p.status_code == 201
        lst = requests.get(f"{API}/discussions", params={"courseId": "course_react_mastery"}, headers=hdr(stu["token"])).json()["data"]
        assert lst[-1]["message"] == msg
        assert requests.post(f"{API}/discussions", json={"courseId": "x", "message": " "}, headers=hdr(stu["token"])).status_code == 400


# ---- stats / users ----
class TestAdmin:
    def test_stats(self, adm, ins, stu):
        a = requests.get(f"{API}/stats/admin", headers=hdr(adm["token"]))
        assert a.status_code == 200 and len(a.json()["data"]["revenueChartData"]) == 12
        assert requests.get(f"{API}/stats/admin", headers=hdr(ins["token"])).status_code == 403
        assert requests.get(f"{API}/stats/instructor", headers=hdr(ins["token"])).status_code == 200
        assert requests.get(f"{API}/stats/instructor", headers=hdr(stu["token"])).status_code == 403

    def test_users(self, adm, ins, stu):
        all_u = requests.get(f"{API}/users", headers=hdr(adm["token"])).json()["data"]
        assert {u["role"] for u in all_u} >= {"Student", "Instructor", "Admin"}
        assert all("passwordHash" not in u for u in all_u)
        iu = requests.get(f"{API}/users", headers=hdr(ins["token"])).json()["data"]
        assert all(u["role"] == "Student" for u in iu)
        assert requests.get(f"{API}/users", headers=hdr(stu["token"])).status_code == 403

    def test_role_status_updates(self, adm, ins):
        reg = requests.post(f"{API}/auth/register", json={"name": "TEST Role", "email": f"test_r_{uuid.uuid4().hex[:6]}@x.com", "password": "Password123"}).json()["data"]
        uid = reg["user"]["id"]
        assert requests.put(f"{API}/users/{uid}/role", json={"role": "instructor"}, headers=hdr(ins["token"])).status_code == 403
        r = requests.put(f"{API}/users/{uid}/role", json={"role": "instructor"}, headers=hdr(adm["token"]))
        assert r.status_code == 200 and r.json()["data"]["role"] == "Instructor"
        s = requests.put(f"{API}/users/{uid}/status", json={"status": "Deactivated"}, headers=hdr(adm["token"]))
        assert s.status_code == 200 and s.json()["data"]["status"] == "Deactivated"
        assert requests.get(f"{API}/auth/me", headers=hdr(reg["token"])).status_code == 401
