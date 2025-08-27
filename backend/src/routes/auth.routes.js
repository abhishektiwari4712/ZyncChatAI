import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  phoneLogin,
  firebaseLogin,
  googleLogin
} from "../controllers/auth.Controller.js";
import { completeOnboarding } from "../controllers/onboarding.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @desc   Register new user
 * @route  POST /api/auth/register
 * @access Public
 */
router.post("/register", registerUser);

/**
 * @desc   Login user
 * @route  POST /api/auth/login
 * @access Public
 */
router.post("/login", loginUser);

/**
 * @desc   Logout user
 * @route  POST /api/auth/logout
 * @access Public
 */
router.post("/logout", logoutUser);

/**
 * @desc   Get current logged-in user
 * @route  GET /api/auth/me
 * @access Private
 */
router.get("/me", protect, getMe);

/**
 * @desc   Complete user onboarding
 * @route  PUT /api/auth/onboard
 * @access Private
 */
router.put("/onboard", protect, completeOnboarding);

/**
 * @desc   Login user with phone number (Firebase)
 * @route  POST /api/auth/phone-login
 * @access Public
 */
router.post("/phone-login", phoneLogin);

/**
 * @desc   Login user with Firebase ID token
 * @route  POST /api/auth/firebase-login
 * @access Public
 */
router.post("/firebase-login", firebaseLogin);

/**
 * @desc   Login user with Google
 * @route  POST /api/auth/google
 * @access Public
 */
router.post("/google", googleLogin);

export default router;
