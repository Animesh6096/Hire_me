import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status when component mounts and when auth token changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    
    // Prevent back button after logout
    window.addEventListener('popstate', checkAuth);
    
    return () => {
      window.removeEventListener('popstate', checkAuth);
    };
  }, []);

  const handleSignOut = () => {
    // Clear any stored user data/tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    
    // Clear browser history and redirect to home
    window.history.pushState(null, '', '/');
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="nav-container">
          <div className="nav-content">
            <h1 className="app-title">Information System</h1>
            <div className="nav-links">
              {isAuthenticated ? (
                // Authenticated navigation links
                <>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/profile" className="nav-link">Profile</Link>
                  <button onClick={handleSignOut} className="nav-link signout-btn">
                    Sign Out
                  </button>
                </>
              ) : (
                // Non-authenticated navigation links
                <>
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/register" className="nav-link">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
              !isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />
            } />
            <Route path="/register" element={
              !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
            } />
            <Route path="/dashboard" element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
            } />
            <Route path="/profile" element={
              isAuthenticated ? <Profile /> : <Navigate to="/login" />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;