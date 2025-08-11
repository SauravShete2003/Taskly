import api from './api';

// Tries common places: data.token, data.accessToken, data.jwt, or nested under data.data
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
      {
        _skipAuthHeader: true,   // don't send stale token
        _skipAuthRedirect: true, // don't hard-redirect on 401 here
      }
    );

    // Your API shape: { success, message, data: {...} }
    const token =
      extractToken(res.data?.data) || extractToken(res.data);

    if (!token) {
      console.warn('Login response missing token. Response was:', res.data);
      throw new Error('NO_TOKEN');
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

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  updateProfile: async (userData) => {
    const res = await api.put('/auth/profile', userData);
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await api.put('/auth/change-password', passwordData);
    return res.data;
  },
};

export default authService;