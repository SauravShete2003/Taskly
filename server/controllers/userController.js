// server/controllers/userController.js
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  asyncHandler,
} from '../utils/responseHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helpers for local avatar cleanup
function isLocalAvatarPath(p) {
  return typeof p === 'string' && p.startsWith('/uploads/avatars/');
}

function deleteLocalFileIfExists(relPath) {
  try {
    // relPath starts with /uploads/... so prefix with . to resolve under project root
    const fullPath = path.resolve(__dirname, '..', `.${relPath}`);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (_) {}
}

// Get all users (admin only) with optional pagination
export const getUsers = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return forbiddenResponse(res, 'Only admins can view all users');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const filter = { isActive: true };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return successResponse(res, {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Get user by ID (self or admin)
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return forbiddenResponse(res, 'You can only view your own profile');
  }

  const user = await User.findById(id).select('-password');
  if (!user) return notFoundResponse(res, 'User not found');

  return successResponse(res, { user });
});

// Get current authenticated user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return notFoundResponse(res, 'User not found');

  return successResponse(res, { user });
});

// Update user (self or admin)
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, avatar } = req.body;

  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return forbiddenResponse(res, 'You can only update your own profile');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) return notFoundResponse(res, 'User not found');

  return successResponse(res, { user }, 'User updated successfully');
});

// Update current authenticated user
export const updateCurrentUser = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) return notFoundResponse(res, 'User not found');

  return successResponse(res, { user }, 'User updated successfully');
});

// Delete (deactivate) user (self or admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() !== id && req.user.role !== 'admin') {
    return forbiddenResponse(res, 'You can only delete your own account');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!user) return notFoundResponse(res, 'User not found');

  return successResponse(res, null, 'User deactivated successfully');
});

// Delete (deactivate) current authenticated user
export const deleteCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!user) return notFoundResponse(res, 'User not found');

  return successResponse(res, null, 'User deactivated successfully');
});

// Upload or change avatar (current user)
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return forbiddenResponse(res, 'No file uploaded');
  }

  try {
    // Store a relative path in DB; served statically via /uploads
    const relativePath = `/uploads/avatars/${req.file.filename}`;

    // Fetch user to get old avatar for cleanup
    const user = await User.findById(req.user._id);
    if (!user) return notFoundResponse(res, 'User not found');

    const oldAvatar = user.avatar;

    user.avatar = relativePath;
    await user.save();

    // Cleanup old local avatar if it was local
    if (isLocalAvatarPath(oldAvatar)) {
      deleteLocalFileIfExists(oldAvatar);
    }

    const sanitized = await User.findById(req.user._id).select('-password');
    return successResponse(res, { user: sanitized }, 'Avatar updated successfully');
  } catch (error) {
    // Clean up uploaded file if user save fails
    if (req.file) {
      const filePath = path.join(__dirname, '..', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    throw error;
  }
});

// Change password (current user)
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    return forbiddenResponse(res, 'All password fields are required');
  }
  if (newPassword !== confirmPassword) {
    return forbiddenResponse(res, 'New password and confirmation do not match');
  }
  if (newPassword.length < 8) {
    return forbiddenResponse(res, 'New password must be at least 8 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) return notFoundResponse(res, 'User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return forbiddenResponse(res, 'Current password is incorrect');
  }
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    return forbiddenResponse(
      res,
      'New password must be different from current password'
    );
  }

  // If your User model hashes on save via pre('save'), this will hash it.
  // If not, hash here instead:
  // user.password = await bcrypt.hash(newPassword, 10);
  user.password = newPassword;
  await user.save();

  return successResponse(res, null, 'Password updated successfully');
});