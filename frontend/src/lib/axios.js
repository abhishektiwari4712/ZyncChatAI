// // // src/lib/axios.js
// src/lib/axios.js
import axios from "axios";

// ✅ Get backend URL from env
const BASE = import.meta.env.VITE_BACKEND_URL;

// If no env set, log an error
if (!BASE) {
  // eslint-disable-next-line no-console
  console.error("❌ VITE_BACKEND_URL is missing in .env");
}

// ✅ Base URL config
// - Development: use VITE_BACKEND_URL (e.g. http://localhost:5001/api)
// - Production: backend served with frontend, so just "/api"
const BASE_URL =
  import.meta.env.MODE === "development"
    ? BASE // example: http://localhost:5001/api
    : "/api"; // production (reverse-proxy to backend)

// ✅ Create Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // keep true since you may need cookies in auth
});

// ✅ Attach JWT token to Authorization header (if exists)
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

// // src/lib/axios.js
// import axios from "axios";

// // Get base URL from env
// const BASE = import.meta.env.VITE_BACKEND_URL;

// if (!BASE) {
//   // Helps catch misconfigured env immediately
//   // eslint-disable-next-line no-console
//   console.error("VITE_BACKEND_URL is missing in .env");
// }

// // Decide base URL depending on mode
// const BASE_URL = import.meta.env.MODE === "development" ? BASE : "/api";

// const axiosInstance = axios.create({
//   baseURL: BASE_URL, // already includes /api if needed
//   withCredentials: false, // Don't send cookies, use Authorization header instead
// });

// // Add JWT token to Authorization header for all requests
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default axiosInstance;

