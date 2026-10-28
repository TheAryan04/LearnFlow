import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Clerk sessions register a getter here; demo sessions fall back to the stored demo token.
let clerkTokenGetter = null;
export const setClerkTokenGetter = (fn) => { clerkTokenGetter = fn; };

export async function getAuthToken() {
  if (clerkTokenGetter) {
    const token = await clerkTokenGetter();
    if (token) return token;
  }
  return localStorage.getItem('learnflow_token');
}

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const err = new Error(error.response?.data?.message || error.message || 'Something went wrong');
    err.status = error.response?.status;
    err.code = error.response?.data?.code;
    return Promise.reject(err);
  }
);

export const setAuthToken = (token) => {
  if (token) localStorage.setItem('learnflow_token', token);
  else localStorage.removeItem('learnflow_token');
};

export default api;
