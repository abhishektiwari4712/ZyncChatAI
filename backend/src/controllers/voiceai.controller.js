// controllers/asrController.mjs (ESM)
import fs from "fs";
import { spawn } from "child_process";
import axios from "axios";
import { pipeline } from "@xenova/transformers";
import ffmpegPath from "ffmpeg-static";
import pkg from "wavefile"; // ✅ Fix: wavefile is CommonJS
const { WaveFile } = pkg;   // ✅ Use destructuring

// Env keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const VOICERSS_API_KEY = process.env.VOICERSS_API_KEY;
const GEMINI_MODEL = process.env.MODEL || "gemini-1.5-flash";

// Whisper ASR model (default: small)
const WHISPER_MODEL = process.env.WHISPER_MODEL || "Xenova/whisper-small";

let transcriber = null;

/**
 * Load ASR model once and reuse
 */
async function loadModel() {
  if (transcriber) return transcriber;
  try {
    console.log(`⏳ Loading Whisper model: ${WHISPER_MODEL}`);
    transcriber = await pipeline("automatic-speech-recognition", WHISPER_MODEL);
    console.log("✅ Whisper model loaded successfully");
    return transcriber;
  } catch (err) {
    console.error("❌ Failed to load Whisper model:", err.message);
    throw err;
  }
}

/**
 * Convert any audio to Float32 PCM (16 kHz, mono) using ffmpeg
 */
async function convertToFloat32Array(inputPath) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(new Error("ffmpeg binary not found (ffmpeg-static missing?)"));
    }

    const args = [
      "-hide_banner",
      "-loglevel", "error",
      "-i", inputPath,
      "-f", "f32le",
      "-acodec", "pcm_f32le",
      "-ac", "1",
      "-ar", "16000",
      "pipe:1",
    ];

    const ff = spawn(ffmpegPath, args);

    const chunks = [];
    let stderr = "";

    ff.stdout.on("data", (c) => chunks.push(c));
    ff.stderr.on("data", (d) => (stderr += d.toString()));
    ff.on("error", (err) => reject(err));

    ff.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`ffmpeg exited with code ${code}. stderr: ${stderr}`));
      }
      const buffer = Buffer.concat(chunks);
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const floatCount = buffer.length / 4;
      const floats = new Float32Array(floatCount);
      for (let i = 0; i < floatCount; i++) {
        floats[i] = view.getFloat32(i * 4, true);
      }
      resolve(floats);
    });
  });
}

/**
 * Speech-to-Text + Gemini Response
 */
export const transcribeAndRespond = async (req, res) => {
  let audioPath;
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, error: "No audio uploaded" });
    }

    audioPath = req.file.path;

    // Load Whisper
    const model = await loadModel();

    // Convert to Float32 PCM
    const float32Audio = await convertToFloat32Array(audioPath);

    // Run transcription
    const transcriptResult = await model(float32Audio, {});
    const transcript = transcriptResult?.text ?? "Could not transcribe";

    // If no Gemini key → return transcript only
    if (!GEMINI_API_KEY) {
      return res.json({
        success: true,
        transcript,
        text: null,
        warning: "GEMINI_API_KEY not set",
      });
    }

    // Ask Gemini
    const aiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        contents: [{ role: "user", parts: [{ text: transcript }] }],
      },
      {
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = aiRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply generated";

    res.json({ success: true, transcript, text });
  } catch (err) {
    console.error("❌ transcribeAndRespond error:", err?.response?.data || err.message || err);
    res.status(500).json({
      success: false,
      error: "Failed to transcribe or generate reply",
      detail: String(err?.message ?? err),
    });
  } finally {
    // Cleanup uploaded file
    try {
      if (audioPath) fs.unlinkSync(audioPath);
    } catch (_) {}
  }
};

/**
 * Text-to-Speech (VoiceRSS API)
 */
export const generateTTS = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    if (!VOICERSS_API_KEY) {
      return res.status(500).json({ error: "Missing VOICERSS_API_KEY" });
    }

    const ttsRes = await axios.get(
      `https://api.voicerss.org/?key=${VOICERSS_API_KEY}&hl=en-us&src=${encodeURIComponent(
        text
      )}&c=MP3`,
      { responseType: "arraybuffer" }
    );

    res.set("Content-Type", "audio/mpeg");
    res.send(ttsRes.data);
  } catch (err) {
    console.error("❌ generateTTS error:", err?.response?.data || err.message);
    res.status(500).json({ error: "TTS failed" });
  }
};


// import axios from "axios";
// import fs from "fs";
// import { pipeline } from "@xenova/transformers";
// import { WaveFile } from "wavefile";

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const VOICERSS_API_KEY = process.env.VOICERSS_API_KEY;
// const GEMINI_MODEL = process.env.MODEL || "gemini-1.5-flash";

// // Choose a Xenova-converted Whisper model.
// // For quick tests or low memory use "Xenova/whisper-tiny.en" (English-only).
// // For better accuracy use "Xenova/whisper-small" (multilingual).
// const WHISPER_MODEL = process.env.WHISPER_MODEL || "Xenova/whisper-small";

