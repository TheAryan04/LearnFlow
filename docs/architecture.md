# LearnFlow architecture

## Stack decision

- React frontend (existing CRA/CRACO toolchain).
- Node.js + Express 5 backend.
- MongoDB using the existing native `mongodb` driver.
- Clerk for user authentication.
- Socket.IO for real-time events.
- Cloudinary for uploaded course materials and assignment submissions.

No LLM provider or AI API is required by the application.

## Backend structure

```text
backend/
├── server.js
├── src/
│   ├── app.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── repositories/
│   ├── services/
│   ├── routes/
│   ├── utils/
│   ├── auth.js
│   ├── clerk.js
│   ├── realtime.js
│   ├── scope.js
│   ├── seed.js
│   └── storage.js
└── package.json
```

## Layer responsibilities

- **Routes:** declare HTTP paths and attach authentication/authorization middleware.
- **Controllers:** translate HTTP requests into service calls and format responses.
- **Services:** implement domain workflows and business rules.
- **Repositories:** centralize MongoDB collection operations using the native driver.
- **Config:** initialize infrastructure such as MongoDB.
- **Middleware/auth:** authenticate users and enforce roles.
- **Realtime/storage:** provide Socket.IO and Cloudinary-backed file persistence.

All five domain route modules delegate request handling to dedicated controller modules. Course, enrolment, coursework, classroom, and community business operations live in corresponding service modules.

## Cloudinary file storage

Set either `CLOUDINARY_URL` or all three variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `backend/.env`. Keep credentials server-side and never put the API secret in frontend environment variables.

New uploads are sent from the Express backend to Cloudinary using the Node SDK. MongoDB stores the Cloudinary public ID, resource type, secure delivery URL, and existing file metadata. The application continues to serve files through the authenticated `/api/files/:id` route, which checks authorization before retrieving the asset. Cloudinary URLs are not returned in API responses.

Files uploaded before this migration using local filesystem storage remain readable from `backend/uploads` as a backward-compatibility fallback. New files use Cloudinary. Existing Emergent object-storage files are not automatically migrated.

The backend upload route currently limits files to 25 MB. Configure a persistent backup/export process for important Cloudinary assets and metadata.

## Compatibility decisions

1. Keep collection names and stored document fields unchanged where possible.
2. Keep API URLs, status codes, and response envelopes unchanged.
3. Keep Clerk token verification and demo-login behavior unchanged.
4. Keep Socket.IO path, event names, and room naming unchanged.
5. Keep the file metadata API and authenticated download route unchanged while using Cloudinary for new uploads.
6. Keep `src/core.js` as a compatibility facade for existing imports.
7. Keep backend integration tests in `backend/tests/` until their runner and CI paths are updated together.

## MVP hardening

The backend is intentionally kept as a modular monolith for the MVP. The current baseline includes:

- Public signup defaults to the Student role; elevated roles are assigned by an administrator or the verified-email admin allowlist.
- Request and domain checks for course titles/status, assignment marks/deadlines, attendance dates/records, and account status.
- Course enrolment is required before a student can submit coursework.
- Baseline browser security headers, configurable CORS for HTTP and Socket.IO, and bounded JSON/file payloads.
- Graceful process shutdown for Socket.IO and MongoDB.
- MongoDB indexes for common course, enrolment, coursework, attendance, discussion, and notification lookups.
- Dashboard counts are based on stored records; revenue is not reported because payment/revenue data is not modelled.

Avoid adding Redis, queues, Elasticsearch, microservices, or a separate cache until a real MVP requirement justifies them.

## Verification

Backend unit tests use Node's built-in test runner:

```bash
cd backend
npm install
npm test
npm run dev
```

The API integration tests in `backend/tests/test_node_api.py` and `backend/tests/test_node_realtime_files.py` are Python/pytest suites and require a configured running API plus their test environment variables. Runtime, build, and integration tests have not been executed as part of these source edits; run the checks before merging.

Frontend:

```bash
cd frontend
yarn install
yarn start
```

## Follow-up work

- Add automated regression coverage for Cloudinary upload, metadata persistence, and authorized download.
- Add domain-specific repositories if query logic grows beyond the shared collection repository.
- Audit frontend feature boundaries and consolidate duplicate API/service helpers.
- Move backend tests only after updating their execution and CI configuration.


## Admin, reports, and notifications

- Admin user and course operations remain protected by the existing admin role middleware.
- Admin reports are read from MongoDB collections through `GET /api/admin/reports/:type`; supported types are users, courses, enrolments, attendance, results, assignments, and submissions.
- Attendance reports flatten the stored session records and include student identity; enrolment, result, and submission reports include related student/course/assignment labels.
- The student grade card is generated in the browser as a PDF using the installed jsPDF dependency.
- Assignment deadline reminders run hourly and notify enrolled students when an assignment is due within the next 24 hours. A reminder is recorded once per assignment/student.
- Course publication and updates, assignment announcements, grading, and result publication create in-app notifications. Per-user notifications are also emailed when SMTP is configured.

Optional email delivery uses Nodemailer. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in the backend environment. Email is skipped when SMTP settings are absent; email delivery errors are logged and do not fail the in-app notification request. See `backend/.env.example`.
