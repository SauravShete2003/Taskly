// server/routes/auth.js
import express from 'express';
import { userValidation } from '../utils/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { register, login, getProfile, changePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', userValidation.register, register);
router.post('/login', userValidation.login, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/change-password', authenticateToken, userValidation.changePassword, changePassword);

export default router;