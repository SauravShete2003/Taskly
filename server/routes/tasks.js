import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask,
  moveTask,
  addComment,
  removeComment
} from '../controllers/taskController.js';
import { taskValidation } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/board/:boardId', getTasks);
router.post('/board/:boardId', taskValidation.create, createTask);
router.get('/:taskId', taskValidation.taskId, getTaskById);
router.put('/:taskId', taskValidation.taskId, taskValidation.update, updateTask);
router.delete('/:taskId', taskValidation.taskId, deleteTask);
router.put('/:taskId/move', taskValidation.taskId, moveTask);

// Comments
router.post('/:taskId/comments', taskValidation.taskId, addComment);
router.delete('/:taskId/comments/:commentId', taskValidation.taskId, removeComment);

export default router; 