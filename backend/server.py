from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import json
import math
import time
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
import socketio
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("learnflow")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]
JWT_SECRET = os.environ["JWT_SECRET"]
DEMO_ENABLED = os.environ.get("ENABLE_DEMO_LOGIN", "false").lower() == "true"
SEED_PASSWORD = os.environ.get("SEED_USER_PASSWORD")
DEMO_ACCOUNTS = {"student": "alex.student@learnflow.edu", "instructor": "marcus.vance@learnflow.edu", "admin": "admin@learnflow.edu"}
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
PROJ = {"_id": 0, "_order": 0}
YT_RE = re.compile(r"(?:youtu\.be/|youtube\.com/(?:embed/|v/|watch\?v=|watch\?.+&v=))([\w-]{11})")

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app = FastAPI(title="LearnFlow API")
api = APIRouter(prefix="/api")


def uid(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ApiError(Exception):
    def __init__(self, status: int, message: str):
        self.status, self.message = status, message


@app.exception_handler(ApiError)
async def api_error_handler(_, exc: ApiError):
    return JSONResponse(status_code=exc.status, content={"success": False, "message": exc.message})


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(_, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "message": str(exc.detail)})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_, exc: RequestValidationError):
    msg = "; ".join(e.get("msg", "Invalid input") for e in exc.errors())
    return JSONResponse(status_code=400, content={"success": False, "message": msg})


# ---------- data helpers ----------
async def find(col: str, query: Optional[dict] = None) -> list:
    return await db[col].find(query or {}, PROJ).sort("_order", -1).to_list(5000)


async def find_one(col: str, query: dict) -> Optional[dict]:
    return await db[col].find_one(query, PROJ)


async def insert(col: str, item: dict) -> dict:
    await db[col].insert_one({**item, "_order": time.time()})
    return item


async def update(col: str, item_id: str, changes: dict) -> Optional[dict]:
    await db[col].update_one({"id": item_id}, {"$set": changes})
    return await find_one(col, {"id": item_id})


def num(value, field: str, cast=float):
    try:
        out = cast(value)
    except (TypeError, ValueError):
        raise ApiError(400, f"{field} must be a number")
    if not math.isfinite(out):
        raise ApiError(400, f"{field} must be a number")
    if out < 0:
        raise ApiError(400, f"{field} cannot be negative")
    return out


def public_user(user: dict) -> dict:
    return {k: v for k, v in user.items() if k != "passwordHash"}


async def notify(notif: dict):
    await insert("notifications", notif)
    await sio.emit("notification", notif, room=f"user_{notif['userId']}" if notif.get("userId") else None)


# ---------- auth ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())


def make_token(user: dict) -> str:
    payload = {"id": user["id"], "role": user["role"].lower(), "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def user_from_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    user = await find_one("users", {"id": payload.get("id")})
    if not user or user.get("status") == "Deactivated":
        return None
    return user


async def current_user(request: Request) -> dict:
    header = request.headers.get("authorization", "")
    if not header.startswith("Bearer "):
        raise ApiError(401, "Authentication required")
    user = await user_from_token(header[7:])
    if not user:
        raise ApiError(401, "Invalid or expired token")
    return {"id": user["id"], "role": user["role"].lower(), "name": user["name"], "avatar": user.get("avatar")}


def require_role(*roles):
    async def dep(user: dict = Depends(current_user)):
        if user["role"] not in roles:
            raise ApiError(403, "Insufficient permissions")
        return user
    return dep


def session(user: dict) -> dict:
    return {"success": True, "data": {"user": public_user(user), "token": make_token(user)}}


@api.post("/auth/register")
async def register(body: dict):
    name = str(body.get("name") or "").strip()
    email = str(body.get("email") or "").strip().lower()
    password = str(body.get("password") or "")
    role = str(body.get("role") or "student").lower()
    if not name or not email or not password:
        raise ApiError(400, "Name, email, and password are required")
    if not re.match(r"^\S+@\S+\.\S+$", email):
        raise ApiError(400, "Enter a valid email address")
    if len(password) < 8:
        raise ApiError(400, "Password must be at least 8 characters")
    if role not in ("student", "instructor"):
        raise ApiError(400, "Role must be student or instructor")
    if await db.users.find_one({"email": email}):
        raise ApiError(409, "An account with this email already exists")
    user = {
        "id": uid("user"), "name": name, "email": email, "passwordHash": hash_password(password),
        "role": role.capitalize(),
        "avatar": f"https://api.dicebear.com/7.x/notionists/svg?seed={name.replace(' ', '%20')}",
        "joinedDate": today(), "status": "Active",
    }
    await insert("users", user)
    return session(user)


@api.post("/auth/login")
async def login(body: dict, request: Request):
    email = str(body.get("email") or "").strip().lower()
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "x")).split(",")[0].strip()
    ident = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident})
    if attempt and attempt.get("count", 0) >= 5 and attempt["last"] > time.time() - 900:
        raise ApiError(429, "Too many attempts. Try again in 15 minutes")
    user = await db.users.find_one({"email": email}, PROJ)
    ok = user and user.get("passwordHash") and user.get("status") != "Deactivated" \
        and verify_password(str(body.get("password") or ""), user["passwordHash"])
    if not ok:
        await db.login_attempts.update_one({"identifier": ident}, {"$inc": {"count": 1}, "$set": {"last": time.time()}}, upsert=True)
        raise ApiError(401, "Invalid email or password")
    await db.login_attempts.delete_many({"identifier": ident})
    return session(user)


