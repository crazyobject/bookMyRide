import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons"; // Icon for add/remove
import { faPhone, faCommentDots } from "@fortawesome/free-solid-svg-icons"; // Phone and SMS icons
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"; // Import WhatsApp icon
import "./MatchingRides.css";
import { DateTime } from "./DateTime";

const MatchingRides = ({
  rides,
  setSelectedRides,
  selectedRides,
  showNoRidesFound,
  searchType,
  handleRequestANewRide,
  handleShowModalForNewRide,
}) => {
  // Method to handle adding/removing rides from selectedRides
  const handleShowMore = (ride) => {
    setSelectedRides((prevSelectedRides) => {
      const isSelected = prevSelectedRides.find(
        (selectedRide) => selectedRide.id === ride.id,
      );

      if (isSelected) {
        return prevSelectedRides.filter(
          (selectedRide) => selectedRide.id !== ride.id,
        );
      } else {
        return [...prevSelectedRides, ride];
      }
    });
  };

  // Method to generate the inquiry message
  const getInquiryMessage = (ride) => {
    return encodeURIComponent(
      `Hello ${ride.rider.fName} ${ride.rider.lName}, I'm interested in booking your ride. Could you please share more details?`,
    );
  };

  // Method to handle WhatsApp click
  const handleWhatsAppClick = (ride) => {
    const inquiryMessage = getInquiryMessage(ride);
    window.open(
      `https://wa.me/${ride.rider.contact}?text=${inquiryMessage}`,
      "_blank",
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
    <>
      {rides.length > 0 ? (
        rides.map((ride) => (
          <div key={ride.id} className="ride-card">
            <h5>
              {ride.rider.fName} {ride.rider.lName} -{" "}
              <DateTime dateTime={ride.startDate} />
            </h5>
            <p className="text-start">
              <b>From: </b>
              {ride.route.start.address} <br /> <b>To: </b>
              {ride.route.end.address}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "Row",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                {ride.type === "offer" && (
                  <p>
                    <b>Car: </b> {ride.car.model || "--"} (
                    {ride.car.number || "--"}) / <b>Seats: </b>
                    {ride.car.seats || "--"} / <b>Tarrif: </b>
                    {ride.car.amount || "--"}
                  </p>
                )}
                <p className="icon-container">
                  <button onClick={() => handleShowMore(ride)}>
                    <FontAwesomeIcon icon={faChartLine} />
                    {selectedRides.some((r) => r.id === ride.id)
                      ? " Remove"
                      : " Add"}
                  </button>
                  <button
                    title="WhatsApp Rider"
                    onClick={() => handleWhatsAppClick(ride)}
                  >
                    <FontAwesomeIcon icon={faWhatsapp} />
                  </button>
                  <button
                    title="Call Rider"
                    onClick={() => handleCallClick(ride.rider.contact)}
                  >
                    <FontAwesomeIcon icon={faPhone} />
                  </button>
                  <button title="Send SMS" onClick={() => handleSMSClick(ride)}>
                    <FontAwesomeIcon icon={faCommentDots} />
                  </button>
                </p>
              </div>
              <div>
                {ride.rider.photoURL && (
                  <img
                    alt="Rider Profile"
                    src={ride.rider.photoURL}
                    width="43"
                    style={{
                      marginLeft: "5px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <></>
      )}
    </>
  );
};

export default MatchingRides;
