import React from 'react';
import './MainDashboard.css';

const MainDashboard = () => {
  // Demo data
  const demoStats = {
    totalJobs: 15,
    activeJobs: 8,
    completedJobs: 5,
    pendingJobs: 2
  };

  const demoRecentPosts = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "Tech Solutions Inc",
      description: "Looking for an experienced React developer...",
      salary: "90,000 - 120,000"
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "Digital Innovations",
      description: "Full stack role with focus on MERN stack...",
      salary: "80,000 - 100,000"
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "Creative Studios",
      description: "Design user interfaces for web applications...",
      salary: "70,000 - 90,000"
    }
  ];

  return (
    <div className="main-dashboard">
      {/* Stats Overview */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <i className="fas fa-file-alt"></i>
          <div className="stat-info">
            <h3>{demoStats.totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-briefcase"></i>
          <div className="stat-info">
            <h3>{demoStats.activeJobs}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-check-circle"></i>
          <div className="stat-info">
            <h3>{demoStats.completedJobs}</h3>
            <p>Completed Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-clock"></i>
          <div className="stat-info">
            <h3>{demoStats.pendingJobs}</h3>
            <p>Pending Jobs</p>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="recent-posts">
        <div className="section-header">
          <h2>Recent Job Posts</h2>
          <button className="view-all-btn">View All Jobs</button>
        </div>
        <div className="posts-grid">
          {demoRecentPosts.map(post => (
            <div key={post.id} className="post-card">
              <h3>{post.title}</h3>
              <p className="company"><i className="fas fa-building"></i> {post.company}</p>
              <p className="description">{post.description}</p>
              <p className="salary"><i className="fas fa-money-bill-wave"></i> ${post.salary}</p>
              <button className="apply-btn">Apply Now</button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="actions-grid">
          <button className="action-btn">
            <i className="fas fa-plus-circle"></i>
            Post New Job
          </button>
          <button className="action-btn">
            <i className="fas fa-search"></i>
            Search Jobs
          </button>
          <button className="action-btn">
            <i className="fas fa-user-edit"></i>
            My Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard; 