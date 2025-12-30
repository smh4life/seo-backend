import express from "express";
import {
  generateSingle,
  generateBatch,
  generateSeoPro
} from "../controllers/generateController.js";
import { requirePlan } from "../middleware/requirePlan.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { checkFreeUsage } from "../middleware/freeUsage.js";

const router = express.Router();

// Single generator: optional auth + free usage check (5 free for unauthenticated)
router.post("/single", optionalAuth, checkFreeUsage("single"), generateSingle);

// Batch generator: requires authentication
router.post("/batch", requireAuth, requirePlan("batch"), generateBatch);

// SEO-Pro: requires authentication and Pro plan
router.post("/seo-pro", requireAuth, requirePlan("pro"), generateSeoPro);

export default router;
