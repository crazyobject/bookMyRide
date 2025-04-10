import React from 'react';
import AdminNav from './AdminNav';
import './AdminStyles.css';

const RideHistory = () => {
  return (
    <div className="admin-container">
      <AdminNav currentModule="Ride History" />
      <div className="admin-content">
        <h2>Ride History</h2>
        <div className="admin-card">
          <p>Historical ride data and statistics will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default RideHistory; 