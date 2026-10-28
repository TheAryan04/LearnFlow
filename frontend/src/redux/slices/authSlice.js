import { createSlice } from '@reduxjs/toolkit';
import { ROLES } from '../../utils/constants';

let savedUser = null;
try {
  savedUser = JSON.parse(localStorage.getItem('learnflow_user') || 'null');
} catch {
  localStorage.removeItem('learnflow_user');
}

const initialState = {
  user: savedUser,
  token: localStorage.getItem('learnflow_token'),
  role: savedUser?.role || ROLES.STUDENT,
  isAuthenticated: Boolean(savedUser && localStorage.getItem('learnflow_token')),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.role = user?.role || ROLES.STUDENT;
      state.isAuthenticated = true;
      localStorage.setItem('learnflow_user', JSON.stringify(user));
      if (token) localStorage.setItem('learnflow_token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = ROLES.STUDENT;
      state.isAuthenticated = false;
      localStorage.removeItem('learnflow_token');
      localStorage.removeItem('learnflow_user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
