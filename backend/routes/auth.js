import express from "express";
import { register, login } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.schema.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Get current user info
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
});

export default router;
