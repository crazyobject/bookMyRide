import React, { useState, useRef, useEffect, useCallback } from "react";
import "./LocationInput.css";
import { Form, InputGroup, Button } from "react-bootstrap";
import debounce from "lodash.debounce"; // Install lodash.debounce if not already installed

// Base URL for Nominatim API (used for geolocation-based place search)
const NominatimURL = "https://nominatim.openstreetmap.org/search?";

const cache = new Map();

const photonOrNommina = "nomina";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_DELAY = 300;

// LocationInput Component
const LocationInput = ({ label, placeholder, onLocationSelect, value }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);

  // Cleanup function to abort any pending requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Fetch location suggestions from the Nominatim API based on the user's input.
   *
   * @param {string} query - The text input entered by the user.
   */
  const fetchSuggestions = useCallback(
    async (query) => {
      cleanup(); // Cleanup any previous requests

      if (query.length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        return;
      }

      if (cache.has(query)) {
        setSuggestions(cache.get(query));
        return;
      }

      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      try {
        setIsLoading(true);
        setError(null);

        const url = `${NominatimURL}q=${encodeURIComponent(query)}&format=json&limit=5`;
        const response = await fetch(url, { signal });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const formattedSuggestions = data.map((place) => ({
          place_id: place.place_id || "",
          display_name: place.display_name || "",
          lat: parseFloat(place.lat) || 0,
          lon: parseFloat(place.lon) || 0,
        }));

        setSuggestions(formattedSuggestions);
        cache.set(query, formattedSuggestions);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching suggestions:", error);
          setError("Failed to fetch suggestions. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cleanup],
  );

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce((query) => fetchSuggestions(query), DEBOUNCE_DELAY),
    [fetchSuggestions],
  );

  // Handle input change event
  const handleInputChange = useCallback(
    (e) => {
      const query = e.target.value;
      setInputValue(query);
      debouncedFetchSuggestions(query);
    },
    [debouncedFetchSuggestions],
  );

  // Handle location selection
  const handleSelectSuggestion = useCallback(
    (suggestion) => {
      setInputValue(suggestion.display_name);
      setSuggestions([]);
      onLocationSelect?.(suggestion);
      inputRef.current?.blur();
    },
    [onLocationSelect],
  );

  // Clear input and suggestions
  const clearInput = useCallback(() => {
    setInputValue("");
    setSuggestions([]);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      debouncedFetchSuggestions.cancel();
    };
  }, [cleanup, debouncedFetchSuggestions]);

  // Update internal state whenever the prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="location-input-container">
      {label && <label className="location-input-label">{label}</label>}

      <InputGroup className="location-input-group">
        <Form.Control
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="location-input-field"
        />
        {inputValue && (
          <Button
            variant="outline-secondary"
            onClick={clearInput}
            className="location-clear-button"
          >
            <i className="fas fa-times"></i>
          </Button>
        )}
      </InputGroup>

      {/* Loading indicator */}
      {isLoading && (
        <div className="location-loading">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="location-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="location-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.place_id}-${index}`}
              className="location-suggestion-item"
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
