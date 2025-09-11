// src/components/FriendButton.jsx
import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FriendButton = ({ userId }) => {
  const handleSendRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/users/send-friend-request/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Friend request sent!');
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Failed to send friend request'
      );
    }
  };

  return (
    <button className="friend-request-btn" onClick={handleSendRequest}>
      Add Friend
    </button>
  );
};

export default FriendButton;
