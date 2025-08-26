// src/routes/chat.routes.js
// src/routes/chat.routes.js
// import express from "express";

// const router = express.Router();

// // Add your chat routes here
// router.get("/", (req, res) => {
//   res.json({ message: "Chat route working!" });
// });

// export default router;

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const router = express.Router();

// Protected route to get a Stream token
router.get("/token", protect, getStreamToken);

export default router;
// // ✅ Named export to match import in server.js
// export const chatRoutes = router;
