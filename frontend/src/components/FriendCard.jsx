import React from 'react';
import './FriendCard.css';
import { Link } from 'react-router-dom';
import FriendButton from './FriendButton';
import LanguageBadge from './LanguageBadge';

const FriendCard = ({ friends }) => {
  return (
    <div className="friend-card">
      <div className="friend-card-body">
        <div className="friend-user-info">
          <div className="friend-avatar">
            <img src={friends.profilePic} alt={friends.fullName} />
          </div>
          <h3 className="friend-name">{friends.fullName}</h3>
        </div>

        <div className="friend-badges">
          <LanguageBadge 
            language={friends.nativeLanguage} 
            type="Native" 
            className="badge-native"
          />
          <LanguageBadge 
            language={friends.learningLanguage} 
            type="Learning" 
            className="badge-learning"
          />
        </div>

        <Link to={`/chat/${friends._id}`} className="friend-message-btn">
          Message
        </Link>

        {/* ✅ Add Friend Request Button */}
        <FriendButton userId={friends._id} />
      </div>
    </div>
  );
};

export default FriendCard;