@api.post("/auth/demo")
async def demo_login(body: dict):
    if not DEMO_ENABLED:
        raise ApiError(404, "Not found")
    email = DEMO_ACCOUNTS.get(str(body.get("role") or "").lower())
    user = email and await db.users.find_one({"email": email, "status": {"$ne": "Deactivated"}}, PROJ)
    if not user:
        raise ApiError(404, "Demo account not found")
    return session(user)


@api.get("/auth/me")
async def me(user: dict = Depends(current_user)):
    return {"success": True, "data": public_user(await find_one("users", {"id": user["id"]}))}


@api.get("/health")
async def health():
    return {"status": "healthy", "timestamp": now_iso(), "service": "LearnFlow LMS API"}


# ---------- users ----------
@api.get("/users")
async def list_users(role: Optional[str] = None, user: dict = Depends(require_role("admin", "instructor"))):
    if user["role"] == "instructor":
        role = "student"
    users = [public_user(u) for u in await find("users")]
    if role:
        users = [u for u in users if u["role"].lower() == role.lower()]
    return {"success": True, "count": len(users), "data": users}


@api.put("/users/{user_id}/role")
async def set_role(user_id: str, body: dict, _: dict = Depends(require_role("admin"))):
    role = str(body.get("role") or "")
    if role.lower() not in ("student", "instructor", "admin"):
        raise ApiError(400, "Invalid user role")
    if not await find_one("users", {"id": user_id}):
        raise ApiError(404, "User not found")
    return {"success": True, "data": public_user(await update("users", user_id, {"role": role.capitalize()}))}


@api.put("/users/{user_id}/status")
async def set_status(user_id: str, body: dict, _: dict = Depends(require_role("admin"))):
    user = await find_one("users", {"id": user_id})
    if not user:
        raise ApiError(404, "User not found")
    status = body.get("status") or ("Deactivated" if user.get("status") == "Active" else "Active")
    return {"success": True, "data": public_user(await update("users", user_id, {"status": status}))}


# ---------- courses ----------
@api.get("/courses")
async def list_courses(search: Optional[str] = None, category: Optional[str] = None, sort: Optional[str] = None):
    courses = await find("courses", {"status": "published"})
    if category and category != "All":
        courses = [c for c in courses if c["category"].lower() == category.lower()]
    if search:
        q = search.lower()
        courses = [c for c in courses if q in c["title"].lower() or q in c["category"].lower() or q in c["instructorName"].lower()]
    keys = {"popular": ("enrolledCount", True), "price-low": ("price", False), "price-high": ("price", True), "rating": ("rating", True)}
    if sort in keys:
        k, rev = keys[sort]
        courses.sort(key=lambda c: c.get(k) or 0, reverse=rev)
    return {"success": True, "count": len(courses), "data": courses}


