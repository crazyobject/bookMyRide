import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaCar,
  FaCog,
  FaChartBar,
  FaBell,
  FaUserShield,
  FaMapMarkedAlt,
  FaHistory,
} from "react-icons/fa";
import AdminNav from "./AdminNav";
import "./AdminStyles.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Users",
      icon: <FaUsers />,
      path: "/admin/users",
      color: "#4CAF50",
      description: "Manage user accounts and permissions",
    },
    {
      title: "Rides",
      icon: <FaCar />,
      path: "/admin/rides",
      color: "#2196F3",
      description: "Monitor and manage ride requests",
    },
    {
      title: "Active Rides",
      icon: <FaMapMarkedAlt />,
      path: "/admin/active-rides",
      color: "#FF9800",
      description: "Track and manage ongoing rides",
    },
    {
      title: "Ride History",
      icon: <FaHistory />,
      path: "/admin/ride-history",
      color: "#F39C12",
      description: "View completed ride history",
    },
    {
      title: "Analytics",
      icon: <FaChartBar />,
      path: "/admin/analytics",
      color: "#E91E63",
      description: "View platform statistics and reports",
    },
    {
      title: "Notifications",
      icon: <FaBell />,
      path: "/admin/notifications",
      color: "#00BCD4",
      description: "Manage system notifications",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/admin/settings",
      color: "#607D8B",
      description: "Configure system settings",
    },
    {
      title: "Security",
      icon: <FaUserShield />,
      path: "/admin/security",
      color: "#F44336",
      description: "Manage security settings and access",
    },
  ];

  return (
    <div className="admin-container">
      <AdminNav currentModule="Dashboard" />
      <div className="admin-content">
        <div className="dashboard-grid">
          {modules.map((module, index) => (
            <div
              key={index}
              className="module-tile"
              style={{ backgroundColor: module.color }}
              onClick={() => navigate(module.path)}
            >
              <div className="module-icon">{module.icon}</div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
