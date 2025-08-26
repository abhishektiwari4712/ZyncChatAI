// // src/components/PrivateRoute.jsx
// src/components/PrivateRoute.jsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import PageLoader from "./PageLoader";

const PrivateRoute = ({ requireOnboarded, inverse }) => {
  const { authUser, isLoading } = useAuthUser();

  if (isLoading) return <PageLoader />;

  const isAuthenticated = !!authUser && !!authUser.token;
  const isOnboarded = !!authUser?.isOnboarded;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Route only for not-onboarded users
  if (requireOnboarded === false && isOnboarded) {
    return <Navigate to="/" replace />;
  }

  // Block access if onboarded is required and user isn't onboarded
  if (requireOnboarded && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;


// import React from "react";
// import { Navigate } from "react-router-dom";
// import useAuthUser from "../hooks/useAuthUser"; // ✅ Custom hook to check auth status
// import PageLoader from "./PageLoader"; 
// import './PrivateRoute.css'// Optional loading spinner

// const PrivateRoute = ({ children }) => {
//   const { authUser, isLoading } = useAuthUser();

//   if (isLoading) return <PageLoader />; // Show loading while checking auth

//   if (!authUser) {
//     // ❌ Not authenticated → redirect to login
//     return <Navigate to="/login" replace />;
//   }

//   // ✅ Authenticated → render the page
//   return children;
// };

// export default PrivateRoute;
