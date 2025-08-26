import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { upsertStreamUser } from "../lib/stream.js";

// ✅ Onboard a user
const onboard = async (req, res) => {
  try {
    const { nativeLanguage, learningLanguage } = req.body;

    if (!nativeLanguage || !learningLanguage) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nativeLanguage, learningLanguage, isOnboarded: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User onboarded successfully", user });
  } catch (error) {
    console.error("❌ Error in onboard:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get recommended users
const getRecommendedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("friends");

    const recommendedUsers = await User.find({
      _id: { $ne: req.user._id, $nin: currentUser.friends },
      isOnboarded: true,
    }).select("fullName profilePic nativeLanguage learningLanguage bio location");

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("❌ Error in getRecommendedUsers:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get my friends
const getMyfriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("❌ Error in getMyfriends:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Send a friend request
// ✅ Send a friend request
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id; // Auth middleware should add this
    const recipientId = req.params.id;

    if (senderId.toString() === recipientId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const recipientExists = await User.findById(recipientId);
    if (!recipientExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyRequested = await FriendRequest.findOne({ sender: senderId, recipient: recipientId });
    if (alreadyRequested) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const newRequest = new FriendRequest({ sender: senderId, recipient: recipientId });
    await newRequest.save();

    return res.status(201).json(newRequest);
  } catch (err) {
    console.error("Error sending friend request:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// const sendFriendRequest = async (req, res) => {
//   try {
//     const myId = req.user._id.toString();
//     const recipientId = req.params.id;

//     if (!recipientId || myId === recipientId) {
//       return res.status(400).json({ success: false, message: "Invalid recipient ID" });
//     }

//     const recipient = await User.findById(recipientId);
//     if (!recipient) return res.status(404).json({ success: false, message: "User not found" });

//     if (recipient.friends.includes(req.user._id)) {
//       return res.status(400).json({ success: false, message: "You are already friends" });
//     }

//     const existingRequest = await FriendRequest.findOne({
//       $or: [
//         { sender: req.user._id, recipient: recipientId },
//         { sender: recipientId, recipient: req.user._id },
//       ],
//     });

//     if (existingRequest) {
//       return res.status(400).json({ success: false, message: "Friend request already exists" });
//     }

//     const request = await FriendRequest.create({
//       sender: req.user._id,
//       recipient: recipientId,
//       status: "pending",
//     });

//     res.status(201).json({ success: true, message: "Friend request sent", request });
//   } catch (error) {
//     console.error("❌ Error in sendFriendRequest:", error.message);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// ✅ Accept a friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await FriendRequest.findById(requestId);

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status === "accepted") {
      return res.status(400).json({ success: false, message: "Request already accepted" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.recipient },
    });

    await User.findByIdAndUpdate(request.recipient, {
      $addToSet: { friends: request.sender },
    });

    // Ensure both users exist in Stream Chat
    try {
      const sender = await User.findById(request.sender);
      const recipient = await User.findById(request.recipient);
      
      if (sender) {
        await upsertStreamUser({
          id: sender._id.toString(),
          name: sender.fullName,
          image: sender.profilePic || ""
        });
      }
      
      if (recipient) {
        await upsertStreamUser({
          id: recipient._id.toString(),
          name: recipient.fullName,
          image: recipient.profilePic || ""
        });
      }
    } catch (streamError) {
      console.error("Error ensuring Stream users exist:", streamError);
      // Don't fail the friend request if Stream operations fail
    }

    res.status(200).json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    console.error("❌ Error in acceptFriendRequest:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get incoming requests
const getFriendRequests = async (req, res) => {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      recipient: req.user._id,
      status: "accepted",
    }).populate("sender", "fullName profilePic");

    res.status(200).json({ success: true, incomingReqs, acceptedReqs });
  } catch (error) {
    console.error("❌ Error in getFriendRequests:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get outgoing requests
const getOutgoingRequests = async (req, res) => {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json({ success: true, outgoingRequests });
  } catch (error) {
    console.error("❌ Error in getOutgoingRequests:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Reject a friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await FriendRequest.findById(requestId);

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to reject this request" });
    }
    if (request.status === "rejected") {
      return res.status(400).json({ success: false, message: "Request already rejected" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ success: true, message: "Friend request rejected" });
  } catch (error) {
    console.error("❌ Error in rejectFriendRequest:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  onboard,
  getRecommendedUsers,
  getMyfriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getOutgoingRequests,
};
