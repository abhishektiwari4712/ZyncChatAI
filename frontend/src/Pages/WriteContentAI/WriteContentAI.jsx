// // src/components/WriteContentAI.jsx
// src/components/WriteContentAI.jsx
import React, { useState } from "react";
import { seoOptimize } from "../../lib/api.js"; // API function
import "./WriteContentAI.css";

export default function WriteContentAI() {
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [auditUrl, setAuditUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const MAX_WORDS_PREVIEW = 300;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !keywords) return alert("Content and keywords are required!");

    setLoading(true);
    setResult(null);

    try {
      const response = await seoOptimize({
        content,
        keywords: keywords.split(",").map((kw) => kw.trim()),
        auditUrl: auditUrl || null,
      });

      setResult(response);

      setHistory((prev) => [
        {
          id: Date.now(),
          content: response.optimizedContent,
          seoAudit: response.seoAudit,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("SEO Optimization Error:", err);
      alert("Error generating content");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="wcai-container">
      <h2 className="wcai-title">✍️ Write Content AI</h2>

      <form onSubmit={handleSubmit} className="wcai-form">
        <textarea
          className="wcai-textarea"
          placeholder="Enter your topic or content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />

        <input
          className="wcai-input"
          placeholder="Keywords (comma separated)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />

        <input
          className="wcai-input"
          placeholder="Optional: Audit URL"
          value={auditUrl}
          onChange={(e) => setAuditUrl(e.target.value)}
        />

        <button type="submit" className="wcai-btn" disabled={loading}>
          {loading ? "⏳ Generating..." : "🚀 Generate Content"}
        </button>
      </form>

      {loading && (
        <div className="wcai-loading">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      )}

      {result && (
        <div className="wcai-result fade-in">
          <div className="wcai-result-header">
            <h3>✨ Generated Content (Preview)</h3>
            <button
              className="wcai-copy-btn"
              onClick={() => handleCopy(result.optimizedContent)}
            >
              Copy
            </button>
          </div>

          <p className="wcai-preview">
            {result.optimizedContent.split(" ").slice(0, MAX_WORDS_PREVIEW).join(" ")}
            {result.optimizedContent.split(" ").length > MAX_WORDS_PREVIEW && " ..."}
          </p>

          {result.seoAudit && (
            <div className="wcai-audit">
              <h4>📊 SEO Audit</h4>
              <p><strong>Title:</strong> {result.seoAudit.title}</p>
              <p><strong>Meta:</strong> {result.seoAudit.metaDesc}</p>
              <p><strong>H1 Tags:</strong> {result.seoAudit.h1Tags.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="wcai-history fade-in">
          <h3>🕘 History</h3>
          <ul>
            {history.map((item) => (
              <li key={item.id} className="wcai-history-item">
                <span>{item.content.split(" ").slice(0, 20).join(" ")}...</span>
                <button
                  className="wcai-history-copy"
                  onClick={() => handleCopy(item.content)}
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// import React, { useState } from "react";
// import { seoOptimize } from "../../lib/api.js"; // use your API function
// import "./WriteContentAI.css";

// export default function WriteContentAI() {
//   const [content, setContent] = useState("");
//   const [keywords, setKeywords] = useState("");
//   const [auditUrl, setAuditUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [history, setHistory] = useState([]);

//   const MAX_WORDS_PREVIEW = 300; // limit words in preview

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!content || !keywords) return alert("Content and keywords are required!");

//     setLoading(true);
//     setResult(null);

//     try {
//       const response = await seoOptimize({
//         content,
//         keywords: keywords.split(",").map((kw) => kw.trim()),
//         auditUrl: auditUrl || null,
//       });

//       setResult(response);

//       // Save to history
//       setHistory((prev) => [
//         {
//           id: Date.now(),
//           content: response.optimizedContent,
//           seoAudit: response.seoAudit,
//         },
//         ...prev,
//       ]);
//     } catch (err) {
//       console.error("SEO Optimization Error:", err);
//       alert("Error generating content");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCopy = (text) => {
//     navigator.clipboard.writeText(text);
//     alert("Copied to clipboard!");
//   };

//   return (
//     <div className="wcai-container">
//       <h2 className="wcai-title">Write Content AI</h2>

//       <form onSubmit={handleSubmit} className="wcai-form">
//         <textarea
//           className="wcai-textarea"
//           placeholder="Enter your topic or content here"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           rows={3}
//         />

//         <input
//           className="wcai-input"
//           placeholder="Keywords (comma separated)"
//           value={keywords}
//           onChange={(e) => setKeywords(e.target.value)}
//         />

//         <input
//           className="wcai-input"
//           placeholder="Optional: Audit URL"
//           value={auditUrl}
//           onChange={(e) => setAuditUrl(e.target.value)}
//         />

//         <button type="submit" className="wcai-btn" disabled={loading}>
//           {loading ? "Generating..." : "Generate Content"}
//         </button>
//       </form>

//       {loading && <div className="wcai-loading">Generating content...</div>}

//       {result && (
//         <div className="wcai-result">
//           <div className="wcai-result-header">
//             <h3>Generated Content (Preview)</h3>
//             <button
//               className="wcai-copy-btn"
//               onClick={() => handleCopy(result.optimizedContent)}
//             >
//               Copy
//             </button>
//           </div>

//           <p className="wcai-preview">
//             {result.optimizedContent.split(" ").slice(0, MAX_WORDS_PREVIEW).join(" ")}
//             {result.optimizedContent.split(" ").length > MAX_WORDS_PREVIEW && " ..."}
//           </p>

//           {result.seoAudit && (
//             <div className="wcai-audit">
//               <h4>SEO Audit</h4>
//               <p><strong>Title:</strong> {result.seoAudit.title}</p>
//               <p><strong>Meta:</strong> {result.seoAudit.metaDesc}</p>
//               <p><strong>H1 Tags:</strong> {result.seoAudit.h1Tags.join(", ")}</p>
//             </div>
//           )}
//         </div>
//       )}

//       {history.length > 0 && (
//         <div className="wcai-history">
//           <h3>History</h3>
//           <ul>
//             {history.map((item) => (
//               <li key={item.id} className="wcai-history-item">
//                 <span>{item.content.split(" ").slice(0, 20).join(" ")}...</span>
//                 <button
//                   className="wcai-history-copy"
//                   onClick={() => handleCopy(item.content)}
//                 >
//                   Copy
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }
