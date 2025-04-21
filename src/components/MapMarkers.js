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
  const [routeData, setRouteData] = useState(null);
  const [rideRoutes, setRideRoutes] = useState({}); // Store routes for selected rides

  useEffect(() => {
    if (pickupCoords && dropCoords) {
      fetchRoute(pickupCoords, dropCoords, setRouteData);
    }
  }, [pickupCoords, dropCoords]);

  const fetchRoute = async (start, end, setRouteCallback) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
      );
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        setRouteCallback(data.routes[0].geometry.coordinates);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  useEffect(() => {
    // Fetch routes for all selected rides
    selectedRides.forEach((ride) => {
      if (!rideRoutes[ride.id]) {
        fetchRoute(
          ride.route.start.coordinates,
          ride.route.end.coordinates,
          (route) => {
            setRideRoutes((prevRoutes) => ({
              ...prevRoutes,
              [ride.id]: route,
            }));
          },
        );
      }
    });
  }, [selectedRides]);

  return (
    <>
      {/* Show markers for pickup and drop locations */}
      {pickupCoords && (
        <Marker
          position={pickupCoords}
          eventHandlers={{
            mouseover: (e) => {
              e.target.openTooltip(); // Show the tooltip on hover
            },
            mouseout: (e) => {
              e.target.closeTooltip(); // Hide the tooltip when the mouse leaves
            },
          }}
        >
          <Tooltip>
            <div className="tooltip-content">
              <strong>Start Location:</strong>
              <br />
              {pickupAddress}
            </div>
          </Tooltip>
        </Marker>
      )}
      {dropCoords && (
        <Marker
          position={dropCoords}
          eventHandlers={{
            mouseover: (e) => {
              e.target.openTooltip(); // Show the tooltip on hover
            },
            mouseout: (e) => {
              e.target.closeTooltip(); // Hide the tooltip when the mouse leaves
            },
          }}
        >
          <Tooltip>
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
          color="red" 
          weight={3}
          opacity={1}
          dashArray="5, 5"
        />
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
          {rideRoutes[ride.id] && (
            <Polyline
              positions={rideRoutes[ride.id].map((coord) => [coord[1], coord[0]])}
              color={hoveredRideId === ride.id ? "orange" : "#007bff"}
              weight={8}
              opacity={0.7}
              dashArray={hoveredRideId === ride.id ? "10, 10" : "5, 5"}
              onMouseOver={() => setHoveredRideId(ride.id)}
              onMouseOut={() => setHoveredRideId(null)}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default MapMarkers;
