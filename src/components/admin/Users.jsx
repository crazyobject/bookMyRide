import React from 'react';
import AdminNav from '../AdminNav.jsx';
import './AdminModule.css';

const Users = () => {
  return (
    <div className="admin-module">
      <AdminNav moduleName="Users Management" />
      <div className="module-content">
        <div className="module-header">
          <h1>Users Management</h1>
          <p>Manage user accounts, permissions, and access levels</p>
        </div>
        <div className="module-body">
          {/* Add your users management content here */}
          <div className="content-card">
            <h2>User List</h2>
            <p>User management interface will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users; 