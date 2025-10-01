import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse,
  unauthorizedResponse,
  asyncHandler 
} from '../utils/responseHandler.js';
import { MESSAGES, HTTP_STATUS } from '../utils/constants.js';

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 'User with this email already exists', HTTP_STATUS.CONFLICT);
  }

  // Create new user
  const user = new User({
    name,
    email,
    password
  });

  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('X-Access-Token', token);

  return successResponse(
    res,
    {
      user: user.getProfile(),
      token
    },
    MESSAGES.USER_REGISTERED,
    HTTP_STATUS.CREATED
  );
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return unauthorizedResponse(res, MESSAGES.INVALID_CREDENTIALS);
  }

  // Check if user is active
  if (!user.isActive) {
    return unauthorizedResponse(res, MESSAGES.ACCOUNT_DEACTIVATED);
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return unauthorizedResponse(res, MESSAGES.INVALID_CREDENTIALS);
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Debug logging: show that we're returning a token for this user
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_AUTH === 'true') {
    console.info('[authController] login:', {
      userId: user._id.toString(),
      tokenPreview: token ? `${token.slice(0, 10)}...` : null,
    });
  }

  // Also expose the token in response headers so frontends behind
  // proxies or with altered bodies can still extract it from headers.
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('X-Access-Token', token);

  return successResponse(res, {
    user: user.getProfile(),
    token
  }, MESSAGES.LOGIN_SUCCESSFUL);
});

// Get current user profile
export const getProfile = asyncHandler(async (req, res) => {
  return successResponse(res, {
    user: req.user
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;

  const updateData = {};
  if (name) updateData.name = name;
  if (avatar) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  return successResponse(res, {
    user
  }, 'Profile updated successfully');
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Get user with password
  const user = await User.findById(userId).select('+password');
  
  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return errorResponse(res, 'Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return successResponse(res, null, 'Password changed successfully');
}); 