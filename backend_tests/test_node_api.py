# LearnFlow Node/Express API regression (iteration 3) - runs against external URL
import os
import io
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"


def demo(role):
    r = requests.post(f"{API}/auth/demo", json={"role": role}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["data"]


def H(tok):
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture(scope="module")
def S():
    return demo("student")


@pytest.fixture(scope="module")
def I():
    return demo("instructor")


@pytest.fixture(scope="module")
def A():
    return demo("admin")


@pytest.fixture(scope="module")
def created(I, A):
    ids = {"courses": []}
    yield ids
    for cid in ids["courses"]:
        requests.delete(f"{API}/courses/{cid}", headers=H(A["token"]), timeout=30)


# ---- auth ----
class TestAuth:
    def test_health(self):
        r = requests.get(f"{API}/health", timeout=30)
        assert r.status_code == 200 and r.json()["status"] == "healthy"

    def test_config(self):
        r = requests.get(f"{API}/auth/config", timeout=30)
        assert r.status_code == 200 and r.json()["data"]["demoEnabled"] is True

    def test_demo_roles(self, S, I, A):
        assert S["user"]["email"] == "alex.student@learnflow.edu" and S["user"]["role"] == "Student"
        assert I["user"]["role"] == "Instructor"
        assert A["user"]["role"] == "Admin"
        assert "passwordHash" not in S["user"]

    def test_demo_invalid_role(self):
        r = requests.post(f"{API}/auth/demo", json={"role": "hacker"}, timeout=30)
        assert r.status_code == 404

    def test_me(self, S):
        r = requests.get(f"{API}/auth/me", headers=H(S["token"]), timeout=30)
        assert r.status_code == 200 and r.json()["data"]["id"] == S["user"]["id"]
        assert "passwordHash" not in r.json()["data"]

    def test_me_no_token(self):
        assert requests.get(f"{API}/auth/me", timeout=30).status_code == 401

    def test_me_bad_token(self):
        assert requests.get(f"{API}/auth/me", headers=H("garbage.token.x"), timeout=30).status_code == 401

    def test_sync_rejects_invalid(self, S):
        for hdr in [{}, H("abc.def.ghi"), H(S["token"])]:
            r = requests.post(f"{API}/auth/sync", headers=hdr, json={"role": "instructor"}, timeout=30)
            assert r.status_code == 401, (hdr, r.status_code, r.text)

    def test_unknown_route_404(self):
        assert requests.get(f"{API}/nope", timeout=30).status_code == 404

    def test_bad_json_400(self, I):
        r = requests.post(f"{API}/courses", data="{bad", headers={**H(I["token"]), "Content-Type": "application/json"}, timeout=30)
        assert r.status_code == 400


# ---- courses ----
class TestCourses:
    def test_list_and_sort(self):
        r = requests.get(f"{API}/courses", params={"sort": "price-low"}, timeout=30)
        assert r.status_code == 200
        prices = [c["price"] for c in r.json()["data"]]
        assert prices == sorted(prices) and len(prices) > 0
        r2 = requests.get(f"{API}/courses", params={"sort": "price-high"}, timeout=30)
        p2 = [c["price"] for c in r2.json()["data"]]
        assert p2 == sorted(p2, reverse=True)

    def test_search_category(self):
        r = requests.get(f"{API}/courses", params={"search": "react"}, timeout=30)
        assert r.status_code == 200
        assert all("react" in (c["title"] + c["category"] + c["instructorName"]).lower() for c in r.json()["data"])

    def test_all_role(self, S, I, A):
        assert requests.get(f"{API}/courses/all", headers=H(S["token"]), timeout=30).status_code == 403
        ri = requests.get(f"{API}/courses/all", headers=H(I["token"]), timeout=30)
        assert ri.status_code == 200 and all(c["instructorId"] == I["user"]["id"] for c in ri.json()["data"])
        ra = requests.get(f"{API}/courses/all", headers=H(A["token"]), timeout=30)
        assert ra.json()["count"] >= ri.json()["count"]

    def test_detail_404(self):
        assert requests.get(f"{API}/courses/nonexistent", timeout=30).status_code == 404

    def test_crud_and_validation(self, S, I, A, created):
        assert requests.post(f"{API}/courses", json={"title": "TEST_x"}, headers=H(S["token"]), timeout=30).status_code == 403
        assert requests.post(f"{API}/courses", json={"price": 1}, headers=H(I["token"]), timeout=30).status_code == 400
        for bad in ["nan", "inf", "Infinity", "-5", "abc", None]:
            r = requests.post(f"{API}/courses", json={"title": "TEST_bad", "price": bad}, headers=H(I["token"]), timeout=30)
            if bad is None:
                # null -> ?? 0 -> allowed
                if r.status_code == 201:
                    created["courses"].append(r.json()["data"]["id"])
                continue
            assert r.status_code == 400, (bad, r.status_code)
        r = requests.post(f"{API}/courses", json={"title": "TEST_course", "price": 4099, "status": "published"}, headers=H(I["token"]), timeout=30)
        assert r.status_code == 201
        c = r.json()["data"]
        created["courses"].append(c["id"])
        assert c["price"] == 4099 and c["instructorId"] == I["user"]["id"]
        g = requests.get(f"{API}/courses/{c['id']}", timeout=30).json()["data"]
        assert g["title"] == "TEST_course"
        u = requests.put(f"{API}/courses/{c['id']}", json={"price": 5000, "featured": True}, headers=H(I["token"]), timeout=30)
        assert u.status_code == 200 and u.json()["data"]["price"] == 5000 and u.json()["data"]["featured"] is False
        assert requests.put(f"{API}/courses/{c['id']}", json={"price": "nan"}, headers=H(I["token"]), timeout=30).status_code == 400
        # another instructor's course -> 403
        others = [x for x in requests.get(f"{API}/courses/all", headers=H(A["token"]), timeout=30).json()["data"] if x["instructorId"] != I["user"]["id"]]
        if others:
            assert requests.put(f"{API}/courses/{others[0]['id']}", json={"title": "hack"}, headers=H(I["token"]), timeout=30).status_code == 403
            assert requests.delete(f"{API}/courses/{others[0]['id']}", headers=H(I["token"]), timeout=30).status_code == 403
        d = requests.delete(f"{API}/courses/{c['id']}", headers=H(I["token"]), timeout=30)
        assert d.status_code == 200
        assert requests.get(f"{API}/courses/{c['id']}", timeout=30).status_code == 404


# ---- enrolments ----
class TestEnrolments:
    def test_enrol_progress(self, S, I, A, created):
        r = requests.post(f"{API}/courses", json={"title": "TEST_enrol", "price": 100, "status": "published"}, headers=H(I["token"]), timeout=30)
        cid = r.json()["data"]["id"]
        created["courses"].append(cid)
        assert requests.post(f"{API}/enrolments", json={"courseId": cid}, headers=H(I["token"]), timeout=30).status_code == 403
        assert requests.post(f"{API}/enrolments", json={}, headers=H(S["token"]), timeout=30).status_code == 400
        e = requests.post(f"{API}/enrolments", json={"courseId": cid}, headers=H(S["token"]), timeout=30)
        assert e.status_code == 201
        eid = e.json()["data"]["id"]
        again = requests.post(f"{API}/enrolments", json={"courseId": cid}, headers=H(S["token"]), timeout=30)
        assert again.status_code == 200 and again.json()["data"]["id"] == eid
        lst = requests.get(f"{API}/enrolments", headers=H(S["token"]), timeout=30).json()["data"]
        assert all(x["userId"] == S["user"]["id"] for x in lst) and any(x["id"] == eid for x in lst)
        for bad in ["nan", "inf", 101, -1]:
            assert requests.put(f"{API}/enrolments/{eid}/progress", json={"progress": bad}, headers=H(S["token"]), timeout=30).status_code == 400, bad
        p = requests.put(f"{API}/enrolments/{eid}/progress", json={"progress": 40}, headers=H(S["token"]), timeout=30)
        assert p.status_code == 200 and p.json()["data"]["progress"] == 40
        # instructor sees enrolment in own course
        li = requests.get(f"{API}/enrolments", params={"courseId": cid}, headers=H(I["token"]), timeout=30).json()["data"]
        assert any(x["id"] == eid for x in li)
        created["enrol_course"] = cid

    def test_progress_other_student_403(self, A):
        # use admin listing to get someone else's enrolment
        sarah = [u for u in requests.get(f"{API}/users", headers=H(A["token"]), timeout=30).json()["data"] if u["email"] == "sarah.chen@learnflow.edu"]
        if not sarah:
            pytest.skip("no sarah")
        es = requests.get(f"{API}/enrolments", params={"userId": sarah[0]["id"]}, headers=H(A["token"]), timeout=30).json()["data"]
        if not es:
            pytest.skip("sarah has no enrolments")
        S = demo("student")
        r = requests.put(f"{API}/enrolments/{es[0]['id']}/progress", json={"progress": 10}, headers=H(S["token"]), timeout=30)
        assert r.status_code == 403


# ---- materials / assignments / files ----
class TestCoursework:
    def test_material_upload_and_file_access(self, S, I, A, created):
        cid = created.get("enrol_course")
        if not cid:
            pytest.skip("no course")
        files = {"file": ("TEST_notes.txt", io.BytesIO(b"hello learnflow"), "text/plain")}
        r = requests.post(f"{API}/materials", data={"title": "TEST_mat", "courseId": cid}, files=files, headers=H(I["token"]), timeout=60)
        assert r.status_code == 201, r.text
        m = r.json()["data"]
        assert m["url"].startswith("/api/files/")
        url = f"{BASE_URL}{m['url']}"
        assert requests.get(url, timeout=30).status_code == 401
        f1 = requests.get(url, headers=H(S["token"]), timeout=30)  # enrolled student
        assert f1.status_code == 200 and f1.content == b"hello learnflow"
        f2 = requests.get(url, params={"auth": I["token"]}, timeout=30)
        assert f2.status_code == 200
        assert requests.get(url, params={"auth": "bad"}, timeout=30).status_code == 401
        # other instructor (elena) is not reachable via demo; admin ok
        assert requests.get(url, headers=H(A["token"]), timeout=30).status_code == 200
        assert requests.get(f"{API}/files/file_nope", headers=H(A["token"]), timeout=30).status_code == 404
        # student cannot upload material
        assert requests.post(f"{API}/materials", data={"title": "x", "courseId": cid}, headers=H(S["token"]), timeout=30).status_code == 403
        assert requests.post(f"{API}/materials", data={"courseId": cid}, headers=H(I["token"]), timeout=30).status_code == 400
        mats = requests.get(f"{API}/materials", params={"courseId": cid}, headers=H(S["token"]), timeout=30).json()["data"]
        assert any(x["id"] == m["id"] for x in mats)
        created["file_url"] = url
        d = requests.delete(f"{API}/materials/{m['id']}", headers=H(I["token"]), timeout=30)
        assert d.status_code == 200

    def test_assignment_submit_grade(self, S, I, created):
        cid = created.get("enrol_course")
        if not cid:
            pytest.skip("no course")
        assert requests.post(f"{API}/assignments", json={"title": "TEST_a", "courseId": cid}, headers=H(S["token"]), timeout=30).status_code == 403
        assert requests.post(f"{API}/assignments", json={"title": "TEST_a", "courseId": cid, "maxMarks": "nan"}, headers=H(I["token"]), timeout=30).status_code == 400
        a = requests.post(f"{API}/assignments", json={"title": "TEST_asg", "courseId": cid, "maxMarks": 50}, headers=H(I["token"]), timeout=30)
        assert a.status_code == 201
        aid = a.json()["data"]["id"]
        files = {"file": ("TEST_sub.txt", io.BytesIO(b"my answer"), "text/plain")}
        s = requests.post(f"{API}/assignments/{aid}/submit", data={"notes": "TEST"}, files=files, headers=H(S["token"]), timeout=60)
        assert s.status_code == 201, s.text
        sub = s.json()["data"]
        assert sub["fileUrl"].startswith("/api/files/") and sub["status"] == "Pending"
        fr = requests.get(f"{BASE_URL}{sub['fileUrl']}", headers=H(I["token"]), timeout=30)
        assert fr.status_code == 200 and fr.content == b"my answer"
        assert requests.post(f"{API}/assignments/{aid}/submit", headers=H(I["token"]), timeout=30).status_code == 403
        subs = requests.get(f"{API}/assignments/submissions", params={"assignmentId": aid}, headers=H(I["token"]), timeout=30).json()["data"]
        assert any(x["id"] == sub["id"] for x in subs)
        for bad in ["nan", "inf", 51, -1, None]:
            r = requests.put(f"{API}/assignments/submissions/{sub['id']}/grade", json={"marks": bad}, headers=H(I["token"]), timeout=30)
            assert r.status_code == 400, (bad, r.status_code)
        assert requests.put(f"{API}/assignments/submissions/{sub['id']}/grade", json={"marks": 40}, headers=H(S["token"]), timeout=30).status_code == 403
        g = requests.put(f"{API}/assignments/submissions/{sub['id']}/grade", json={"marks": 40, "feedback": "TEST ok"}, headers=H(I["token"]), timeout=30)
        assert g.status_code == 200 and g.json()["data"]["status"] == "Graded" and g.json()["data"]["marks"] == 40
        mine = requests.get(f"{API}/assignments/submissions", headers=H(S["token"]), timeout=30).json()["data"]
        assert all(x["studentId"] == S["user"]["id"] for x in mine)


# ---- attendance / results ----
class TestClassroom:
    def test_attendance(self, S, I, created):
        cid = created.get("enrol_course")
        sid = S["user"]["id"]
        assert requests.post(f"{API}/attendance", json={"courseId": cid, "date": "2026-01-10"}, headers=H(S["token"]), timeout=30).status_code == 403
        assert requests.post(f"{API}/attendance", json={"courseId": cid}, headers=H(I["token"]), timeout=30).status_code == 400
        r = requests.post(f"{API}/attendance", json={"courseId": cid, "date": "2026-01-10", "records": [{"studentId": sid, "status": "Present"}]}, headers=H(I["token"]), timeout=30)
        assert r.status_code == 201
        st = requests.get(f"{API}/attendance", params={"studentId": "someoneelse"}, headers=H(S["token"]), timeout=30).json()["data"]
        assert any(h["courseId"] == cid for h in st["history"])
        lst = requests.get(f"{API}/attendance", headers=H(S["token"]), timeout=30).json()["data"]
        assert all(all(rec["studentId"] == sid for rec in s["records"]) for s in lst)

    def test_results(self, S, I, created):
        cid = created.get("enrol_course")
        sid = S["user"]["id"]
        assert requests.post(f"{API}/results", json={"courseId": cid, "totalMarks": 80, "studentId": sid}, headers=H(S["token"]), timeout=30).status_code == 403
        for bad in ["nan", "inf", 101, -3]:
            assert requests.post(f"{API}/results", json={"courseId": cid, "totalMarks": bad, "studentId": sid}, headers=H(I["token"]), timeout=30).status_code == 400, bad
        assert requests.post(f"{API}/results", json={"courseId": cid, "totalMarks": 80, "studentId": "bogus"}, headers=H(I["token"]), timeout=30).status_code == 400
        r = requests.post(f"{API}/results", json={"courseId": cid, "totalMarks": 92, "studentId": sid}, headers=H(I["token"]), timeout=30)
        assert r.status_code == 201 and r.json()["data"]["grade"] == "A+"
        mine = requests.get(f"{API}/results", headers=H(S["token"]), timeout=30).json()["data"]
        assert all(x["studentId"] == sid for x in mine["results"]) and any(x["courseId"] == cid for x in mine["results"])


# ---- notifications / discussions / users / stats ----
class TestCommunity:
    def test_notifications_private(self, S, I, A):
        s = requests.get(f"{API}/notifications", headers=H(S["token"]), timeout=30).json()["data"]
        assert all(n.get("userId") in (None, S["user"]["id"]) for n in s)
        i = requests.get(f"{API}/notifications", headers=H(I["token"]), timeout=30).json()["data"]
        assert all(n.get("userId") in (None, I["user"]["id"]) for n in i)
        priv = [n for n in s if n.get("userId") == S["user"]["id"]]
        if priv:
            assert requests.put(f"{API}/notifications/{priv[0]['id']}/read", headers=H(I["token"]), timeout=30).status_code == 404
            assert requests.put(f"{API}/notifications/{priv[0]['id']}/read", headers=H(S["token"]), timeout=30).status_code == 200
        assert requests.put(f"{API}/notifications/read-all", headers=H(S["token"]), timeout=30).status_code == 200

    def test_discussions(self, S, I, created):
        cid = created.get("enrol_course")
        assert requests.get(f"{API}/discussions", headers=H(S["token"]), timeout=30).status_code == 400
        r = requests.post(f"{API}/discussions", json={"courseId": cid, "message": "TEST_hello"}, headers=H(S["token"]), timeout=30)
        assert r.status_code == 201
        lst = requests.get(f"{API}/discussions", params={"courseId": cid}, headers=H(I["token"]), timeout=30).json()["data"]
        assert any(x["message"] == "TEST_hello" for x in lst)
        # course student is not enrolled in
        allc = requests.get(f"{API}/courses", timeout=30).json()["data"]
        mine = {e["courseId"] for e in requests.get(f"{API}/enrolments", headers=H(S["token"]), timeout=30).json()["data"]}
        other = [c for c in allc if c["id"] not in mine]
        if other:
            assert requests.get(f"{API}/discussions", params={"courseId": other[0]["id"]}, headers=H(S["token"]), timeout=30).status_code == 403
            assert requests.post(f"{API}/discussions", json={"courseId": other[0]["id"], "message": "x"}, headers=H(S["token"]), timeout=30).status_code == 403

    def test_users(self, S, I, A):
        assert requests.get(f"{API}/users", headers=H(S["token"]), timeout=30).status_code == 403
        iu = requests.get(f"{API}/users", params={"role": "admin"}, headers=H(I["token"]), timeout=30).json()["data"]
        assert all(u["role"] == "Student" for u in iu)
        au = requests.get(f"{API}/users", headers=H(A["token"]), timeout=30).json()["data"]
        assert all("passwordHash" not in u for u in au)
        assert requests.put(f"{API}/users/{S['user']['id']}/role", json={"role": "god"}, headers=H(A["token"]), timeout=30).status_code == 400
        assert requests.put(f"{API}/users/{S['user']['id']}/role", json={"role": "admin"}, headers=H(I["token"]), timeout=30).status_code == 403
        assert requests.put(f"{API}/users/{A['user']['id']}/status", json={}, headers=H(A["token"]), timeout=30).status_code == 400
        assert requests.put(f"{API}/users/nope/status", json={}, headers=H(A["token"]), timeout=30).status_code == 404

    def test_stats(self, S, I, A):
        assert requests.get(f"{API}/stats/admin", headers=H(I["token"]), timeout=30).status_code == 403
        a = requests.get(f"{API}/stats/admin", headers=H(A["token"]), timeout=30).json()["data"]
        assert len(a["revenueChartData"]) == 12 and a["revenueChartData"][0]["revenue"] == 14200 * 83
        assert requests.get(f"{API}/stats/instructor", headers=H(S["token"]), timeout=30).status_code == 403
        i = requests.get(f"{API}/stats/instructor", headers=H(I["token"]), timeout=30).json()["data"]
        assert i["totalRevenue"].startswith("₹")
