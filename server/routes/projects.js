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
  updateMemberRole,
} from '../controllers/projectController.js';
import { projectValidation } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Projects
router.get('/', getProjects);
router.post('/', projectValidation.create, createProject);
router.get('/:projectId', projectValidation.projectId, getProjectById);
router.put('/:projectId', projectValidation.projectId, projectValidation.update, updateProject);
router.delete('/:projectId', projectValidation.projectId, deleteProject);

// Members
router.post(
  '/:projectId/members',
  projectValidation.memberAdd,
  addMember
);

router.delete(
  '/:projectId/members/:userId',
  projectValidation.memberParam,
  removeMember
);

router.put(
  '/:projectId/members/:userId',
  projectValidation.memberParam.concat(projectValidation.memberRole),
  updateMemberRole
);

export default router;