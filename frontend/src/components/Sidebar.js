import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ 
  setShowNewPostForm, 
  handleProfileClick,
  handleSeekingClick,
  handleRecruitingClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (action) => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      // Set a timeout to allow navigation to complete before executing the action
      setTimeout(() => {
        if (action === 'seeking') {
          handleSeekingClick?.();
        } else if (action === 'recruiting') {
          handleRecruitingClick?.();
        }
      }, 0);
    } else {
      // If already on dashboard, just execute the action
      if (action === 'seeking') {
        handleSeekingClick?.();
      } else if (action === 'recruiting') {
        handleRecruitingClick?.();
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-buttons">
        <button className="sidebar-btn" onClick={() => handleNavigation('seeking')}>
          <i className="fas fa-search"></i>
          Seeking
        </button>
        <button className="sidebar-btn" onClick={() => handleNavigation('recruiting')}>
          <i className="fas fa-user-tie"></i>
          Recruiting
        </button>
        <button className="sidebar-btn">
          <i className="fas fa-star"></i>
          Interested
        </button>
        <button className="sidebar-btn">
          <i className="fas fa-briefcase"></i>
          Currently Working
        </button>
      </div>
      <div className="sidebar-bottom">
        <button className="sidebar-btn" onClick={() => setShowNewPostForm?.(true)}>
          <i className="fas fa-plus-circle"></i>
          Add New Post
        </button>
        {/* Updated Search Button */}
        <button className="sidebar-btn" onClick={() => navigate('/search')}>
          <i className="fas fa-search"></i>
          Search
        </button>
        <button className="sidebar-btn" onClick={handleProfileClick}>
          <i className="fas fa-user-circle"></i>
          My Profile
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
