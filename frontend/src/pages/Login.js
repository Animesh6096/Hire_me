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
      console.log('Attempting login with:', { email });
      const response = await api.post("/users/login", { email, password });
      console.log('Login response:', response.data);  // Debug log
      
      const { role, user_id } = response.data;
      console.log('Extracted data:', { role, user_id });  // Debug log

      // Store user role and user_id
      localStorage.setItem("userRole", role);
      localStorage.setItem("user_id", user_id);
      console.log('Stored in localStorage:', { 
        storedRole: localStorage.getItem("userRole"),
        storedUserId: localStorage.getItem("user_id")
      });  // Debug log
      
      // Set authentication state
      setIsAuthenticated(true);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);  // Debug log
      setError(err.response?.data?.error || "Login failed. Please check your email and password.");
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