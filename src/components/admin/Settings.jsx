import React from 'react';
import AdminNav from './AdminNav';
import './AdminModule.css';

const Settings = () => {
  return (
    <div className="admin-module">
      <AdminNav moduleName="Settings" />
      <div className="module-content">
        <div className="module-header">
          <h1>System Settings</h1>
          <p>Configure platform settings and preferences</p>
        </div>
        <div className="module-body">
          <div className="content-card">
            <h2>General Settings</h2>
            <p>Configure general platform settings</p>
          </div>
          <div className="content-card">
            <h2>Payment Settings</h2>
            <p>Manage payment gateway configurations</p>
          </div>
          <div className="content-card">
            <h2>Email Settings</h2>
            <p>Configure email templates and notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 