// let transcriber = null;
// const loadModel = async () => {
//   if (transcriber) return transcriber;
//   try {
//     // Create pipeline for ASR using a Xenova/whisper-* model (ONNX converted).
//     transcriber = await pipeline("automatic-speech-recognition", WHISPER_MODEL);
//     return transcriber;
//   } catch (e) {
//     console.error("loadModel failed:", e);
//     // rethrow so route can return 500
//     throw e;
//   }
// };

// // STT + Gemini
// export const transcribeAndRespond = async (req, res) => {
//   try {
//     if (!req.file || !req.file.path) {
//       return res.status(400).json({ success: false, error: "No audio uploaded" });
//     }

//     // ensure model loaded (will download first time if required)
//     await loadModel();

//     const audioPath = req.file.path;

//     // Read file and convert to 32-bit float + 16000 Hz as required by Whisper pipeline
//     const fileBuffer = fs.readFileSync(audioPath);
//     const wav = new WaveFile(fileBuffer);

//     // Convert bit depth to 32-bit float and sample rate to 16000
//     // (WaveFile methods will modify the internal data)
//     try {
//       wav.toBitDepth("32f");
//     } catch (e) {
//       // if toBitDepth not applicable for this file, continue; we'll still try to get samples
//     }
//     try {
//       wav.toSampleRate(16000);
//     } catch (e) {
//       // same: if conversion fails, we'll attempt to proceed
//     }

//     // Get samples; if multiple channels, select the first channel
//     let audioData = wav.getSamples();
//     if (Array.isArray(audioData)) {
//       // de-interleaved channels -> pick channel 0
//       audioData = audioData[0];
//     }

//     // Ensure Float32Array (Transformers.js expects numeric array/typed array)
//     if (!(audioData instanceof Float32Array)) {
//       audioData = Float32Array.from(audioData);
//     }

//     // Run transcription
//     const transcriptResult = await transcriber(audioData, {
//       // optional pipeline options:
//       // language: 'english', task: 'transcribe'
//     });

//     const transcript = transcriptResult?.text ?? "Could not transcribe";

//     // Gemini AI reply (your existing code)
//     if (!GEMINI_API_KEY) {
//       // clean up the file before returning
//       try { fs.unlinkSync(audioPath); } catch (e) {}
//       return res.status(500).json({ success: false, error: "Missing GEMINI_API_KEY" });
//     }

//     const aiRes = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
//       {
//         contents: [
//           {
//             role: "user",
//             parts: [{ text: transcript }],
//           },
//         ],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${GEMINI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const text =
//       aiRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply generated";

//     // delete uploaded file (best-effort)
//     try { fs.unlinkSync(audioPath); } catch (e) {}

//     res.json({ success: true, transcript, text });
//   } catch (err) {
//     // Better logging: include full error for debugging
//     console.error("transcribeAndRespond error:", err?.response?.data ?? err?.message ?? err);
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to transcribe or generate reply", detail: String(err?.message ?? err) });
//   }
// };

// // Text-to-Speech (VoiceRSS) - unchanged
// export const generateTTS = async (req, res) => {
//   try {
//     const { text } = req.body;
//     if (!text) return res.status(400).json({ error: "No text provided" });

//     if (!VOICERSS_API_KEY) {
//       return res.status(500).json({ error: "Missing VOICERSS_API_KEY" });
//     }

//     const ttsRes = await axios.get(
//       `https://api.voicerss.org/?key=${VOICERSS_API_KEY}&hl=en-us&src=${encodeURIComponent(
//         text
//       )}&c=MP3`,
//       { responseType: "arraybuffer" }
//     );

//     res.set("Content-Type", "audio/mpeg");
//     res.send(ttsRes.data);
//   } catch (err) {
//     console.error("generateTTS error:", err.response?.data || err.message);
//     res.status(500).json({ error: "TTS failed" });
//   }
// };


// import fs from "fs";
// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export const transcribeAndRespond = async (req, res, io) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No audio file uploaded (use field name "audio")' });
//   }

//   const tempPath = req.file.path;

//   try {
//     // 1) Transcription (Whisper)
//     const transcription = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(tempPath),
//       model: "whisper-1",
//     });

//     const userText =
//       transcription.text ||
//       (transcription.data && transcription.data.text) ||
//       "";

//     // 2) AI reply (ChatGPT)
//     const chatResponse = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are a helpful AI tutor. Answer concisely and clearly." },
//         { role: "user", content: userText || "..." },
//       ],
//       max_tokens: 500,
//     });

//     const aiText =
//       chatResponse.choices?.[0]?.message?.content ||
//       "";

//     // 3) Emit via Socket.IO
//     const socketId = req.body?.socketId;
//     if (io && socketId) {
//       io.to(socketId).emit("voice:reply", { transcript: userText, reply: aiText });
//     } else if (io) {
//       io.emit("voice:reply", { transcript: userText, reply: aiText });
//     }

//     // 4) Response
//     return res.json({ success: true, transcript: userText, reply: aiText });
//   } catch (err) {
//     console.error("transcribeAndRespond error:", err);
//     return res.status(500).json({ success: false, error: "Failed to transcribe or generate reply" });
//   } finally {
//     try {
//       fs.unlinkSync(tempPath);
//     } catch (e) {
//       /* ignore */
//     }
//   }
// };
