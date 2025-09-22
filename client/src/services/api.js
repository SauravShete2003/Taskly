// client/src/services/api.js
import axios from 'axios';

// Prefer an explicit environment variable. When not set, use localhost only
// for local development. For deployed frontends (e.g. Render/Netlify/Vercel)
// a relative '/api' path is safer so the browser hits the same host where the
// backend is proxied or hosted, instead of trying to connect to localhost.
const explicitUrl = process.env.REACT_APP_API_URL;
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = explicitUrl || (isLocalhost ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, 
});

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
export const fileUrl = (maybeRelative) => {
  if (!maybeRelative) return '';
  if (maybeRelative.startsWith('http')) return maybeRelative;
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${maybeRelative}`;
};

export default api;
