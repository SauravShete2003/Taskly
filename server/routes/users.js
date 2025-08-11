import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../controllers/userController.js';
import { userValidation } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', userValidation.updateProfile, updateUser);
router.delete('/:id', deleteUser);

export default router; 