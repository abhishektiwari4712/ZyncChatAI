// // // src/pages/Login.jsx
// // src/Login/Login.jsx
// src/Login/Login.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import useAuthUser from "../../hooks/useAuthUser.js";
import "./Login.css";

const Login = () => {
  const { login, isLoggingIn } = useAuthUser();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-header">
          <h1>ZyncChatAi</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue your language journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="hello@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don’t have an account? <a href="/signup">Create one</a>
          </p>
          <a href="/forgot-password" className="forgot-link">
            Forgot your password?
          </a>
        </div>
      </div>

      <div className="login-right">
        <div className="info-box">
          <h3>Connect with language partners worldwide</h3>
          <p>
            Practice conversations, make friends, and improve your language
            skills together.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import useAuthUser from "../../hooks/useAuthUser.js";
// import "./Login.css";

// const Login = () => {
//   const { login, isLoggingIn } = useAuthUser();
//   const [form, setForm] = useState({ email: "", password: "" });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await login(form);
//       // navigate is handled inside the hook
//     } catch (e) {
//       // mutateAsync throws; toast already shown in hook, but we stop UI here
//       toast.error(e?.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="login-container">
//       <form onSubmit={handleSubmit}>
//         <label>Email address</label>
//         <input
//           type="email"
//           value={form.email}
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//           required
//         />
//         <label>Password</label>
//         <input
//           type="password"
//           value={form.password}
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//           required
//         />
//         <button type="submit" disabled={isLoggingIn}>
//           {isLoggingIn ? "Signing in..." : "Sign in"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;

// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { RotateCw, Ship } from "lucide-react";

// import { login } from "../../lib/api.js"; // ← fixed relative path
// import "./Login.css";

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       const res = await login(formData); // response from API

//       // Normalize different backend shapes:
//       // possible shapes: { user: {...}, token }, { _id, fullName, token }, or { data: {...} }
//       const payload = res?.user ?? res?.data ?? res ?? {};
//       const token = res?.token ?? payload?.token ?? null;

//       if (token) {
//         try {
//           localStorage.setItem("token", token);
//         } catch (err) {
//           // ignore storage errors (e.g., in strict cookies-only setups)
//         }
//       }

//       await queryClient.invalidateQueries(["authUser"]);
//       toast.success("Login successful!");

//       // handle both naming conventions: isOnboarded or onboarded
//       const isOnboarded =
//         payload?.isOnboarded ?? payload?.onboarded ?? res?.isOnboarded ?? res?.onboarded ?? false;

//       if (isOnboarded) {
//         navigate("/", { replace: true });
//       } else {
//         navigate("/onboarding", { replace: true });
//       }
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         {/* Left Panel */}
//         <div className="login-form-panel">
//           <div className="login-header">
//             <Ship className="logo" />
//             <h1>ZyncChatAi</h1>
//           </div>

//           <div className="welcome-text">
//             <h2>Welcome Back</h2>
//             <p>Sign in to your account to continue your language journey.</p>
//           </div>

//           {error && <div className="error-box">{error}</div>}

//           <form onSubmit={handleLogin} className="form">
//             <div className="form-group">
//               <label htmlFor="email">Email address</label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="hello@example.com"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 required
//                 minLength="8"
//               />
//             </div>

//             <div className="form-footer">
//               <div className="remember-me">
//                 <input type="checkbox" id="remember-me" />
//                 <label htmlFor="remember-me">Remember me</label>
//               </div>
//               <Link to="/forgot-password" className="link">
//                 Forgot your password?
//               </Link>
//             </div>

//             <button type="submit" className="submit-btn" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <RotateCw className="spinner" />
//                   Signing in...
//                 </>
//               ) : (
//                 "Sign In"
//               )}
//             </button>
//           </form>

//           <div className="bottom-text">
//             Don’t have an account?{" "}
//             <Link to="/signup" className="link">
//               Create one
//             </Link>
//           </div>
//         </div>

//         {/* Right Panel */}
//         <div className="login-info-panel">
//           <img src="/Video-call-bro.svg" alt="language partner" />
//           <h3>Connect with language partners worldwide</h3>
//           <p>
//             Practice conversations, make friends, and improve your language skills together.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

