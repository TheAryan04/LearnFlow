import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchEnrolments = createAsyncThunk(
  'enrolments/fetchEnrolments',
  async (userId = 'user_student_1', { rejectWithValue }) => {
    try {
      const res = await api.get('/enrolments', { params: { userId } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const enrolCourse = createAsyncThunk(
  'enrolments/enrolCourse',
  async ({ userId = 'user_student_1', courseId }, { rejectWithValue }) => {
    try {
      const res = await api.post('/enrolments', { userId, courseId });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateLessonProgress = createAsyncThunk(
  'enrolments/updateLessonProgress',
  async ({ enrolmentId, lessonId, completed, progress }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/enrolments/${enrolmentId}/progress`, {
        lessonId,
        completed,
        progress,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const enrolmentsSlice = createSlice({
  name: 'enrolments',
  initialState: {
    enrolments: [],
    activeEnrolment: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveEnrolment: (state, action) => {
      state.activeEnrolment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrolments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrolments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolments = action.payload;
      })
      .addCase(fetchEnrolments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(enrolCourse.fulfilled, (state, action) => {
        const exists = state.enrolments.some((e) => e.id === action.payload.id);
        if (!exists) {
          state.enrolments.unshift(action.payload);
        }
      })
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        const index = state.enrolments.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.enrolments[index] = {
            ...state.enrolments[index],
            ...action.payload,
          };
        }
        if (state.activeEnrolment?.id === action.payload.id) {
          state.activeEnrolment = {
            ...state.activeEnrolment,
            ...action.payload,
          };
        }
      });
  },
});

export const { setActiveEnrolment } = enrolmentsSlice.actions;
export default enrolmentsSlice.reducer;
