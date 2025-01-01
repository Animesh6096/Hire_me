import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";
import Chat from './pages/Chat';
import AboutUs from './pages/AboutUs';
import "./App.css";
import SearchComponent from "./pages/SearchComponent";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="nav-container">
          <div className="nav-content">
            <h1 className="app-title">HireMe</h1>
            <div className="nav-links">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/payment" className="nav-link">Payment</Link>
                  <Link to="/chat" className="nav-link">Chat</Link>
                  <Link to="/about" className="nav-link">About Us</Link>
                  <button onClick={handleSignOut} className="nav-link signout-btn">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/register" className="nav-link">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            !isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />
          } />
          <Route path="/register" element={
            !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
          } />
          <Route path="/search" element={<SearchComponent />} />
          <Route path="/dashboard" element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          } />
          <Route path="/payment" element={
            isAuthenticated ? <Payment /> : <Navigate to="/login" />
          } />
          <Route path="/chat" element={
            isAuthenticated ? <Chat /> : <Navigate to="/login" />
          } />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;