import React, { useState, useEffect, useRef } from 'react';
import { XIcon, CameraIcon, SaveIcon, UploadIcon, TrashIcon } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser';
import { LANGUAGES } from '../constants/index.js';
import './ProfileEdit.css';

const ProfileEdit = ({ isOpen, onClose }) => {
  const { authUser, completeOnboarding, isOnboarding } = useAuthUser();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    nativeLanguage: '',
    learningLanguage: '',
    location: '',
    profilePic: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Load current user data when component opens
  useEffect(() => {
    if (isOpen && authUser) {
      setFormData({
        fullName: authUser.fullName || '',
        bio: authUser.bio || '',
        nativeLanguage: authUser.nativeLanguage || '',
        learningLanguage: authUser.learningLanguage || '',
        location: authUser.location || '',
        profilePic: authUser.profilePic || 'https://api.dicebear.com/6.x/big-smile/svg?seed=default'
      });
      setUploadedImage(null);
    }
  }, [isOpen, authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarGenerate = () => {
    const seed = Math.random().toString(36).substring(7);
    setFormData(prev => ({
      ...prev,
      profilePic: `https://api.dicebear.com/6.x/big-smile/svg?seed=${seed}`
    }));
    setUploadedImage(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setFormData(prev => ({
          ...prev,
          profilePic: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImage(null);
    setFormData(prev => ({
      ...prev,
      profilePic: authUser?.profilePic || 'https://api.dicebear.com/6.x/big-smile/svg?seed=default'
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.nativeLanguage || !formData.learningLanguage) {
      alert('Please fill in all required fields');
      return;
    }

    setIsEditing(true);
    
    try {
      await completeOnboarding({
        nativeLanguage: formData.nativeLanguage,
        learningLanguage: formData.learningLanguage,
        bio: formData.bio,
        location: formData.location,
        profilePic: formData.profilePic
      });
      
      // Close the modal after successful update
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsEditing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-edit-overlay" onClick={onClose}>
      <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-edit-header">
          <h2 className="profile-edit-title">Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <XIcon size={24} />
          </button>
        </div>

        <div className="profile-edit-content">
          <div className="avatar-section">
            <div className="avatar-container">
              <img
                src={formData.profilePic}
                alt="Profile"
                className="avatar-preview"
              />
              <div className="avatar-overlay">
                <button
                  type="button"
                  className="avatar-edit-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Image"
                >
                  <UploadIcon size={16} />
                </button>
                <button
                  type="button"
                  className="avatar-edit-btn"
                  onClick={handleAvatarGenerate}
                  title="Generate Avatar"
                >
                  <CameraIcon size={16} />
                </button>
                {uploadedImage && (
                  <button
                    type="button"
                    className="avatar-edit-btn remove-btn"
                    onClick={handleRemoveUploadedImage}
                    title="Remove Uploaded Image"
                  >
                    <TrashIcon size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="file-input"
              style={{ display: 'none' }}
            />

            <div className="avatar-actions">
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Upload Image
              </button>
              <button
                type="button"
                className="generate-avatar-btn"
                onClick={handleAvatarGenerate}
              >
                🎲 Generate Avatar
              </button>
            </div>

            <div className="upload-info">
              <p>Supported formats: JPEG, PNG, GIF</p>
              <p>Max size: 5MB</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Tell us about yourself..."
                rows={3}
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
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                placeholder="City, Country"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={isEditing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={isEditing}
              >
                {isEditing ? (
                  <>
                    <div className="spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
