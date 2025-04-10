import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCar, FaCog, FaChartBar, FaBell, FaUserShield, FaMapMarkedAlt, FaHistory } from 'react-icons/fa';
import AdminNav from './AdminNav.jsx';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Users',
      icon: <FaUsers />,
      path: '/admin/users',
      color: '#3498db',
      description: 'Manage user accounts and permissions'
    },
    {
      title: 'Rides',
      icon: <FaCar />,
      path: '/admin/rides',
      color: '#2ecc71',
      description: 'Monitor and manage ride requests'
    },
    {
      title: 'Active Rides',
      icon: <FaMapMarkedAlt />,
      path: '/admin/active-rides',
      color: '#9b59b6',
      description: 'Track and manage ongoing rides'
    },
    {
      title: 'Ride History',
      icon: <FaHistory />,
      path: '/admin/ride-history',
      color: '#f39c12',
      description: 'View completed ride history'
    },
    {
      title: 'Analytics',
      icon: <FaChartBar />,
      path: '/admin/analytics',
      color: '#1abc9c',
      description: 'View platform statistics and reports'
    },
    {
      title: 'Notifications',
      icon: <FaBell />,
      path: '/admin/notifications',
      color: '#f1c40f',
      description: 'Manage system notifications'
    },
    {
      title: 'Settings',
      icon: <FaCog />,
      path: '/admin/settings',
      color: '#e67e22',
      description: 'Configure system settings'
    },
    {
      title: 'Security',
      icon: <FaUserShield />,
      path: '/admin/security',
      color: '#e74c3c',
      description: 'Manage security settings and access'
    }
  ];

  const handleModuleClick = (path) => {
    navigate(path);
  };

  return (
    <div className="admin-dashboard">
      <AdminNav moduleName="Dashboard" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome to Admin Dashboard</h1>
          <p>Select a module to manage different aspects of the platform</p>
        </div>
        <div className="module-grid">
          {modules.map((module, index) => (
            <div
              key={index}
              className="module-tile"
              onClick={() => handleModuleClick(module.path)}
              style={{ '--tile-color': module.color }}
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