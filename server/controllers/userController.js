import User from '../models/User.js';
import { successResponse, errorResponse, asyncHandler } from '../utils/responseHandler.js';

// Search users by name or email
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return errorResponse(
      res,
      'Search query must be at least 2 characters long',
      400
    );
  }

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
    _id: { $ne: req.user._id }, // Exclude current logged-in user
  })
    .select('_id name email avatar')
    .limit(10);

  return successResponse(res, { users });
});
