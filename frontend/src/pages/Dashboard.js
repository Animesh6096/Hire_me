import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState({
    jobTitle: '',
    description: '',
    requiredSkills: '',
    requiredTime: '',
    location: '',
    type: 'remote',
    salary: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to save the post
    console.log('New post:', newPost);
    setShowNewPostForm(false);
    setNewPost({
      jobTitle: '',
      description: '',
      requiredSkills: '',
      requiredTime: '',
      location: '',
      type: 'remote',
      salary: ''
    });
  };

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }
      const response = await api.get(`/users/${userId}`);
      setUserInfo(response.data);
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError(err.message || 'Failed to fetch user information');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = () => {
    setShowUserInfo(true);
    fetchUserInfo();
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-buttons">
          <button className="sidebar-btn">
            <i className="fas fa-search"></i>
            Seeking
          </button>
          <button className="sidebar-btn">
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
          <button className="sidebar-btn" onClick={() => setShowNewPostForm(true)}>
            <i className="fas fa-plus-circle"></i>
            Add New Post
          </button>
          <button className="sidebar-btn">
            <i className="fas fa-search"></i>
            Search
          </button>
          <button className="sidebar-btn" onClick={handleProfileClick}>
            <i className="fas fa-user-circle"></i>
            My Profile
          </button>
        </div>
      </div>

      {/* User Info Modal */}
      {showUserInfo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>My Profile</h2>
              <button className="close-btn" onClick={() => setShowUserInfo(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="user-info-content">
              {loading && <p>Loading...</p>}
              {error && <p className="error">{error}</p>}
              {userInfo && (
                <div className="user-info">
                  <div className="info-group">
                    <label>First Name:</label>
                    <p>{userInfo.firstName}</p>
                  </div>
                  <div className="info-group">
                    <label>Last Name:</label>
                    <p>{userInfo.lastName}</p>
                  </div>
                  <div className="info-group">
                    <label>Email:</label>
                    <p>{userInfo.email}</p>
                  </div>
                  <div className="info-group">
                    <label>Country:</label>
                    <p>{userInfo.country}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewPostForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Post</h2>
              <button className="close-btn" onClick={() => setShowNewPostForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="new-post-form">
              <div className="form-group">
                <label htmlFor="jobTitle">Job Title</label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={newPost.jobTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newPost.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="requiredSkills">Required Skills</label>
                <input
                  type="text"
                  id="requiredSkills"
                  name="requiredSkills"
                  value={newPost.requiredSkills}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              </div>

              <div className="form-group">
                <label htmlFor="requiredTime">Required Time</label>
                <input
                  type="text"
                  id="requiredTime"
                  name="requiredTime"
                  value={newPost.requiredTime}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Full-time, Part-time, 20hrs/week"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newPost.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  name="type"
                  value={newPost.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary</label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={newPost.salary}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., $50,000/year or $30-40/hour"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowNewPostForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard; 