import { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendMessageToAI } from "../lib/api.js"; // Backend API wrapper
import "./Chatbot.css";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await sendMessageToAI(input); // Call backend
      const botReply = res.reply || "No response from AI";
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    } catch (err) {
      console.error("❌ Frontend AI error:", err);
      toast.error("AI Error! Please try again.");
      setMessages((prev) => [...prev, { from: "bot", text: "AI Error" }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">AI Chatbot</div>
      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.from}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="message bot">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}


// import { useState, useRef, useEffect } from "react";
// import axios from "../lib/axios.js"; // Make sure this axios instance has baseURL = http://localhost:5001
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./Chatbot.css"; // your CSS styles

// export default function Chatbot() {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMessage = { from: "user", text: input };
//     setMessages((prev) => [...prev, userMessage]);
//     setLoading(true);

//     try {
//       const res = await axios.post("/api/ai/chatbot", { message: input });
//       const botReply = res.data.reply || "No response from AI";

//       setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
//     } catch (err) {
//       console.error("❌ Frontend AI error:", err);
//       toast.error("AI Error! Please try again.");
//       setMessages((prev) => [...prev, { from: "bot", text: "AI Error" }]);
//     } finally {
//       setLoading(false);
//     }

//     setInput("");
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !loading) {
//       sendMessage();
//     }
//   };

//   return (
//     <div className="chatbot-container">
//       <div className="chatbot-header">AI Chatbot</div>
//       <div className="chatbot-messages">
//         {messages.map((m, i) => (
//           <div key={i} className={`message ${m.from}`}>
//             {m.text}
//           </div>
//         ))}
//         {loading && <div className="message bot">Typing...</div>}
//         <div ref={messagesEndRef} />
//       </div>
//       <div className="chatbot-input-area">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyPress={handleKeyPress}
//           placeholder="Type a message..."
//           disabled={loading}
//         />
//         <button onClick={sendMessage} disabled={loading}>
//           {loading ? "..." : "Send"}
//         </button>
//       </div>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// }