@api.get("/courses/all")
async def all_courses(user: dict = Depends(require_role("instructor", "admin"))):
    query = {} if user["role"] == "admin" else {"instructorId": user["id"]}
    courses = await find("courses", query)
    return {"success": True, "count": len(courses), "data": courses}


@api.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await find_one("courses", {"id": course_id})
    if not course:
        raise ApiError(404, "Course not found")
    return {"success": True, "data": course}


def youtube_id(url: Optional[str]) -> Optional[str]:
    m = YT_RE.search(url or "")
    return m.group(1) if m else None


@api.post("/courses", status_code=201)
async def create_course(body: dict, user: dict = Depends(require_role("instructor", "admin"))):
    if not body.get("title"):
        raise ApiError(400, "Course title is required")
    preview = body.get("previewYoutubeUrl") or "https://www.youtube.com/watch?v=bMknfKXIFA8"
    course = {
        "id": uid("course"), "title": body["title"], "category": body.get("category") or "Development",
        "price": num(body.get("price") or 0, "Price"), "rating": 5.0, "reviewCount": 0,
        "instructorId": body.get("instructorId") if user["role"] == "admin" and body.get("instructorId") else user["id"],
        "instructorName": user["name"], "instructorAvatar": user.get("avatar"),
        "thumbnail": body.get("thumbnail") or "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
        "durationMs": 7200000, "enrolledCount": 0, "status": body.get("status") or "draft", "featured": False,
        "previewYoutubeUrl": preview, "previewYoutubeId": youtube_id(preview) or "bMknfKXIFA8",
        "description": body.get("description") or "<p>Welcome to this course.</p>",
        "curriculum": body.get("curriculum") or [], "reviews": [],
    }
    for k in ("level", "language", "shortDescription"):
        if k in body:
            course[k] = body[k]
    await insert("courses", course)
    await sio.emit("course_published", course)
    return {"success": True, "data": course}


async def owned_course(course_id: str, user: dict) -> dict:
    course = await find_one("courses", {"id": course_id})
    if not course:
        raise ApiError(404, "Course not found")
    if user["role"] != "admin" and course["instructorId"] != user["id"]:
        raise ApiError(403, "Cannot modify another instructor's course")
    return course


@api.put("/courses/{course_id}")
async def update_course(course_id: str, body: dict, user: dict = Depends(require_role("instructor", "admin"))):
    await owned_course(course_id, user)
    editable = ("title", "category", "price", "thumbnail", "description", "curriculum", "previewYoutubeUrl", "status", "level", "language", "shortDescription", "featured")
    changes = {k: v for k, v in body.items() if k in editable}
    if "featured" in changes and user["role"] != "admin":
        changes.pop("featured")
    if "price" in changes:
        changes["price"] = num(changes["price"], "Price")
    if youtube_id(body.get("previewYoutubeUrl")):
        changes["previewYoutubeId"] = youtube_id(body["previewYoutubeUrl"])
    updated = await update("courses", course_id, changes)
    await sio.emit("course_updated", updated)
    return {"success": True, "data": updated}


@api.delete("/courses/{course_id}")
async def delete_course(course_id: str, user: dict = Depends(require_role("instructor", "admin"))):
    await owned_course(course_id, user)
    await db.courses.delete_one({"id": course_id})
    await sio.emit("course_deleted", course_id)
    return {"success": True, "message": "Course deleted successfully"}


# ---------- scoping ----------
async def scoped_course_ids(user: dict) -> Optional[list]:
    if user["role"] == "student":
        return [e["courseId"] for e in await find("enrolments", {"userId": user["id"]})]
    if user["role"] == "instructor":
        return [c["id"] for c in await find("courses", {"instructorId": user["id"]})]
    return None


async def save_upload(file: Optional[UploadFile]) -> Optional[dict]:
    if not file or not file.filename:
        return None
    name = f"{int(time.time() * 1000)}-{Path(file.filename).name}"
    data = await file.read()
    (UPLOAD_DIR / name).write_bytes(data)
    return {"name": file.filename, "url": f"/api/uploads/{name}", "size": len(data), "type": file.content_type or ""}


