import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/users/login", { email, password });
      const { role, token } = response.data;

      // Store user role and token
      localStorage.setItem("userRole", role);
      localStorage.setItem("authToken", token);
      
      // Set authentication state
      setIsAuthenticated(true);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="form-title">Login</h2>
        <input
          className="input-field"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="input-field"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button className="submit-button" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;