// src/pages/Profile.jsx
import { useEffect, useRef, useState } from 'react';
import api, { fileUrl } from '../services/api';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [user, setUser] = useState(null);

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get('/users/me')
      .then((res) => {
        if (!alive) return;
        const u = res.data?.data?.user || res.data?.user || res.data;
        setUser(u);
        setName(u?.name || '');
        setEmail(u?.email || '');
        setAvatarPreview(fileUrl(u?.avatar));
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
    return () => {
      alive = false;
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    };
  }, []);

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const res = await api.put('/users/me', { name });
      const u = res.data?.data?.user || res.data?.user;
      setUser(u);
      setMessage('Profile updated');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, GIF allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Max file size is 5MB');
      return;
    }
    setError('');
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    setUploading(true);
    setMessage('');
    setError('');
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const res = await api.post('/users/me/avatar', fd);
      const u = res.data?.data?.user || res.data?.user;
      setUser(u);
      setAvatarFile(null);
      setAvatarPreview(fileUrl(u?.avatar));
      setMessage('Avatar updated');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    setPwdSaving(true);
    setMessage('');
    setError('');
    try {
      await api.put('/users/me/password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setPwdSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account?')) return;
    if (!window.confirm('This will deactivate your account. Continue?')) return;
    setDeleting(true);
    setMessage('');
    setError('');
    try {
      await api.delete('/users/me');
      // Optional: clear token and redirect
      // localStorage.removeItem('token');
      // window.location.href = '/login';
      setMessage('Account deactivated');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-4" />
        <div className="animate-pulse h-40 w-40 bg-gray-200 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      {(message || error) && (
        <div
          className={`mb-4 rounded p-3 text-sm ${
            error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {error || message}
        </div>
      )}

      {/* Avatar section */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-medium mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <img
            src={avatarPreview || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjgwIiB5PSI4MCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTBBQyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5BdmF0YXI8L3RleHQ+Cjwvc3ZnPgo='}
            alt="avatar"
            className="h-24 w-24 rounded-full object-cover border"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9rZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjgwIiB5PSI4MCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTBBQyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5BdmF0YXI8L3RleHQ+Cjwvc3ZnPgo=';
            }}
          />
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            <button
              onClick={handlePickAvatar}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              type="button"
            >
              Choose File
            </button>
            <button
              onClick={handleUploadAvatar}
              disabled={!avatarFile || uploading}
              className={`px-3 py-2 rounded text-white ${
                avatarFile && !uploading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300'
              }`}
              type="button"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <form onSubmit={handleSaveProfile} className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-medium mb-4">Profile Info</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
              value={email}
              readOnly
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Change password */}
      <form onSubmit={handleChangePassword} className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-medium mb-4">Change Password</h2>
        {/* Hidden username field for accessibility - helps password managers */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          className="hidden"
          value={email}
          readOnly
        />
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">New password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirm password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            disabled={pwdSaving}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {pwdSaving ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-medium text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-3">
          Deactivate your account. You can re-activate later by contacting support or through admin.
        </p>
        <button
          onClick={handleDeactivate}
          disabled={deleting}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
        >
          {deleting ? 'Deactivating...' : 'Deactivate account'}
        </button>
      </div>
    </div>
  );
}