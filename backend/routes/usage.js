import express from "express";
import { getUsage, incrementUsage } from "../controllers/usageController.js";
import { optionalAuth } from "../middleware/auth.js";
import { getFreeUsageRemaining } from "../middleware/freeUsage.js";

const router = express.Router();

router.get("/", getUsage);
router.post("/increment", incrementUsage);

// Check remaining free uses for unauthenticated users
router.get("/free", optionalAuth, (req, res) => {
  if (req.user) {
    // Authenticated users have unlimited access (based on plan)
    return res.json({ 
      isAuthenticated: true,
      freeUsageRemaining: null,
      freeUsageLimit: null
    });
  }
  
  const remaining = getFreeUsageRemaining(req);
  res.json({
    isAuthenticated: false,
    freeUsageRemaining: remaining,
    freeUsageLimit: 5
  });
});

export default router;
