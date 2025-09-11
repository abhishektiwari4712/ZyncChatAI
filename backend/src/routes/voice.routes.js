import express from "express";
import upload from "../middleware/multer.middleware.js";
import { transcribeAndRespond, generateTTS } from "../controllers/voiceai.controller.js";

const router = express.Router();

/**
 * Health Check
 * GET /api/voice/health
 */
router.get("/health", (req, res) => {
  res.json({ ok: true, message: "VoiceAI service is running" });
});

/**
 * Speech-to-Text (STT)
 * POST /api/voice/stt
 * field name for audio upload: "voice"
 */
router.post("/stt", upload.single("voice"), transcribeAndRespond);

/**
 * Text-to-Speech (TTS)
 * POST /api/voice/tts
 */
router.post("/tts", generateTTS);

/**
 * Error Handler (specific to this router)
 */
router.use((err, req, res, next) => {
  console.error("❌ VoiceAI route error:", err.message || err);

  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, error: `Multer error: ${err.message}` });
  }

  if (err.message && err.message.includes("Only audio files are allowed")) {
    return res.status(400).json({ success: false, error: "Invalid file type. Only audio allowed." });
  }

  res.status(500).json({ success: false, error: "Internal Server Error" });
});

export default router;

// import express from "express";

// const router = express.Router();

// // 🎤 POST Speech-to-Text
// router.post("/stt", async (req, res) => {
//   try {
//     // yahan aap audio file ya base64 bhejoge
//     // AI API call karke transcription return karna hoga
//     res.json({ success: true, text: "Hello, I am AI Tutor (transcribed)." });
//   } catch (err) {
//     console.error("STT Error:", err);
//     res.status(500).json({ success: false, message: "Speech-to-Text failed" });
//   }
// });

// // 🔊 POST Text-to-Speech
// router.post("/tts", async (req, res) => {
//   try {
//     const { text } = req.body;
//     // yahan TTS API call karo aur audio return karo
//     res.json({ success: true, audioUrl: "/mock-audio-file.mp3" });
//   } catch (err) {
//     console.error("TTS Error:", err);
//     res.status(500).json({ success: false, message: "Text-to-Speech failed" });
//   }
// });

// export default router;
