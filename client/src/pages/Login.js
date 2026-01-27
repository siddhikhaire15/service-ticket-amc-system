import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { setAuth } from "../utils/auth";
import api from "../utils/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await api.post("/auth/login", { email, password });

      console.log("LOGIN SUCCESS DATA:", res.data);

      const token = res.data?.token;
      const role = res.data?.user?.role;
      const user = res.data?.user;

      if (!token || !role) {
        console.log("TOKEN:", token);
        console.log("ROLE:", role);
        throw new Error("Token/Role missing in login response");
      }

      // ✅ Store everything correctly (token + role + name/email)
      setAuth(token, user);

      // ✅ Redirect by role
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "engineer") {
        navigate("/engineer/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      console.log("LOGIN FULL ERROR:", err);
      console.log("LOGIN RESPONSE DATA:", err?.response?.data);
      console.log("LOGIN STATUS:", err?.response?.status);

      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LEFT PANEL */}
        <div className="login-left">
          <div className="left-text">
            <div className="title">
              Service Ticket <br />
              & AMC Management <br />
              System
            </div>
          </div>

          <div className="wave-image">
            <img src="/left-visual.png" alt="visual" />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <form className="form-container" onSubmit={handleLogin}>
            <div className="brand">ServiCore</div>
            <div className="subtitle">Login to your account</div>

            {error && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#fecaca",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Work Email"
              className="input-field"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
  type="password"
  placeholder="Password"
  className="input-field"
  required
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

<div className="forgot-wrapper">
  <button
    type="button"
    onClick={() => navigate("/forgot-password")}
    className="forgot-btn"
  >
    Forgot password?
  </button>
</div>







            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="footer-text">
              New user?{" "}
              <span className="link-text" onClick={() => navigate("/register")}>
                Create account
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
