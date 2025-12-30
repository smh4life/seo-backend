import express from "express";
import { getUsage, setUserAdmin, getAllUsers } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication
router.use(requireAuth);

// Get usage stats (admin only)
router.get("/usage", getUsage);

// Get all users (admin only)
router.get("/users", getAllUsers);

// Set user admin status (admin only)
router.post("/set-admin", setUserAdmin);

export default router;
