# Removes TEST_ data and orphans left behind by test runs (course delete does not cascade)
from pymongo import MongoClient


def env(key):
    for line in open('/app/backend/.env'):
        if line.startswith(key + '='):
            return line.split('=', 1)[1].strip().strip('"')


db = MongoClient(env('MONGO_URL'))[env('DB_NAME')]
course_ids = {c['id'] for c in db.courses.find({}, {'id': 1})}
before = {}
for col, key in [('enrolments', 'courseId'), ('assignments', 'courseId'), ('materials', 'courseId'), ('attendance', 'courseId'), ('results', 'courseId'), ('discussions', 'courseId')]:
    orphans = db[col].count_documents({key: {'$nin': list(course_ids)}})
    before[col] = orphans
    db[col].delete_many({key: {'$nin': list(course_ids)}})
asg_ids = [a['id'] for a in db.assignments.find({}, {'id': 1})]
before['submissions'] = db.submissions.count_documents({'assignmentId': {'$nin': asg_ids}})
db.submissions.delete_many({'assignmentId': {'$nin': asg_ids}})
before['courses_TEST'] = db.courses.count_documents({'title': {'$regex': '^TEST_'}})
db.courses.delete_many({'title': {'$regex': '^TEST_'}})
db.notifications.delete_many({'message': {'$regex': 'TEST_'}})
print('orphans removed:', before)
