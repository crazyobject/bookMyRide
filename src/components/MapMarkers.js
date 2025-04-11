import React, { useState, useEffect } from "react";
import { Marker, Polyline, Tooltip } from "react-leaflet";
import { getRandomColor } from "../utils/colorUtils";
import RideTooltip from "./RideTooltip";

const MapMarkers = ({
  pickupCoords,
  dropCoords,
  selectedRides,
  hoveredRideId,
  setHoveredRideId,
  pickupAddress,
  dropAddress,
}) => {
  console.log("Addresses:", { pickupAddress, dropAddress });
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    if (pickupCoords && dropCoords) {
      fetchRoute(pickupCoords, dropCoords);
    }
  }, [pickupCoords, dropCoords]);

  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
      );
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        setRouteData(data.routes[0].geometry.coordinates);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  return (
    <>
      {/* Show markers for pickup and drop locations */}
      {pickupCoords && (
        <Marker position={pickupCoords}>
          <Tooltip permanent>
            <div className="tooltip-content">
              <strong>Start Location:</strong>
              <br />
              {pickupAddress}
            </div>
          </Tooltip>
        </Marker>
      )}
      {dropCoords && (
        <Marker position={dropCoords}>
          <Tooltip permanent>
            <div className="tooltip-content">
              <strong>End Location:</strong>
              <br />
              {dropAddress}
            </div>
          </Tooltip>
        </Marker>
      )}

      {/* Draw route between pickup and drop locations */}
      {routeData && (
        <Polyline
          positions={routeData.map((coord) => [coord[1], coord[0]])}
          color="#007bff"
          weight={5}
          opacity={1}
          eventHandlers={{
            mouseover: (e) => {
              e.target.setStyle({
                weight: 7,
                opacity: 1,
              });
            },
            mouseout: (e) => {
              e.target.setStyle({
                weight: 5,
                opacity: 1,
              });
            },
          }}
        >
          {/*<Tooltip sticky className="d-none">
            <div className="route-tooltip-content">
              <div className="route-info">
                <strong>Ride Details:</strong>
                <br />
                Start: {pickupAddress || "Location selected"}
                <hr />
                End: {dropAddress || "Location selected"}
              </div>
            </div>
          </Tooltip>*/}
        </Polyline>
      )}

      {/* Show routes for selected rides */}
      {selectedRides.map((ride) => (
        <React.Fragment key={ride.id}>
          <Marker position={ride.route.start.coordinates}>
            <RideTooltip ride={ride} />
          </Marker>
          <Marker position={ride.route.end.coordinates}>
            <RideTooltip ride={ride} />
          </Marker>
          <Polyline
            positions={[
              ride.route.start.coordinates,
              ride.route.end.coordinates,
            ]}
            color={hoveredRideId === ride.id ? "orange" : getRandomColor()}
            dashArray={hoveredRideId === ride.id ? "10, 10" : "5, 5"}
            onMouseOver={() => setHoveredRideId(ride.id)}
            onMouseOut={() => setHoveredRideId(null)}
          >
            <RideTooltip ride={ride} />
          </Polyline>
        </React.Fragment>
      ))}
    </>
  );
};

export default MapMarkers;
