import User from '../models/User.js';
import { 
  successResponse, 
  // errorResponse, 
  notFoundResponse,
  forbiddenResponse,
  asyncHandler 
} from '../utils/responseHandler.js';
import { HTTP_STATUS } from '../utils/constants.js';

// Get all users (for admin purposes)
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true })
    .select('-password')
    .sort({ createdAt: -1 });

  return successResponse(res, { users });
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select('-password');

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  return successResponse(res, { user });
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, avatar } = req.body;
  const currentUser = req.user;

  // Check if user is updating their own profile or is admin
  if (currentUser._id.toString() !== id && currentUser.role !== 'admin') {
    return forbiddenResponse(res, 'You can only update your own profile');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (avatar) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  return successResponse(res, { user }, 'User updated successfully');
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Check if user is deleting their own account or is admin
  if (currentUser._id.toString() !== id && currentUser.role !== 'admin') {
    return forbiddenResponse(res, 'You can only delete your own account');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  return successResponse(res, null, 'User deactivated successfully');
}); 