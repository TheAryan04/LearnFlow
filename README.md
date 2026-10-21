# LearnFlow - Real-Time Full-Stack Learning Management System (LMS)

LearnFlow is an enterprise-grade, real-time Learning Management System inspired by **Udemy** and **Notion**. Built with React 19, Tailwind CSS, Express, Socket.io, and Clerk, it features dedicated portals for **Students**, **Instructors**, and **Administrators** with real-time WebSockets, persistent storage, and live cohort discussions.

---

## ⚡ Real-Time & Production Features

1. **Persistent Database Engine (`Backend/data/db.js`)**:
   - Thread-safe, file-backed database persisting to `Backend/data/db.json`.
   - All mutations (course creation, curriculum updates, assignments, grades, attendance, enrolments, discussions) are permanently saved across server restarts.
   - Optional MongoDB support via `MONGODB_URI` in `.env`.

2. **WebSockets & Real-Time Sync (`socket.io` & `socket.io-client`)**:
   - **Live Cohort Q&A & Lecture Discussion Room**: In the Course Player (`/student/course/:courseId/learn`), learners and instructors chat in real time with instant message broadcast.
   - **Real-Time Notification Broadcast**: Instant toasts and badge updates when assignments are published, submissions are graded, or attendance is logged.
   - **Real-Time Progress & Enrolment Synchronization**.

3. **Production Clerk Authentication**:
   - Supports both `pk_test_` and `pk_live_` publishable keys from [Clerk Dashboard](https://dashboard.clerk.com).
   - `ClerkAuthBridge` automatically synchronizes authenticated user identities, JWT tokens, and role metadata (`Student`, `Instructor`, `Admin`) with the database and Axios interceptors.
   - Built-in instant role switcher for quick preview and evaluation.

---

## 🎨 Design System

- **Primary Color:** Deep Navy (`#1F3864`)
- **Accent Color:** Electric Blue (`#2E75B6`)
- **Backgrounds:** `#F8FAFC` (Light) / `#0F172A` (Dark)
- **Typography:** Google Fonts Inter (headings bold, body regular)
- **Style:** Clean, minimal, modern (inspired by Udemy + Notion)
- **Responsiveness:** Mobile-first (375px → 1440px)
- **Dark Mode:** Supported natively via Tailwind `dark:` classes with smooth transitions

---

## 👥 Three Roles & Capabilities

### 1. Student Portal (`/student`)
- **Overview:** Enrolled courses with **RC Progress** circular progress bars, recent activity feed, and upcoming assignment deadlines.
- **My Courses:** Course cards showing progress %, filtered by In-Progress, Completed, or All, with `humanize-duration` formatted lengths.
- **Dedicated Course Player (`/student/course/:courseId/learn`):**
  - Left sidebar: curriculum with lesson list & green checkmarks for completed lessons
  - Center: **React YouTube** player for lecture videos
  - Below player: 
    - **Tab 1: Lecture Notes & Syllabus** rendered from **Quill** rich HTML
    - **Tab 2: Live Cohort Discussion & Q&A** powered by **Socket.io** WebSockets
  - **RC Progress** linear bar showing overall course completion percentage
  - Previous / Next lesson navigation & "Mark as Complete" toggle
- **Assignments (`/student/assignments`):** Deadline countdowns, max marks, and feedback display.
- **Submit Assignment (`/student/assignments/:id/submit`):** File upload input + implementation notes textarea.
- **Attendance Registry (`/student/attendance`):** Circular RC Progress showing attendance rate, sessions breakdown (Present / Absent / Late).
- **Academic Results (`/student/results`):** Cumulative GPA display (e.g. 3.90 / 4.00), official grade card table (Course | Marks | Grade | Remarks), and transcript download.
- **Profile (`/student/profile`):** Embedded **Clerk** UserProfile component or verified academic badge view.

### 2. Instructor Portal (`/instructor`)
- **Overview:** Total students, courses published, pending submissions to grade, and revenue summary cards.
- **My Courses (`/instructor/courses`):** Course catalog with edit, delete, preview, and live publish/unpublish toggle actions.
- **Create / Edit Course (`/instructor/courses/create`):**
  - Course title, category dropdown, price, cover thumbnail URL
  - **Quill** rich text editor for comprehensive course descriptions
  - **Curriculum Builder:** Add sections and lessons stored as `uniqid`-keyed objects with YouTube URLs and lecture notes
  - Publish / Unpublish toggle
- **Upload Material (`/instructor/materials`):** Drag-and-drop file upload for PDF guides, video resources, and code archives.
- **Assignments Manager (`/instructor/assignments`):**
  - Create assignment: title, Quill description, datetime picker, max marks
  - View submissions table: student name, file, submitted notes
  - **Inline grading:** Enter marks and feedback remarks with instant saving and real-time alert dispatch
- **Attendance Manager (`/instructor/attendance`):**
  - Course selector + date picker
  - Student roster with Present / Late / Absent radio buttons
  - Submit attendance button
- **Results Publisher (`/instructor/results`):**
  - Select student + course → enter total marks → auto-compute grade (A+, A, B, C, D, F) & GPA → publish official result.

### 3. Admin Portal (`/admin`)
- **Overview Cards:** Total Users, Total Courses, Total Enrolments, Active This Month.
- **Revenue & Enrolments Chart:** Interactive dual-gradient area/line chart powered by **Recharts**.
- **Users Table (`/admin/users`):** User directory with role badges, role editor, and deactivate/reactivate actions.
- **Courses Table (`/admin/courses`):** Moderation controls, status toggling, and purge capability.
- **Enrolments Table (`/admin/enrolments`):** Detailed student enrollment registry with live RC Progress line bars.
- **Reports & Export (`/admin/reports`):** 4 direct CSV export downloads (Users, Courses, Financial Revenue, Attendance).

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS (Deep Navy `#1F3864`, Electric Blue `#2E75B6`, Inter font)
- **Routing:** React Router DOM v6/v7 with `ProtectedRoute` guards
- **Authentication:** Clerk (`@clerk/clerk-react`) with full JWT synchronization
- **WebSockets:** `socket.io-client` & `socket.io`
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
  - Slices: `authSlice`, `coursesSlice`, `enrolmentsSlice`, `assignmentsSlice`, `attendanceSlice`, `resultsSlice`, `notificationsSlice`
- **API & Networking:** Axios instance with Bearer token request interceptor
- **Video Playback:** React YouTube (`react-youtube`)
- **Rich Text Editing:** Quill (`react-quill-new`) & `QuillViewer`
- **Progress Tracking:** RC Progress (`rc-progress` Line & Circle)
- **Charts:** Recharts (`recharts`)
- **Icons:** Lucide React (`lucide-react`)
- **Formatting & Utils:** `humanize-duration`, `uniqid`
- **Backend:** Node.js + Express + Socket.io server (`server.js`) with CORS, Multer file upload, and persistent JSON database.

---

## 🚀 Running the Project

### 1. Start the Backend Real-Time API Server (Port 5000)
```bash
cd Backend
npm install
npm run start
```
The API server will run at: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)

