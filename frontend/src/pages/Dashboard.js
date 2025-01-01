import React, { useState, useEffect, useRef } from "react";
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
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [otherPosts, setOtherPosts] = useState([]);
  const [showPosts, setShowPosts] = useState(false);
  const [showOtherPosts, setShowOtherPosts] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    bio: '',
    skills: []
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    year: ''
  });
  const [newExperience, setNewExperience] = useState({
    position: '',
    company: '',
    duration: '',
    description: ''
  });
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const fileInputRef = useRef(null);
  const [newPost, setNewPost] = useState({
    jobTitle: '',
    description: '',
    requiredSkills: '',
    requiredTime: '',
    location: '',
    type: 'remote',
    salary: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [commentSortNewest, setCommentSortNewest] = useState(false);
  const [interactionPosts, setInteractionPosts] = useState([]);
  const [showInteractions, setShowInteractions] = useState(false);
  const [interactionFilter, setInteractionFilter] = useState('all'); // 'all', 'interested', 'applied'
  const [followStatus, setFollowStatus] = useState({});  // Store follow status for each user
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followModalUsers, setFollowModalUsers] = useState([]);
  const [workingPosts, setWorkingPosts] = useState([]);
  const [showWorking, setShowWorking] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/posts/create', newPost);
      console.log('Post created:', response.data);
      setShowNewPostForm(false);
      setSuccessMessage('Post created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setNewPost({
        jobTitle: '',
        description: '',
        requiredSkills: '',
        requiredTime: '',
        location: '',
        type: 'remote',
        salary: ''
      });
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
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

  const handleEditClick = () => {
    setIsEditing(true);
    setEditData({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      country: userInfo.country,
      bio: userInfo.bio || '',
      skills: userInfo.skills || []
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowAddEducation(false);
    setShowAddExperience(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setLoading(true);
      const response = await api.post(`/users/${localStorage.getItem('user_id')}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.photo_url) {
        setUserInfo(prev => ({
          ...prev,
          profilePhoto: response.data.photo_url
        }));
        // Clear any previous errors
        setError(null);
      }
    } catch (err) {
      setError('Failed to upload photo: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/users/${localStorage.getItem('user_id')}/profile`, editData);
      if (response.status === 200) {
        setUserInfo(prev => ({
          ...prev,
          ...editData
        }));
        setIsEditing(false);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEducation = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/users/${localStorage.getItem('user_id')}/education`, newEducation);
      if (response.status === 201) {
        setUserInfo(prev => ({
          ...prev,
          education: [...(prev.education || []), { ...newEducation, id: Date.now().toString() }]
        }));
        setNewEducation({ degree: '', institution: '', year: '' });
        setShowAddEducation(false);
      }
    } catch (err) {
      setError('Failed to add education');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEducation = async (educationId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/users/${localStorage.getItem('user_id')}/education/${educationId}`);
      if (response.status === 200) {
        setUserInfo(prev => ({
          ...prev,
          education: prev.education.filter(edu => edu.id !== educationId)
        }));
      }
    } catch (err) {
      setError('Failed to delete education');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExperience = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/users/${localStorage.getItem('user_id')}/experience`, newExperience);
      if (response.status === 201) {
        setUserInfo(prev => ({
          ...prev,
          experience: [...(prev.experience || []), { ...newExperience, id: Date.now().toString() }]
        }));
        setNewExperience({ position: '', company: '', duration: '', description: '' });
        setShowAddExperience(false);
      }
    } catch (err) {
      setError('Failed to add experience');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/users/${localStorage.getItem('user_id')}/experience/${experienceId}`);
      if (response.status === 200) {
        setUserInfo(prev => ({
          ...prev,
          experience: prev.experience.filter(exp => exp.id !== experienceId)
        }));
      }
    } catch (err) {
      setError('Failed to delete experience');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillInputChange = (e) => {
    setNewSkill(e.target.value);
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!editData.skills.includes(newSkill.trim())) {
        setEditData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill.trim()]
        }));
      }
      setNewSkill('');
    } else if (e.key === 'Backspace' && !newSkill) {
      // Remove last skill when backspace is pressed on empty input
      setEditData(prev => ({
        ...prev,
        skills: prev.skills.slice(0, -1)
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts/user-posts');
      setUserPosts(response.data.posts);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts/other-posts');
      setOtherPosts(response.data.posts);
      await fetchInitialFollowStatus(response.data.posts);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSeekingClick = () => {
    setShowOtherPosts(true);
    setShowPosts(false);
    setShowInteractions(false);
    setShowWorking(false);
    fetchOtherPosts();
  };

  const handleRecruitingClick = () => {
    setShowPosts(true);
    setShowOtherPosts(false);
    setShowInteractions(false);
    setShowWorking(false);
    fetchUserPosts();
  };

  const handleApply = async (postId) => {
    try {
      setLoading(true);
      // If the user was declined, just remove the application from their interactions
      if (showInteractions) {
        const currentPost = interactionPosts.find(p => p._id === postId);
        if (currentPost?.isDeclined) {
          const response = await api.post(`/posts/${postId}/remove-application`);
          if (response.status === 200) {
            fetchInteractionPosts();
            setSuccessMessage('Application removed');
            setTimeout(() => setSuccessMessage(''), 3000);
          }
          return;
        }
      }

      // Normal apply/unapply flow
      const response = await api.post(`/posts/${postId}/apply`);
      if (response.status === 200) {
        // Refresh the posts to get updated status
        if (showOtherPosts) {
          fetchOtherPosts();
        }
        if (showInteractions) {
          fetchInteractionPosts();
        }
        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error applying:', err);
      setError('Failed to apply');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async (postId) => {
    try {
      setLoading(true);
      const response = await api.post(`/posts/${postId}/interest`);
      if (response.status === 200) {
        // Refresh the posts to get updated status
        if (showOtherPosts) {
          fetchOtherPosts();
        }
        if (showInteractions) {
          fetchInteractionPosts();
        }
        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error marking interest:', err);
      setError('Failed to mark interest');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleShowApplicants = async (postId) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${postId}/applicants`);
      setSelectedUsers(response.data.users);
      setModalTitle('Applicants');
      setShowUsersModal(true);
      setSelectedPostId(postId); // Save the selected post ID for approve/decline actions
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleShowInterested = async (postId) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${postId}/interested`);
      setSelectedUsers(response.data.users);
      setModalTitle('Interested Users');
      setShowUsersModal(true);
    } catch (err) {
      console.error('Error fetching interested users:', err);
      setError('Failed to fetch interested users');
    } finally {
      setLoading(false);
    }
  };

  const sortComments = (commentsToSort) => {
    return [...commentsToSort].sort((a, b) => {
      if (commentSortNewest) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return new Date(a.created_at) - new Date(b.created_at);
    });
  };

  const handleShowComments = async (postId) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${postId}/comments`);
      // Sort comments before setting them
      const sortedComments = sortComments(response.data.comments || []);
      setComments(sortedComments);
      setSelectedPostId(postId);
      setShowCommentModal(true);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const response = await api.post(`/posts/${selectedPostId}/comments`, {
        text: newComment
      });
      if (response.status === 201) {
        // Refresh comments
        const commentsResponse = await api.get(`/posts/${selectedPostId}/comments`);
        // Sort comments before setting them
        const sortedComments = sortComments(commentsResponse.data.comments || []);
        setComments(sortedComments);
        setNewComment('');
        setSuccessMessage('Comment added successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost({
      ...post,
      requiredSkills: post.requiredSkills || ''
    });
    setShowEditModal(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put(`/posts/${editingPost._id}`, editingPost);
      if (response.status === 200) {
        setShowEditModal(false);
        fetchUserPosts();
        setSuccessMessage('Post updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeletePost = async (postId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/posts/${postId}`);
      if (response.status === 200) {
        // Refresh the user's posts
        fetchUserPosts();
        setSuccessMessage('Post deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchInteractionPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts/user-interactions');
      setInteractionPosts(response.data.posts);
      await fetchInitialFollowStatus(response.data.posts);
      setError(null);
    } catch (err) {
      console.error('Error fetching interaction posts:', err);
      setError('Failed to fetch interaction posts');
    } finally {
      setLoading(false);
    }
  };

  const handleInteractionsClick = () => {
    setShowInteractions(true);
    setShowPosts(false);
    setShowOtherPosts(false);
    setShowWorking(false);
    fetchInteractionPosts();
  };

  const getFilteredPosts = () => {
    switch (interactionFilter) {
      case 'interested':
        return interactionPosts.filter(post => post.isInterested);
      case 'applied':
        return interactionPosts.filter(post => post.hasApplied);
      default:
        return interactionPosts;
    }
  };

  const handleFollow = async (post) => {
    try {
      const currentUserId = localStorage.getItem('user_id');
      const creatorId = post.user_id;
      
      if (!currentUserId || !creatorId) {
        console.log('Missing IDs:', { currentUserId, creatorId });
        return;
      }

      const response = await api.post(`/users/${creatorId}/follow`);
      
      // Update the follow status in state
      if (response.data) {
        setFollowStatus(prev => ({
          ...prev,
          [creatorId]: response.data.is_following
        }));
        
        // Show success message
        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Follow error:', err);
      setError('Failed to update follow status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const fetchFollowStatus = async (userId) => {
    try {
      const response = await api.getFollowStatus(userId);
      setFollowStatus(prev => ({
        ...prev,
        [userId]: response.data.is_following
      }));
    } catch (err) {
      console.error('Error fetching follow status:', err);
    }
  };

  const fetchInitialFollowStatus = async (posts) => {
    try {
      for (const post of posts) {
        if (post.user_id && post.user_id !== localStorage.getItem('user_id')) {
          const response = await api.get(`/users/${post.user_id}/follow-status`);
          setFollowStatus(prev => ({
            ...prev,
            [post.user_id]: response.data.is_following
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching follow status:', err);
    }
  };

  const handleModalFollow = async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/follow`);
      
      if (response.data) {
        // Update follow status
        setFollowStatus(prev => ({
          ...prev,
          [userId]: response.data.is_following
        }));
        
        // Refresh the lists if needed
        if (showFollowersModal) {
          const followersResponse = await api.get(`/users/${userInfo._id}/followers`);
          setFollowModalUsers(followersResponse.data.users);
        } else if (showFollowingModal) {
          const followingResponse = await api.get(`/users/${userInfo._id}/following`);
          setFollowModalUsers(followingResponse.data.users);
        }

        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Follow error:', err);
      setError('Failed to update follow status');
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    const fetchModalUsersFollowStatus = async () => {
      for (const user of followModalUsers) {
        try {
          const response = await api.get(`/users/${user._id}/follow-status`);
          setFollowStatus(prev => ({
            ...prev,
            [user._id]: response.data.is_following
          }));
        } catch (err) {
          console.error('Error fetching follow status:', err);
        }
      }
    };

    if (followModalUsers.length > 0) {
      fetchModalUsersFollowStatus();
    }
  }, [followModalUsers]);

  useEffect(() => {
    const fetchFollowStatusForPosts = async () => {
      const posts = showOtherPosts ? otherPosts : interactionPosts;
      for (const post of posts) {
        if (post.creator && post.creator._id !== localStorage.getItem('user_id')) {
          await fetchFollowStatus(post.creator._id);
        }
      }
    };

    if (showOtherPosts || showInteractions) {
      fetchFollowStatusForPosts();
    }
  }, [otherPosts, interactionPosts, showOtherPosts, showInteractions]);

  const handleApproveApplicant = async (userId) => {
    try {
      setLoading(true);
      const response = await api.post(`/posts/${selectedPostId}/approve/${userId}`);
      if (response.status === 200) {
        // Refresh applicants list
        const applicantsResponse = await api.get(`/posts/${selectedPostId}/applicants`);
        setSelectedUsers(applicantsResponse.data.users);
        setSuccessMessage('Applicant approved successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error approving applicant:', err);
      setError('Failed to approve applicant');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineApplicant = async (userId) => {
    try {
      setLoading(true);
      const response = await api.post(`/posts/${selectedPostId}/decline/${userId}`);
      if (response.status === 200) {
        // Refresh applicants list
        const applicantsResponse = await api.get(`/posts/${selectedPostId}/applicants`);
        setSelectedUsers(applicantsResponse.data.users);
        setSuccessMessage('Applicant declined successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error declining applicant:', err);
      setError('Failed to decline applicant');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithUser = async (userId) => {
    try {
      // For now, just log the action. We'll implement chat functionality later
      console.log('Chat with user:', userId);
      // You can navigate to chat page or open chat modal here
    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Failed to start chat');
      setTimeout(() => setError(null), 3000);
    }
  };

  const fetchWorkingPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts/working-posts');
      setWorkingPosts(response.data.posts);
      setError(null);
    } catch (err) {
      console.error('Error fetching working posts:', err);
      setError('Failed to fetch working posts');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingClick = () => {
    setShowWorking(true);
    setShowPosts(false);
    setShowOtherPosts(false);
    setShowInteractions(false);
    fetchWorkingPosts();
  };

  const handleShowWorking = async (postId) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${postId}/working-users`);
      setSelectedUsers(response.data.users);
      setModalTitle('Working Users');
      setShowUsersModal(true);
    } catch (err) {
      console.error('Error fetching working users:', err);
      setError('Failed to fetch working users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-buttons">
          <button 
            className={`sidebar-btn ${showOtherPosts ? 'active-seeking' : ''}`} 
            onClick={handleSeekingClick}
          >
            <i className="fas fa-search"></i>
            Seeking
          </button>
          <button 
            className={`sidebar-btn ${showPosts ? 'active-recruiting' : ''}`}
            onClick={handleRecruitingClick}
          >
            <i className="fas fa-user-tie"></i>
            Recruiting
          </button>
          <button 
            className={`sidebar-btn ${showInteractions ? 'active-interactions' : ''}`}
            onClick={handleInteractionsClick}
          >
            <i className="fas fa-star"></i>
            My Interactions
          </button>
          <button 
            className={`sidebar-btn ${showWorking ? 'active-working' : ''}`}
            onClick={handleWorkingClick}
          >
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

      <div className="main-content">
        {/* User Info Modal */}
        {showUserInfo && (
          <div className="modal-overlay">
            <div className="modal-content profile-modal">
              <div className="modal-header">
                <h2>My Profile</h2>
                <button className="close-btn" onClick={() => setShowUserInfo(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="user-info-content">
                {loading && <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>}
                {error && <p className="error">{error}</p>}
                {userInfo && (
                  <div className="user-info">
                    <div className="profile-header">
                      <div className="profile-avatar" onClick={handlePhotoClick}>
                        {userInfo.profilePhoto ? (
                          <img src={userInfo.profilePhoto} alt="Profile" />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                        <div className="avatar-upload">
                          <i className="fas fa-camera"></i>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                      </div>
                      <div className="profile-name">
                        {isEditing ? (
                          <div className="edit-name-section">
                            <input
                              type="text"
                              value={editData.firstName}
                              onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              value={editData.lastName}
                              onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                              placeholder="Last Name"
                            />
                            <input
                              type="text"
                              value={editData.country}
                              onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                              placeholder="Country"
                            />
                            <textarea
                              value={editData.bio}
                              onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                              placeholder="Write your bio..."
                              className="bio-input"
                            />
                          </div>
                        ) : (
                          <>
                            <h3>{`${userInfo.firstName} ${userInfo.lastName}`}</h3>
                            <span className="profile-location">
                              <i className="fas fa-map-marker-alt"></i> {userInfo.country}
                            </span>
                            <div className="profile-tags">
                              <span className={`profile-tag ${userInfo.posts?.length > 0 ? 'active' : 'inactive'}`}>
                                <i className="fas fa-bullhorn"></i>
                                {userInfo.posts?.length > 0 ? 'Recruiting' : 'Not Recruiting'}
                              </span>
                            </div>
                            <div className="profile-follow-info">
                              <span 
                                className="profile-tag follow-info clickable" 
                                onClick={async () => {
                                  try {
                                    const response = await api.get(`/users/${userInfo._id}/followers`);
                                    setFollowModalUsers(response.data.users);
                                    setShowFollowersModal(true);
                                  } catch (err) {
                                    console.error('Error fetching followers:', err);
                                  }
                                }}
                              >
                                <i className="fas fa-users"></i>
                                {userInfo.followers?.length || 0} Followers
                              </span>
                              <span 
                                className="profile-tag follow-info clickable"
                                onClick={async () => {
                                  try {
                                    const response = await api.get(`/users/${userInfo._id}/following`);
                                    setFollowModalUsers(response.data.users);
                                    setShowFollowingModal(true);
                                  } catch (err) {
                                    console.error('Error fetching following:', err);
                                  }
                                }}
                              >
                                <i className="fas fa-user-friends"></i>
                                {userInfo.following?.length || 0} Following
                              </span>
                            </div>
                            <p className="profile-bio">{userInfo.bio || 'No bio added yet'}</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="profile-details">
                      <div className="info-card">
                        <div className="info-card-header">
                          <i className="fas fa-graduation-cap"></i>
                          <h4>Education</h4>
                          {isEditing && (
                            <button className="add-btn" onClick={() => setShowAddEducation(true)}>
                              <i className="fas fa-plus"></i>
                            </button>
                          )}
                        </div>
                        <div className="info-card-content">
                          {showAddEducation && (
                            <div className="add-education-form">
                              <input
                                type="text"
                                value={newEducation.degree}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                                placeholder="Degree"
                              />
                              <input
                                type="text"
                                value={newEducation.institution}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                                placeholder="Institution"
                              />
                              <input
                                type="text"
                                value={newEducation.year}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                                placeholder="Year"
                              />
                              <div className="form-actions">
                                <button onClick={() => setShowAddEducation(false)} className="cancel-btn">Cancel</button>
                                <button onClick={handleAddEducation} className="submit-btn">Add</button>
                              </div>
                            </div>
                          )}
                          {userInfo.education && userInfo.education.length > 0 ? (
                            userInfo.education.map((edu, index) => (
                              <div key={index} className="education-item">
                                <h5>{edu.degree}</h5>
                                <p>{edu.institution}</p>
                                <span>{edu.year}</span>
                                {isEditing && (
                                  <button className="delete-btn" onClick={() => handleDeleteEducation(edu.id)}>
                                    <i className="fas fa-trash"></i>
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="no-content">No education details added</p>
                          )}
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-card-header">
                          <i className="fas fa-code"></i>
                          <h4>Skills</h4>
                        </div>
                        <div className="info-card-content">
                          {isEditing ? (
                            <div className="skills-input-container">
                              <div className="skills-tags">
                                {editData.skills.map((skill, index) => (
                                  <span key={index} className="skill-tag">
                                    {skill}
                                    <button 
                                      onClick={() => handleRemoveSkill(skill)}
                                      className="remove-skill-btn"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <input
                                type="text"
                                value={newSkill}
                                onChange={handleSkillInputChange}
                                onKeyDown={handleSkillInputKeyDown}
                                placeholder="Type a skill and press Enter"
                                className="skill-input"
                              />
                            </div>
                          ) : (
                            userInfo.skills && userInfo.skills.length > 0 ? (
                              <div className="skills-container">
                                {userInfo.skills.map((skill, index) => (
                                  <span key={index} className="skill-tag">{skill}</span>
                                ))}
                              </div>
                            ) : (
                              <p className="no-content">No skills added</p>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="profile-details">
                      <div className="info-card">
                        <div className="info-card-header">
                          <i className="fas fa-briefcase"></i>
                          <h4>Experience</h4>
                          {isEditing && (
                            <button className="add-btn" onClick={() => setShowAddExperience(true)}>
                              <i className="fas fa-plus"></i>
                            </button>
                          )}
                        </div>
                        <div className="info-card-content">
                          {showAddExperience && (
                            <div className="add-experience-form">
                              <input
                                type="text"
                                value={newExperience.position}
                                onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                                placeholder="Position"
                              />
                              <input
                                type="text"
                                value={newExperience.company}
                                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                                placeholder="Company"
                              />
                              <input
                                type="text"
                                value={newExperience.duration}
                                onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                                placeholder="Duration"
                              />
                              <textarea
                                value={newExperience.description}
                                onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Description"
                              />
                              <div className="form-actions">
                                <button onClick={() => setShowAddExperience(false)} className="cancel-btn">Cancel</button>
                                <button onClick={handleAddExperience} className="submit-btn">Add</button>
                              </div>
                            </div>
                          )}
                          {userInfo.experience && userInfo.experience.length > 0 ? (
                            userInfo.experience.map((exp, index) => (
                              <div key={index} className="experience-item">
                                <h5>{exp.position}</h5>
                                <p>{exp.company}</p>
                                <span>{exp.duration}</span>
                                <p className="experience-description">{exp.description}</p>
                                {isEditing && (
                                  <button className="delete-btn" onClick={() => handleDeleteExperience(exp.id)}>
                                    <i className="fas fa-trash"></i>
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="no-content">No experience details added</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="profile-actions">
                      {isEditing ? (
                        <>
                          <button className="cancel-btn" onClick={handleCancelEdit}>
                            <i className="fas fa-times"></i> Cancel
                          </button>
                          <button className="submit-btn" onClick={handleSaveProfile}>
                            <i className="fas fa-save"></i> Save Changes
                          </button>
                        </>
                      ) : (
                        <button className="edit-profile-btn" onClick={handleEditClick}>
                          <i className="fas fa-edit"></i> Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add success message display */}
        {successMessage && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}

        {/* Add error message display */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* New Post Form Modal */}
        {showNewPostForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add New Post</h2>
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
                    placeholder="Enter job title"
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
                    placeholder="Enter job description"
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
                    placeholder="Enter required skills"
                    required
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
                    placeholder="Enter required time"
                    required
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
                    placeholder="Enter location"
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
                    placeholder="Enter salary"
                    required
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

        {/* Main Content Sections */}
        {showPosts && (
          <div className="posts-container">
            <h2>My Posts</h2>
            {loading ? (
              <p>Loading posts...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : userPosts.length === 0 ? (
              <p>No posts found. Create your first job post!</p>
            ) : (
              <div className="posts-grid">
                {userPosts.map((post) => (
                  <div key={post._id} className="post-card">
                    <button 
                      className="post-delete-btn"
                      onClick={() => handleDeletePost(post._id)}
                      title="Delete Post"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <h3>{post.jobTitle}</h3>
                    <p><strong>Type:</strong> {post.type}</p>
                    <p><strong>Location:</strong> {post.location}</p>
                    <p><strong>Required Time:</strong> {post.requiredTime}</p>
                    <p><strong>Salary:</strong> {post.salary}</p>
                    <p><strong>Required Skills:</strong> {post.requiredSkills}</p>
                    <p className="post-description">{post.description}</p>
                    <p className="post-date">
                      <i className="fas fa-calendar-alt"></i>
                      Posted on: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <div className="post-stats">
                      <button 
                        className="stat-btn"
                        onClick={() => handleShowApplicants(post._id)}
                      >
                        <i className="fas fa-user-check"></i>
                        Applied: {post.applicants?.length || 0}
                      </button>
                      <button 
                        className="stat-btn"
                        onClick={() => handleShowInterested(post._id)}
                      >
                        <i className="fas fa-star"></i>
                        Interested: {post.interests?.length || 0}
                      </button>
                      <button 
                        className="stat-btn working-stat-btn"
                        onClick={() => handleShowWorking(post._id)}
                      >
                        <i className="fas fa-briefcase"></i>
                        Working: {post.approved_applicants?.length || 0}
                      </button>
                      <button 
                        className="stat-btn"
                        onClick={() => handleShowComments(post._id)}
                      >
                        <i className="fas fa-comments"></i>
                        Comments: {post.comments?.length || 0}
                      </button>
                    </div>
                    <div className="post-admin-actions">
                      <button 
                        className="admin-btn edit-btn"
                        onClick={() => handleEditPost(post)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button 
                        className="admin-btn delete-btn"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showOtherPosts && (
          <div className="posts-container">
            <h2>Available Posts</h2>
            {loading ? (
              <p>Loading posts...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : otherPosts.length === 0 ? (
              <p>No posts available at the moment.</p>
            ) : (
              <div className="posts-grid">
                {otherPosts.map((post) => (
                  <div key={post._id} className="post-card">
                    <div className="post-creator">
                      {post.creator?.profilePhoto ? (
                        <img src={post.creator.profilePhoto} alt="Creator" />
                      ) : (
                        <i className="fas fa-user"></i>
                      )}
                      <span>{post.creator ? `${post.creator.firstName} ${post.creator.lastName}` : 'Unknown User'}</span>
                      {post.user_id && post.user_id !== localStorage.getItem('user_id') && (
                        <button
                          className={`follow-btn ${followStatus[post.user_id] ? 'following' : ''}`}
                          onClick={() => {
                            console.log('Clicking follow for post:', post);
                            handleFollow(post);
                          }}
                          disabled={loading}
                        >
                          <i className={`fas ${followStatus[post.user_id] ? 'fa-user-minus' : 'fa-user-plus'}`}></i>
                          {followStatus[post.user_id] ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                    <h3>{post.jobTitle}</h3>
                    <p><strong>Type:</strong> {post.type}</p>
                    <p><strong>Location:</strong> {post.location}</p>
                    <p><strong>Required Time:</strong> {post.requiredTime}</p>
                    <p><strong>Salary:</strong> {post.salary}</p>
                    <p><strong>Required Skills:</strong> {post.requiredSkills}</p>
                    <p className="post-description">{post.description}</p>
                    <p className="post-date">
                      <i className="fas fa-calendar-alt"></i>
                      Posted on: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <div className="post-actions">
                      {post.isWorking ? (
                        <span className="working-badge">
                          <i className="fas fa-briefcase"></i>
                          Currently Working
                        </span>
                      ) : (
                        <>
                          <button 
                            className={`action-btn apply-btn ${post.hasApplied ? 'applied' : ''}`}
                            onClick={() => handleApply(post._id)}
                            disabled={loading}
                          >
                            <i className={`fas ${post.hasApplied ? 'fa-check' : 'fa-paper-plane'}`}></i>
                            {post.hasApplied ? 'Applied' : 'Apply'}
                          </button>
                          <button 
                            className={`action-btn interest-btn ${post.isInterested ? 'interested' : ''}`}
                            onClick={() => handleInterest(post._id)}
                            disabled={loading}
                          >
                            <i className={`fas ${post.isInterested ? 'fa-star' : 'fa-star'}`}></i>
                            {post.isInterested ? 'Interested' : 'Interest'}
                          </button>
                        </>
                      )}
                      <button 
                        className="action-btn comment-btn"
                        onClick={() => handleShowComments(post._id)}
                        disabled={loading}
                      >
                        <i className="fas fa-comment"></i>
                        Comments ({post.comments?.length || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showInteractions && (
          <div className="posts-container">
            <div className="interactions-header">
              <h2>My Interactions</h2>
              <div className="filter-buttons">
                <button 
                  className="filter-btn"
                  onClick={() => {
                    setInteractionFilter('all');
                    setShowInteractions(true);
                  }}
                >
                  <i className="fas fa-list"></i>
                  All
                </button>
                <button 
                  className="filter-btn"
                  onClick={() => {
                    setInteractionFilter('interested');
                    setShowInteractions(true);
                  }}
                >
                  <i className="fas fa-star"></i>
                  Interested
                </button>
                <button 
                  className="filter-btn"
                  onClick={() => {
                    setInteractionFilter('applied');
                    setShowInteractions(true);
                  }}
                >
                  <i className="fas fa-paper-plane"></i>
                  Applied
                </button>
              </div>
            </div>
            {loading ? (
              <p>Loading posts...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : getFilteredPosts().length === 0 ? (
              <p>No {interactionFilter === 'all' ? 'interactions' : interactionFilter} posts found.</p>
            ) : (
              <div className="posts-grid">
                {getFilteredPosts().map((post) => (
                  <div key={post._id} className="post-card">
                    <div className="post-creator">
                      {post.creator?.profilePhoto ? (
                        <img src={post.creator.profilePhoto} alt="Creator" />
                      ) : (
                        <i className="fas fa-user"></i>
                      )}
                      <span>{post.creator ? `${post.creator.firstName} ${post.creator.lastName}` : 'Unknown User'}</span>
                      {post.user_id && post.user_id !== localStorage.getItem('user_id') && (
                        <button
                          className={`follow-btn ${followStatus[post.user_id] ? 'following' : ''}`}
                          onClick={() => {
                            console.log('Clicking follow for post:', post);
                            handleFollow(post);
                          }}
                          disabled={loading}
                        >
                          <i className={`fas ${followStatus[post.user_id] ? 'fa-user-minus' : 'fa-user-plus'}`}></i>
                          {followStatus[post.user_id] ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                    <h3>{post.jobTitle}</h3>
                    <p><strong>Type:</strong> {post.type}</p>
                    <p><strong>Location:</strong> {post.location}</p>
                    <p><strong>Required Time:</strong> {post.requiredTime}</p>
                    <p><strong>Salary:</strong> {post.salary}</p>
                    <p><strong>Required Skills:</strong> {post.requiredSkills}</p>
                    <p className="post-description">{post.description}</p>
                    <p className="post-date">
                      <i className="fas fa-calendar-alt"></i>
                      Posted on: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <div className="interaction-badges">
                      {post.hasApplied && (
                        <span className={`badge applied-badge ${post.isDeclined ? 'declined' : ''}`}>
                          <i className="fas fa-paper-plane"></i>
                          {post.isDeclined ? 'Your application has been declined' : 'Applied'}
                          <button 
                            className="remove-badge-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(post._id);
                            }}
                            title={post.isDeclined ? 'Remove application' : 'Cancel application'}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </span>
                      )}
                      {post.isInterested && (
                        <span className="badge interested-badge">
                          <i className="fas fa-star"></i> Interested
                          <button 
                            className="remove-badge-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInterest(post._id);
                            }}
                            title="Remove interest"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="post-actions">
                      <button 
                        className="action-btn comment-btn"
                        onClick={() => handleShowComments(post._id)}
                        disabled={loading}
                      >
                        <i className="fas fa-comment"></i>
                        Comments ({post.comments?.length || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showWorking && !showPosts && !showOtherPosts && !showInteractions && (
          <div className="posts-container">
            <h2>Currently Working</h2>
            {loading ? (
              <p>Loading posts...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : workingPosts.length === 0 ? (
              <p>No active work found.</p>
            ) : (
              <div className="posts-grid">
                {workingPosts.map((post) => (
                  <div key={post._id} className="post-card">
                    <div className="post-creator">
                      {post.creator?.profilePhoto ? (
                        <img src={post.creator.profilePhoto} alt="Creator" />
                      ) : (
                        <i className="fas fa-user"></i>
                      )}
                      <span>{post.creator ? `${post.creator.firstName} ${post.creator.lastName}` : 'Unknown User'}</span>
                    </div>
                    <h3>{post.jobTitle}</h3>
                    <p><strong>Type:</strong> {post.type}</p>
                    <p><strong>Location:</strong> {post.location}</p>
                    <p><strong>Required Time:</strong> {post.requiredTime}</p>
                    <p><strong>Salary:</strong> {post.salary}</p>
                    <p><strong>Required Skills:</strong> {post.requiredSkills}</p>
                    <p className="post-description">{post.description}</p>
                    <p className="post-date">
                      <i className="fas fa-calendar-alt"></i>
                      Posted on: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <div className="post-actions">
                      <button 
                        className="action-btn comment-btn"
                        onClick={() => handleShowComments(post._id)}
                        disabled={loading}
                      >
                        <i className="fas fa-comment"></i>
                        Comments ({post.comments?.length || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showUsersModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Applicants</h2>
                <button className="close-btn" onClick={() => setShowUsersModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="applicant-container">
                {selectedUsers.map((user) => (
                  <div key={user._id} className="applicant-item">
                    <div className="applicant-left">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={`${user.firstName}'s profile`} />
                      ) : (
                        <div className="profile-placeholder">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="applicant-actions">
                      <button onClick={() => handleApproveApplicant(user._id)} className="btn-approve">
                        <i className="fas fa-check"></i> Approve
                      </button>
                      <button onClick={() => handleDeclineApplicant(user._id)} className="btn-decline">
                        <i className="fas fa-times"></i> Decline
                      </button>
                      <button onClick={() => handleChatWithUser(user._id)} className="btn-chat">
                        <i className="fas fa-comment"></i> Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showUsersModal && selectedUsers && modalTitle === 'Interested Users' && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Interested Users</h2>
                <button className="close-btn" onClick={() => setShowUsersModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="users-list">
                {selectedUsers.map((user) => (
                  <div key={user._id} className="user-item">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.firstName} />
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showCommentModal && (
          <div className="modal-overlay">
            <div className="modal-content comments-modal">
              <div className="modal-header">
                <h2>Comments</h2>
                <button className="close-btn" onClick={() => setShowCommentModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="comments-section">
                <form onSubmit={handleAddComment} className="comment-form">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows="3"
                  />
                  <button type="submit" className="submit-btn" disabled={loading}>
                    <i className="fas fa-paper-plane"></i>
                    Post Comment
                  </button>
                </form>
                
                <div className="comments-sort">
                  <button 
                    className="sort-btn"
                    onClick={() => {
                      setCommentSortNewest(!commentSortNewest);
                      setComments(sortComments(comments));
                    }}
                  >
                    <i className={`fas fa-sort-amount-${commentSortNewest ? 'up' : 'down'}`}></i>
                    Sort by: {commentSortNewest ? "Newest first" : "Oldest first"}
                  </button>
                </div>

                <div className="comments-list">
                  {comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <div className="comment-user">
                        {comment.user?.profilePhoto ? (
                          <img src={comment.user.profilePhoto} alt={comment.user.firstName} />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                        <span>{comment.user?.firstName} {comment.user?.lastName}</span>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Edit Post</h2>
                <button className="close-btn" onClick={() => setShowEditModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleUpdatePost} className="edit-post-form">
                <div className="form-group">
                  <label htmlFor="jobTitle">Job Title</label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={editingPost?.jobTitle}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editingPost?.description}
                    onChange={handleEditInputChange}
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
                    value={editingPost?.requiredSkills}
                    onChange={handleEditInputChange}
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
                    value={editingPost?.requiredTime}
                    onChange={handleEditInputChange}
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
                    value={editingPost?.location}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={editingPost?.type}
                    onChange={handleEditInputChange}
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
                    value={editingPost?.salary}
                    onChange={handleEditInputChange}
                    required
                    placeholder="e.g., $50,000/year or $30-40/hour"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Update Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {(showFollowersModal || showFollowingModal) && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{showFollowersModal ? 'Followers' : 'Following'}</h2>
                <button 
                  className="close-btn" 
                  onClick={() => {
                    setShowFollowersModal(false);
                    setShowFollowingModal(false);
                    setFollowModalUsers([]);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="users-list">
                {followModalUsers.length > 0 ? (
                  followModalUsers.map((user) => (
                    <div key={user._id} className="user-item">
                      <div className="user-left">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt={user.firstName} />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                        <span className="user-name">{user.firstName} {user.lastName}</span>
                      </div>
                      {user._id !== localStorage.getItem('user_id') && (
                        <button
                          className={`user-follow-btn ${followStatus[user._id] ? 'following' : ''}`}
                          onClick={() => handleModalFollow(user._id)}
                        >
                          <i className={`fas ${followStatus[user._id] ? 'fa-user-minus' : 'fa-user-plus'}`}></i>
                          {followStatus[user._id] ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-users">No {showFollowersModal ? 'followers' : 'following'} yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 