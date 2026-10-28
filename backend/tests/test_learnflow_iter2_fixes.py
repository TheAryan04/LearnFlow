# Retest of iteration_1 fixes: demo determinism, lockout via XFF, enrol 404/draft, numeric validation,
# results validation/ownership, PUT whitelist, discussions access, instructor scoping, studentName, socket room scoping
import os
import time
import uuid
import pytest
import requests
import socketio

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
PW = "LearnFlow@2026"


def login(email, pw=PW):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": pw})
    assert r.status_code == 200, r.text
    return r.json()["data"]["token"]


def H(t):
    return {"Authorization": f"Bearer {t}"}


@pytest.fixture(scope="module")
def stu():
    return login("alex.student@learnflow.edu")


@pytest.fixture(scope="module")
def stu2():
    return login("sarah.chen@learnflow.edu")


@pytest.fixture(scope="module")
def ins():
    return login("marcus.vance@learnflow.edu")


@pytest.fixture(scope="module")
def ins2():
    return login("elena.rostova@learnflow.edu")


@pytest.fixture(scope="module")
def adm():
    return login("admin@learnflow.edu")


@pytest.fixture(scope="module")
def fresh():
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{BASE_URL}/api/auth/register", json={"name": "TEST Fresh", "email": email, "password": "Passw0rd!x"})
    assert r.status_code == 200, r.text
    d = r.json()["data"]
    return d["token"], d["user"]["id"]


# (1) demo determinism even after new sign-ups
def test_demo_fixed_accounts(fresh):
    requests.post(f"{BASE_URL}/api/auth/register", json={"name": "TEST Ins", "email": f"test_{uuid.uuid4().hex[:8]}@x.com", "password": "Passw0rd!x", "role": "instructor"})
    exp = {"student": "alex.student@learnflow.edu", "instructor": "marcus.vance@learnflow.edu", "admin": "admin@learnflow.edu"}
    for role, email in exp.items():
        r = requests.post(f"{BASE_URL}/api/auth/demo", json={"role": role})
        assert r.status_code == 200
        assert r.json()["data"]["user"]["email"] == email
    assert requests.post(f"{BASE_URL}/api/auth/demo", json={"role": "hacker"}).status_code == 404


# (3) lockout with XFF
def test_lockout_429():
    email = f"nobody_{uuid.uuid4().hex[:6]}@x.com"
    codes = [requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "bad"}).status_code for _ in range(6)]
    assert codes[:5] == [401] * 5 and codes[5] == 429, codes


def test_bcrypt_hash_format():
    from pymongo import MongoClient
    from dotenv import load_dotenv
    from pathlib import Path
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    u = db.users.find_one({"email": "admin@learnflow.edu"})
    assert u["passwordHash"].startswith("$2b$")


# (4) enrol missing/draft -> 404
def test_enrol_missing_and_draft(fresh, ins):
    tok, _ = fresh
    assert requests.post(f"{BASE_URL}/api/enrolments", json={"courseId": "nope_xyz"}, headers=H(tok)).status_code == 404
    c = requests.post(f"{BASE_URL}/api/courses", json={"title": "TEST_draft"}, headers=H(ins)).json()["data"]
    assert c["status"] == "draft"
    assert requests.post(f"{BASE_URL}/api/enrolments", json={"courseId": c["id"]}, headers=H(tok)).status_code == 404
    # drafts visible in /courses/all for owner
    ids = [x["id"] for x in requests.get(f"{BASE_URL}/api/courses/all", headers=H(ins)).json()["data"]]
    assert c["id"] in ids
    requests.delete(f"{BASE_URL}/api/courses/{c['id']}", headers=H(ins))


# (5) numeric validation
def test_numeric_validation(ins, stu):
    assert requests.post(f"{BASE_URL}/api/courses", json={"title": "TEST_bad", "price": "abc"}, headers=H(ins)).status_code == 400
    assert requests.post(f"{BASE_URL}/api/assignments", json={"title": "TEST_bad", "courseId": "course_react_mastery", "maxMarks": "abc"}, headers=H(ins)).status_code == 400
    r = requests.post(f"{BASE_URL}/api/results", json={"courseId": "course_react_mastery", "studentId": "user_student_1", "totalMarks": 150}, headers=H(ins))
    assert r.status_code == 400
    r = requests.post(f"{BASE_URL}/api/results", json={"courseId": "course_react_mastery", "totalMarks": 80}, headers=H(ins))
    assert r.status_code == 400  # missing studentId
    r = requests.post(f"{BASE_URL}/api/results", json={"courseId": "course_react_mastery", "studentId": "user_instructor_1", "totalMarks": 80}, headers=H(ins))
    assert r.status_code == 400  # non-student
    r = requests.post(f"{BASE_URL}/api/results", json={"courseId": "course_uiux_design", "studentId": "user_student_1", "totalMarks": 80}, headers=H(ins))
    assert r.status_code == 403  # not own course


def test_price_edge_values(ins):
    # NaN/Infinity should be rejected with 400 (not 500 / not stored)
    out = {}
    for v in ("nan", "inf"):
        r = requests.post(f"{BASE_URL}/api/courses", json={"title": f"TEST_edge_{v}", "price": v}, headers=H(ins))
        out[v] = r.status_code
    assert all(code == 400 for code in out.values()), out


# (6) PUT whitelist
def test_put_whitelist(ins):
    c = requests.post(f"{BASE_URL}/api/courses", json={"title": "TEST_wl"}, headers=H(ins)).json()["data"]
    r = requests.put(f"{BASE_URL}/api/courses/{c['id']}", json={"title": "TEST_wl2", "instructorId": "user_instructor_2", "enrolledCount": 999, "rating": 1, "featured": True, "id": "hack"}, headers=H(ins))
    assert r.status_code == 200
    d = requests.get(f"{BASE_URL}/api/courses/{c['id']}").json()["data"]
    assert d["title"] == "TEST_wl2" and d["instructorId"] == "user_instructor_1" and d["enrolledCount"] == 0 and d["rating"] == 5.0 and d["featured"] is False
    assert requests.put(f"{BASE_URL}/api/courses/{c['id']}", json={"price": "abc"}, headers=H(ins)).status_code == 400
    requests.delete(f"{BASE_URL}/api/courses/{c['id']}", headers=H(ins))


# (7) discussions access
def test_discussions_access(stu, stu2, ins, ins2, adm, fresh):
    tok, _ = fresh
    assert requests.get(f"{BASE_URL}/api/discussions", headers=H(stu)).status_code == 400
    assert requests.get(f"{BASE_URL}/api/discussions?courseId=course_react_mastery", headers=H(stu)).status_code == 200
    assert requests.get(f"{BASE_URL}/api/discussions?courseId=course_python_ai", headers=H(stu)).status_code == 403
    assert requests.get(f"{BASE_URL}/api/discussions?courseId=course_react_mastery", headers=H(tok)).status_code == 403
    assert requests.get(f"{BASE_URL}/api/discussions?courseId=course_react_mastery", headers=H(ins)).status_code == 200
    assert requests.get(f"{BASE_URL}/api/discussions?courseId=course_react_mastery", headers=H(ins2)).status_code == 403
    assert requests.get(f"{BASE_URL}/api/discussions?courseId=course_react_mastery", headers=H(adm)).status_code == 200
    assert requests.post(f"{BASE_URL}/api/discussions", json={"courseId": "course_python_ai", "message": "TEST msg x"}, headers=H(stu)).status_code == 403
    r = requests.post(f"{BASE_URL}/api/discussions", json={"courseId": "course_react_mastery", "message": "TEST msg ok"}, headers=H(stu))
    assert r.status_code == 201 and r.json()["data"]["message"] == "TEST msg ok"


# (8) instructor scoping
def test_instructor_scoping(ins2):
    att = requests.get(f"{BASE_URL}/api/attendance", headers=H(ins2)).json()["data"]
    assert all(s["courseId"] == "course_uiux_design" for s in att)
    res = requests.get(f"{BASE_URL}/api/results", headers=H(ins2)).json()["data"]["results"]
    assert all(r["courseId"] == "course_uiux_design" for r in res)
    st = requests.get(f"{BASE_URL}/api/stats/instructor", headers=H(ins2))
    assert st.status_code == 200 and isinstance(st.json()["data"]["pendingToGrade"], int)


# (9) studentName
def test_enrolments_student_name(ins):
    d = requests.get(f"{BASE_URL}/api/enrolments?courseId=course_react_mastery", headers=H(ins)).json()["data"]
    names = {e["userId"]: e["studentName"] for e in d}
    assert names.get("user_student_1") == "Alex Johnson"


# (12) fresh student no fake numbers
def test_fresh_student_empty(fresh):
    tok, sid = fresh
    r = requests.get(f"{BASE_URL}/api/results", headers=H(tok)).json()["data"]
    assert r["results"] == [] and r["totalGradedCourses"] == 0
    a = requests.get(f"{BASE_URL}/api/attendance?studentId={sid}", headers=H(tok)).json()["data"]
    assert a["totalSessions"] == 0


# (2) socket room scoping: graded notification only reaches the student
def test_socket_private_notification(ins, stu):
    got = {"stu": [], "ins": []}
    clients = {}
    for key, tok in (("stu", stu), ("ins", ins)):
        c = socketio.Client()
        c.on("notification", lambda data, k=key: got[k].append(data))
        c.connect(BASE_URL, socketio_path="api/socket.io", auth={"token": tok}, transports=["polling"])
        clients[key] = c
    try:
        asg = requests.post(f"{BASE_URL}/api/assignments", json={"title": "TEST_sock", "courseId": "course_react_mastery", "maxMarks": 50}, headers=H(ins)).json()["data"]
        sub = requests.post(f"{BASE_URL}/api/assignments/{asg['id']}/submit", data={"notes": "x"}, headers=H(stu)).json()["data"]
        r = requests.put(f"{BASE_URL}/api/assignments/submissions/{sub['id']}/grade", json={"marks": 40, "feedback": "ok"}, headers=H(ins))
        assert r.status_code == 200
        time.sleep(3)
        stu_titles = [n["title"] for n in got["stu"]]
        ins_titles = [n["title"] for n in got["ins"]]
        assert "Assignment Graded" in stu_titles, stu_titles
        assert "Assignment Graded" not in ins_titles, ins_titles
    finally:
        for c in clients.values():
            c.disconnect()
