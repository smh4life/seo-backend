import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requirePlan } from "../middleware/requirePlan.js";
import {
  listTemplates,
  createTemplate,
  deleteTemplate
} from "../controllers/templateController.js";

const router = express.Router();

// All template routes require Pro plan
router.get("/", requireAuth, requirePlan("pro"), listTemplates);
router.post("/", requireAuth, requirePlan("pro"), createTemplate);
router.delete("/:id", requireAuth, requirePlan("pro"), deleteTemplate);

export default router;
