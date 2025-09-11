// src/components/Sidebar.jsx
import React, { useState } from 'react';
import useAuthUser from '../hooks/useAuthUser.js';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ShipWheelIcon, 
  UsersIcon, 
  BellIcon, 
  EditIcon,
  FileTextIcon,
  PenToolIcon,
  Mic2Icon // ✅ Added for Text to Prompt
} from 'lucide-react';
import ProfileEdit from './ProfileEdit.jsx';
import './Sidebar.css';


const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileEditOpen(true);
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <ShipWheelIcon className="sidebar-icon" />
            <span className="sidebar-title">ZyncChatAI</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`sidebar-link ${currentPath === '/' ? 'active' : ''}`}
          >
            <HomeIcon className="nav-icon" />
            <span>Home</span>
          </Link>

          <Link
            to="/friends"
            className={`sidebar-link ${currentPath === '/friends' ? 'active' : ''}`}
          >
            <UsersIcon className="nav-icon" />
            <span>Friends</span>
          </Link>

          <Link
            to="/notifications"
            className={`sidebar-link ${currentPath === '/notifications' ? 'active' : ''}`}
          >
            <BellIcon className="nav-icon" />
            <span>Notifications</span>
          </Link>

          {/* ✅ New Link for Text to Prompt */}
          <Link
            to="/text-to-prompt"
            className={`sidebar-link ${currentPath === '/text-to-prompt' ? 'active' : ''}`}
          >
            <FileTextIcon className="nav-icon" />
            <span>Text to Prompt</span>
          </Link>
           {/* ✅ New Link: Write Content AI */}
          <Link
            to="/seo-optimize"
            className={`sidebar-link ${currentPath === '/seo-optimize' ? 'active' : ''}`}
          >
            <PenToolIcon className="nav-icon" />
            <span>Write Content AI</span>
          </Link>
            {/* ✅ AI Voice */}
          <Link
            to="/ai-voice"
            className={`sidebar-link ${currentPath === '/ai-voice' ? 'active' : ''}`}
          >
            <Mic2Icon className="nav-icon" />
            <span>AI Voice</span>
          </Link>
        </nav>

        

        <div className="sidebar-footer">
          <div className="user-info" onClick={handleProfileClick}>
            <div className="avatar">
              {authUser?.profilePic ? (
                <img src={authUser.profilePic} alt="User Avatar" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">👤</div>
              )}
            </div>
            <div className="user-details">
              <p className="user-name">{authUser?.fullName || 'User'}</p>
              <p className="user-status">
                <span className="online-dot" /> Online
              </p>
            </div>
            <EditIcon className="edit-icon" size={16} />
          </div>
        </div>
      </aside>

      <ProfileEdit
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
      />
    </>
  );
};

export default Sidebar;
