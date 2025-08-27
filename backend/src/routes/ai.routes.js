import express from "express";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/ai/chatbot → OpenAI
router.post("/chatbot", protect, async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ message: "prompt is required" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "OPENAI_API_KEY not configured" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant in a chat app." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 256,
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || "";
    return res.json({ content });
  } catch (err) {
    console.error("/chatbot error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/ai/smart-reply → HuggingFace (generate short replies)
router.post("/smart-reply", protect, async (req, res) => {
  try {
    const { context } = req.body || {};
    if (!context) return res.status(400).json({ message: "context is required" });

    const hfKey = process.env.HF_API_KEY;
    if (!hfKey) return res.status(500).json({ message: "HF_API_KEY not configured" });

    // Using a lightweight text-generation model for suggestions
    const model = process.env.HF_SMART_REPLY_MODEL || "gpt2";
    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${hfKey}` },
      body: JSON.stringify({ inputs: `Context: ${context}\nShort reply:` }),
    });
    const out = await hfRes.json();
    // Best effort parse; return up to 3 short suggestions
    const text = Array.isArray(out) && out[0]?.generated_text ? out[0].generated_text : "Thanks!";
    const suggestions = [text]
      .flat()
      .map((s) => (typeof s === "string" ? s.split("\n").pop() : ""))
      .filter(Boolean)
      .slice(0, 3)
      .map((s) => s.trim().slice(0, 80));
    return res.json({ suggestions: suggestions.length ? suggestions : ["Sounds good!", "Let’s do it.", "Thanks!"] });
  } catch (err) {
    console.error("/smart-reply error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/ai/toxic-check → HuggingFace (toxicity)
router.post("/toxic-check", protect, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: "text is required" });

    const hfKey = process.env.HF_API_KEY;
    if (!hfKey) return res.status(500).json({ message: "HF_API_KEY not configured" });

    const model = process.env.HF_TOXIC_MODEL || "unitary/toxic-bert";
    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${hfKey}` },
      body: JSON.stringify({ inputs: text }),
    });
    const out = await hfRes.json();
    // out is typically array of array of {label, score}
    let toxicScore = 0;
    const scores = Array.isArray(out) ? out.flat().filter(Boolean) : [];
    const toxic = scores.find((s) => /toxic/i.test(s?.label || ""));
    if (toxic?.score) toxicScore = toxic.score;
    return res.json({ score: toxicScore });
  } catch (err) {
    console.error("/toxic-check error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/ai/seo-optimize → OpenAI
router.post("/seo-optimize", protect, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: "text is required" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "OPENAI_API_KEY not configured" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You improve short messages for SEO and clarity while keeping tone." },
          { role: "user", content: `Optimize this for SEO while keeping it concise and friendly: "${text}"` },
        ],
        temperature: 0.6,
        max_tokens: 200,
      }),
    });
    const data = await response.json();
    const optimized = data?.choices?.[0]?.message?.content?.trim() || "";
    return res.json({ optimized });
  } catch (err) {
    console.error("/seo-optimize error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;


