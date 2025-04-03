import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="nav-left">
          <button className="nav-button" onClick={handleHome}>
            <FaHome className="nav-icon" />
            <span>Home</span>
          </button>
        </div>
        <div className="nav-right">
          <button className="nav-button logout" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
      <div className="dashboard-content">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Active Rides</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Completed Rides</h3>
            <p className="stat-number">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 