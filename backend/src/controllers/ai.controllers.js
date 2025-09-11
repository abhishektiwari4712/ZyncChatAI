// backend/src/controllers/ai.controller.js
import fetch from "node-fetch";

const HF_TOKEN = process.env.HF_TOKEN;
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "openai/gpt-oss-120b:fireworks-ai";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("🔹 Incoming user message:", message);
    console.log("🔹 Model:", HF_MODEL);

    // Request body
    const body = {
      model: HF_MODEL,
      messages: [{ role: "user", content: message }],
      max_tokens: 512,
      temperature: 0.7,
    };

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("🔹 Raw Status:", response.status);

    const rawText = await response.text();
    console.log("🔹 Raw Response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ JSON parse failed, response was not JSON.");
      return res.status(500).json({
        error: "HF router returned non-JSON",
        details: rawText,
      });
    }

    if (!response.ok) {
      console.error("❌ HF API Error:", data);
      return res.status(response.status).json({
        error: "HF API returned error",
        details: data,
      });
    }

    // Extract reply safely
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "No response";

    return res.json({ reply });
  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({ error: "Failed to get response from AI" });
  }
};
