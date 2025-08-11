import axios from 'axios';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: false, // token-based auth. If your backend uses cookies, set true and remove auth header logic.
});

// Attach Authorization header unless explicitly skipped
api.interceptors.request.use(
  (config) => {
    if (!config._skipAuthHeader) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401s from protected calls only (not login/register)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const cfg = error?.config || {};
    const url = cfg?.url || '';

    const isAuthEndpoint =
      url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !cfg._skipAuthRedirect && !isAuthEndpoint) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('authChange'));
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;