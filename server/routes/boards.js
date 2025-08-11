import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getBoards, 
  getBoardById, 
  createBoard, 
  updateBoard, 
  deleteBoard,
  reorderBoards
} from '../controllers/boardController.js';
import { boardValidation } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes - Specific routes first, then parameterized routes
router.get('/project/:projectId', getBoards);
router.post('/project/:projectId', boardValidation.create, createBoard);
router.put('/reorder', reorderBoards); // This must come before /:boardId routes
router.get('/:boardId', boardValidation.boardId, getBoardById);
router.put('/:boardId', boardValidation.boardId, boardValidation.update, updateBoard);
router.delete('/:boardId', boardValidation.boardId, deleteBoard);

export default router; 