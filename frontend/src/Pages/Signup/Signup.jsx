import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthUser from "../../hooks/useAuthUser";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    agree: false,
  });

  const { signup, isSigningUp } = useAuthUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agree) {
      alert("Please agree to the terms and conditions");
      return;
    }

    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      
      // The useAuthUser hook will handle navigation to onboarding
      // No need to manually navigate here
    } catch (err) {
      console.error("Signup error:", err);
      // Error handling is done in the useAuthUser hook
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <h2 className="brand">ZyncChat</h2>
        <h3>Create an Account</h3>
        <p>Join ZyncChat and start your language learning adventure!</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
            />
            I agree to the <a href="#">terms of service</a> and{" "}
            <a href="#">privacy policy</a>
          </label>

          <button type="submit" className="signup-btn" disabled={isSigningUp}>
            {isSigningUp ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="signin-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div className="signup-right">
        <img
          src="/Video-call-bro.svg"
          alt="Illustration"
          className="signup-illustration"
        />
        <h3>Connect with language partners worldwide</h3>
        <p>
          Practice conversations, make friends, and improve your language skills
          together.
        </p>
      </div>
    </div>
  );
};

export default Signup;

