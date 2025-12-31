import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requirePlan } from "../middleware/requirePlan.js";
import {
  listCategories,
  importCategories,
  matchCategories,
  deleteAllCategories
} from "../controllers/categoryController.js";

const router = express.Router();

// All routes require authentication and Pro plan
router.use(requireAuth);
router.use(requirePlan("pro"));

router.get("/", listCategories);
router.post("/import", importCategories);
router.post("/match", matchCategories);
router.delete("/", deleteAllCategories);

export default router;

