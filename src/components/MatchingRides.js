import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faPhone,
  faCommentDots,
  faCar,
  faUser,
  faMapMarkerAlt,
  faCalendarAlt,
  faMoneyBillWave,
  faChair,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Popup from "./Popup"; // Import the Popup component
import { getDoc, doc } from "firebase/firestore"; // Import Firestore methods
import { db } from "../firebase"; // Import your Firebase config
import "./MatchingRides.css";
import { DateTime } from "./DateTime";

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Function to calculate route match percentage
const calculateRouteMatchPercentage = (searchRoute, matchingRoute) => {
  // Check for valid coordinates
  if (
    !searchRoute ||
    !matchingRoute ||
    !searchRoute.start ||
    !searchRoute.end ||
    !matchingRoute.start ||
    !matchingRoute.end ||
    typeof searchRoute.start.lat !== "number" ||
    typeof searchRoute.start.lng !== "number" ||
    typeof searchRoute.end.lat !== "number" ||
    typeof searchRoute.end.lng !== "number" ||
    !Array.isArray(matchingRoute.start.coordinates) ||
    !Array.isArray(matchingRoute.end.coordinates) ||
    matchingRoute.start.coordinates.length < 2 ||
    matchingRoute.end.coordinates.length < 2
  ) {
    return "--";
  }

  // Extract lat/lng from coordinates array
  const matchingStartLat = matchingRoute.start.coordinates[0];
  const matchingStartLng = matchingRoute.start.coordinates[1];
  const matchingEndLat = matchingRoute.end.coordinates[0];
  const matchingEndLng = matchingRoute.end.coordinates[1];

  // Calculate distances between start and end points
  const startDistance = calculateDistance(
    searchRoute.start.lat,
    searchRoute.start.lng,
    matchingStartLat,
    matchingStartLng
  );

  const endDistance = calculateDistance(
    searchRoute.end.lat,
    searchRoute.end.lng,
    matchingEndLat,
    matchingEndLng
  );

  const maxDistance = 5; // 5km radius

  const startMatch = Math.max(0, 100 - (startDistance / maxDistance) * 100);
  const endMatch = Math.max(0, 100 - (endDistance / maxDistance) * 100);

  return Math.round((startMatch + endMatch) / 2);
};

