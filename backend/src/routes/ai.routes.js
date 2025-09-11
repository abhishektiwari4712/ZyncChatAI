// backend/src/routes/ai.routes.js
import express from "express";
import { chatWithAI } from "../controllers/ai.controllers.js";

const router = express.Router();

// Route: POST /api/ai/chatbot
router.post("/chatbot", chatWithAI);

export default router;



// // backend/src/routes/ai.routes.js
// import express from "express";
// import pkg from "cohere-ai";
// const { CohereClient } = pkg;

// const router = express.Router();

// // Use environment variable here
// const co = new CohereClient({
//   apiKey: process.env.COHERE_API_KEY
// });

// console.log("Cohere API Key:", process.env.COHERE_API_KEY);

// // AI Chatbot Route
// router.post("/chatbot", async (req, res) => {
//   const { message } = req.body;

//   if (!message) return res.status(400).json({ error: "Message is required" });

//   try {
//     const response = await co.generate({
//       model: "xlarge",
//       prompt: message,
//       max_tokens: 100
//     });

//     const reply = response.body.generations[0].text;
//     res.json({ reply });

//   } catch (err) {
//     console.error("Cohere API Error:", err);
//     res.status(500).json({ error: "Failed to get response from AI" });
//   }
// });

// export default router;



