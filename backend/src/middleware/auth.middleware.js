// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // ensure lowercase file path

/**
 * Middleware to protect routes by verifying JWT from Authorization header.
 * Adds authenticated user to req.user
 */
export const protect = async (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Unauthorized: Token expired"
            : "Unauthorized: Invalid token",
      });
    }

    // 3️⃣ Check if decoded payload has user id
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token payload",
      });
    }

    // 4️⃣ Fetch user and exclude password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    // 5️⃣ Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ protect middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication middleware",
    });
  }
};