# ---------- materials ----------
@api.get("/materials")
async def list_materials(courseId: Optional[str] = None, user: dict = Depends(current_user)):
    items = await find("materials", {"courseId": courseId} if courseId else {})
    ids = await scoped_course_ids(user)
    if ids is not None:
        items = [m for m in items if m["courseId"] in ids]
    return {"success": True, "count": len(items), "data": items}


@api.post("/materials", status_code=201)
async def create_material(
    title: str = Form(""), courseId: str = Form("course_react_mastery"), fileType: str = Form(""),
    file: Optional[UploadFile] = File(None), user: dict = Depends(require_role("instructor", "admin")),
):
    if not title:
        raise ApiError(400, "Material title is required")
    course = await find_one("courses", {"id": courseId})
    if not course or (user["role"] != "admin" and course["instructorId"] != user["id"]):
        raise ApiError(403, "Course is unavailable to this instructor")
    up = await save_upload(file)
    material = {
        "id": uid("mat"), "courseId": courseId, "title": title,
        "fileType": fileType or (up["type"].split("/")[-1].upper() if up and up["type"] else "PDF"),
        "size": f"{up['size'] / 1048576:.1f} MB" if up else "3.2 MB",
        "uploadedDate": today(), "url": up["url"] if up else "#",
    }
    await insert("materials", material)
    return {"success": True, "data": material}


@api.delete("/materials/{material_id}")
async def delete_material(material_id: str, user: dict = Depends(require_role("instructor", "admin"))):
    material = await find_one("materials", {"id": material_id})
    if not material:
        raise ApiError(404, "Material not found")
    course = await find_one("courses", {"id": material["courseId"]})
    if user["role"] != "admin" and (course or {}).get("instructorId") != user["id"]:
        raise ApiError(403, "Cannot delete another instructor's material")
    await db.materials.delete_one({"id": material_id})
    return {"success": True, "message": "Material deleted"}


# ---------- enrolments ----------
@api.get("/enrolments")
async def list_enrolments(userId: Optional[str] = None, courseId: Optional[str] = None, user: dict = Depends(current_user)):
    query = {}
    if user["role"] == "student":
        query["userId"] = user["id"]
    elif userId:
        query["userId"] = userId
    if courseId:
        query["courseId"] = courseId
    items = await find("enrolments", query)
    courses = {c["id"]: c for c in await find("courses")}
    names = {u["id"]: u["name"] for u in await db.users.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(5000)}
    data = [{**e, "course": courses.get(e["courseId"], {}), "studentName": names.get(e["userId"], "Student")} for e in items]
    return {"success": True, "count": len(data), "data": data}


@api.post("/enrolments", status_code=201)
async def enrol(body: dict, user: dict = Depends(require_role("student"))):
    course_id = body.get("courseId")
    if not course_id:
        raise ApiError(400, "courseId is required")
    course = await find_one("courses", {"id": course_id})
    if not course or course.get("status") != "published":
        raise ApiError(404, "Course not found")
    existing = await find_one("enrolments", {"userId": user["id"], "courseId": course_id})
    if existing:
        return {"success": True, "message": "Already enrolled", "data": {**existing, "course": course}}
    first = ((course or {}).get("curriculum") or [{}])[0].get("lessons") or [{}]
    enrolment = {
        "id": uid("enrol"), "userId": user["id"], "courseId": course_id, "enrolledDate": today(),
        "progress": 0, "completedLessons": [], "lastAccessedLessonId": first[0].get("id", "les_101"),
    }
    await insert("enrolments", enrolment)
    if course:
        await db.courses.update_one({"id": course_id}, {"$inc": {"enrolledCount": 1}})
    await sio.emit("new_enrolment", {"userId": user["id"], "courseId": course_id})
    return {"success": True, "data": {**enrolment, "course": course}}


