import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/attendance', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitAttendance = createAsyncThunk(
  'attendance/submitAttendance',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const res = await api.post('/attendance', attendanceData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    sessions: [],
    studentStats: {
      totalSessions: 0,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      attendanceRate: 100,
      history: [],
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.history) {
          state.studentStats = action.payload;
        } else if (Array.isArray(action.payload)) {
          state.sessions = action.payload;
        }
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitAttendance.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
      });
  },
});

export default attendanceSlice.reducer;
