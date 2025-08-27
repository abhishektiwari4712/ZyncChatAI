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

  // Initialize reCAPTCHA
  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved
        },
      });
    }
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
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      setUpRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep(2);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
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
                  placeholder="Enter your phone number with country code (e.g., +1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
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