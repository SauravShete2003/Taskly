import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { searchUsers } from "../controllers/userController.js";
import { getProfile, updateProfile } from "../controllers/authController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get current user profile
router.get("/me", getProfile);

// Update current user profile
router.put("/me", updateProfile);

// Search users by name or email
router.get("/search", searchUsers);

export default router;
