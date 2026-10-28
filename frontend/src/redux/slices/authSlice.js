import { createSlice } from '@reduxjs/toolkit';
import { ROLES } from '../../utils/constants';

let savedUser = null;
try {
  savedUser = JSON.parse(localStorage.getItem('learnflow_user') || 'null');
} catch {
  localStorage.removeItem('learnflow_user');
}
const savedMode = localStorage.getItem('learnflow_auth_mode');

const initialState = {
  user: savedUser,
  token: localStorage.getItem('learnflow_token'),
  mode: savedUser ? savedMode || 'demo' : null,
  role: savedUser?.role || ROLES.STUDENT,
  isAuthenticated: Boolean(savedUser),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token = null, mode = 'demo' } = action.payload;
      state.user = user;
      state.token = token;
      state.mode = mode;
      state.role = user?.role || ROLES.STUDENT;
      state.isAuthenticated = true;
      localStorage.setItem('learnflow_user', JSON.stringify(user));
      localStorage.setItem('learnflow_auth_mode', mode);
      if (token) localStorage.setItem('learnflow_token', token);
      else localStorage.removeItem('learnflow_token');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.mode = null;
      state.role = ROLES.STUDENT;
      state.isAuthenticated = false;
      localStorage.removeItem('learnflow_token');
      localStorage.removeItem('learnflow_user');
      localStorage.removeItem('learnflow_auth_mode');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
