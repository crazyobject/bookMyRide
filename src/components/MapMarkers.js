import React, { useState, useEffect } from "react";
import { Marker, Polyline } from "react-leaflet";
import { getRandomColor } from "../utils/colorUtils";
import RideTooltip from "./RideTooltip";

const MapMarkers = ({
  pickupCoords,
  dropCoords,
  selectedRides,
  hoveredRideId,
  setHoveredRideId,
}) => {
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    if (pickupCoords && dropCoords) {
      fetchRoute(pickupCoords, dropCoords);
    }
  }, [pickupCoords, dropCoords]);

  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
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
      {pickupCoords && <Marker position={pickupCoords}></Marker>}
      {dropCoords && <Marker position={dropCoords}></Marker>}

      {/* Draw route between pickup and drop locations */}
      {routeData && (
        <Polyline
          positions={routeData.map((coord) => [coord[1], coord[0]])}
          color="blue"
          weight={3}
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
/* import React from "react";
import { Marker, Polyline } from "react-leaflet";
import { getRandomColor } from "../utils/colorUtils";
import RideTooltip from "./RideTooltip";

const MapMarkers = ({
  pickupCoords,
  dropCoords,
  selectedRides,
  hoveredRideId,
  setHoveredRideId,
}) => (
  <>
    {/* Show markers for pickup and drop locations */}
    {pickupCoords && <Marker position={pickupCoords}></Marker>}
    {dropCoords && <Marker position={dropCoords}></Marker>}

    {/* Draw a polyline between pickup and drop locations */}
    {pickupCoords && dropCoords && (
      <Polyline positions={[pickupCoords, dropCoords]} color="blue" />
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
          positions={[ride.route.start.coordinates, ride.route.end.coordinates]}
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

export default MapMarkers;
*/
