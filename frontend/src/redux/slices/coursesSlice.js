import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/courses', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCoursePage = createAsyncThunk(
  'courses/fetchCoursePage',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/courses', { params });
      return {
        courses: response.data || [],
        count: response.count || 0,
        page: response.page || 1,
        limit: response.limit || params.limit || 12,
        totalPages: response.totalPages || 0,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchManagedCourses = createAsyncThunk(
  'courses/fetchManagedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/courses/all');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const { thumbnailFile, ...course } = courseData;
      if (thumbnailFile) {
        const form = new FormData();
        form.append('course', JSON.stringify(course));
        form.append('thumbnail', thumbnailFile);
        const res = await api.post('/courses', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        return res.data;
      }
      const res = await api.post('/courses', course);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { thumbnailFile, ...course } = data;
      if (thumbnailFile) {
        const form = new FormData();
        form.append('course', JSON.stringify(course));
        form.append('thumbnail', thumbnailFile);
        const res = await api.put(`/courses/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
        return res.data;
      }
      const res = await api.put(`/courses/${id}`, course);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${courseId}`);
      return courseId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    catalogueCount: 0,
    cataloguePage: 1,
    catalogueLimit: 12,
    catalogueTotalPages: 0,
    catalogueRequestId: null,
    selectedCourse: null,
    loading: false,
    error: null,
    categoryFilter: 'All',
    searchQuery: '',
    sortBy: 'popular',
  },
  reducers: {
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoursePage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.catalogueRequestId = action.meta.requestId;
      })
      .addCase(fetchCoursePage.fulfilled, (state, action) => {
        if (state.catalogueRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.catalogueRequestId = null;
        state.courses = action.payload.courses;
        state.catalogueCount = action.payload.count;
        state.cataloguePage = action.payload.page;
        state.catalogueLimit = action.payload.limit;
        state.catalogueTotalPages = action.payload.totalPages;
      })
      .addCase(fetchCoursePage.rejected, (state, action) => {
        if (state.catalogueRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.catalogueRequestId = null;
        state.error = action.payload;
      })
      // fetchCourses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchManagedCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchManagedCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchManagedCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchCourseById
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createCourse
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
      })
      // updateCourse
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.selectedCourse?.id === action.payload.id) {
          state.selectedCourse = action.payload;
        }
      })
      // deleteCourse
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter((c) => c.id !== action.payload);
      });
  },
});

export const { setCategoryFilter, setSearchQuery, setSortBy, clearSelectedCourse } = coursesSlice.actions;
export default coursesSlice.reducer;
