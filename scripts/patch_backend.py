p = '/app/backend/server.py'
s = open(p).read()

def rep(old, new):
    global s
    assert old in s, old[:70]
    s = s.replace(old, new, 1)

# numeric validation helper
rep('''def public_user(user: dict) -> dict:''', '''def num(value, field: str, cast=float):
    try:
        out = cast(value)
    except (TypeError, ValueError):
        raise ApiError(400, f"{field} must be a number")
    if out < 0:
        raise ApiError(400, f"{field} cannot be negative")
    return out


def public_user(user: dict) -> dict:''')

# per-user notification rooms
rep('''async def notify(notif: dict):
    await insert("notifications", notif)
    await sio.emit("notification", notif)''', '''async def notify(notif: dict):
    await insert("notifications", notif)
    await sio.emit("notification", notif, room=f"user_{notif['userId']}" if notif.get("userId") else None)''')
rep('''    await sio.save_session(sid, {"id": user["id"], "name": user["name"], "role": user["role"], "avatar": user.get("avatar")})''',
    '''    await sio.save_session(sid, {"id": user["id"], "name": user["name"], "role": user["role"], "avatar": user.get("avatar")})
    await sio.enter_room(sid, f"user_{user['id']}")''')

# lockout behind ingress
rep('''    ident = f"{request.client.host if request.client else 'x'}:{email}"''',
    '''    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "x")).split(",")[0].strip()
    ident = f"{ip}:{email}"''')

# deterministic demo accounts
rep('''    role = str(body.get("role") or "").capitalize()
    user = await db.users.find_one({"role": role, "status": {"$ne": "Deactivated"}}, PROJ, sort=[("_order", -1)])''',
    '''    email = DEMO_ACCOUNTS.get(str(body.get("role") or "").lower())
    user = email and await db.users.find_one({"email": email, "status": {"$ne": "Deactivated"}}, PROJ)''')
rep('''UPLOAD_DIR = ROOT_DIR / "uploads"''', '''DEMO_ACCOUNTS = {"student": "alex.student@learnflow.edu", "instructor": "marcus.vance@learnflow.edu", "admin": "admin@learnflow.edu"}
UPLOAD_DIR = ROOT_DIR / "uploads"''')

# numeric validation
rep('''"price": float(body.get("price") or 0),''', '''"price": num(body.get("price") or 0, "Price"),''')
rep('''"maxMarks": int(body.get("maxMarks") or 100), "createdAt": today(),''', '''"maxMarks": num(body.get("maxMarks") or 100, "Max marks", int), "createdAt": today(),''')
rep('''    total = float(total)
    course = await find_one("courses", {"id": course_id}) or {}''', '''    total = num(total, "Total marks")
    if total > 100:
        raise ApiError(400, "Total marks must be between 0 and 100")
    if not body.get("studentId") or not await db.users.find_one({"id": body["studentId"], "role": "Student"}):
        raise ApiError(400, "A valid studentId is required")
    course = await owned_course(course_id, user)''')

# course updates: whitelist + price validation
rep('''    changes = {k: v for k, v in body.items() if k not in ("id", "instructorId", "instructorName", "_id", "_order")}''',
    '''    editable = ("title", "category", "price", "thumbnail", "description", "curriculum", "previewYoutubeUrl", "status", "level", "language", "shortDescription", "featured")
    changes = {k: v for k, v in body.items() if k in editable}
    if "featured" in changes and user["role"] != "admin":
        changes.pop("featured")
    if "price" in changes:
        changes["price"] = num(changes["price"], "Price")''')

# enrolment must target published course
rep('''    course = await find_one("courses", {"id": course_id})
    existing = await find_one("enrolments", {"userId": user["id"], "courseId": course_id})''',
    '''    course = await find_one("courses", {"id": course_id})
    if not course or course.get("status") != "published":
        raise ApiError(404, "Course not found")
    existing = await find_one("enrolments", {"userId": user["id"], "courseId": course_id})''')

# attendance POST ownership
rep('''    course = await find_one("courses", {"id": course_id}) or {}
    existing = await find_one("attendance", {"courseId": course_id, "date": date})''',
    '''    course = await owned_course(course_id, user)
    existing = await find_one("attendance", {"courseId": course_id, "date": date})''')

# scope instructor reads of attendance/results
rep('''    records = await find("attendance", {"courseId": courseId} if courseId else {})
    if studentId:''', '''    records = await find("attendance", {"courseId": courseId} if courseId else {})
    if user["role"] == "instructor":
        ids = await scoped_course_ids(user)
        records = [r for r in records if r["courseId"] in ids]
    if studentId:''')
rep('''    results = await find("results", query)
    gpa =''', '''    results = await find("results", query)
    if user["role"] == "instructor":
        ids = await scoped_course_ids(user)
        results = [r for r in results if r["courseId"] in ids]
    gpa =''')

# discussions access
rep('''async def list_discussions(courseId: Optional[str] = None, _: dict = Depends(current_user)):
    items = await find("discussions", {"courseId": courseId} if courseId else {})''',
    '''async def list_discussions(courseId: str, user: dict = Depends(current_user)):
    if not await can_access_course(user, courseId):
        raise ApiError(403, "You do not have access to this course")
    items = await find("discussions", {"courseId": courseId})''')
rep('''        raise ApiError(400, "courseId and message are required")
    post =''', '''        raise ApiError(400, "courseId and message are required")
    if not await can_access_course(user, body["courseId"]):
        raise ApiError(403, "You do not have access to this course")
    post =''')

# pendingToGrade scoped
rep('''        "pendingToGrade": await db.submissions.count_documents({"status": "Pending"}),''',
    '''        "pendingToGrade": await db.submissions.count_documents({"status": "Pending", "assignmentId": {"$in": [
            a["id"] for a in await find("assignments", {"courseId": {"$in": await scoped_course_ids(user) or []}})]}}),''')
open(p, 'w').write(s)
print('ok')
