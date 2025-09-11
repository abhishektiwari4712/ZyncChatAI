import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import { connectDB } from "./src/lib/db.js";

// ==================
// Import Routes
// ==================
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.route.js";
import chatRoutes from "./src/routes/chat.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import seoRoutes from "./src/routes/seo.routes.js";
import translateRoutes from "./src/routes/translate.routes.js";
import textToImageRoutes from "./src/routes/textToImage.routes.js";
import aitutorRoutes from "./src/routes/aitutor.routes.js";
import voiceRoutes from "./src/routes/voice.routes.js"; // ✅ fixed name

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// ==================
// Middlewares
// ==================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ==================
// HTTP + Socket.IO
// ==================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Make io available to routes
app.set("io", io);

// ==================
// Socket.IO handlers
// ==================
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("voiceMessage", async ({ text }) => {
    try {
      console.log(`🎤 Incoming message from ${socket.id}:`, text);

      const aiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${process.env.MODEL}:generateContent`,
        {
          contents: [{ role: "user", parts: [{ text }] }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply =
        aiRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I could not generate a response.";

      socket.emit("aiReply", { text: reply });
    } catch (err) {
      console.error("❌ Gemini socket error:", err.message);
      socket.emit("aiReply", { text: "AI service failed. Please try again." });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ==================
// API Routes
// ==================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/seo-optimize", seoRoutes);
app.use("/api/ai/translate", translateRoutes);
app.use("/api/text-to-image", textToImageRoutes);
app.use("/api/tutor", aitutorRoutes);
app.use("/api/voice", voiceRoutes);

// ==================
// Serve Frontend (Prod)
// ==================
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
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
// Error Handler
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
    server.listen(PORT, () => {
      console.log("✅ MongoDB Connected");
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🎤 Voice API ready at http://localhost:${PORT}/api/voice`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB", err);
    process.exit(1);
  });
// 5 puran version hi
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";
// import path from "path";
// import http from "http";
// import { Server } from "socket.io";
// import axios from "axios"; // ✅ for Gemini AI calls
// import { connectDB } from "./src/lib/db.js";

// // ==================
// // Import Routes
// // ==================
// import authRoutes from "./src/routes/auth.routes.js";
// import userRoutes from "./src/routes/user.route.js";
// import chatRoutes from "./src/routes/chat.routes.js";
// import aiRoutes from "./src/routes/ai.routes.js";
// import seoRoutes from "./src/routes/seo.routes.js";
// import translateRoutes from "./src/routes/translate.routes.js";
// import textToImageRoutes from "./src/routes/textToImage.routes.js";
// import aitutorRoutes from "./src/routes/aitutor.routes.js";
// import voiceRoutes from "./src/routes/voice.routes.js"; // ✅ Voice routes

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5001;
// const __dirname = path.resolve();

// // ==================
// // Middlewares
// // ==================
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173", // frontend URL
//     credentials: true,
//   })
// );
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));
// app.use(cookieParser());
// app.use(morgan("dev"));

// // ==================
// // Create HTTP Server & Socket.IO
// // ==================
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] },
// });

// // Make io accessible in routes
// app.set("io", io);

// // ==================
// // Socket.IO connection
// // ==================
// io.on("connection", (socket) => {
//   console.log("⚡ Client connected:", socket.id);

//   // Handle real-time voice + text messages
//   socket.on("voiceMessage", async ({ text }) => {
//     try {
//       console.log(`🎤 Incoming message from ${socket.id}:`, text);

//       // Call Gemini AI
//       const aiRes = await axios.post(
//         `https://generativelanguage.googleapis.com/v1beta2/models/${process.env.MODEL}:generate`,
//         {
//           prompt: text,
//           temperature: 0.7,
//           maxOutputTokens: 300,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const reply =
//         aiRes?.data?.candidates?.[0]?.output || "Sorry, I could not generate a response.";

//       // Emit AI reply back to frontend
//       socket.emit("aiReply", { text: reply });
//     } catch (err) {
//       console.error("❌ Gemini socket error:", err.message);
//       socket.emit("aiReply", { text: "AI service failed. Please try again." });
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id);
//   });
// });

