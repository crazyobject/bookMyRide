import React from 'react';
import AdminNav from './AdminNav';
import './AdminStyles.css';

const Users = () => {
  return (
    <div className="admin-container">
      <AdminNav currentModule="Users Management" />
      <div className="admin-content">
        <div className="admin-card">
          <h2>Users Management</h2>
          <p>Manage user accounts, permissions, and access levels</p>
          <div className="content-section">
            <h3>User List</h3>
            <p>User management interface will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users; 