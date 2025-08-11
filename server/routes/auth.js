import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { userValidation } from '../utils/validation.js';

const router = express.Router();

// Routes
router.post('/register', userValidation.register, register);
router.post('/login', userValidation.login, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, userValidation.updateProfile, updateProfile);
router.put('/change-password', authenticateToken, userValidation.changePassword, changePassword);

export default router; 