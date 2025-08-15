// server/routes/users.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  updateCurrentUser,
  deleteUser,
  deleteCurrentUser,
} from '../controllers/userController.js';
import { userValidation, paginationValidation } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Current user (no ID required)
router.get('/me', getCurrentUser);
router.put('/me', userValidation.updateProfile, updateCurrentUser);
router.delete('/me', deleteCurrentUser);

// Admin and ID-based operations
router.get('/', paginationValidation, getUsers);
router.get('/:id', userValidation.userId, getUserById);
router.put('/:id', userValidation.userId, userValidation.updateProfile, updateUser);
router.delete('/:id', userValidation.userId, deleteUser);

export default router;