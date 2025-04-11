import React from "react";
import AdminNav from "./AdminNav";
import "./AdminStyles.css";

const Analytics = () => {
  return (
    <div className="admin-container">
      <AdminNav currentModule="Analytics" />
      <div className="admin-content">
        <h2>Analytics Dashboard</h2>
        <div className="admin-card">
          <p>Analytics and reporting features will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
