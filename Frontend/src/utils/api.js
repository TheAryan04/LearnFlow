import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Clerk JWT token to every request via Axios interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('learnflow_token') || sessionStorage.getItem('clerk_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.warn('[LearnFlow API Response Interceptor Caught]:', error.message);
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('learnflow_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('learnflow_token');
    delete api.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default api;
