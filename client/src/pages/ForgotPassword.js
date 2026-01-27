import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../utils/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(res.data.message || "Reset link sent to your email");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LEFT PANEL — SAME */}
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

        {/* RIGHT PANEL — SAME */}
        <div className="login-right">
          <form className="form-container" onSubmit={handleForgot}>
            <div className="brand">ServiCore</div>

            {/* 🔁 TEXT CHANGE ONLY */}
            <div className="subtitle">Forgot your password?</div>

            {error && (
              <div className="auth-error">{error}</div>
            )}

            {success && (
              <div className="auth-success">{success}</div>
            )}

            {/* 🔁 ONLY EMAIL */}
            <input
              type="email"
              placeholder="Work Email"
              className="input-field"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* 🔁 SAME BLACK BUTTON */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>

            {/* 🔁 SAME FOOTER STYLE */}
            <div className="footer-text">
              Remember password?{" "}
              <span className="link-text" onClick={() => navigate("/login")}>
                Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
