import React from "react";
import "./LoadingOverlay.css";

const LoadingOverlay = ({
  show,
  icon,
  text,
  style = {},
  backgroundColor = "rgba(0, 0, 0, 0.6)",
  zIndex = 9999,
}) => {
  if (!show) return null; // Don't render if not active

  return (
    <div className="loading-overlay" style={{ backgroundColor, zIndex }}>
      <div className="spinner-container">
        <div className="loading-spinner">
          {/* Render the icon passed via props with the style object */}
          {icon && (
            <span className="icon-container" style={style}>
              {icon}
            </span>
          )}
          {!icon && (
            <span style={style}>
              <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
            </span>
          )}
          {/* Render the text passed via props with the same style object */}
          <p style={style}>{text || "Loading..."}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
