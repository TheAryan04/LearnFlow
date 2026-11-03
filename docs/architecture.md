# LearnFlow architecture

## Stack decision

- React frontend (existing CRA/CRACO toolchain).
- Node.js + Express 5 backend.
- MongoDB using the existing native `mongodb` driver.
- Clerk for user authentication.
- Socket.IO for real-time events.

Mongoose is intentionally not introduced. Existing collections, document shapes, IDs, and API response envelopes remain the source of truth.

## Backend structure

```text
backend/
├── server.js
├── src/
│   ├── app.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── courses.controller.js
│   │   ├── enrolments.controller.js
│   │   ├── coursework.controller.js
│   │   ├── classroom.controller.js
│   │   └── community.controller.js
│   ├── repositories/
│   │   └── collection.repository.js
│   ├── services/
│   │   ├── course.service.js
│   │   ├── enrolment.service.js
│   │   ├── coursework.service.js
│   │   ├── classroom.service.js
│   │   └── community.service.js
│   ├── routes/
│   │   ├── courses.js
│   │   ├── enrolments.js
│   │   ├── coursework.js
│   │   ├── classroom.js
│   │   └── community.js
│   ├── utils/
│   │   ├── core.js
│   │   └── errors.js
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
- **Realtime/storage:** preserve Socket.IO and file-storage integrations.

All five domain route modules now delegate request handling to dedicated controller modules. Course, enrolment, coursework, classroom, and community business operations live in corresponding service modules.

## Compatibility decisions

1. Keep collection names and stored document fields unchanged.
2. Keep API URLs, status codes, and response envelopes unchanged.
3. Keep Clerk token verification and demo-login behavior unchanged.
4. Keep Socket.IO path, event names, and room naming unchanged.
5. Keep the existing upload/storage adapter unchanged.
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

- Add automated regression coverage for the preserved API contracts.
- Add domain-specific repositories if query logic grows beyond the shared collection repository.
- Audit frontend feature boundaries and consolidate duplicate API/service helpers.
- Move backend tests only after updating their execution and CI configuration.
