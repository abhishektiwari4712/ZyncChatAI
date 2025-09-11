import express from "express";
import { seoOptimize } from "../controllers/seo.controllers.js";

const router = express.Router();

router.post("/", seoOptimize);

export default router;
