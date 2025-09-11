// src/lib/db.js

import mongoose from "mongoose";

/**
 * Connect to MongoDB using Mongoose
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL); // 🔧 Removed deprecated options

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit process with failure
  }
};
