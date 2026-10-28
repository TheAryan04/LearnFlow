import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import coursesReducer from './slices/coursesSlice';
import enrolmentsReducer from './slices/enrolmentsSlice';
import assignmentsReducer from './slices/assignmentsSlice';
import attendanceReducer from './slices/attendanceSlice';
import resultsReducer from './slices/resultsSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    enrolments: enrolmentsReducer,
    assignments: assignmentsReducer,
    attendance: attendanceReducer,
    results: resultsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