@api.put("/enrolments/{enrol_id}/progress")
async def update_progress(enrol_id: str, body: dict, user: dict = Depends(require_role("student"))):
    enrolment = await find_one("enrolments", {"id": enrol_id})
    if not enrolment:
        raise ApiError(404, "Enrolment not found")
    if enrolment["userId"] != user["id"]:
        raise ApiError(403, "Cannot update another student's progress")
    lesson_id, completed = body.get("lessonId"), body.get("completed", True)
    done = list(enrolment.get("completedLessons") or [])
    if lesson_id:
        if completed and lesson_id not in done:
            done.append(lesson_id)
        elif not completed:
            done = [x for x in done if x != lesson_id]
    course = await find_one("courses", {"id": enrolment["courseId"]}) or {}
    total = sum(len(s.get("lessons") or []) for s in course.get("curriculum") or [])
    if body.get("progress") is not None:
        progress = num(body["progress"], "Progress")
    else:
        progress = round(len(done) / total * 100) if total else 100
    updated = await update("enrolments", enrol_id, {
        "completedLessons": done, "progress": min(100, max(0, progress)),
        "lastAccessedLessonId": lesson_id or enrolment.get("lastAccessedLessonId"),
    })
    await sio.emit("progress_updated", updated)
    return {"success": True, "data": updated}


# ---------- assignments ----------
@api.get("/assignments")
async def list_assignments(courseId: Optional[str] = None, user: dict = Depends(current_user)):
    items = await find("assignments", {"courseId": courseId} if courseId else {})
    ids = await scoped_course_ids(user)
    if ids is not None:
        items = [a for a in items if a["courseId"] in ids]
    return {"success": True, "count": len(items), "data": items}


