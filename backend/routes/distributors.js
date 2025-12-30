import express from "express";
import {
  listDistributors,
  createDistributor,
  deleteDistributor
} from "../controllers/distributorController.js";

const router = express.Router();

router.get("/", listDistributors);
router.post("/", createDistributor);
router.delete("/:id", deleteDistributor);

export default router;
