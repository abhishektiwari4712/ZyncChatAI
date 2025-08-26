// src/lib/axios.js
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = import.meta.env.MODE === "development" ? `${BASE}`: "/api"
if (!BASE) {
  // Helps catch misconfigured env immediately
  // eslint-disable-next-line no-console
  console.error("VITE_BACKEND_URL is missing in .env");
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // Don't send cookies, use Authorization header instead
});

// Add JWT token to Authorization header for all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
