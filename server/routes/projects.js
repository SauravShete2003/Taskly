import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole
} from '../controllers/projectController.js';
import { projectValidation } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getProjects);
router.post('/', projectValidation.create, createProject);
router.get('/:projectId', projectValidation.projectId, getProjectById);
router.put('/:projectId', projectValidation.projectId, projectValidation.update, updateProject);
router.delete('/:projectId', projectValidation.projectId, deleteProject);

// Member management
router.post('/:projectId/members', projectValidation.projectId, addMember);
router.delete('/:projectId/members/:userId', projectValidation.projectId, removeMember);
router.put('/:projectId/members/:userId', projectValidation.projectId, updateMemberRole);

export default router; 