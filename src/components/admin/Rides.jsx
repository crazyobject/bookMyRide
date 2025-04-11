import React from 'react';
import AdminNav from './AdminNav';
import './AdminModule.css';

const Rides = () => {
  return (
    <div className="admin-module">
      <AdminNav moduleName="Rides Management" />
      <div className="module-content">
        <div className="module-header">
          <h1>Rides Management</h1>
          <p>Monitor and manage ride requests and schedules</p>
        </div>
        <div className="module-body">
          <div className="content-card">
            <h2>Active Ride Requests</h2>
            <p>View and manage current ride requests</p>
          </div>
          <div className="content-card">
            <h2>Scheduled Rides</h2>
            <p>View upcoming scheduled rides</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rides; 