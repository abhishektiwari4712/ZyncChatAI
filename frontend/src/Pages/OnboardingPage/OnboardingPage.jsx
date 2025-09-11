// src/OnboardingPage/OnboardingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../../hooks/useAuthUser.js";
import { LANGUAGES } from "../../constants/index.js";
import "./OnboardingPage.css";

const OnboardingPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    location: "",
    profilePic: "https://api.dicebear.com/6.x/big-smile/svg?seed=default",
  });

  const navigate = useNavigate();
  const { authUser, completeOnboarding, isOnboarding } = useAuthUser();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarGenerate = () => {
    const seed = Math.random().toString(36).substring(7);
    setFormData((prev) => ({
      ...prev,
      profilePic: `https://api.dicebear.com/6.x/big-smile/svg?seed=${seed}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.nativeLanguage || !formData.learningLanguage) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await completeOnboarding({
        nativeLanguage: formData.nativeLanguage,
        learningLanguage: formData.learningLanguage,
        bio: formData.bio,
        location: formData.location,
        profilePic: formData.profilePic,
      });
      // navigate("/") is already handled inside the hook
    } catch (err) {
      console.error("Onboarding error:", err);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h2 className="onboarding-title">Complete Your Profile</h2>
        <p className="onboarding-subtitle">Tell us about yourself to get started</p>

        <div className="onboarding-content">
          <div className="avatar-section">
            <img
              src={formData.profilePic}
              alt="Avatar"
              className="avatar-preview"
            />
            <button
              type="button"
              className="avatar-generate-btn"
              onClick={handleAvatarGenerate}
            >
              🎲 Generate New Avatar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="onboarding-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="form-textarea"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Native Language *</label>
                <select
                  name="nativeLanguage"
                  value={formData.nativeLanguage}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Learning Language *</label>
                <select
                  name="learningLanguage"
                  value={formData.learningLanguage}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select language to learn</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isOnboarding}
            >
              {isOnboarding ? (
                <>
                  <div className="spinner" />
                  Completing Profile...
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
