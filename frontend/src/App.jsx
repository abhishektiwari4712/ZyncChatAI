// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout";
import useThemeStore from "./store/useThemeStore";

import Home from "./Pages/Home/Home.jsx";
import Login from "./Pages/Login/Login.jsx";
import Signup from "./Pages/Signup/Signup.jsx";
import OnboardingPage from "./Pages/OnboardingPage/OnboardingPage.jsx";
import Dashboard from "./Pages/Dashboard/Dashboard.jsx";
import ChatPage from "./Pages/ChatPage/ChatPage.jsx";
import CallPage from "./Pages/CallPage/CallPage.jsx";
import Notification from "./Pages/Notification/Notification.jsx";
import TextToPrompt from "./Pages/TexttoPrompt/TexttoPrompt.jsx"; // ✅ imported
import WriteContentAI from "./Pages/WriteContentAI/WriteContentAI.jsx";
import AIVoice from "./Pages/AIVOICE/AIVoice.jsx"

const Protected = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthUser();

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const OnboardingGate = ({ children }) => {
  const { isOnboarded, isLoading } = useAuthUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isOnboarded ? <Navigate to="/" replace /> : children;
};

export default function App() {
  const { isLoading } = useAuthUser();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  if (localStorage.getItem("token") && isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <Layout showSidebar={true}>
                <Home />
              </Layout>
            </Protected>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/onboarding"
          element={
            <Protected>
              <OnboardingGate>
                <OnboardingPage />
              </OnboardingGate>
            </Protected>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Layout showSidebar={true}>
                <Dashboard />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <Protected>
              <Layout showSidebar={true}>
                <ChatPage />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/call/:id"
          element={
            <Protected>
              <Layout showSidebar={true}>
                <CallPage />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/notifications"
          element={
            <Protected>
              <Layout showSidebar={true}>
                <Notification />
              </Layout>
            </Protected>
          }
        />

        {/* ✅ New Route for TextToPrompt */}
        <Route
          path="/text-to-prompt"
          element={
            <Protected>
              <Layout showSidebar={true}>
                <TextToPrompt />
              </Layout>
            </Protected>
          }
        />
        {/* ✅ Write Content AI Route */}
        <Route
          path="/seo-optimize"
          element={
            <Protected>
              <Layout showSidebar={true}>
                <WriteContentAI />
              </Layout>
            </Protected>
          }
        />
        <Route path="/ai-voice" 
        element={
          <Protected>
          <Layout showSidebar={true}>
          <AIVoice />
          </Layout>
          </Protected>
        } 
        />

        


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
