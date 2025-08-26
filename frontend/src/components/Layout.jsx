import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css'; // Import the CSS file

const Layout = ({ showSidebar = false, children }) => {
  return (
    <div className="layout-container">
      <div className="layout-flex">
        {showSidebar && <Sidebar />}

        <div className="layout-main">
          <Navbar />
          <main className="layout-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
