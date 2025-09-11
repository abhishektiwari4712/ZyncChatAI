import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  sendVoice,
  textToSpeech,
  playAudioFromUrl,
  playAudioFromBase64,
} from "../../lib/api.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

import "./AIVoice.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export default function AIVoice() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [displayedTranscript, setDisplayedTranscript] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [displayedReply, setDisplayedReply] = useState("");
  const [textToSpeak, setTextToSpeak] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const socketRef = useRef(null);
  const [socketId, setSocketId] = useState(null);

  /* ===============================
     SOCKET.IO SETUP
  =============================== */
  useEffect(() => {
    socketRef.current = io(API_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      setSocketId(socketRef.current.id);
      console.log("✅ Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("voice:reply", (data) => {
      if (data.transcript) setTranscript(data.transcript);
      if (data.reply) setAiReply(data.reply);
      if (data.audioUrl) playAudioFromUrl(data.audioUrl);
      if (data.audioBase64) playAudioFromBase64(data.audioBase64);
    });

    socketRef.current.on("connect_error", () => {
      toast.error("❌ Socket connection failed");
    });

    return () => socketRef.current?.disconnect();
  }, []);

  /* ===============================
     Typewriter effect for transcript
  =============================== */
  useEffect(() => {
    let idx = 0;
    setDisplayedTranscript("");
    if (!transcript) return;
    const interval = setInterval(() => {
      setDisplayedTranscript((prev) => prev + transcript[idx]);
      idx++;
      if (idx >= transcript.length) clearInterval(interval);
    }, 25); // typing speed
    return () => clearInterval(interval);
  }, [transcript]);

  /* ===============================
     Typewriter effect for AI reply
  =============================== */
  useEffect(() => {
    let idx = 0;
    setDisplayedReply("");
    if (!aiReply) return;
    const interval = setInterval(() => {
      setDisplayedReply((prev) => prev + aiReply[idx]);
      idx++;
      if (idx >= aiReply.length) clearInterval(interval);
    }, 30); // typing speed
    return () => clearInterval(interval);
  }, [aiReply]);

  /* ===============================
     RECORDING
  =============================== */
  const startRecording = async () => {
    setTranscript("");
    setAiReply("");
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleAudioUpload(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setRecording(true);
    } catch (err) {
      toast.error("🎙 Microphone access required");
    }
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  /* ===============================
     HANDLE AUDIO UPLOAD (STT + AI)
  =============================== */
  const handleAudioUpload = async (audioBlob) => {
    try {
      const data = await sendVoice(audioBlob, socketId);

      if (data.transcript) setTranscript(data.transcript);
      if (data.text) setAiReply(data.text);

      if (data.audioUrl) playAudioFromUrl(data.audioUrl);
      if (data.audioBase64) playAudioFromBase64(data.audioBase64);
    } catch (err) {
      toast.error(err.error || "❌ STT failed");
    }
  };

  /* ===============================
     HANDLE TTS
  =============================== */
  const handleSpeakText = async () => {
    if (!textToSpeak?.trim()) return toast.warning("Enter text to speak");
    try {
      const arrayBuffer = await textToSpeech(textToSpeak);

      // Convert ArrayBuffer → Audio
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play().catch(() => toast.error("Playback failed"));
    } catch (err) {
      toast.error(err.error || "❌ TTS failed");
    }
  };

  /* ===============================
     BROWSER BUILT-IN TTS
  =============================== */
  const speakWithBrowserTTS = (text) => {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="ai-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="ai-title">🎤 AI Voice Assistant</h2>

      {/* STT + AI Reply */}
      <section className="ai-section">
        <h4>1) 🎙 Record voice (Speech → Text → AI Reply)</h4>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={recording ? stopRecording : startRecording}
          className={`record-btn ${recording ? "recording" : ""}`}
        >
          {recording ? "⏹ Stop Recording" : "🎙 Start Recording"}
        </motion.button>
        <span className={`record-status ${recording ? "active" : ""}`}>
          {recording ? "● Recording..." : ""}
        </span>

        <div className="transcript-box">
          <strong>Transcript:</strong>
          <motion.div
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.5 }}
            className="text-box typewriter"
          >
            {displayedTranscript || <i>No transcript yet</i>}
          </motion.div>
        </div>

        <div className="ai-reply-box">
          <strong>AI Reply:</strong>
          <motion.div
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.5 }}
            className="text-box ai-reply typewriter"
          >
            {displayedReply || <i>No reply</i>}
          </motion.div>
          <button className="tts-btn" onClick={() => speakWithBrowserTTS(aiReply)}>
            🔊 Speak Reply (Browser TTS)
          </button>
        </div>
      </section>

      <hr />

      {/* TTS from typed text */}
      <section className="ai-section">
        <h4>2) ⌨️ Type text → Hear voice (TTS)</h4>
        <textarea
          className="tts-textarea"
          placeholder="Type text here"
          value={textToSpeak}
          onChange={(e) => setTextToSpeak(e.target.value)}
        />
        <div className="tts-buttons">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpeakText}
            className="tts-btn green"
          >
            🔈 Speak (Server TTS)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speakWithBrowserTTS(textToSpeak)}
            className="tts-btn gray"
          >
            🔈 Speak (Browser TTS)
          </motion.button>
        </div>
      </section>
    </div>
  );
}


// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import {
//   sendVoice,
//   textToSpeech,
//   playAudioFromUrl,
//   playAudioFromBase64,
// } from "../../lib/api.js";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { motion } from "framer-motion";

// // Backend URL
// const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

// export default function AIVoice() {
//   const [recording, setRecording] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [aiReply, setAiReply] = useState("");
//   const [textToSpeak, setTextToSpeak] = useState("");
//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);
//   const socketRef = useRef(null);
//   const [socketId, setSocketId] = useState(null);

//   // ----------------- Socket.IO Setup -----------------
//   useEffect(() => {
//     socketRef.current = io(API_URL, { transports: ["websocket"] });

//     socketRef.current.on("connect", () => {
//       setSocketId(socketRef.current.id);
//       console.log("✅ Socket connected:", socketRef.current.id);
//     });

//     socketRef.current.on("voice:reply", (data) => {
//       if (data.transcript) setTranscript(data.transcript);
//       if (data.reply) setAiReply(data.reply);
//       if (data.audioUrl) playAudioFromUrl(data.audioUrl);
//       if (data.audioBase64) playAudioFromBase64(data.audioBase64);
//     });

//     socketRef.current.on("connect_error", (err) => {
//       console.error("❌ Socket connection error:", err.message);
//       toast.error("Socket connection failed");
//     });

//     return () => socketRef.current?.disconnect();
//   }, []);

//   // ----------------- Record Voice -----------------
//   const startRecording = async () => {
//     setTranscript("");
//     setAiReply("");
//     chunksRef.current = [];

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mr = new MediaRecorder(stream);
//       mediaRecorderRef.current = mr;

//       mr.ondataavailable = (e) => {
//         if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
//       };

//       mr.onstop = async () => {
//         const blob = new Blob(chunksRef.current, { type: "audio/webm" });
//         await handleAudioUpload(blob);
//         stream.getTracks().forEach((t) => t.stop());
//       };

//       mr.start();
//       setRecording(true);
//     } catch (err) {
//       console.error("❌ Microphone error:", err);
//       toast.error("Microphone access required");
//     }
//   };

//   const stopRecording = () => {
//     setRecording(false);
//     mediaRecorderRef.current?.stop();
//   };

//   // ----------------- Upload Audio & Get AI Reply -----------------
//   const handleAudioUpload = async (audioBlob) => {
//     try {
//       const data = await sendVoice(audioBlob, socketId);
//       if (data.transcript) setTranscript(data.transcript);
//       if (data.text) setAiReply(data.text);

//       if (data.audioUrl) playAudioFromUrl(data.audioUrl);
//       if (data.audioBase64) playAudioFromBase64(data.audioBase64);
//     } catch (err) {
//       console.error("❌ STT upload error:", err);
//       toast.error(err.error || "STT failed");
//     }
//   };

//   // ----------------- Text-to-Speech -----------------
//   const handleSpeakText = async () => {
//     if (!textToSpeak?.trim()) return toast.warning("Enter text to speak");
//     try {
//       const data = await textToSpeech(textToSpeak);
//       if (data.audioUrl) playAudioFromUrl(data.audioUrl);
//       else if (data.audioBase64) playAudioFromBase64(data.audioBase64);
//       else toast.error("TTS response did not include audio");
//     } catch (err) {
//       console.error("❌ TTS error:", err);
//       toast.error(err.error || "TTS failed");
//     }
//   };

