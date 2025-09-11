// backend/routes/translate.routes.js
import express from "express";
import { translateMessage } from "../controllers/translation.controller.js";

const router = express.Router();

// POST /api/ai/translate
router.post("/translate", translateMessage);

export default router;
