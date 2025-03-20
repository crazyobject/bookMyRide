import React from "react";
import "./UserProfileDetails.css"; // Add a CSS file for styling (optional)

const UserProfileDetails = ({ user }) => {
  return (
    <div className="user-profile-details">
      <div className="profile-header">
        <img
          src={user.photoURL || "https://via.placeholder.com/96"}
          alt="User Avatar"
          className="user-avatar"
        />
        <div className="user-info">
          <h2>{user.displayName || "User Name"}</h2>
          <p>{user.email}</p>
          <p>
            {user.emailVerified ? (
              <span className="text-success">Email Verified</span>
            ) : (
              <span className="text-danger">Email Not Verified</span>
            )}
          </p>
        </div>
      </div>
      <div className="profile-details">
        <h5>Profile Details</h5>
        <ul>
          <li>
            <strong>User ID:</strong> {user.uid}
          </li>
          <li>
            <strong>Provider:</strong> {user.providerData[0]?.providerId}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfileDetails;
