import React from 'react';
import './AboutUs.css';

function AboutUs() {
  return (
    <div className="about-us-container">
      <div className="about-us-content">
        <h1>Welcome to Our Platform</h1>
        
        <section className="manual-section">
          <h2>Getting Started</h2>
          <p>Our platform is designed to connect talented individuals with exciting opportunities. Whether you're seeking work or recruiting talent, we've got you covered.</p>
        </section>

        <section className="manual-section">
          <h2>Key Features</h2>
          
          <div className="feature-block">
            <h3>Profile Management</h3>
            <ul>
              <li>Create and customize your professional profile</li>
              <li>Add your educational background</li>
              <li>List your work experience</li>
              <li>Showcase your skills</li>
              <li>Upload a profile photo</li>
            </ul>
          </div>

          <div className="feature-block">
            <h3>Job Posts</h3>
            <ul>
              <li>Create detailed job posts with requirements</li>
              <li>Specify job type (remote, onsite, hybrid)</li>
              <li>Set required skills and experience</li>
              <li>Define salary and time commitment</li>
            </ul>
          </div>

          <div className="feature-block">
            <h3>Interaction Features</h3>
            <ul>
              <li>Apply to interesting positions</li>
              <li>Save posts you're interested in</li>
              <li>Follow other users</li>
              <li>Comment on job posts</li>
              <li>Track your applications</li>
            </ul>
          </div>
        </section>

        <section className="manual-section">
          <h2>Navigation Guide</h2>
          
          <div className="feature-block">
            <h3>Sidebar Navigation</h3>
            <ul>
              <li><strong>Seeking:</strong> Browse available job opportunities</li>
              <li><strong>Recruiting:</strong> Manage your job posts</li>
              <li><strong>My Interactions:</strong> View your applications and saved posts</li>
              <li><strong>Currently Working:</strong> Track your ongoing projects</li>
              <li><strong>Search:</strong> Find specific posts or users</li>
            </ul>
          </div>

          <div className="feature-block">
            <h3>Profile Actions</h3>
            <ul>
              <li><strong>Add New Post:</strong> Create a new job posting</li>
              <li><strong>My Profile:</strong> View and edit your profile</li>
            </ul>
          </div>
        </section>

        <section className="manual-section">
          <h2>Using the Search Feature</h2>
          <p>Our powerful search functionality allows you to:</p>
          <ul>
            <li>Search for job posts by title and description</li>
            <li>Find users by their names</li>
            <li>Toggle between post and user search</li>
            <li>View detailed information about search results</li>
          </ul>
        </section>

        <section className="manual-section">
          <h2>Managing Applications</h2>
          <div className="feature-block">
            <h3>For Job Seekers</h3>
            <ul>
              <li>Apply to posts that match your skills</li>
              <li>Track application status</li>
              <li>Mark posts as interesting</li>
              <li>View declined applications</li>
              <li>Remove applications if needed</li>
            </ul>
          </div>

          <div className="feature-block">
            <h3>For Recruiters</h3>
            <ul>
              <li>Review incoming applications</li>
              <li>Approve or decline applicants</li>
              <li>View interested candidates</li>
              <li>Track working status</li>
              <li>Manage project completion</li>
            </ul>
          </div>
        </section>

        <section className="manual-section">
          <h2>Best Practices</h2>
          <ul>
            <li>Keep your profile information up to date</li>
            <li>Provide detailed descriptions in job posts</li>
            <li>Respond to applications promptly</li>
            <li>Use the comment section for clarifications</li>
            <li>Mark projects as complete when finished</li>
          </ul>
        </section>

        <section className="manual-section">
          <h2>Need Help?</h2>
          <p>If you need assistance or have questions about using our platform, please don't hesitate to contact our support team. We're here to help you make the most of your experience.</p>
        </section>
      </div>
    </div>
  );
}

export default AboutUs; 