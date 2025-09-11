// src/lib/api.js
import axiosInstance from "./axios.js";

/* ===========================
   AUTH
   =========================== */
export const signup = async (data) => {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
};

export const login = async (data) => {
  const res = await axiosInstance.post("/auth/login", data);
  if (res?.data?.token) localStorage.setItem("token", res.data.token);
  return res.data;
};

export const logout = async () => {
  const res = await axiosInstance.post("/auth/logout");
  localStorage.removeItem("token");
  return res.data;
};

export const getMe = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res.data;
};

export const completeOnboarding = async (data) => {
  const res = await axiosInstance.put("/auth/onboard", data);
  return res.data;
};

/* ===========================
   FRIEND REQUESTS
   =========================== */
export const getOutgoingFriendReqs = async () => {
  const res = await axiosInstance.get("/users/outgoing-request");
  return res.data.outgoingRequests;
};

export const getIncomingFriendReqs = async () => {
  const res = await axiosInstance.get("/users/friend-request");
  return res.data.incomingReqs;
};

export const sendFriendRequest = async (userId) => {
  const res = await axiosInstance.post(`/users/send-friend-request/${userId}`);
  return res.data;
};

export const acceptFriendRequest = async (requestId) => {
  const res = await axiosInstance.put(`/users/send-friend-request/${requestId}/accept`);
  return res.data;
};

export const rejectFriendRequest = async (requestId) => {
  const res = await axiosInstance.put(`/users/send-friend-request/${requestId}/reject`);
  return res.data;
};

export const getUserFriends = async () => {
  const res = await axiosInstance.get("/users/friends");
  return res.data;
};

export const getRecommendedUsers = async () => {
  const res = await axiosInstance.get("/users/recommendations");
  return res.data;
};

export const getFriendRequests = async () => {
  const res = await axiosInstance.get("/users/friend-request");
  return res.data;
};

/* ===========================
   STREAM TOKEN
   =========================== */
export async function getStreamToken() {
  const res = await axiosInstance.get("/chat/token");
  return res.data;
}

/* ===========================
   AI CHATBOT
   =========================== */
export const sendMessageToAI = async (message) => {
  const res = await axiosInstance.post("/ai/chatbot", { message });
  return res.data; // { reply: "AI response" }
};

/* ===========================
   SEO OPTIMIZE
   =========================== */
export const seoOptimize = async ({ content, keywords, auditUrl }) => {
  const res = await axiosInstance.post("/seo-optimize", {
    content,
    keywords,
    auditUrl,
  });
  return res.data;
};

/* ===========================
   TRANSLATION
   =========================== */
export const translateMessage = async (message, targetLanguage) => {
  const res = await axiosInstance.post("/ai/translate", {
    message,
    targetLanguage,
  });
  return res.data.translatedText;
};

/* ===========================
   TEXT → IMAGE
   =========================== */
export const generatePrompt = async (prompt) => {
  const res = await axiosInstance.post("/text-to-image", { prompt });
  return res.data;
};

/* ===========================
   VOICE AI (STT + TTS)
   =========================== */

/**
 * Upload recorded audio for Speech-to-Text + AI reply
 * @param {Blob|File} audioBlob
 * @param {string|null} socketId
 * @param {string} filename
 */
export const sendVoice = async (audioBlob, socketId = null, filename = "voice.webm") => {
  const fd = new FormData();
  fd.append("audio", audioBlob, filename);
  if (socketId) fd.append("socketId", socketId);

  const res = await axiosInstance.post("/voice/stt", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000, // 2 minutes
  });

  return res.data; // { transcript, text }
};

/**
 * Convert text into audio via TTS
 * @param {string} text
 */
export const textToSpeech = async (text) => {
  const res = await axiosInstance.post("/voice/tts", { text }, {
    responseType: "arraybuffer",
  });

  return res.data; // raw audio ArrayBuffer (MP3)
};

/* ===========================
   AUDIO HELPERS
   =========================== */
export const playAudioFromUrl = (audioUrl) => {
  if (!audioUrl) return;
  const url =
    audioUrl.startsWith("http")
      ? audioUrl
      : `${axiosInstance.defaults.baseURL?.replace(/\/api\/?$/, "") || ""}${audioUrl}`;
  const audio = new Audio(url);
  audio.crossOrigin = "anonymous";
  audio.play().catch((e) => console.warn("Audio play blocked:", e));
};

export const playAudioFromBase64 = (base64) => {
  if (!base64) return;
  const dataUrl = base64.startsWith("data:")
    ? base64
    : `data:audio/mpeg;base64,${base64}`;
  const audio = new Audio(dataUrl);
  audio.play().catch((e) => console.warn("Audio play blocked:", e));
};
