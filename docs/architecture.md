# LearnFlow architecture

## Stack decision

- React frontend (existing CRA/CRACO toolchain).
- Node.js + Express 5 backend.
- MongoDB using the existing native `mongodb` driver.
- Clerk for user authentication.
- Socket.IO for real-time events.

Mongoose is intentionally not introduced. Existing collections, document shapes, IDs, and API response envelopes remain the source of truth.

## Backend layers

```text
backend/
├── server.js                  # process bootstrap and lifecycle
├── src/
│   ├── app.js                 # Express middleware and route composition
│   ├── config/
│   │   └── database.js        # MongoClient and database connection
│   ├── repositories/
│   │   └── collection.repository.js
│   ├── utils/
│   │   ├── core.js            # shared response, ID, date and number helpers
│   │   └── errors.js          # ApiError
│   ├── routes/                # HTTP endpoint declarations (legacy handlers retained)
│   ├── auth.js                # Clerk/session authentication (legacy module)
│   ├── realtime.js            # Socket.IO integration (legacy module)
│   ├── scope.js               # role/course access scope
│   ├── seed.js                # seed data
│   └── storage.js             # file storage integration
└── package.json
```

### Responsibilities

- **Routes:** expose the existing HTTP paths and preserve request/response contracts.
- **Controllers (next extraction phase):** own HTTP request/response orchestration; route handlers currently remain inline to avoid a risky all-at-once rewrite.
- **Services (next extraction phase):** own multi-step business workflows such as enrolment, grading, notifications, and uploads.
- **Repositories:** own MongoDB reads/writes. The generic collection repository currently centralizes the existing query helpers.
- **Config:** initialize external infrastructure.
- **Middleware:** authentication, authorization, request validation, and error handling.

## Compatibility strategy

1. Keep collection names and stored document fields unchanged.
2. Keep API URLs, status codes, and response envelopes unchanged.
3. Keep Clerk token verification and demo-login behavior unchanged.
4. Keep Socket.IO path, event names, and room naming unchanged.
5. Keep the existing upload/storage adapter unchanged.
6. Keep `src/core.js` as a compatibility facade while modules are migrated.
7. Extract route controllers and domain-specific services incrementally, with regression tests for each domain.

## Verification

Run from `backend/`:

```bash
npm install
npm run dev
```

Run the existing integration tests in the environment configured for the project. The Python tests in the repository root's `backend_tests/` directory expect a running API and project-specific environment variables; they are not standalone unit tests.

## Known follow-up work

- Extract each route module into controller + service modules.
- Add domain-specific repositories (users, courses, enrolments, assignments, submissions).
- Move backend integration tests into the backend package only after updating their environment paths and CI references.
- Add a root workspace script only after confirming the deployment and Emergent runner expectations.
