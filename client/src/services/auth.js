// client/src/services/auth.js
import api from './api';

function extractToken(root) {
  const candidates = [
    root?.data?.token,
    root?.token,
    root?.data?.accessToken,
    root?.accessToken,
    root?.data?.access_token,
    root?.access_token,
    root?.data?.jwt,
    root?.jwt,
  ];
  return candidates.find(Boolean) || null;
}

export const authService = {
  login: async (email, password) => {
    const res = await api.post(
      '/auth/login',
      { email, password },
    );

    // Try multiple shapes: nested data, top-level
    let token = extractToken(res.data?.data) || extractToken(res.data);

    // Fallback: some backends send token in headers (x-access-token or authorization)
    if (!token) {
      const hdrToken = res?.headers?.['x-access-token'] || res?.headers?.['x_access_token'] || res?.headers?.authorization;
      if (hdrToken) {
        // strip Bearer if present
        token = hdrToken.replace(/^Bearer\s+/i, '');
      }
    }

    // Additional fallback: sometimes proxies strip body but leave the
    // raw response text or return the token as a plain string in res.data.
    if (!token && typeof res.data === 'string' && res.data.trim()) {
      const candidate = res.data.trim();
      // If it looks like a JWT (three dot-separated parts) or a Bearer string,
      // accept it as the token.
      if (/^Bearer\s+/i.test(candidate)) {
        token = candidate.replace(/^Bearer\s+/i, '');
      } else if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(candidate)) {
        token = candidate;
      }
    }

    // Final defensive check: maybe the server attached the token to the top-level
    // response object in a non-standard place; try a shallow search.
    if (!token) {
      for (const key of ['token', 'accessToken', 'access_token', 'jwt']) {
        if (res[key]) {
          token = res[key];
          break;
        }
      }
    }

    if (!token) {
      // Provide more helpful error with the server response attached
      console.warn('Login response missing token. Response was:', {
        status: res?.status,
        headers: res?.headers,
        data: res?.data
      });
      const message = (res?.data && res.data.message) || 'Server did not include a token. Check API response (data.token/accessToken or Authorization header).';
      const err = new Error(message);
      err.response = res;
      throw err;
    }

    localStorage.setItem('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    window.dispatchEvent(new Event('authChange'));

    return res.data;
  },

  register: async (userData) => {
    const res = await api.post(
      '/auth/register',
      userData,
      { _skipAuthHeader: true, _skipAuthRedirect: true }
    );
    const token =
      extractToken(res.data?.data) || extractToken(res.data);

    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      window.dispatchEvent(new Event('authChange'));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
    window.dispatchEvent(new Event('authChange'));
  },

  // Aligned to backend /users/me
  getProfile: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },

  updateProfile: async (userData) => {
    const res = await api.put('/users/me', userData);
    return res.data.user;
  },

  async searchUsers(query) {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    // normalize to return an array of user objects
    return (
      res?.data?.data?.users || res?.data?.users || res?.data || []
    );
  },
};
export default authService;