// // ==================
// // API Routes
// // ==================
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/ai", aiRoutes);
// app.use("/api/seo-optimize", seoRoutes);
// app.use("/api/ai/translate", translateRoutes);
// app.use("/api/text-to-image", textToImageRoutes);
// app.use("/api/tutor", aitutorRoutes);
// app.use("/api/voice", voiceRoutes); // ✅ Voice routes

// // ==================
// // Serve Frontend in Production
// // ==================
// if (process.env.NODE_ENV === "production") {
//   const frontendPath = path.join(__dirname, "../frontend/dist");
//   app.use(express.static(frontendPath));

//   // SPA fallback
//   app.get(/.*/, (req, res) => {
//     res.sendFile(path.join(frontendPath, "index.html"));
//   });
// }

// // ==================
// // 404 Handler
// // ==================
// app.use((req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.originalUrl}`,
//   });
// });

// // ==================
// // Error Handler Middleware
// // ==================
// app.use((err, req, res, next) => {
//   console.error("🔥 Server Error:", err);
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// // ==================
// // Start Server + Connect DB
// // ==================
// connectDB()
//   .then(() => {
//     server.listen(PORT, () => {
//       console.log("✅ MongoDB Connected");
//       console.log(`🚀 Server running at http://localhost:${PORT}`);
//       console.log(`🎤 Voice API ready at http://localhost:${PORT}/api/voice`);
//       //console.log(`📚 Tutor API ready at http://localhost:${PORT}/api/tutor/ask`);
    
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Failed to connect to DB", err);
//     process.exit(1);
//   });


// // server.js before the 11.26pm 9september
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";
// import path from "path";
// import { connectDB } from "./src/lib/db.js";

// // Routes
// import authRoutes from "./src/routes/auth.routes.js";
// import userRoutes from "./src/routes/user.route.js";
// import chatRoutes from "./src/routes/chat.routes.js";
// import aiRoutes from "./src/routes/ai.routes.js";
// import seoRoutes from "./src/routes/seo.routes.js";
// import translateRoutes from "./src/routes/translate.routes.js";
// import textToImageRoutes from "./src/routes/textToImage.routes.js";
// import aitutorRoutes from "./src/routes/aitutor.routes.js";
// const voiceRoute = require('./routes/voice.route')(io);
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5001;
// const __dirname = path.resolve();

// // ==================
// // Middlewares
// // ==================
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(express.json({ limit: "10mb" })); // for base64 images
// app.use(cookieParser());
// app.use(morgan("dev"));

// // ==================
// // API Routes
// // ==================
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/ai", aiRoutes);
// app.use("/api/seo-optimize", seoRoutes);
// app.use("/api/ai/translate", translateRoutes);
// app.use("/api/text-to-image", textToImageRoutes);
// app.use("/api/tutor", aitutorRoutes);

// app.use('/voice', voiceRoute);
// // ==================
// // Serve Frontend in Production
// // ==================
// if (process.env.NODE_ENV === "production") {
//   const frontendPath = path.join(__dirname, "../frontend/dist");
//   app.use(express.static(frontendPath));

//   // SPA fallback using regex compatible with Express 4 & 5
//   app.get(/.*/, (req, res) => {
//     res.sendFile(path.join(frontendPath, "index.html"));
//   });
// }

// // ==================
// // 404 Handler for API
// // ==================
// app.use((req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.originalUrl}`,
//   });
// });

// // ==================
// // Error Handler Middleware
// // ==================
// app.use((err, req, res, next) => {
//   console.error("🔥 Server Error:", err);
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// // ==================
// // Start Server
// // ==================
// connectDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log("✅ MongoDB Connected");
//       console.log(`🚀 Server running at http://localhost:${PORT}`);
//       console.log(`📚 Tutor API ready at http://localhost:${PORT}/api/tutor/ask`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Failed to connect to DB", err);
//     process.exit(1);
//   });