### 2. Start the Frontend Development Server (Port 5173)
```bash
cd Frontend
npm install
npm run dev
```
The web application will run at: `http://localhost:5173`

---

## 📁 Folder Structure

```
LearnFlow/
├── Backend/
│   ├── data/
│   │   ├── db.js              # Persistent JSON database engine
│   │   ├── db.json            # Persistent storage file
│   │   └── seedData.js        # Seed courses, users, enrolments, assignments
│   ├── routes/
│   │   ├── courses.js         # Course CRUD & real-time broadcasts
│   │   ├── enrolments.js      # Progress & completion
│   │   ├── assignments.js     # Assignments & inline grading
│   │   ├── attendance.js      # Attendance logging & statistics
│   │   ├── results.js         # Auto-calculated grades & GPA
│   │   ├── users.js           # Users & Clerk synchronization
│   │   ├── materials.js       # File resource uploads
│   │   ├── stats.js           # Admin & instructor analytics
│   │   ├── notifications.js   # Notification alerts
│   │   └── discussions.js     # Real-time Q&A discussions
│   ├── server.js              # Express + Socket.io server
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/        # ProgressBar, CircularProgress, QuillViewer, Toast, EmptyState
    │   │   ├── course/        # CourseCard
    │   │   └── layout/        # Navbar, Sidebar, DashboardLayout, ProtectedRoute
    │   ├── hooks/             # useTheme, useAuthRole
    │   ├── pages/
    │   │   ├── public/        # LandingPage, CourseListing, CourseDetail, About, Contact
    │   │   ├── student/       # Overview, MyCourses, CoursePlayer, Assignments, Attendance, Results, Profile
    │   │   ├── instructor/    # Overview, MyCourses, CreateEditCourse, Materials, Assignments, Attendance, Results
    │   │   ├── admin/         # Overview, Users, Courses, Enrolments, Reports
    │   │   └── auth/          # SignInPage, SignUpPage
    │   ├── redux/
    │   ├── utils/             # Axios instance, socket.js, constants
    │   ├── App.jsx            # Real-time socket sync & ClerkAuthBridge
    │   ├── index.css          # Tailwind CSS tokens
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```
