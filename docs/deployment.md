# LearnFlow deployment checklist

This repository has not been deployed or smoke-tested against production services by this change. Use this checklist to prepare a Render API, Vercel frontend, and MongoDB Atlas database.

## 1. MongoDB Atlas

1. Create a production database and a database user with access only to that database.
2. Configure the Atlas network access list for the backend host. Avoid leaving unrestricted access enabled as a permanent setting.
3. Copy the application connection string into the backend environment as `MONGO_URL` and set `DB_NAME`.
4. Enable automated backups and verify that a restore can be performed before loading real student data.

## 2. Backend on Render

Create a Node web service with:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Node.js: 20.9 or later

Set the following environment variables in Render (never commit production values):

| Variable | Purpose |
| --- | --- |
| `MONGO_URL` | MongoDB Atlas connection string |
| `DB_NAME` | Production database name |
| `CORS_ORIGINS` | Comma-separated exact frontend origin(s), including the production Vercel URL |
| `CLERK_SECRET_KEY` | Secret key for the same Clerk application used by the frontend |
| `CLERK_AUTHORIZED_PARTIES` | Comma-separated allowed frontend origins |
| `ADMIN_EMAILS` | Verified email allowlist for initial admin provisioning |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary upload credentials, or configure `CLOUDINARY_URL` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional Nodemailer delivery settings |
| `ENABLE_DEMO_LOGIN` | Keep `false` in production |
| `JWT_SECRET` | Long random secret; required if demo JWT login is enabled |

Render supplies `PORT` at runtime. Do not hard-code a production port. Configure the service's health-check path only after confirming the deployed health endpoint responds successfully.

## 3. Frontend on Vercel

Create a project with:

- Root directory: `frontend`
- Framework preset: Create React App
- Build command: `npm run build`
- Output directory: `build`

Set these frontend environment variables for the Production environment:

- `REACT_APP_BACKEND_URL`: the public Render API origin, without the trailing `/api`
- `REACT_APP_CLERK_PUBLISHABLE_KEY`: publishable key from the same Clerk application as `CLERK_SECRET_KEY`

After the first deployment, add the final Vercel origin to both backend `CORS_ORIGINS` and Clerk `CLERK_AUTHORIZED_PARTIES`, then redeploy the backend.

## 4. Clerk account recovery

LearnFlow uses Clerk for signup and sign-in. Password recovery and email verification are therefore configured in the Clerk application and its hosted sign-in flow; this repository does not implement a separate local-password or custom OTP-reset API. Verify the email-code/password-recovery flow in the deployed Clerk configuration before sign-off.

## 5. Production smoke tests

Run these checks against the deployed API and frontend before accepting the release:

1. Open the Vercel URL and confirm the course catalogue loads from the Render API.
2. Create/sign in to a Student account and confirm the profile is synchronized.
3. Verify that an unauthenticated request to a protected endpoint returns 401 and a Student request to an admin endpoint returns 403.
4. Verify instructor course creation, student enrolment, lesson progress, assignment submission, grading, attendance, and results.
5. Download a student grade card and an admin report.
6. Upload and download a course material and an assignment submission; verify that another student's account cannot read a private submission.
7. Trigger a notification and verify in-app delivery. If SMTP is configured, verify the email in a real inbox and check provider logs for delivery failures.
8. Verify browser console/network errors, mobile layouts, and response latency under realistic catalogue and dashboard usage.

Do not mark deployment complete based only on a successful frontend build. Record the deployed URLs, release commit, smoke-test results, and any failed checks.
