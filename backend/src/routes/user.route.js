import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  onboard,
  getRecommendedUsers,
  getMyfriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getOutgoingRequests
} from "../controllers/user.Controller.js";

const router = express.Router();

// ✅ Protect all routes in this file
router.use(protect);

/**
 * @desc   Onboard user
 * @route  POST /api/users/onboard
 * @access Private
 */
router.post("/onboard", onboard);

/**
 * @desc   Get recommended users
 * @route  GET /api/users/recommendations
 * @access Private
 */
router.get("/recommendations", getRecommendedUsers);

/**
 * @desc   Get my friends
 * @route  GET /api/users/friends
 * @access Private
 */
router.get("/friends", getMyfriends);

/**
 * @desc   Send friend request
 * @route  POST /api/users/send-friend-request/:id
 * @access Private
 */
router.post("/send-friend-request/:id", sendFriendRequest);

/**
 * @desc   Accept friend request
 * @route  PUT /api/users/send-friend-request/:id/accept
 * @access Private
 */
router.put("/send-friend-request/:id/accept", acceptFriendRequest);

/**
 * @desc   Reject friend request
 * @route  PUT /api/users/send-friend-request/:id/reject
 * @access Private
 */
router.put("/send-friend-request/:id/reject", rejectFriendRequest);

/**
 * @desc   Get incoming friend requests
 * @route  GET /api/users/friend-request
 * @access Private
 */
router.get("/friend-request", getFriendRequests);

/**
 * @desc   Get outgoing friend requests
 * @route  GET /api/users/outgoing-request
 * @access Private
 */
router.get("/outgoing-request", getOutgoingRequests);

export default router;

// routes/user.routes.js

// import { sendFriendRequest } from "../controllers/user.controller.js"; // Your JWT middleware







// const router = express.Router();

// router.use(protectRoute);

// router.post("/onboard", onboard);
// router.get("/recommendations", getRecommendedUsers);
// router.get("/friends", getMyfriends);
// router.post("/send-friend-request/:id",protectRoute, sendFriendRequest);
// router.put("/send-friend-request/:id/accept", acceptFriendRequest);
// router.get("/friend-request", getFriendRequests);
// router.get("/outgoing-request", getOutgoingRequests);



// export default router;

