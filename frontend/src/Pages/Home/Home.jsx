//16aug updated code
// src/Pages/Home/Home.jsx
import React, { useEffect, useState } from 'react';
import './Home.css';
import { Sidebar } from 'lucide-react';
import {
  getRecommendedUsers,
  getUserFriends,
  getOutgoingFriendReqs,
  sendFriendRequest
} from '../../lib/api.js';

import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  MapPinIcon,
  UsersIcon,
  UserPlusIcon
} from 'lucide-react';

import FriendCard from '../../components/FriendCard.jsx';
import NoFriendsFound from '../../components/NoFriendsFound.jsx';
import LanguageBadge from '../../components/LanguageBadge.jsx';

const Home = () => {
  const [friends, setFriends] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [friendsData, recommendedData, outgoingData] = await Promise.all([
          getUserFriends(),
          getRecommendedUsers(),
          getOutgoingFriendReqs()
        ]);

        setFriends(friendsData || []);
        setRecommendedUsers(recommendedData || []);
        setOutgoingRequests(outgoingData || []);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSendFriendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      setOutgoingRequests((prev) => [...prev, { recipient: { _id: userId } }]);
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const isRequestSent = (userId) => {
    // Handle different possible data structures from backend
    return outgoingRequests.some((req) => {
      // Check if req.recipient exists and has _id
      if (req.recipient && req.recipient._id) {
        return req.recipient._id === userId;
      }
      // Check if req.recipient is directly the ID
      if (req.recipient && typeof req.recipient === 'string') {
        return req.recipient === userId;
      }
      // Check if req.recipient is the ID directly
      if (req.recipient === userId) {
        return true;
      }
      return false;
    });
  };

  return (
    <div className="home-container">
      <div className="home-wrapper">
        {/* Header */}
        <div className="home-header">
          <h2 className="home-title">Your Friends</h2>
          <Link to="/notifications" className="friend-request-button">
            <UsersIcon className="icon-small" /> Friend Requests
          </Link>
        </div>

        {/* Friends List */}
        {loading ? (
          <div className="loading-section">
            <span className="spinner" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="friend-grid">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friends={friend} />
            ))}
          </div>
        )}

        {/* Recommendations */}
        <section>
          <div className="section-header">
            <div>
              <h2 className="home-title">Meet New Learners</h2>
              <p className="section-subtitle">
                Discover perfect language exchange partners based on your profile
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading-section">
              <span className="spinner" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="no-recommendation-card">
              <h3 className="no-recommendation-title">No recommendation available</h3>
              <p className="no-recommendation-text">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="recommendation-grid">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = isRequestSent(user._id);
                return (
                  <div key={user._id} className="recommendation-card">
                    <div className="recommendation-body">
                      {/* User Info */}
                      <div className="user-info">
                        <div className="avatar">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>
                        <div>
                          <h3 className="user-name">{user.fullName}</h3>
                          {user.location && (
                            <div className="user-location">
                              <MapPinIcon className="icon-xs" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="language-flags">
                        <LanguageBadge 
                          language={user.nativeLanguage} 
                          type="Native" 
                        />
                        <LanguageBadge 
                          language={user.learningLanguage} 
                          type="Learning" 
                        />
                      </div>

                      {/* Bio */}
                      {user.bio && <p className="user-bio">{user.bio}</p>}

                      {/* Action Button */}
                      <button
                        className={`action-button ${hasRequestBeenSent ? 'disabled' : 'primary'}`}
                        onClick={() => handleSendFriendRequest(user._id)}
                        disabled={hasRequestBeenSent}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="icon-small" /> Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="icon-small" /> Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
