# Socket private-room + cross-student file privacy checks (iteration 3)
import os, io, time, jwt, requests, pytest
import socketio
from pymongo import MongoClient

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"


def env(key):
    for line in open('/app/backend/.env'):
        if line.startswith(key + '='):
            return line.split('=', 1)[1].strip().strip('"')


def demo(role):
    return requests.post(f"{API}/auth/demo", json={"role": role}, timeout=30).json()["data"]


def token_for(email):
    u = MongoClient(env('MONGO_URL'))[env('DB_NAME')].users.find_one({"email": email})
    return u["id"], jwt.encode({"id": u["id"], "kind": "demo"}, env('JWT_SECRET'), algorithm="HS256")


H = lambda t: {"Authorization": f"Bearer {t}"}


def connect(tok, bucket):
    sio = socketio.Client()
    sio.on('notification', lambda d: bucket.append(('notification', d)))
    sio.on('receive_message', lambda d: bucket.append(('receive_message', d)))
    sio.connect(BASE_URL, socketio_path='/api/socket.io', auth={"token": tok}, transports=['polling'], wait_timeout=20)
    return sio


def test_socket_rejects_no_token():
    sio = socketio.Client()
    with pytest.raises(Exception):
        sio.connect(BASE_URL, socketio_path='/api/socket.io', auth={"token": "bad"}, transports=['polling'], wait_timeout=10)


def test_private_notification_and_file_privacy():
    S, I = demo("student"), demo("instructor")
    sarah_id, sarah_tok = token_for("sarah.chen@learnflow.edu")
    c = requests.post(f"{API}/courses", json={"title": "TEST_sock", "price": 10, "status": "published"}, headers=H(I["token"]), timeout=30).json()["data"]
    try:
        for t in (S["token"], sarah_tok):
            assert requests.post(f"{API}/enrolments", json={"courseId": c["id"]}, headers=H(t), timeout=30).status_code in (200, 201)
        alex_b, sarah_b = [], []
        a_sio, s_sio = connect(S["token"], alex_b), connect(sarah_tok, sarah_b)
        a_sio.emit('join_course_room', c["id"]); s_sio.emit('join_course_room', c["id"])
        time.sleep(2)
        asg = requests.post(f"{API}/assignments", json={"title": "TEST_sock_asg", "courseId": c["id"], "maxMarks": 10}, headers=H(I["token"]), timeout=30).json()["data"]
        sub = requests.post(f"{API}/assignments/{asg['id']}/submit", files={"file": ("TEST_a.txt", io.BytesIO(b"alex secret"), "text/plain")}, headers=H(S["token"]), timeout=60).json()["data"]
        requests.put(f"{API}/assignments/submissions/{sub['id']}/grade", json={"marks": 8}, headers=H(I["token"]), timeout=30)
        requests.post(f"{API}/discussions", json={"courseId": c["id"], "message": "TEST_live"}, headers=H(S["token"]), timeout=30)
        time.sleep(4)
        graded_alex = [d for e, d in alex_b if e == 'notification' and d.get('title') == 'Assignment Graded']
        graded_sarah = [d for e, d in sarah_b if e == 'notification' and d.get('title') == 'Assignment Graded']
        print("alex events", [e for e, _ in alex_b], "sarah events", [e for e, _ in sarah_b])
        assert graded_alex, "alex did not get private notification"
        assert not graded_sarah, "private notification leaked to sarah"
        assert any(e == 'receive_message' and d.get('message') == 'TEST_live' for e, d in sarah_b)
        a_sio.disconnect(); s_sio.disconnect()
        # cross-student file privacy: sarah fetching alex's submission file
        r = requests.get(f"{BASE_URL}{sub['fileUrl']}", headers=H(sarah_tok), timeout=30)
        print("sarah fetch alex submission file:", r.status_code)
        assert r.status_code == 403, f"Other enrolled student can read a classmate's submission file (status {r.status_code})"
    finally:
        requests.delete(f"{API}/courses/{c['id']}", headers=H(demo('admin')["token"]), timeout=30)
