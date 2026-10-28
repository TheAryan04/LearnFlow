# LearnFlow Redesign

LearnFlow is an existing online learning platform (github.com/TheAryan04/LearnFlow) where students take courses, instructors run them, and admins oversee everything, with live updates.
This project brings that repository in and gives every screen a new calm, editorial look, plus small usability improvements, while keeping all current features working.

## Who it's for
- **Students**: follow courses, submit assignments, check attendance and results.
- **Instructors**: create and manage courses, materials, assignments, attendance and grades.
- **Admins**: manage users, courses and enrolments, and view reports.
- **Visitors**: browse the public site and course catalogue before signing up.

## Core features and experience
All existing features stay and keep working the same way. Only the look and a few usability details change.

**Public**
- Home page, course catalogue, course details, sign-in and sign-up.

**Student area**
- Overview, My Courses, Course Player, Assignments, Attendance, Results, Profile.

**Instructor area**
- Overview, My Courses, Create/Edit Course, Materials, Assignments, Attendance, Results.

**Admin area**
- Overview, Users, Courses, Enrolments, Reports.

**Kept as they are**
- Real sign-in through the existing Clerk account, with Student, Instructor and Admin roles.
- Live notifications and progress that update without a refresh.
- Course discussions.

**Small usability improvements**
- Clearer side navigation for each role, with the current page highlighted.
- Friendly empty screens ("No assignments yet") that point to the next step, instead of blank areas.
- Search and filter on course and user lists.
- Loading placeholders, plus clear success and error messages after actions.
- Layouts that work on phones as well as desktops.

## User flow
1. A visitor lands on the home page, browses the catalogue and opens a course.
2. They sign up or sign in. LearnFlow sends them to the dashboard for their role.
3. **Student**: opens a course in the player, works through the materials, submits assignments, then checks attendance and results.
4. **Instructor**: creates or edits a course, uploads materials, posts assignments, marks attendance and enters results.
5. **Admin**: reviews the overview, manages users and enrolments, and opens reports.
6. Notifications appear live for every role as events happen.

## UI/UX feel
- Calm and editorial, like a well-designed study journal.
- Warm off-white pages, a deep ink colour for text, and one restrained accent colour.
- Elegant serif headings paired with a clean, readable body font.
- Lots of space, left-aligned layouts and soft dividers instead of heavy boxes.
- Gentle motion: soft page entrances and subtle hover states.
- The sign-in screens are restyled to match the new look.

## Implementation phases

**Phase 1 (MVP, built now)**
- Bring in the LearnFlow repository and get it running here.
- Redesign every public, student, instructor and admin screen in the calm editorial style.
- Keep Clerk sign-in, roles, live updates and all current features working.
- Add the small usability improvements listed above.

**Phase 2**
- Deeper usability work based on feedback, for example:
  - a richer course player (progress markers, next/previous lesson)
  - bulk actions for instructors and admins
  - improved charts in reports

**Phase 3**
- Optional dark reading mode, accessibility review, and final visual polish across all devices.

## Assumptions
- The app's features and data stay as they are in the repository. No new features beyond the small usability improvements.
- Sign-in stays on your existing Clerk account. You will be asked for your Clerk keys securely before sign-in is tested. Until then, signed-in screens can't be previewed.
- Roles continue to come from your Clerk user settings (Student, Instructor or Admin). New users default to Student.
- The repository's built-in sample data is used, so the screens have content to show.
- The app is moved onto this platform's standard setup where needed, with the same behaviour.
- Fonts, colours and the exact accent colour are chosen to fit the calm editorial direction.
- The interface stays in English.
