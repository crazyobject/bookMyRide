import { useEffect } from "react";
import { useMap } from "react-leaflet";
export const PanToLocation = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      // Using flyTo for smooth transition
      map.flyTo(coords, map.getZoom(), {
        animate: true,
        duration: 1.5, // duration in seconds
      });
    }
  }, [coords, map]);
  return null;
};
