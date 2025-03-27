// RideTooltip.js
import React from "react";
import { Tooltip } from "react-leaflet";
import "./RideTooltip.css"; // Import the custom CSS
import { DateTime } from "./DateTime";

const RideTooltip = ({ ride }) => (
  <Tooltip className="leaflet-tooltip-large">
    <div className="important-params">
      <div className="tooltip-text text-capitalize">
        {ride.rider.fName} {ride.rider.lName} -{" "}
        <DateTime dateTime={ride.startDate} />
      </div>
      <div className="tooltip-detail">
        <span className="field-title">Start:</span> {ride.route.start.address}
      </div>
      <div className="tooltip-detail">
        <span className="field-title">End:</span> {ride.route.end.address}
      </div>
      {ride.route.routeText && (
        <div className="tooltip-detail">
          <span className="field-title">Route:</span> {ride.route.routeText}
        </div>
      )}
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "Row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="additional-info">
        {ride.car.model && (
          <div className="tooltip-detail">
            <span className="field-title">Car Model:</span> {ride.car.model}{" "}
            {ride.car.number}
          </div>
        )}
        {ride.car.seat && (
          <div className="tooltip-detail">
            <span className="field-title">Seats:</span> {ride.car.seat}
          </div>
        )}
        {ride.car.amount && (
          <div className="tooltip-detail">
            <span className="field-title">Fare/Tarrif:</span>{" "}
            {ride.car.amount}{" "}
          </div>
        )}
        {ride.rider.riderID && (
          <div className="tooltip-detail">
            <span className="field-title">Rider ID:</span> {ride.rider.riderID}
          </div>
        )}
        {ride.rider.contact && (
          <div className="tooltip-detail">
            <span className="field-title">Contact:</span> {ride.rider.contact}
          </div>
        )}
        {ride.rider.email && (
          <div className="tooltip-detail">
            <span className="field-title">E-mail:</span> {ride.rider.email}
          </div>
        )}
        {ride.rider.maxSeats && (
          <div className="tooltip-detail">
            <span className="field-title">Max Seats:</span>{" "}
            {ride.rider.maxSeats}
          </div>
        )}
        {ride.rider.seatsAvailable && (
          <div className="tooltip-detail">
            <span className="field-title">Seats Available:</span>{" "}
            {ride.rider.seatsAvailable}
          </div>
        )}
      </div>
      <div>
        {ride.rider.photoURL && (
          <img
            alt={ride.rider.riderID}
            src={ride.rider.photoURL}
            width="53"
            style={{
              marginLeft: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        )}
      </div>
    </div>
  </Tooltip>
);

export default RideTooltip;
