import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminStyles.css';

const AdminNav = ({ currentModule }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleHome = () => {
    navigate('/adminDashboard');
  };

  return (
    <nav className="admin-nav">
      <div className="nav-left">
        <h2>{currentModule}</h2>
      </div>
      <div className="nav-right">
        <button onClick={handleHome} className="nav-button">
          Home
        </button>
        <button onClick={handleLogout} className="nav-button logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNav; 