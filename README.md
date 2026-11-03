# LearnFlow

LearnFlow is a learning management system with student, instructor, and administrator workflows.

## Technology

- React frontend (Create React App / CRACO)
- Node.js and Express 5 API
- MongoDB using the native MongoDB Node.js driver
- Clerk authentication
- Socket.IO real-time communication

## Repository layout

- `frontend/` — React application
- `backend/` — Express API and MongoDB integration
- `backend_tests/` — API and real-time integration tests
- `plan/`, `memory/`, `test_reports/` — project/agent workflow artifacts

## Run locally

Configure the environment variables required by the frontend and backend before starting either application.

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

See [docs/architecture.md](docs/architecture.md) for the backend layering decision and the staged refactoring plan.

## Database choice

The project intentionally retains the native MongoDB driver. Mongoose is not used.
