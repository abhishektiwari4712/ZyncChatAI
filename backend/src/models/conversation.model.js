// src/models/conversation.model.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "assistant", "system"], required: true },
  text: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  language: { type: String, default: "auto" },
  topic: { type: String, default: "" },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
