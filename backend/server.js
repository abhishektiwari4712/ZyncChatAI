// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectDB } from "./src/lib/db.js";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Correct route imports
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.route.js";
import chatRoutes from "./src/routes/chat.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ==================
// Middlewares
// ==================
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true, // Allow cookies
  })
);
app.use(express.json()); // Parse JSON body
app.use(cookieParser()); // Parse cookies
app.use(morgan("dev")); // Log requests

// ==================
// API Routes
// ==================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// ==================
// Serve Frontend in Production
// ==================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ==================
// 404 Handler
// ==================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ==================
// Error Handler Middleware
// ==================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ==================
// Start Server
// ==================
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("✅ MongoDB Connected");
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB", err);
    process.exit(1);
  });

// import "express-async-errors";

// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import morgan from "morgan";

// // Import Routes
// import authRoutes from "./src/routes/auth.routes.js";
// import userRoutes from "./src/routes/user.route.js";
// import chatRoutes from "./src/routes/chat.routes.js";

// // Import DB connection
// import { connectDB } from "./src/lib/db.js";

// // Load environment variables
// dotenv.config();

// // Initialize app
// const app = express();
// const PORT = process.env.PORT || 5001;

// // ✅ Middlewares
// app.use(express.json()); // To parse JSON request bodies
// app.use(cookieParser()); // To parse cookies
// app.use(morgan("dev"));  // Logging
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Frontend origin
//     credentials: true,               // To send cookies from browser
//   })
// );

// // ✅ API Routes
// app.use("/api/auth", authRoutes);   // e.g. /api/auth/login
// app.use("/api/users", userRoutes);  // e.g. /api/users/friends
// app.use("/api/chat", chatRoutes);   // e.g. /api/chat/messages

// // ❌ 404 Route
// app.use("*", (req, res) => {
//   res.status(404).json({ message: "API route not found" });
// });

// // ❌ Global Error Handler
// app.use((err, req, res, next) => {
//   console.error("❌ Internal Server Error:", err.stack);
//   res.status(500).json({ message: "Something went wrong!" });
// });

// // ✅ Start Server
// async function startServer() {
//   try {
//     await connectDB();
//     console.log("✅ MongoDB connected");

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running at http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ DB connection failed:", err.message);
//     process.exit(1);
//   }
// }

// startServer();