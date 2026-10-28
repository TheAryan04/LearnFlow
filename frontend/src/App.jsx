import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import { ToastProvider, useToast } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import socket from './utils/socket';
import { fetchNotifications } from './redux/slices/notificationsSlice';

// Layouts & Guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { ROLES } from './utils/constants';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import CourseListingPage from './pages/public/CourseListingPage';
import CourseDetailPage from './pages/public/CourseDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';

// Student Pages
import StudentOverview from './pages/student/StudentOverview';
import StudentMyCourses from './pages/student/StudentMyCourses';
import CoursePlayerPage from './pages/student/CoursePlayerPage';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentSubmitAssignment from './pages/student/StudentSubmitAssignment';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentResults from './pages/student/StudentResults';
import StudentProfile from './pages/student/StudentProfile';

// Instructor Pages
import InstructorOverview from './pages/instructor/InstructorOverview';
import InstructorCourses from './pages/instructor/InstructorCourses';
import CreateEditCourse from './pages/instructor/CreateEditCourse';
import InstructorMaterials from './pages/instructor/InstructorMaterials';
import InstructorAssignments from './pages/instructor/InstructorAssignments';
import InstructorAttendance from './pages/instructor/InstructorAttendance';
import InstructorResults from './pages/instructor/InstructorResults';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminEnrolments from './pages/admin/AdminEnrolments';
import AdminReports from './pages/admin/AdminReports';

// Real-Time Socket Notifications
function RealTimeSyncWrapper({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?.id);
  const toast = useToast();
  const toastRef = React.useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchNotifications());

    const handleNotification = (notif) => {
      if (!isAuthenticated || (notif.userId && notif.userId !== userId)) return;
      dispatch(fetchNotifications());
      if (notif.type === 'success') toastRef.current.success(notif.message);
      else toastRef.current.info(notif.message);
    };

    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [dispatch, isAuthenticated, userId]);

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/courses" element={<CourseListingPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Dedicated Course Player with Real-time Chat */}
      <Route
        path="/student/course/:courseId/learn"
        element={<CoursePlayerPage />}
      />

      {/* Student Portal */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<StudentOverview />} />
          <Route path="/student/courses" element={<StudentMyCourses />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/assignments/:id/submit" element={<StudentSubmitAssignment />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* Instructor Portal */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/instructor" element={<InstructorOverview />} />
          <Route path="/instructor/courses" element={<InstructorCourses />} />
          <Route path="/instructor/courses/create" element={<CreateEditCourse />} />
          <Route path="/instructor/courses/:id/edit" element={<CreateEditCourse />} />
          <Route path="/instructor/materials" element={<InstructorMaterials />} />
          <Route path="/instructor/assignments" element={<InstructorAssignments />} />
          <Route path="/instructor/attendance" element={<InstructorAttendance />} />
          <Route path="/instructor/results" element={<InstructorResults />} />
        </Route>
      </Route>

      {/* Admin Portal */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/enrolments" element={<AdminEnrolments />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const innerApp = (
    <ToastProvider>
      <ErrorBoundary>
        <RealTimeSyncWrapper>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RealTimeSyncWrapper>
      </ErrorBoundary>
    </ToastProvider>
  );

  return (
    <Provider store={store}>
      {innerApp}
    </Provider>
  );
}