@api.post("/assignments", status_code=201)
async def create_assignment(body: dict, user: dict = Depends(require_role("instructor", "admin"))):
    if not body.get("title") or not body.get("courseId"):
        raise ApiError(400, "Title and Course are required")
    course = await find_one("courses", {"id": body["courseId"]})
    if not course or (user["role"] != "admin" and course["instructorId"] != user["id"]):
        raise ApiError(403, "Course is unavailable to this instructor")
    assignment = {
        "id": uid("asg"), "courseId": course["id"], "courseTitle": course["title"], "title": body["title"],
        "description": body.get("description") or "<p>Please complete this assignment.</p>",
        "deadline": body.get("deadline") or (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "maxMarks": num(body.get("maxMarks") or 100, "Max marks", int), "createdAt": today(),
    }
    await insert("assignments", assignment)
    await sio.emit("new_assignment", assignment)
    await notify({"id": uid("notif"), "title": "New Assignment Posted",
                  "message": f'{course["title"]}: "{body["title"]}" is now open for submissions.',
                  "date": "Just now", "read": False, "type": "info"})
    return {"success": True, "data": assignment}


@api.get("/assignments/submissions")
async def list_submissions(assignmentId: Optional[str] = None, studentId: Optional[str] = None, user: dict = Depends(current_user)):
    query = {}
    if assignmentId:
        query["assignmentId"] = assignmentId
    if user["role"] == "student":
        query["studentId"] = user["id"]
    elif studentId:
        query["studentId"] = studentId
    subs = await find("submissions", query)
    asgs = {a["id"]: a for a in await find("assignments")}
    ids = await scoped_course_ids(user) if user["role"] == "instructor" else None
    data = [{**s, "assignment": asgs.get(s["assignmentId"], {})} for s in subs]
    if ids is not None:
        data = [s for s in data if s["assignment"].get("courseId") in ids]
    return {"success": True, "count": len(data), "data": data}


@api.post("/assignments/{assignment_id}/submit", status_code=201)
async def submit_assignment(
    assignment_id: str, notes: str = Form(""), fileName: str = Form(""),
    file: Optional[UploadFile] = File(None), user: dict = Depends(require_role("student")),
):
    if not await find_one("assignments", {"id": assignment_id}):
        raise ApiError(404, "Assignment not found")
    existing = await find_one("submissions", {"assignmentId": assignment_id, "studentId": user["id"]})
    up = await save_upload(file)
    sub = {
        "id": existing["id"] if existing else uid("sub"), "assignmentId": assignment_id,
        "studentId": user["id"], "studentName": user["name"], "submittedAt": now_iso(),
        "fileName": up["name"] if up else (fileName or "submission_document.pdf"),
        "fileUrl": up["url"] if up else "#", "notes": notes or "Completed work submitted.",
        "status": "Pending", "marks": None, "feedback": None,
    }
    if existing:
        await update("submissions", sub["id"], sub)
    else:
        await insert("submissions", sub)
    await sio.emit("new_submission", sub)
    return {"success": True, "data": sub}


@api.put("/assignments/submissions/{submission_id}/grade")
async def grade_submission(submission_id: str, body: dict, user: dict = Depends(require_role("instructor", "admin"))):
    sub = await find_one("submissions", {"id": submission_id})
    asg = sub and await find_one("assignments", {"id": sub["assignmentId"]})
    if not sub or not asg:
        raise ApiError(404, "Submission not found")
    course = await find_one("courses", {"id": asg["courseId"]}) or {}
    if user["role"] != "admin" and course.get("instructorId") != user["id"]:
        raise ApiError(403, "Cannot grade another instructor's submission")
    try:
        marks = float(body.get("marks"))
    except (TypeError, ValueError):
        marks = -1
    if marks < 0 or marks > asg["maxMarks"]:
        raise ApiError(400, "Marks must be between 0 and the assignment maximum")
    marks = int(marks) if marks.is_integer() else marks
    updated = await update("submissions", submission_id, {"marks": marks, "feedback": body.get("feedback") or "Good work!", "status": "Graded"})
    await sio.emit("assignment_graded", updated, room=f"user_{updated['studentId']}")
    await notify({"id": uid("notif"), "userId": updated["studentId"], "title": "Assignment Graded",
                  "message": f'Your submission for {asg["title"]} has been evaluated: {marks} marks.',
                  "date": "Just now", "read": False, "type": "success"})
    return {"success": True, "data": updated}


# ---------- attendance ----------
@api.get("/attendance")
async def list_attendance(courseId: Optional[str] = None, studentId: Optional[str] = None, user: dict = Depends(current_user)):
    records = await find("attendance", {"courseId": courseId} if courseId else {})
    if user["role"] == "instructor":
        ids = await scoped_course_ids(user)
        records = [r for r in records if r["courseId"] in ids]
    if studentId:
        sid = user["id"] if user["role"] == "student" else studentId
        counts = {"Present": 0, "Late": 0, "Absent": 0}
        history = []
        for s in records:
            rec = next((r for r in s.get("records") or [] if r.get("studentId") == sid), None)
            if rec:
                counts[rec["status"] if rec["status"] in counts else "Absent"] += 1
                history.append({"sessionId": s["id"], "courseId": s["courseId"], "courseTitle": s.get("courseTitle"), "date": s["date"], "status": rec["status"]})
        total = len(history)
        rate = round((counts["Present"] + counts["Late"] * 0.5) / total * 100) if total else 100
        return {"success": True, "data": {"totalSessions": total, "presentCount": counts["Present"], "lateCount": counts["Late"],
                                          "absentCount": counts["Absent"], "attendanceRate": rate, "history": history}}
    if user["role"] == "student":
        records = [{**s, "records": [r for r in s.get("records") or [] if r.get("studentId") == user["id"]]} for s in records]
        records = [s for s in records if s["records"]]
    return {"success": True, "count": len(records), "data": records}


@api.post("/attendance", status_code=201)
async def record_attendance(body: dict, user: dict = Depends(require_role("instructor", "admin"))):
    course_id, date = body.get("courseId"), body.get("date")
    if not course_id or not date:
        raise ApiError(400, "courseId and date are required")
    course = await owned_course(course_id, user)
    existing = await find_one("attendance", {"courseId": course_id, "date": date})
    entry = {"id": existing["id"] if existing else uid("att"), "courseId": course_id,
             "courseTitle": course.get("title", "Course Attendance"), "date": date, "records": body.get("records") or []}
    if existing:
        await update("attendance", entry["id"], entry)
    else:
        await insert("attendance", entry)
    await sio.emit("attendance_updated", entry)
    await notify({"id": uid("notif"), "title": "Attendance Logged",
                  "message": f'Attendance for {course.get("title", "Course")} on {date} has been recorded.',
                  "date": "Just now", "read": False, "type": "info"})
    return {"success": True, "message": "Attendance recorded successfully", "data": entry}


# ---------- results ----------
def compute_grade(m: float):
    for limit, grade, gpa in ((90, "A+", 4.0), (80, "A", 3.8), (75, "B+", 3.4), (70, "B", 3.0), (60, "C+", 2.5), (50, "C", 2.0), (40, "D", 1.5)):
        if m >= limit:
            return grade, gpa
    return "F", 0.0


@api.get("/results")
async def list_results(studentId: Optional[str] = None, user: dict = Depends(current_user)):
    query = {"studentId": user["id"]} if user["role"] == "student" else ({"studentId": studentId} if studentId else {})
    results = await find("results", query)
    if user["role"] == "instructor":
        ids = await scoped_course_ids(user)
        results = [r for r in results if r["courseId"] in ids]
    gpa = round(sum(float(r.get("gpa") or 0) for r in results) / len(results), 2) if results else 0.0
    return {"success": True, "data": {"results": results, "cumulativeGpa": gpa, "totalGradedCourses": len(results)}}


@api.post("/results", status_code=201)
async def publish_result(body: dict, user: dict = Depends(require_role("instructor", "admin"))):
    course_id, total = body.get("courseId"), body.get("totalMarks")
    if not course_id or total is None:
        raise ApiError(400, "courseId and totalMarks are required")
    total = num(total, "Total marks")
    if total > 100:
        raise ApiError(400, "Total marks must be between 0 and 100")
    if not body.get("studentId") or not await db.users.find_one({"id": body["studentId"], "role": "Student"}):
        raise ApiError(400, "A valid studentId is required")
    course = await owned_course(course_id, user)
    grade, gpa = compute_grade(total)
    sid = body.get("studentId")
    existing = await find_one("results", {"studentId": sid, "courseId": course_id})
    entry = {"id": existing["id"] if existing else uid("res"), "studentId": sid, "courseId": course_id,
             "courseTitle": course.get("title", "Course Result"), "totalMarks": int(total) if total.is_integer() else total,
             "grade": grade, "gpa": gpa, "remarks": body.get("remarks") or f"Demonstrated {grade} tier proficiency.",
             "publishedDate": today()}
    if existing:
        await update("results", entry["id"], entry)
    else:
        await insert("results", entry)
    await sio.emit("result_published", entry, room=f"user_{sid}")
    await notify({"id": uid("notif"), "userId": sid, "title": "Final Grade Published",
                  "message": f'Your final score for {course.get("title", "Course")} has been published: {grade} ({entry["totalMarks"]}/100).',
                  "date": "Just now", "read": False, "type": "success"})
    return {"success": True, "message": "Result published successfully", "data": entry}


# ---------- notifications ----------
def visible_to(user: dict) -> dict:
    return {"$or": [{"userId": None}, {"userId": {"$exists": False}}, {"userId": user["id"]}]}


@api.get("/notifications")
async def list_notifications(user: dict = Depends(current_user)):
    items = await find("notifications", visible_to(user))
    return {"success": True, "count": len(items), "data": items}


@api.put("/notifications/read-all")
async def read_all(user: dict = Depends(current_user)):
    await db.notifications.update_many(visible_to(user), {"$set": {"read": True}})
    return {"success": True, "message": "All notifications marked as read", "data": await find("notifications", visible_to(user))}


@api.put("/notifications/{notif_id}/read")
async def read_one(notif_id: str, user: dict = Depends(current_user)):
    n = await find_one("notifications", {"id": notif_id})
    if not n or (n.get("userId") and n["userId"] != user["id"]):
        raise ApiError(404, "Notification not found")
    return {"success": True, "data": await update("notifications", notif_id, {"read": True})}


# ---------- discussions ----------
@api.get("/discussions")
async def list_discussions(courseId: str, user: dict = Depends(current_user)):
    if not await can_access_course(user, courseId):
        raise ApiError(403, "You do not have access to this course")
    items = await find("discussions", {"courseId": courseId})
    items.sort(key=lambda d: d.get("timestamp") or "")
    return {"success": True, "count": len(items), "data": items}


@api.post("/discussions", status_code=201)
async def post_discussion(body: dict, user: dict = Depends(current_user)):
    if not body.get("courseId") or not str(body.get("message") or "").strip():
        raise ApiError(400, "courseId and message are required")
    if not await can_access_course(user, body["courseId"]):
        raise ApiError(403, "You do not have access to this course")
    post = {"id": uid("disc"), "courseId": body["courseId"], "userId": user["id"], "userName": user["name"],
            "userAvatar": user.get("avatar"), "role": user["role"].capitalize(),
            "message": str(body["message"]).strip()[:4000], "timestamp": now_iso()}
    await insert("discussions", post)
    await sio.emit("receive_message", post, room=f"course_{body['courseId']}")
    return {"success": True, "data": post}


# ---------- stats ----------
@api.get("/stats/admin")
async def admin_stats(_: dict = Depends(require_role("admin"))):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    rev = [r * 83 for r in (14200, 18400, 22100, 19800, 27500, 31200, 29800, 35600, 42100, 48900, 54200, 61800)]
    enr = [420, 560, 680, 590, 820, 940, 890, 1080, 1250, 1430, 1610, 1840]
    return {"success": True, "data": {
        "totalUsers": await db.users.count_documents({}) + 1540,
        "totalCourses": await db.courses.count_documents({}) + 42,
        "totalEnrolments": await db.enrolments.count_documents({}) + 13280,
        "activeThisMonth": 3420,
        "revenueChartData": [{"month": m, "revenue": r, "enrolments": e} for m, r, e in zip(months, rev, enr)],
    }}


@api.get("/stats/instructor")
async def instructor_stats(user: dict = Depends(require_role("instructor", "admin"))):
    return {"success": True, "data": {
        "totalStudents": 11370,
        "coursesPublished": await db.courses.count_documents({"instructorId": user["id"]}),
        "pendingToGrade": await db.submissions.count_documents({"status": "Pending", "assignmentId": {"$in": [
            a["id"] for a in await find("assignments", {"courseId": {"$in": await scoped_course_ids(user) or []}})]}}),
        "totalRevenue": "₹35,56,550", "monthlyRevenue": "₹5,32,860",
    }}


# ---------- socket.io ----------
async def can_access_course(user: dict, course_id: str) -> bool:
    role = user["role"].lower()
    if role == "admin":
        return True
    if role == "instructor":
        return bool(await db.courses.find_one({"id": course_id, "instructorId": user["id"]}))
    return bool(await db.enrolments.find_one({"userId": user["id"], "courseId": course_id}))


@sio.event
async def connect(sid, environ, auth):
    user = await user_from_token((auth or {}).get("token") or "")
    if not user:
        raise socketio.exceptions.ConnectionRefusedError("Authentication required")
    await sio.save_session(sid, {"id": user["id"], "name": user["name"], "role": user["role"], "avatar": user.get("avatar")})
    await sio.enter_room(sid, f"user_{user['id']}")


@sio.event
async def join_course_room(sid, course_id):
    user = await sio.get_session(sid)
    if course_id and await can_access_course(user, course_id):
        await sio.enter_room(sid, f"course_{course_id}")


@sio.event
async def leave_course_room(sid, course_id):
    await sio.leave_room(sid, f"course_{course_id}")


@sio.event
async def send_message(sid, data):
    user = await sio.get_session(sid)
    room = f"course_{(data or {}).get('courseId')}"
    msg = str((data or {}).get("message") or "").strip()
    if not msg or room not in sio.rooms(sid):
        return
    await sio.emit("receive_message", {"courseId": data["courseId"], "userId": user["id"], "userName": user["name"],
                                       "role": user["role"], "message": msg[:4000], "timestamp": now_iso()}, room=room)


# ---------- startup ----------
async def seed():
    if await db.users.count_documents({}) > 0:
        return
    data = json.loads((ROOT_DIR / "seed_data.json").read_text())
    for col, items in data.items():
        n = len(items)
        docs = []
        for i, item in enumerate(items):
            if col == "users" and SEED_PASSWORD:
                item["passwordHash"] = hash_password(SEED_PASSWORD)
            docs.append({**item, "_order": n - i})
        if docs:
            await db[col].insert_many(docs)
    logger.info("Seeded LearnFlow sample data")


@app.on_event("startup")
async def startup():
    await seed()
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    for col in ("users", "courses", "enrolments", "assignments", "submissions", "attendance", "results", "notifications", "materials", "discussions"):
        await db[col].create_index("id")


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app = app
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="api/socket.io")
