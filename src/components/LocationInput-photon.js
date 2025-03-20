import React, { useState } from "react";
import "./LocationInput.css";
import { Form, InputGroup, Button } from "react-bootstrap"; // Import components from react-bootstrap
import debounce from "lodash.debounce"; // Install lodash.debounce if not already installed

// Base URL for Photon API (used for geolocation-based place search)
const PhotonURL = "https://photon.komoot.io/api/?q=";

const cache = new Map();

/**
 * LocationInput Component:
 * A search input field with autocomplete suggestions for location names.
 * Uses the Photon API to fetch suggestions and returns the selected location's
 * name and coordinates.
 *
 * @param {string} label - Optional label to display above the input field.
 * @param {string} placeholder - Placeholder text inside the input field.
 * @param {function} onLocationSelect - Callback function to handle location selection.
 */
const LocationInput = ({ label, placeholder, onLocationSelect, value }) => {
  // State to store the user's input in the text field
  const [inputValue, setInputValue] = useState(value || "");

  // State to store location suggestions returned by the Photon API
  const [suggestions, setSuggestions] = useState([]);

  /**
   * Fetch location suggestions from the Photon API based on the user's input.
   *
   * @param {string} query - The text input entered by the user.
   */
  const fetchSuggestions = async (query) => {
    if (cache.has(query)) {
      setSuggestions(cache.get(query)); // Return cached suggestions
      return;
    }

    try {
      // Fetch results from the Photon API
      const response = await fetch(PhotonURL + query + "&limit=5");
      const data = await response.json();

      // Format the response to create a list of suggestions
      const formattedSuggestions = data.features.map((feature) => ({
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

      cache.set(query, formattedSuggestions); // Cache the result
      // Update suggestions state with the formatted data
      setSuggestions(formattedSuggestions);
    } catch (error) {
      // Log error if the API request fails
      console.error("Error fetching data from Photon:", error);
    }
  };

  /**
   * Handle input change event:
   * Updates the input state and triggers fetching of suggestions if
   * the input length is greater than 2 characters.
   *
   * @param {object} e - The input change event object.
   */
  const handleInputChange = (e) => {
    const query = e.target.value; // Get user input from the event
    setInputValue(query); // Update the input field value
    debouncedFetchSuggestions(query);
  };

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = debounce((query) => {
    if (query.length > 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, 300); // Wait for 300ms after the user stops typing

  const clearInput = () => {
    setInputValue("");
  };

  /**
   * Handle location selection:
   * When the user selects a suggestion, it updates the input field
   * and passes the selected location (address + coordinates) to the parent component.
   *
   * @param {object} suggestion - The selected location object.
   */
  const handleSelectSuggestion = (suggestion) => {
    // Update input field with the selected location's display name
    setInputValue(suggestion.display_name);

    // Clear suggestions after selection
    setSuggestions([]);

    // Call the callback function passed from the parent component with the selected location
    onLocationSelect && onLocationSelect(suggestion);
  };

  return (
    <div className="form-group">
      {/* Optional label displayed above the input */}
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
            variant="outline-secondary"
            onClick={clearInput}
            style={{ padding: "0.375rem 0.75rem" }}
          >
            <i className="fas fa-times"></i>
          </Button>
        )}
      </InputGroup>

      {/* Display location suggestions if there are any */}
      {suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {/* Map over suggestions to display each as an item */}
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.place_id}-${index}`} // Unique key for each suggestion
              className="suggestion-item" // CSS class for styling suggestion items
              onClick={() => handleSelectSuggestion(suggestion)} // Trigger selection handler on click
            >
              {/* Display the formatted location address */}
              {suggestion.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
