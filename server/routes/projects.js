import express from "express";
import { authenticateToken, requireProjectAdmin } from "../middleware/auth.js";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} from "../controllers/projectController.js";
import { projectValidation } from "../utils/validation.js";

// Import board routes
import boardRoutes from "./boards.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ================== Projects ==================
router.get("/", getProjects);
router.post("/", projectValidation.create, createProject);
router.get("/:projectId", projectValidation.projectId, getProjectById);
router.put(
  "/:projectId",
  projectValidation.projectId,
  projectValidation.update,
  updateProject
);
router.delete("/:projectId", projectValidation.projectId, deleteProject);

// ================== Members (Admin Only) ==================
router.post(
  "/:projectId/members",
  requireProjectAdmin,
  projectValidation.memberAdd,
  addMember
);

router.delete(
  "/:projectId/members/:userId",
  requireProjectAdmin,
  projectValidation.memberParam,
  removeMember
);

router.put(
  "/:projectId/members/:userId",
  requireProjectAdmin,
  projectValidation.memberParam.concat(projectValidation.memberRole),
  updateMemberRole
);

// ================== Boards ==================
// Mount all board-related routes under /projects/:projectId/boards
router.use("/:projectId/boards", boardRoutes);

export default router;
