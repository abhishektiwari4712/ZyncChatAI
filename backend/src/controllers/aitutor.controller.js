// src/controllers/aitutor.controller.js
import Conversation from "../models/conversation.model.js";
import { PredictionServiceClient } from "@google-cloud/aiplatform";

const client = new PredictionServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const project = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const endpoint = `projects/${project}/locations/${location}/publishers/google/models/text-bison@001`;

function buildSystemPrompt({ language, topic }) {
  let prompt = "You are an AI tutor. Explain clearly and simply with examples.";
  if (language && language.toLowerCase() !== "auto") prompt += ` Answer in ${language}.`;
  if (topic) prompt += ` Focus on: ${topic}.`;
  return prompt;
}

// Ask tutor
export const askTutor = async (req, res) => {
  try {
    const { message, conversationId, language = "auto", topic = "" } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "message required" });

    let conversation = null;
    if (conversationId) conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      conversation = new Conversation({ language, topic, messages: [] });
    }

    conversation.messages.push({ sender: "user", text: message });
    await conversation.save();

    const prompt = buildSystemPrompt({ language, topic }) + "\nUser: " + message;

    const [response] = await client.predict({
      endpoint,
      instances: [{ content: prompt }],
    });

    const assistantText = response.predictions?.[0]?.content || "Sorry, no response";

    conversation.messages.push({ sender: "assistant", text: assistantText });
    await conversation.save();

    res.json({ conversationId: conversation._id, assistant: assistantText, messages: conversation.messages });
  } catch (err) {
    console.error("askTutor error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

// List conversations
export const listConversations = async (req, res) => {
  const list = await Conversation.find({}).sort({ createdAt: -1 }).limit(50);
  res.json(list);
};

// Get single conversation
export const getConversation = async (req, res) => {
  const conv = await Conversation.findById(req.params.conversationId);
  if (!conv) return res.status(404).json({ error: "conversation not found" });
  res.json(conv);
};

// Clear conversation
export const clearConversation = async (req, res) => {
  await Conversation.findByIdAndDelete(req.params.conversationId);
  res.json({ ok: true });
};
