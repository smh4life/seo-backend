import express from "express";
import { optionalAuth } from "../middleware/auth.js";
import {
  listTemplates,
  createTemplate,
  deleteTemplate
} from "../controllers/templateController.js";

const router = express.Router();

router.get("/", optionalAuth, listTemplates);
router.post("/", optionalAuth, createTemplate);
router.delete("/:id", optionalAuth, deleteTemplate);

export default router;
