import React from 'react';
import useAuthUser from '../hooks/useAuthUser';
import { Link, useLocation } from 'react-router-dom';
import { BellIcon, ShipWheelIcon, LogOutIcon as LogoutIcon } from 'lucide-react';
import ThemeSelector from './ThemeSelector.jsx';
import useLogout from '../hooks/useLogout';
import './Navbar.css';

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation, isPending } = useLogout();

  const handleLogout = () => {
    logoutMutation();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          {/* Logo Section - Always visible */}
          <div className="navbar-logo">
            <Link to="/" className="navbar-logo-link">
              <ShipWheelIcon className="logo-icon" />
              <span className="logo-text">ZyncChatAI</span>
            </Link>
          </div>

          {/* Right Section - All action icons */}
          <div className="navbar-actions">
            <Link to="/notifications">
              <button className="icon-button">
                <BellIcon className="icon" />
              </button>
            </Link>

            <ThemeSelector />

            {authUser?.profilePic && (
              <div className="avatar">
                <img
                  src={authUser.profilePic}
                  alt="User Avatar"
                  className="avatar-img"
                  rel="noreferrer"
                />
              </div>
            )}

            <button 
              className={`icon-button ${isPending ? 'loading' : ''}`} 
              onClick={handleLogout}
              disabled={isPending}
              title="Logout"
            >
              {isPending ? (
                <div className="spinner-small" />
              ) : (
                <LogoutIcon className="icon" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;