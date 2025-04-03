import React from 'react';
import AdminNav from './AdminNav';
import './AdminStyles.css';

const Notifications = () => {
  return (
    <div className="admin-container">
      <AdminNav currentModule="Notifications" />
      <div className="admin-content">
        <h2>Notifications</h2>
        <div className="admin-card">
          <p>System notifications and alerts will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 