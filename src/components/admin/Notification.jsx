import React, { useEffect } from 'react';
import './AdminStyles.css';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`admin-notification ${type}`}>
      <div className="notification-content">
        <span>{message}</span>
        <button onClick={onClose} className="notification-close">
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification; 