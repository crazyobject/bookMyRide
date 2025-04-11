import React from "react";
import AdminNav from "./AdminNav";
import "./AdminStyles.css";

const ActiveRides = () => {
  return (
    <div className="admin-container">
      <AdminNav currentModule="Active Rides" />
      <div className="admin-content">
        <h2>Active Rides</h2>
        <div className="admin-card">
          <p>List of currently active rides will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default ActiveRides;
