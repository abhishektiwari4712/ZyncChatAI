// src/routes/textToImage.routes.js
import express from "express";
import { generateImage } from "../controllers/textToImage.controller.js";

const router = express.Router();

// POST /api/text-to-image
router.post("/", generateImage);

export default router;



// import express from "express";
// import { generateImage } from "../controllers/textToImage.controller.js";

// const router = express.Router();

// // POST /api/text-to-image
// router.post("/", generateImage);

// export default router;
