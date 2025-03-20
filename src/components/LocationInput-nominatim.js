import React, { useState } from "react";
import "./LocationInput.css";
import { Form, InputGroup, Button } from "react-bootstrap";

// Base URL for Nominatim API (used for geolocation-based place search)
const NominatimURL = "https://nominatim.openstreetmap.org/search?";

// LocationInput Component
const LocationInput = ({ label, placeholder, onLocationSelect, value }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);

  /**
   * Fetch location suggestions from the Nominatim API based on the user's input.
   *
   * @param {string} query - The text input entered by the user.
   */
  const fetchSuggestions = async (query) => {
    try {
      // Nominatim API request parameters
      const url = `${NominatimURL}q=${query}&format=json&addressdetails=1&limit=5`;

      // Fetch results from the Nominatim API
      const response = await fetch(url);
      const data = await response.json();

      // Format the response to create a list of suggestions
      const formattedSuggestions = data.map((place) => ({
        place_id: place.place_id || "", // Place ID
        display_name: place.display_name || "", // Full formatted name of the place
        lat: place.lat || 0, // Latitude
        lon: place.lon || 0, // Longitude
      }));

      // Update suggestions state with the formatted data
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error fetching data from Nominatim:", error);
    }
  };

  // Handle input change event
  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);

    // Fetch suggestions only if the input is longer than 2 characters
    if (query.length > 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  };

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
