import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await api.get('/assignments', { params: { courseId } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const res = await api.post('/assignments', assignmentData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSubmissions = createAsyncThunk(
  'assignments/fetchSubmissions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/assignments/submissions', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitAssignment = createAsyncThunk(
  'assignments/submitAssignment',
  async ({ assignmentId, formData }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const gradeSubmission = createAsyncThunk(
  'assignments/gradeSubmission',
  async ({ submissionId, marks, feedback }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/assignments/submissions/${submissionId}/grade`, {
        marks,
        feedback,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    submissions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAssignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createAssignment
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.assignments.unshift(action.payload);
      })
      // fetchSubmissions
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
      })
      // submitAssignment
      .addCase(submitAssignment.fulfilled, (state, action) => {
        const index = state.submissions.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = action.payload;
        } else {
          state.submissions.unshift(action.payload);
        }
      })
      // gradeSubmission
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        const index = state.submissions.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = action.payload;
        }
      });
  },
});

export default assignmentsSlice.reducer;
