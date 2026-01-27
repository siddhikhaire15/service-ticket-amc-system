import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // ✅ Save Full Name for Topbar welcome message
      localStorage.setItem("name", name);

      // ✅ Go to login page
      navigate("/login");
    } catch (err) {
      setError("Server not reachable");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
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

        <div className="login-right">
          <form
            className="form-container"
            onSubmit={handleRegister}
            noValidate
          >
            <div className="brand">ServiCore</div>
            <div className="subtitle">Create your account</div>

            <input
              type="text"
              placeholder="Full Name"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Work Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Create Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className={`input-field ${error ? "input-error" : ""}`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              required
            />

            {error && <span className="field-error">{error}</span>}

            <button type="submit" className="login-button">
              Register
            </button>

            <div className="footer-text">
              Already have an account?{" "}
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

export default Register;