const MatchingRides = ({
  rides,
  setSelectedRides,
  selectedRides,
  handleShowModalForNewRide,
  user,
  searchRoute, // Add this prop to receive the search route
}) => {
  const [popupMessage, setPopupMessage] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(null);
  const carIconRefs = useRef({});

  // Click-away listener for popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popoverOpen &&
        carIconRefs.current[popoverOpen] &&
        !carIconRefs.current[popoverOpen].contains(event.target)
      ) {
        setPopoverOpen(null);
      }
    }
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverOpen]);

  // Function to check KYC and active status
  const checkUserStatus = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const { kyc, active } = userDoc.data();

        if (!kyc) {
          setPopupMessage(
            "KYC is pending. Please complete your KYC to proceed."
          );
          return false;
        }
        if (!active) {
          setPopupMessage(
            "Your account is inactive. Please activate your account to proceed."
          );
          return false;
        }
        return true;
      } else {
        setPopupMessage("User not found.");
        return false;
      }
    } catch (error) {
      setPopupMessage("An error occurred while checking user status.");
      console.error(error);
      return false;
    }
  };

  // Wrapper function to handle actions with the KYC and active check
  const handleAction = async (ride, action) => {
    setPopupMessage("Processing...");
    const isAllowed = await checkUserStatus(user.uid);
    if (isAllowed) {
      setPopupMessage(null); // Close the popup if allowed
      action(ride); // Execute the desired action
    }
  };

  // Method to handle adding/removing rides from selectedRides
  const handleShowMore = (ride) => {
    setSelectedRides((prevSelectedRides) => {
      const isSelected = prevSelectedRides.find(
        (selectedRide) => selectedRide.id === ride.id
      );

      if (isSelected) {
        return prevSelectedRides.filter(
          (selectedRide) => selectedRide.id !== ride.id
        );
      } else {
        return [...prevSelectedRides, ride];
      }
    });
  };

  // Method to generate the inquiry message
  const getInquiryMessage = (ride) => {
    return encodeURIComponent(
      `Hello ${ride.rider.fName} ${ride.rider.lName}, I'm interested in booking your ride. Could you please share more details?`
    );
  };

  // Method to handle WhatsApp click
  const handleWhatsAppClick = (ride) => {
    const inquiryMessage = getInquiryMessage(ride);
    window.open(
      `https://wa.me/${ride.rider.contact}?text=${inquiryMessage}`,
      "_blank"
    ); // Opens WhatsApp chat
  };

  // Method to handle call click
  const handleCallClick = (number) => {
    window.open(`tel:${number}`); // Initiates a phone call
  };

  // Method to handle SMS click
  const handleSMSClick = (ride) => {
    const inquiryMessage = getInquiryMessage(ride);
    window.open(`sms:${ride.rider.contact}?body=${inquiryMessage}`); // Opens SMS with the message
  };

  return (
    <div className="matching-rides-container">
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
      )}
      {rides.length > 0 ? (
        rides.map((ride) => (
          <div key={ride.id} className="ride-card">
            <div className="ride-card-header">
              <div className="rider-info">
                {ride.rider.photoURL ? (
                  <img
                    src={ride.rider.photoURL}
                    alt="Rider Profile"
                    className="rider-avatar"
                  />
                ) : (
                  <div className="rider-avatar-placeholder">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
                <div className="rider-details">
                  <div className="rider-name-row">
                    <h5 className="rider-name">
                      {ride.rider.fName} {ride.rider.lName}
                    </h5>
                    {ride.type === "offer" && (
                      <>
                        <div
                          className="car-popover-trigger car-popover-next-to-route"
                          ref={(el) => (carIconRefs.current[ride.id] = el)}
                          style={{
                            position: "relative",
                            display: "inline-block",
                            marginLeft: "12px",
                          }}
                        >
                          <button
                            className="car-popover-btn"
                            onClick={() =>
                              setPopoverOpen(
                                popoverOpen === ride.id ? null : ride.id
                              )
                            }
                            title="Show car details"
                            type="button"
                          >
                            <FontAwesomeIcon
                              icon={faCar}
                              className="car-flip-icon"
                            />
                          </button>
                          {popoverOpen === ride.id && (
                            <div className="car-popover-box">
                              <div className="car-details-popover">
                                <div className="car-info-item">
                                  <FontAwesomeIcon icon={faCar} />
                                  <span>
                                    {ride.car.model || "--"} (
                                    {ride.car.number || "--"})
                                  </span>
                                </div>
                                <div className="car-info-item">
                                  <FontAwesomeIcon icon={faChair} />
                                  <span>{ride.car.seats || "--"} seats</span>
                                </div>
                                <div className="car-info-item">
                                  <FontAwesomeIcon icon={faMoneyBillWave} />
                                  <span>₹{ride.car.amount || "--"}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          className={`action-button route-button ${
                            selectedRides.some((r) => r.id === ride.id)
                              ? "active"
                              : ""
                          }`}
                          onClick={() => handleShowMore(ride)}
                        >
                          <FontAwesomeIcon icon={faChartLine} />
                          {selectedRides.some((r) => r.id === ride.id)
                            ? "Remove"
                            : "Route"}
                          {searchRoute && (
                            <span className="match-percentage">
                              {calculateRouteMatchPercentage(
                                searchRoute,
                                ride.route
                              )}
                              %
                            </span>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="ride-time">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <DateTime dateTime={ride.startDate} />
                  </div>
                </div>
              </div>
            </div>

            <div className="ride-card-body">
              <div className="route-info">
                <div className="route-point">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="route-icon start"
                  />
                  <span>{ride.route.start.address}</span>
                </div>
                <div className="route-point">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="route-icon end"
                  />
                  <span>{ride.route.end.address}</span>
                </div>
              </div>
            </div>

            <div className="ride-card-footer">
              <div className="contact-buttons contact-buttons-row">
                <button
                  className="action-button whatsapp-button big-action"
                  title="WhatsApp Rider"
                  onClick={() => handleAction(ride, handleWhatsAppClick)}
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                  <span>WhatsApp</span>
                </button>
                <button
                  className="action-button call-button big-action"
                  title="Call Rider"
                  onClick={() =>
                    handleAction(ride.rider.contact, handleCallClick)
                  }
                >
                  <FontAwesomeIcon icon={faPhone} />
                  <span>Call</span>
                </button>
                <button
                  className="action-button sms-button big-action"
                  title="Send SMS"
                  onClick={() => handleAction(ride, handleSMSClick)}
                >
                  <FontAwesomeIcon icon={faCommentDots} />
                  <span>SMS</span>
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <></>
      )}
    </div>
  );
};

export default MatchingRides;
