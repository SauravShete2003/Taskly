import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js'; // <-- ADDED: So we can find the project
import { asyncHandler, notFoundResponse, forbiddenResponse } from '../utils/responseHandler.js'; // <-- ADDED: For consistent error handling

// --- No changes to the function below ---
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// --- No changes to the function below ---
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// --- No changes to the function below ---
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

// --- No changes to the function below ---
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// ✅ This is the corrected and fully functional middleware
export const requireProjectAdmin = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user._id; // We know req.user exists because authenticateToken runs first

  const project = await Project.findById(projectId);

  if (!project || project.isArchived) {
    return notFoundResponse(res, 'Project not found');
  }

  // We use the isAdmin method we defined on the project model
  if (project.isAdmin(userId)) {
    // If user is an admin or the owner, they can proceed
    next();
  } else {
    // Otherwise, they are forbidden
    return forbiddenResponse(res, 'You must be an admin or the project owner to perform this action.');
  }
});