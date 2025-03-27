import React, { useState, useRef, useEffect } from "react";
import "./LocationInput.css";
import { Form, InputGroup, Button } from "react-bootstrap";
import debounce from "lodash.debounce"; // Install lodash.debounce if not already installed

// Base URL for Nominatim API (used for geolocation-based place search)
const NominatimURL = "https://nominatim.openstreetmap.org/search?";

const cache = new Map();

const photonOrNommina = "nomina";

// LocationInput Component
const LocationInput = ({ label, placeholder, onLocationSelect, value }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const abortControllerRef = useRef(null);

  /**
   * Fetch location suggestions from the Nominatim API based on the user's input.
   *
   * @param {string} query - The text input entered by the user.
   */
  const fetchSuggestions = async (query) => {
    // Abort the previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (cache.has(query)) {
      setSuggestions(cache.get(query)); // Return cached suggestions
      return;
    }

    // Create a new AbortController for the current request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setIsLoading(true); // Set loading state to true

      let url = "";

      if (photonOrNommina === "photon") {
        // enable for photon
        url = `https://photon.komoot.io/api/?q=${query}`;
      } else {
        // Nominatim API request parameters
        url = `${NominatimURL}q=${query}&format=json&limit=5`;
      }

      // Fetch results from the Nominatim API
      const response = await fetch(url, { signal });

      // If request was aborted, just exit
      if (!response.ok) return;

      const data = await response.json();

      // Format the response to create a list of suggestions
      let formattedSuggestions;
      if (photonOrNommina === "photon") {
        formattedSuggestions = data.features.map((feature) => ({
          place_id: feature.properties?.osm_id || "", // Use OpenStreetMap ID if available
          display_name: [
            feature.properties?.name || "", // Name of the place
            feature.properties?.city || "", // City
            feature.properties?.state || "", // State
            feature.properties?.country || "", // Country
          ]
            .filter(Boolean) // Filter out any empty or undefined values
            .join(", "), // Combine non-empty parts with commas to form a full address string
          lat: feature.geometry?.coordinates[1] || 0, // Latitude (0 if not found)
          lon: feature.geometry?.coordinates[0] || 0, // Longitude (0 if not found)
        }));
      } else {
        formattedSuggestions = data.map((place) => ({
          place_id: place.place_id || "", // Place ID
          display_name: place.display_name || "", // Full formatted name of the place
          lat: place.lat || 0, // Latitude
          lon: place.lon || 0, // Longitude
        }));
      }

      // Update suggestions state with the formatted data
      setSuggestions(formattedSuggestions);
      cache.set(query, formattedSuggestions); // Cache the result
      setIsLoading(false); // Reset loading state
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data from Nominatim:", error);
      } else {
        console.error("Error fetching data", error);
      }
    }
  };

  // Update internal state whenever the prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change event
  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
    debounceFetchSuggestions(query);
  };

  // Debounced version of fetchSuggestions
  const debounceFetchSuggestions = debounce((query) => {
    if (query.length > 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, 400); // Wait for 400ms after the user stops typing

  const clearInput = () => {
    setInputValue("");
  };

  // Handle location selection
  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion.display_name); // Update input with selected location name
    setSuggestions([]); // Clear suggestions

    // Call callback function with selected location
    onLocationSelect && onLocationSelect(suggestion);
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}

      {/* Input field for entering location */}
      <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
        <Form.Control
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
        {inputValue && (
          <Button
            variant="secondary"
            onClick={clearInput}
            style={{ padding: "0.375rem 0.75rem" }}
          >
            <i className="fas fa-times"></i>
          </Button>
        )}
      </InputGroup>

      {/* Display loading icon while fetching suggestions */}
      {isLoading && (
        <div className="loading-icon autocomplete-dropdown">
          <i className="fas fa-spinner fa-spin"></i>{" "}
          {/* Font Awesome spinner icon */}
        </div>
      )}

      {/* Display location suggestions if there are any */}
      {suggestions.length > 0 && !isLoading && (
        <div className="autocomplete-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.place_id}-${index}`}
              className="suggestion-item"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
