import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './AboutUs.css';

const AboutUs = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        setShowNewPostForm={() => navigate('/dashboard')}
        handleProfileClick={handleProfileClick}
        handleSeekingClick={() => navigate('/dashboard')}
        handleRecruitingClick={() => navigate('/dashboard')}
      />
      <div className="main-content">
        <div className="about-container">
          <h2>About Us</h2>
          <div className="about-content">
            <div className="about-section">
              <h3>Our Mission</h3>
              <p>
                We're dedicated to connecting talented individuals with exciting opportunities
                in the tech industry. Our platform makes it easy for job seekers and recruiters
                to find their perfect match.
              </p>
            </div>
            <div className="about-section">
              <h3>What We Do</h3>
              <p>
                Our platform provides a seamless experience for both job seekers and recruiters.
                We offer advanced matching algorithms, secure payment systems, and efficient
                communication tools to make the hiring process smooth and effective.
              </p>
            </div>
            <div className="about-section">
              <h3>Contact Us</h3>
              <p>
                Email: support@hireme.com<br />
                Phone: (555) 123-4567<br />
                Address: 123 Tech Street, Silicon Valley, CA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 