//   // ----------------- Browser TTS fallback -----------------
//   const speakWithBrowserTTS = (text) => {
//     if (!text || !("speechSynthesis" in window)) return;
//     window.speechSynthesis.cancel();
//     window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
//   };

//   return (
//     <div style={{ padding: 20, maxWidth: 900, margin: "0 auto", fontFamily: "Arial" }}>
//       <ToastContainer position="top-right" autoClose={3000} />

//       <h2 style={{ textAlign: "center", marginBottom: 20 }}>🎤 AI Voice Assistant</h2>

//       {/* --- STT Section --- */}
//       <section style={{ marginBottom: 30 }}>
//         <h4>1) 🎙 Record voice (Speech → Text → AI Reply)</h4>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={recording ? stopRecording : startRecording}
//           style={{
//             padding: "12px 24px",
//             background: recording ? "#dc3545" : "#28a745",
//             color: "#fff",
//             border: "none",
//             borderRadius: 8,
//             cursor: "pointer",
//             fontSize: 16,
//           }}
//         >
//           {recording ? "⏹ Stop Recording" : "🎙 Start Recording"}
//         </motion.button>
//         <span style={{ marginLeft: 12, color: recording ? "red" : "gray" }}>
//           {recording ? "● Recording..." : ""}
//         </span>

//         <div style={{ marginTop: 16 }}>
//           <strong>Transcript:</strong>
//           <motion.div
//             animate={{ opacity: [0, 1] }}
//             transition={{ duration: 0.5 }}
//             style={{
//               border: "1px solid #ddd",
//               padding: 12,
//               minHeight: 60,
//               whiteSpace: "pre-wrap",
//               background: "#fafafa",
//               borderRadius: 6,
//             }}
//           >
//             {transcript || <i>No transcript yet</i>}
//           </motion.div>
//         </div>

//         <div style={{ marginTop: 16 }}>
//           <strong>AI Reply:</strong>
//           <motion.div
//             animate={{ opacity: [0, 1] }}
//             transition={{ duration: 0.5 }}
//             style={{
//               border: "1px solid #ddd",
//               padding: 12,
//               minHeight: 60,
//               background: "#f0f8ff",
//               borderRadius: 6,
//             }}
//           >
//             {aiReply || <i>No reply</i>}
//           </motion.div>
//           <div style={{ marginTop: 8 }}>
//             <button
//               onClick={() => speakWithBrowserTTS(aiReply)}
//               style={{
//                 padding: "6px 14px",
//                 background: "#007bff",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: 4,
//                 cursor: "pointer",
//               }}
//             >
//               🔊 Speak Reply (Browser TTS)
//             </button>
//           </div>
//         </div>
//       </section>

//       <hr />

//       {/* --- TTS Section --- */}
//       <section style={{ marginTop: 20 }}>
//         <h4>2) ⌨️ Type text → Hear voice (TTS)</h4>
//         <textarea
//           style={{ width: "100%", minHeight: 100, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
//           placeholder="Type text here"
//           value={textToSpeak}
//           onChange={(e) => setTextToSpeak(e.target.value)}
//         />
//         <div style={{ marginTop: 12 }}>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handleSpeakText}
//             style={{
//               padding: "10px 18px",
//               background: "#28a745",
//               color: "#fff",
//               border: "none",
//               borderRadius: 6,
//               cursor: "pointer",
//               marginRight: 8,
//             }}
//           >
//             🔈 Speak (Server TTS)
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => speakWithBrowserTTS(textToSpeak)}
//             style={{
//               padding: "10px 18px",
//               background: "#6c757d",
//               color: "#fff",
//               border: "none",
//               borderRadius: 6,
//               cursor: "pointer",
//             }}
//           >
//             🔈 Speak (Browser TTS)
//           </motion.button>
//         </div>
//       </section>
//     </div>
//   );
// }


// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import {
//   sendVoice,
//   textToSpeech,
//   playAudioFromUrl,
//   playAudioFromBase64,
// } from "../../lib/api.js";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

// export default function AIVoice() {
//   const [recording, setRecording] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [aiReply, setAiReply] = useState("");
//   const [textToSpeak, setTextToSpeak] = useState("");
//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);
//   const socketRef = useRef(null);
//   const [socketId, setSocketId] = useState(null);

