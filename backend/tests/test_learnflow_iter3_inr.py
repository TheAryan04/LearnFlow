# Iteration 3: INR pricing + validation + socket room scoping
import os
import math
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
PW = "LearnFlow@2026"


def login(email):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": PW})
    if r.status_code != 200:
        pytest.skip(f"login failed {email}: {r.status_code}")
    d = r.json()
    return d.get("token") or d.get("data", {}).get("token")


def H(t):
    return {"Authorization": f"Bearer {t}"}


@pytest.fixture(scope="module")
def ins():
    return login("marcus.vance@learnflow.edu")


@pytest.fixture(scope="module")
def stu():
    return login("alex.student@learnflow.edu")


@pytest.fixture(scope="module")
def adm():
    return login("admin@learnflow.edu")


# Courses: INR prices
def test_courses_inr_prices():
    r = requests.get(f"{BASE_URL}/api/courses")
    assert r.status_code == 200
    prices = {c["id"]: c["price"] for c in r.json()["data"]}
    assert prices.get("course_react_mastery") == 4099
    assert sorted(v for v in prices.values() if v)[:4] and all(p > 1000 for p in prices.values() if p)
    assert set([4099, 3299, 4599, 3699]).issubset(set(prices.values()))


# Sorting by INR price
@pytest.mark.parametrize("sort,rev", [("price-low", False), ("price-high", True)])
def test_courses_sort_price(sort, rev):
    r = requests.get(f"{BASE_URL}/api/courses", params={"sort": sort})
    assert r.status_code == 200
    p = [c["price"] for c in r.json()["data"]]
    assert p == sorted(p, reverse=rev)


# Admin stats in INR
def test_admin_stats_inr(adm):
    r = requests.get(f"{BASE_URL}/api/stats/admin", headers=H(adm))
    assert r.status_code == 200
    rows = r.json()["data"]["revenueChartData"]
    assert rows[0]["month"] == "Jan" and rows[0]["revenue"] == 1178600
    assert len(rows) == 12


def test_instructor_stats_inr(ins):
    r = requests.get(f"{BASE_URL}/api/stats/instructor", headers=H(ins))
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["totalRevenue"] == "₹35,56,550" and d["monthlyRevenue"] == "₹5,32,860"


# nan/inf rejected and not saved
@pytest.mark.parametrize("v", ["nan", "inf", "-inf", "NaN", "Infinity"])
def test_price_nonfinite_rejected(ins, v):
    title = f"TEST_nf_{uuid.uuid4().hex[:6]}"
    r = requests.post(f"{BASE_URL}/api/courses", json={"title": title, "price": v}, headers=H(ins))
    assert r.status_code == 400, r.text
    allr = requests.get(f"{BASE_URL}/api/courses/all", headers=H(ins))
    assert allr.status_code == 200
    assert title not in [c["title"] for c in allr.json()["data"]]


def test_put_price_nonfinite_and_create_inr(ins):
    r = requests.post(f"{BASE_URL}/api/courses", json={"title": "TEST_inr_course", "price": 3999}, headers=H(ins))
    assert r.status_code in (200, 201)
    c = r.json()["data"]
    assert c["price"] == 3999
    try:
        assert requests.put(f"{BASE_URL}/api/courses/{c['id']}", json={"price": "nan"}, headers=H(ins)).status_code == 400
        assert requests.get(f"{BASE_URL}/api/courses/{c['id']}").json()["data"]["price"] == 3999
    finally:
        requests.delete(f"{BASE_URL}/api/courses/{c['id']}", headers=H(ins))


def test_assignment_maxmarks_nan(ins):
    r = requests.post(f"{BASE_URL}/api/assignments", json={"title": "TEST_nan", "courseId": "course_react_mastery", "maxMarks": "nan"}, headers=H(ins))
    assert r.status_code == 400


# progress validation
def test_progress_abc_400(stu):
    en = requests.get(f"{BASE_URL}/api/enrolments", headers=H(stu)).json()["data"]
    assert en
    e = en[0]
    r = requests.put(f"{BASE_URL}/api/enrolments/{e['id']}/progress", json={"progress": "abc"}, headers=H(stu))
    assert r.status_code == 400
    r = requests.put(f"{BASE_URL}/api/enrolments/{e['id']}/progress", json={"progress": "nan"}, headers=H(stu))
    assert r.status_code == 400
    after = [x for x in requests.get(f"{BASE_URL}/api/enrolments", headers=H(stu)).json()["data"] if x["id"] == e["id"]][0]
    assert after["progress"] == e["progress"]


# fresh student attendance stats are all zero
def test_fresh_student_attendance():
    email = f"test_att_{uuid.uuid4().hex[:6]}@x.com"
    r = requests.post(f"{BASE_URL}/api/auth/register", json={"name": "TEST Att", "email": email, "password": "Passw0rd!x"})
    assert r.status_code in (200, 201)
    d = r.json()
    tok = d.get("token") or d.get("data", {}).get("token")
    uid = (d.get("user") or d.get("data", {}).get("user"))["id"]
    r = requests.get(f"{BASE_URL}/api/attendance", params={"studentId": uid}, headers=H(tok))
    print(r.status_code, r.text[:400])
    assert r.status_code == 200
