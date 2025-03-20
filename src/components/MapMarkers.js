import React from "react";
import { Marker, Polyline, Tooltip } from "react-leaflet";
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
