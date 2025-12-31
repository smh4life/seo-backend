import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requirePlan } from "../middleware/requirePlan.js";
import {
  listDistributors,
  createDistributor,
  deleteDistributor
} from "../controllers/distributorController.js";

const router = express.Router();

// All distributor routes require Pro plan
router.get("/", requireAuth, requirePlan("pro"), listDistributors);
router.post("/", requireAuth, requirePlan("pro"), createDistributor);
router.delete("/:id", requireAuth, requirePlan("pro"), deleteDistributor);

export default router;
