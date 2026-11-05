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
- `backend/tests/` — Node unit tests and Python API/realtime integration tests
- `docs/` — architecture and project documentation

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

Run backend unit tests with `cd backend && npm test`. See [docs/architecture.md](docs/architecture.md) for the MVP architecture, security baseline, and verification guidance. See [docs/deployment.md](docs/deployment.md) for the Render, Vercel, and MongoDB Atlas deployment checklist.

## Database choice

The project intentionally retains the native MongoDB driver. Mongoose is not used.
