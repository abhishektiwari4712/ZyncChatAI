// src/components/TranslationButton.jsx
import React, { useState } from "react";
import { translateMessage } from "../lib/api.js"; // ✅ backend API call

const TranslationButton = ({ message, recipientLanguage = "hi" }) => {
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!message?.text) return;

    setLoading(true);
    setError("");
    try {
      const translated = await translateMessage(
        message.text,
        recipientLanguage
      );

      // ✅ Agar backend ne kuch na bheja to fallback
      if (!translated) {
        setTranslatedText(message.text);
        setError("⚠️ Could not translate, showing original.");
      } else {
        setTranslatedText(translated);
      }
    } catch (err) {
      console.error("❌ Translation failed:", err);
      setError("❌ Translation failed");
      setTranslatedText(message.text); // fallback to original
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="translation-wrapper" style={{ marginTop: "6px" }}>
      {/* ✅ Show translated text if available else original */}
      <p style={{ margin: "2px 0", fontSize: "0.9rem" }}>
        {translatedText || message.text}
      </p>

      {error && (
        <p style={{ color: "red", fontSize: "0.75rem", margin: "2px 0" }}>
          {error}
        </p>
      )}

      <button
        className="translate-btn"
        style={{
          padding: "4px 8px",
          fontSize: "0.8rem",
          borderRadius: "6px",
          border: "1px solid #007bff",
          backgroundColor: loading ? "#f0f0f0" : "#fff",
          color: "#007bff",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "4px",
          transition: "all 0.2s ease-in-out",
        }}
        onClick={handleTranslate}
        disabled={loading}
      >
        {loading ? "Translating..." : "Translate"}
      </button>
    </div>
  );
};

export default TranslationButton;
