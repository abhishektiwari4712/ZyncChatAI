
import express from "express";
import { completeOnboarding } from "../controllers/onboarding.controller.js";
import authMiddleware from "../auth.middleware.js";

const router = express.Router();

router.post("/onboarding", authMiddleware, completeOnboarding);

export default router;
