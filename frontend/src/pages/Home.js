import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import welcomeImage from "/Users/animesh/Documents/Project/Hire_me/frontend/src/—Pngtree—work hand drawn purple office_5049440.png"; // Add your image to assets folder

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="text-section">
          <h1>Welcome to HIRE ME</h1>
          <p>
          Your ultimate platform for connecting talent with opportunity. Whether you're a skilled professional looking to showcase your expertise or a business seeking top-notch freelancers, we've got you covered.
          </p>
          <button 
            className="start-button"
            onClick={() => navigate('/register')}
          >
            Let's Start
          </button>
        </div>
        <div className="image-section">
          <img src={welcomeImage} alt="Welcome" className="welcome-image" />
        </div>
      </div>
    </div>
  );
}

export default Home; 