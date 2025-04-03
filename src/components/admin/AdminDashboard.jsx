import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNav from './AdminNav';
import './AdminStyles.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Users',
      description: 'Manage user accounts and permissions',
      icon: '👥',
      path: '/admin/users',
      color: '#4CAF50'
    },
    {
      title: 'Rides',
      description: 'View and manage all rides',
      icon: '🚗',
      path: '/admin/rides',
      color: '#2196F3'
    },
    {
      title: 'Active Rides',
      description: 'Monitor ongoing rides',
      icon: '📍',
      path: '/admin/active-rides',
      color: '#FF9800'
    },
    {
      title: 'Ride History',
      description: 'View past ride records',
      icon: '📜',
      path: '/admin/ride-history',
      color: '#9C27B0'
    },
    {
      title: 'Analytics',
      description: 'View system analytics and reports',
      icon: '📊',
      path: '/admin/analytics',
      color: '#E91E63'
    },
    {
      title: 'Notifications',
      description: 'Manage system notifications',
      icon: '🔔',
      path: '/admin/notifications',
      color: '#00BCD4'
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: '⚙️',
      path: '/admin/settings',
      color: '#607D8B'
    },
    {
      title: 'Security',
      description: 'Manage security settings',
      icon: '🔒',
      path: '/admin/security',
      color: '#F44336'
    }
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