import express from "express";
import { optionalAuth } from "../middleware/auth.js";
import {
  listDistributors,
  createDistributor,
  deleteDistributor
} from "../controllers/distributorController.js";

const router = express.Router();

router.get("/", optionalAuth, listDistributors);
router.post("/", optionalAuth, createDistributor);
router.delete("/:id", optionalAuth, deleteDistributor);

export default router;
