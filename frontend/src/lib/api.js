// src/lib/api.js
import axiosInstance from "./axios.js";

// ---------- Auth ----------
export const signup = async (data) => {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
};

export const login = async (data) => {
  // If data contains a token (from Firebase phone auth), use it directly
  if (data?.token && data?.isPhoneAuth) {
    const res = await axiosInstance.post("/auth/firebase-login", {
      firebaseToken: data.token
    });
    if (res?.data?.token) localStorage.setItem("token", res.data.token);
    return res.data;
  }
  
  // Regular email/password login
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

// ---------- Friend Requests ----------
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

// ---------- Friends & Recommendations ----------
export const getUserFriends = async () => {
  const res = await axiosInstance.get("/users/friends");
  return res.data;
};

export const getRecommendedUsers = async () => {
  const res = await axiosInstance.get("/users/recommendations");
  return res.data;
};

// Get friend requests - Fixed endpoint to match backend
export const getFriendRequests = async () => {
  const res = await axiosInstance.get("/users/friend-request");
  return res.data;
};

// get the stream token fom the chatpage 
export async function getStreamToken() {
  const res = await axiosInstance.get("/chat/token");
  return res.data;
}

// ---------- AI Helpers ----------
export const aiChatbot = async (prompt) => {
  const res = await axiosInstance.post("/ai/chatbot", { prompt });
  return res.data;
};

export const aiSmartReply = async (context) => {
  const res = await axiosInstance.post("/ai/smart-reply", { context });
  return res.data;
};

export const aiToxicCheck = async (text) => {
  const res = await axiosInstance.post("/ai/toxic-check", { text });
  return res.data;
};

export const aiSeoOptimize = async (text) => {
  const res = await axiosInstance.post("/ai/seo-optimize", { text });
  return res.data;
};
