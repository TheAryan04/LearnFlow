# Shared fixtures: cleanup of TEST_ data after the session (TEST users would otherwise hijack /auth/demo, which picks the newest user per role)
import os
import pytest
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    yield
    db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    ids = [u["id"] for u in db.users.find({"$or": [{"email": {"$regex": "^test_"}}, {"name": {"$regex": "^TEST"}}]}, {"id": 1})]
    db.enrolments.delete_many({"userId": {"$in": ids}})
    db.courses.delete_many({"$or": [{"instructorId": {"$in": ids}}, {"title": {"$regex": "^TEST_"}}]})
    db.users.delete_many({"id": {"$in": ids}})
    asg = [a["id"] for a in db.assignments.find({"title": {"$regex": "^TEST_"}}, {"id": 1})]
    db.submissions.delete_many({"assignmentId": {"$in": asg}})
    db.assignments.delete_many({"id": {"$in": asg}})
    db.discussions.delete_many({"message": {"$regex": "^TEST msg"}})
    db.attendance.delete_many({"date": "2099-01-01"})
    db.notifications.delete_many({"message": {"$regex": "TEST_|2099-01-01"}})
    db.login_attempts.delete_many({"identifier": {"$regex": "test_|nobody_"}})
