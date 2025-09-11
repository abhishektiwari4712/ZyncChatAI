import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequest,
  getFriendRequests,
} from "../../lib/api";
import {
  ClockIcon,
  MessageSquareIcon,
  UserCheckIcon,
  BellIcon,
} from "lucide-react";
import "./Notification.css";
import NoNotificationsFound from "../../components/NoNotificationsFound";

const Notification = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="notification-wrapper">
      <div className="notification-container">
        <h1 className="notification-heading">Notifications</h1>

        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <>
            {/* Incoming Requests */}
            {incomingRequests.length > 0 && (
              <section>
                <h2 className="friend-requests-heading">
                  <UserCheckIcon className="friend-icon" />
                  Friend Requests
                  <span className="request-count">
                    {incomingRequests.length}
                  </span>
                </h2>

                <div className="requests-list">
                  {incomingRequests.map((request) => (
                    <div key={request._id} className="request-card">
                      <div className="request-body">
                        <div className="request-info">
                          <div className="request-avatar">
                            <img
                              src={request.sender.profilePic}
                              alt={request.sender.fullName}
                            />
                          </div>
                          <div>
                            <h3 className="request-name">
                              {request.sender.fullName}
                            </h3>
                            <div className="request-badges">
                              <span className="badge badge-secondary">
                                Native: {request.sender.nativeLanguage}
                              </span>
                              <span className="badge badge-outline">
                                Learning: {request.sender.learningLanguage}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          className="accept-btn"
                          onClick={() => acceptRequestMutation(request._id)}
                          disabled={isPending}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Accepted Requests Notification */}
            {acceptedRequests.length > 0 && (
              <section className="accepted-section">
                <h2 className="accepted-heading">
                  <BellIcon className="accepted-icon" />
                  New Connections
                </h2>

                <div className="accepted-list">
                  {acceptedRequests.map((notification) => (
                    <div key={notification._id} className="accepted-card">
                      <div className="accepted-body">
                        <div className="accepted-avatar">
                          <img
                            src={notification.recipient.profilePic}
                            alt={notification.recipient.fullName}
                          />
                        </div>
                        <div className="accepted-info">
                          <h3 className="accepted-name">
                            {notification.recipient.fullName}
                          </h3>
                          <p className="accepted-text">
                            {notification.recipient.fullName} accepted your
                            friend request
                          </p>
                          <p className="accepted-time">
                            <ClockIcon className="time-icon" />
                            Recently
                          </p>
                        </div>
                        <div className="accepted-badge">
                          <MessageSquareIcon className="badge-icon" />
                          New Friend
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
        {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
          <NoNotificationsFound/>
        )}
      </div>
    </div>
  );
};

export default Notification;
