import React, { useState } from "react";
import { generatePrompt } from "../../lib/api.js";
import "./TextToPrompt.css"; // ✅ CSS file import

export default function TextToPrompt() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return alert("Please enter a prompt!");

    setLoading(true);
    try {
      const response = await generatePrompt(prompt);
      setResult(response);
    } catch (err) {
      console.error("❌ Error generating prompt:", err);
      alert("Error generating prompt!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tp-container">
      <h2 className="tp-title">✨ Text to Prompt</h2>

      <textarea
        rows="4"
        className="tp-textarea"
        placeholder="Enter your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="tp-button"
      >
        {loading ? "⏳ Generating..." : "🚀 Generate Prompt"}
      </button>

      {result && (
        <div className="tp-output">
          <h3>✅ Prompt Used:</h3>
          <p>{result.prompt}</p>

          <h3>📝 Generated Output:</h3>
          <p>{result.output}</p>
        </div>
      )}
    </div>
  );
}


// import React, { useState } from "react";
// import api from "../lib/api.js"

// export default function TextToPrompt() {
//   const [prompt, setPrompt] = useState("");
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleGenerate = async () => {
//     if (!prompt.trim()) return alert("Please enter a prompt!");

//     setLoading(true);
//     try {
//       const response = await ap.post("http://localhost:5001/api/text-to-image", {
//         prompt: prompt,
//       });

//       setResult(response.data);
//     } catch (err) {
//       console.error(err);
//       alert("Error generating prompt!");
//     }
//     setLoading(false);
//   };

//   return (
//     <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
//       <h2>Text to Prompt</h2>

//       <textarea
//         rows="4"
//         style={{ width: "100%", padding: "10px" }}
//         placeholder="Enter your prompt..."
//         value={prompt}
//         onChange={(e) => setPrompt(e.target.value)}
//       />

//       <br />
//       <button onClick={handleGenerate} disabled={loading} style={{ marginTop: "10px" }}>
//         {loading ? "Generating..." : "Generate Prompt"}
//       </button>

//       {result && (
//         <div style={{ marginTop: "20px", background: "#f4f4f4", padding: "15px" }}>
//           <h3>✅ Prompt Used:</h3>
//           <p>{result.prompt}</p>

//           <h3>📝 Generated Output:</h3>
//           <p>{result.output}</p>
//         </div>
//       )}
//     </div>
//   );
// }
