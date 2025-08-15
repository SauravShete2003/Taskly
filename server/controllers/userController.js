// server/controllers/userController.js
import User from '../models/User.js';
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  asyncHandler,
} from '../utils/responseHandler.js';

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