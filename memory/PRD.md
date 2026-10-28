# LearnFlow — PRD

## Original problem statement
"first connect with this github repo: https://github.com/TheAryan04/LearnFlow/tree/main then redesign the frontend"
Follow-ups: show pricing in Indian currency; use Node + Express.js instead of FastAPI (remove Python); set up Clerk (existing app app_3LL7D9zOsyrd84Mpr1iSF9QgbiK, React).

## Architecture
- Frontend: React 19 (CRA + craco), Redux Toolkit, React Router 7, Tailwind (calm editorial theme: paper/ink/terracotta, Newsreader + Plus Jakarta Sans), @clerk/react, socket.io-client, recharts.
- Backend: Node 20 + Express 5 (ESM) at /app/backend/server.js, MongoDB driver, socket.io (path /api/socket.io), multer (memory) → Emergent object storage, Clerk token verification (secret key via @clerk/backend if present, otherwise networkless JWKS verification pinned to the publishable key's Frontend API).
- Supervisor backend command changed to `node --watch server.js` (/etc/supervisor/conf.d/supervisord.conf — outside /app, may reset on pod restart).

## Users & auth
- Real users: Clerk sign-in/up; choose Student or Instructor at sign-up (unsafeMetadata.role + sessionStorage); profile synced via POST /api/auth/sync; Clerk UserButton in navbar.
- Admins: emails in ADMIN_EMAILS become Admin — requires a verified email (Clerk Backend API secret, or an `email` claim in the Clerk session token).
- Preview sample accounts: demo buttons (ENABLE_DEMO_LOGIN) for Student/Instructor/Admin.

## Implemented (2026-10/06)
- Repo ported, all screens redesigned; role sidebars, empty states, search/filter, skeletons, toasts, responsive.
- Backend scoping/validation hardening (ownership, discussions access, private socket rooms, numeric validation, lockout).
- Prices & revenue in INR (₹, en-IN grouping, ₹k/L/Cr chart ticks); seed prices converted at 83.
- Express backend rewrite, Python removed; uploads via Emergent object storage (/api/files/:id, auth required).
- Clerk sign-in/sign-up styled to the theme.

## Backlog
- P1: Clerk session-token `email` claim (or managed secret) so ADMIN_EMAILS works; CLERK_AUTHORIZED_PARTIES for production origins.
- P1: Richer course player (progress markers, next/previous); materials download links in student UI.
- P2: bulk actions, improved report charts, dark reading mode, accessibility pass.
