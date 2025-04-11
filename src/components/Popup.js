import React from "react";
import "./Popup.css"; // Add styles for the popup

const Popup = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <img
          src="/favicon/android-chrome-192x192.png" // Replace with the actual logo file in your public/favicons folder
          alt="App Logo"
          className="popup-logo"
        />
        <p className="popup-message">{message}</p>
        <button className="popup-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;