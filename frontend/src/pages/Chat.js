import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './Chat.css';

const Chat = () => {
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
        <div className="chat-container">
          <h2>Messages</h2>
          <div className="chat-list">
            <div className="chat-item">
              <div className="chat-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="chat-preview">
                <h3>John Doe</h3>
                <p>Hey, I'm interested in your project...</p>
              </div>
              <div className="chat-time">2m ago</div>
            </div>
            {/* Add more chat items as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 