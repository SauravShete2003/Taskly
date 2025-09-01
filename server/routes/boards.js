import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  reorderBoards,
} from "../controllers/boardController.js";
import { boardValidation } from "../utils/validation.js";

const router = express.Router({ mergeParams: true }); 

router.use(authenticateToken);

// ================== Boards ==================
// GET /api/projects/:projectId/boards
router.get("/", getBoards);

// POST /api/projects/:projectId/boards
router.post("/", boardValidation.create, createBoard);

// PUT /api/boards/:boardId
router.put("/:boardId", boardValidation.boardId, updateBoard);

// DELETE /api/boards/:boardId
router.delete("/:boardId", boardValidation.boardId, deleteBoard);

// PUT /api/boards/reorder
router.put("/reorder", boardValidation.reorder, reorderBoards);

export default router;
