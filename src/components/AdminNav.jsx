import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';
import './AdminNav.css';

const AdminNav = ({ moduleName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleHome = () => {
    navigate('/admin');
  };

  return (
    <nav className="admin-nav">
      <div className="nav-left">
        <h2 className="module-title">{moduleName}</h2>
      </div>
      <div className="nav-right">
        <button className="nav-button" onClick={handleHome}>
          <FaHome className="nav-icon" />
          <span>Home</span>
        </button>
        <button className="nav-button logout" onClick={handleLogout}>
          <FaSignOutAlt className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default AdminNav; 