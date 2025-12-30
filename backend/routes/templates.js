import express from "express";
import {
  listTemplates,
  createTemplate,
  deleteTemplate
} from "../controllers/templateController.js";

const router = express.Router();

router.get("/", listTemplates);
router.post("/", createTemplate);
router.delete("/:id", deleteTemplate);

export default router;
