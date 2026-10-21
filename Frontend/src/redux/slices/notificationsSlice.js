import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/notifications');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.put('/notifications/read-all');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markOneNotificationRead = createAsyncThunk(
  'notifications/markOneNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = 0;
      })
      .addCase(markOneNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
          state.unreadCount = state.notifications.filter((n) => !n.read).length;
        }
      });
  },
});

export default notificationsSlice.reducer;
