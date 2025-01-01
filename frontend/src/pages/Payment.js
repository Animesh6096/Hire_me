import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState({
    receiver: '',
    seekerId: '',
    amount: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Payment Data:', paymentData);
  };

  const handleProfileClick = () => {
    // Add your profile click handler here
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
        <div className="payment-container">
          <h2>Make a Payment</h2>
          
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="receiver">Pay To</label>
                <input
                  type="text"
                  id="receiver"
                  value={paymentData.receiver}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, receiver: e.target.value }))}
                  placeholder="Recipient's name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="seekerId">Seeker ID</label>
                <input
                  type="text"
                  id="seekerId"
                  value={paymentData.seekerId}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, seekerId: e.target.value }))}
                  placeholder="Enter seeker's ID"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  type="number"
                  id="amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={paymentData.description}
                onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What is this payment for?"
                required
                rows="4"
              />
            </div>

            <button type="submit" className="submit-btn">
              <i className="fas fa-paper-plane"></i>
              Send Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
