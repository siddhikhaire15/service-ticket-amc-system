import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/auth.css";
import api from "../utils/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/auth/reset-password/${token}`, { password, });
      setSuccess(res.data.message || "Password reset successful");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired link");
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

        {/* RIGHT PANEL */}
        <div className="login-right">
          <form className="form-container" onSubmit={handleReset}>
            <div className="brand">ServiCore</div>

            {/* 🔁 TEXT CHANGE ONLY */}
            <div className="subtitle">Reset your password</div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <input
              type="password"
              placeholder="New Password"
              className="input-field"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="input-field"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* 🔁 SAME BLACK BUTTON */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
