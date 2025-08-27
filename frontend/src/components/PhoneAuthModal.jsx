import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import useAuthUser from "../hooks/useAuthUser";
import "./PhoneAuthModal.css";

const PhoneAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [step, setStep] = useState(1); // 1 for phone number, 2 for OTP
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuthUser();

  // Format phone number to E.164 format
  const formatPhoneNumber = (number) => {
    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // Check if it's a 10-digit Indian number
    if (cleaned.length === 10) {
      return '+91' + cleaned;
    }
    
    // If it already has country code
    if (cleaned.length > 10 && cleaned.startsWith('91')) {
      return '+' + cleaned;
    }
    
    // If it starts with +91 and has 12 digits
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return '+' + cleaned;
    }
    
    // If it already starts with +
    if (number.startsWith('+')) {
      return number;
    }
    
    // Default case - assume it's an Indian number
    return '+91' + cleaned;
  };

  // Validate phone number
  const isValidPhoneNumber = (number) => {
    const formatted = formatPhoneNumber(number);
    // Check if it's a valid E.164 format with +91 country code and 10 digits
    return /^\+91\d{10}$/.test(formatted);
  };

  // Initialize reCAPTCHA
  const setUpRecaptcha = () => {
    // Clear any existing verifier
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    
    // Create new verifier with proper error handling
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: (response) => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        // Response expired, reset reCAPTCHA
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      }
    });
  };

  // Expose the modal open function to window
  useEffect(() => {
    window.openPhoneAuthModal = () => {
      setIsOpen(true);
      setStep(1);
      setPhoneNumber("");
      setOtp("");
      setConfirmationResult(null);
    };

    // Cleanup function
    return () => {
      window.openPhoneAuthModal = null;
      
      // Clean up reCAPTCHA verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate phone number before sending OTP
    if (!isValidPhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      setLoading(false);
      return;
    }
    
    try {
      setUpRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep(2);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      // Handle specific Firebase errors
      if (error.code === 'auth/invalid-phone-number') {
        toast.error("Invalid phone number. Please check the number and try again.");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many requests. Please try again later.");
      } else if (error.code === 'auth/billing-not-enabled') {
        toast.error("Phone authentication is not available at the moment. Please contact support.");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Get the ID token for backend session
      const idToken = await user.getIdToken();
      
      // Expose the token for optional backend session
      window.firebaseIdToken = idToken;
      
      // Login the user through our backend
      await login({ token: idToken, isPhoneAuth: true });
      
      toast.success("Phone verification successful!");
      
      // Close the modal
      handleClose();
      
      // Redirect to homepage
      window.location.href = "/";
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setPhoneNumber("");
    setOtp("");
    setConfirmationResult(null);
    setStep(1);
    setIsOpen(false);
    
    // Clean up reCAPTCHA verifier
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="phone-auth-modal-overlay" onClick={handleClose}>
      <div className="phone-auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Phone Authentication</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter your 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
              <div id="recaptcha-container"></div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter the 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneAuthModal;