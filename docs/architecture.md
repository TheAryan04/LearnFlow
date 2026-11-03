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

## Verification

The refactor has been committed to a dedicated pull-request branch. Runtime, build, and integration tests have not yet been executed in this environment. Run the project's configured backend and frontend checks before merging.

Backend:

```bash
cd backend
npm install
npm run dev
```

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