//   useEffect(() => {
//     socketRef.current = io(API_URL, { transports: ["websocket"] });
//     socketRef.current.on("connect", () => {
//       setSocketId(socketRef.current.id);
//       console.log("✅ socket connected:", socketRef.current.id);
//     });
//     socketRef.current.on("voice:reply", (data) => {
//       if (data.transcript) setTranscript(data.transcript);
//       if (data.reply) setAiReply(data.reply);
//       if (data.audioUrl) playAudioFromUrl(data.audioUrl);
//       if (data.audioBase64) playAudioFromBase64(data.audioBase64);
//     });
//     return () => socketRef.current?.disconnect();
//   }, []);

//   const startRecording = async () => {
//     setTranscript(""); setAiReply(""); chunksRef.current = [];
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mr = new MediaRecorder(stream);
//       mediaRecorderRef.current = mr;

//       mr.ondataavailable = (e) => {
//         if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
//       };

//       mr.onstop = async () => {
//         const blob = new Blob(chunksRef.current, { type: "audio/webm" });
//         await handleAudioUpload(blob);
//         stream.getTracks().forEach((t) => t.stop());
//       };

//       mr.start();
//       setRecording(true);
//     } catch (err) {
//       console.error("❌ Microphone error:", err);
//       alert("Microphone access required.");
//     }
//   };

//   const stopRecording = () => {
//     setRecording(false);
//     mediaRecorderRef.current?.stop();
//   };

//   const handleAudioUpload = async (audioBlob) => {
//     try {
//       const data = await sendVoice(audioBlob, socketId);
//       const text = data.text || data.transcript || "";
//       const reply = data.reply || "";

//       if (text) setTranscript(text);
//       if (reply) setAiReply(reply);

//       if (data.audioUrl) playAudioFromUrl(data.audioUrl);
//       if (data.audioBase64) playAudioFromBase64(data.audioBase64);
//     } catch (err) {
//       console.error("❌ STT upload error:", err);
//       alert("STT failed.");
//     }
//   };

//   const handleSpeakText = async () => {
//     if (!textToSpeak?.trim()) return alert("Enter text to speak.");
//     try {
//       const data = await textToSpeech(textToSpeak);
//       if (data.audioUrl) playAudioFromUrl(data.audioUrl);
//       else if (data.audioBase64) playAudioFromBase64(data.audioBase64);
//       else alert("TTS response did not include audio.");
//     } catch (err) {
//       console.error("❌ TTS error:", err);
//       alert("TTS failed.");
//     }
//   };

//   const speakWithBrowserTTS = (text) => {
//     if (!text || !("speechSynthesis" in window)) return;
//     window.speechSynthesis.cancel();
//     window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
//   };

//   return (
//     <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
//       <h2>🎤 AI Voice Tutor</h2>

//       <section style={{ marginBottom: 20 }}>
//         <h4>1) Record voice (STT)</h4>
//         <button onClick={recording ? stopRecording : startRecording}>
//           {recording ? "⏹ Stop Recording" : "🎙 Start Recording"}
//         </button>
//         <span style={{ marginLeft: 10 }}>{recording ? "● Recording..." : ""}</span>

//         <div style={{ marginTop: 12 }}>
//           <strong>Transcript:</strong>
//           <div style={{ border: "1px solid #ddd", padding: 10, minHeight: 60, whiteSpace: "pre-wrap" }}>
//             {transcript || <i>No transcript yet</i>}
//           </div>
//         </div>

//         <div style={{ marginTop: 12 }}>
//           <strong>AI Reply:</strong>
//           <div style={{ border: "1px solid #ddd", padding: 10, minHeight: 60 }}>
//             {aiReply || <i>No reply</i>}
//           </div>
//           <div style={{ marginTop: 8 }}>
//             <button onClick={() => speakWithBrowserTTS(aiReply)}>🔊 Speak reply</button>
//           </div>
//         </div>
//       </section>

//       <hr />

//       <section style={{ marginTop: 20 }}>
//         <h4>2) Type text → Speak (TTS)</h4>
//         <textarea
//           style={{ width: "100%", minHeight: 80, padding: 8 }}
//           placeholder="Type text here"
//           value={textToSpeak}
//           onChange={(e) => setTextToSpeak(e.target.value)}
//         />
//         <div style={{ marginTop: 8 }}>
//           <button onClick={handleSpeakText}>🔈 Speak (server TTS)</button>
//           <button style={{ marginLeft: 8 }} onClick={() => speakWithBrowserTTS(textToSpeak)}>🔈 Speak (browser TTS)</button>
//         </div>
//       </section>
//     </div>
//   );
// }
