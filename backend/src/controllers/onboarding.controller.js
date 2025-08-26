
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      profilePic
    } = req.body;

    // Validate required fields
    if (!nativeLanguage || !learningLanguage) {
      return res.status(400).json({ 
        success: false, 
        message: "Native language and learning language are required" 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        profilePic,
        isOnboarded: true
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update user in Stream Chat
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || ""
      });
    } catch (streamError) {
      console.error("Error updating Stream user:", streamError);
      // Don't fail the onboarding if Stream update fails
    }

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Onboarding error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Onboarding failed", 
      error: error.message 
    });
  }
};
