import React from 'react';
import AdminNav from './AdminNav';
import './AdminStyles.css';

const Security = () => {
  return (
    <div className="admin-container">
      <AdminNav currentModule="Security" />
      <div className="admin-content">
        <h2>Security Settings</h2>
        <div className="admin-card">
          <p>Security configurations and access controls will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default Security; 