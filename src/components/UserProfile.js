import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./UserProfile.css"; // Custom styles for the profile dropdown
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCar, faSignOutAlt } from "@fortawesome/free-solid-svg-icons"; // Import icons from FontAwesome
import { Modal } from "react-bootstrap"; // Import Modal from Bootstrap
import UserProfileDetails from "./UserProfileDetails";
import MyRides from "./MyRides";

const UserProfile = ({ user, onLogout, showOfferRideForm }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  // Toggle dropdown open/close
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to get user initials
  const getUserInitials = (displayName) => {
    if (!displayName) return "";
    const nameParts = displayName.split(" ");
    const initials =
      nameParts.length > 1
        ? nameParts[0][0] + nameParts[1][0]
        : nameParts[0][0];
    return initials.toUpperCase();
  };

  // Handle option clicks to open modal with respective content
  const handleOptionClick = (component, title) => {
    setModalContent(component);
    setModalTitle(title); // Set the dynamic title
    setModalShow(true); // Show the modal
    setIsDropdownOpen(false); // Close the dropdown
  };

  return (
    <div className="profile-container">
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt="my profile"
          data-tippy-content="My Profile"
          data-tippy-placement="left"
          width="33px"
          height="33px"
          className="user-avatar"
          style={{
            position: "fixed",
            cursor: "pointer",
            right: "19px",
            borderRadius: "50%",
            top: "85px",
          }}
          onClick={toggleDropdown}
        />
      ) : (
        <div
          className="user-avatar"
          style={{
            position: "fixed",
            cursor: "pointer",
            right: "19px",
            borderRadius: "50%",
            top: "85px",
            width: "33px",
            height: "33px",
            backgroundColor: "#007bff",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "bold",
          }}
          onClick={toggleDropdown}
        >
          {getUserInitials(user?.displayName)}
        </div>
      )}

      {/* Custom Dropdown Menu */}
      {isDropdownOpen && (
        <div
          className="custom-dropdown"
          style={{ position: "fixed", right: "10px", top: "120px" }}
        >
          <ul className="dropdown-menu-icons">
            <li
              className="dropdown-item"
              onClick={() =>
                handleOptionClick(
                  <UserProfileDetails user={user} />,
                  "My Profile",
                )
              }
            >
              <a href="#profile">
                <FontAwesomeIcon icon={faUser} />
                <div style={{ fontSize: "8px" }}>My Profile</div>{" "}
                {/* Profile Icon */}
              </a>
            </li>
            <li
              className="dropdown-item"
              onClick={() =>
                handleOptionClick(
                  <MyRides
                    setModalShow={setModalShow}
                    user={user}
                    showOfferRideForm={showOfferRideForm}
                  />,
                  "My Rides",
                )
              }
            >
              <a href="#my-rides">
                <FontAwesomeIcon icon={faCar} />
                <div style={{ fontSize: "8px" }}>My Rides</div> {/* Car Icon */}
              </a>
            </li>
            <li className="dropdown-item">
              <a
                href="javascript:void(0);"
                onClick={onLogout}
                style={{ cursor: "pointer" }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="text-danger" />
                <div style={{ fontSize: "8px" }}>Logout</div>{" "}
                {/* Logout Icon */}
              </a>
            </li>
          </ul>
        </div>
      )}

      {/* Modal for showing selected content */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        {modalTitle && (
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
        )}
        <Modal.Body>{modalContent}</Modal.Body>
      </Modal>
    </div>
  );
};

export default UserProfile;
