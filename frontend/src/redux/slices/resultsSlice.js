import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchResults = createAsyncThunk(
  'results/fetchResults',
  async (studentId = 'user_student_1', { rejectWithValue }) => {
    try {
      const res = await api.get('/results', { params: { studentId } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const publishResult = createAsyncThunk(
  'results/publishResult',
  async (resultData, { rejectWithValue }) => {
    try {
      const res = await api.post('/results', resultData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const resultsSlice = createSlice({
  name: 'results',
  initialState: {
    results: [],
    cumulativeGpa: 0,
    totalGradedCourses: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload?.results || [];
        state.cumulativeGpa = action.payload?.cumulativeGpa || 0;
        state.totalGradedCourses = action.payload?.totalGradedCourses || 0;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(publishResult.fulfilled, (state, action) => {
        const index = state.results.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.results[index] = action.payload;
        } else {
          state.results.unshift(action.payload);
        }
      });
  },
});

export default resultsSlice.reducer;
