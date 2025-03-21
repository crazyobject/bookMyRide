import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./MapComponent.css";
import LocationInput from "./LocationInput";
import MatchingRides from "./MatchingRides";
import MapMarkers from "./MapMarkers";
import { PanToLocation } from "./PanToLocation";
import OfferRideForm from "./OfferRideForm";
import LoadingOverlay from "./LoadingOverlay";
import { toast } from "react-toastify";
import { getAuth, signOut } from "firebase/auth";
import UserProfile from "./UserProfile";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCar } from "@fortawesome/free-solid-svg-icons"; // Icon for add/remove
import { ROLES } from "../app.config";

// database
import { db } from "../firebase";
import {
  collection,
  getDocs,
  Timestamp,
  where,
  query,
} from "firebase/firestore";

// Fix for missing marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapComponent = ({ user }) => {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [rideMode, setRideMode] = useState("offer");
  const [dropCoords, setDropCoords] = useState(null);
  const [matchingRides, setMatchingRides] = useState([]);
  const [selectedRides, setSelectedRides] = useState([]);
  const [hoveredRideId, setHoveredRideId] = useState(null);
  const [showOfferRideModal, setShowOfferRideModal] = useState(false);
  const [showNoRidesFound, setShowNoRidesFound] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const [searchType, setSearchType] = useState("offer");

  useEffect(() => {
    tippy("[data-tippy-content]", {
      animation: "shift-away", // You can choose 'fade', 'scale', 'shift-away', 'shift-toward', or create a custom one
      duration: 300, // Duration of the animation in milliseconds
    });
  }, []);

  const auth = getAuth();
  const handleLogout = useCallback(() => {
    signOut(auth)
      .then(() => {
        toast.success("User signed out.");
        window.location.assign("/");
      })
      .catch((error) => toast.warn("Sign out error", error));
  }, [auth]);

  const handleShowModalForNewRideRequest = () => {
    setRideMode("request");
    setShowOfferRideModal(true);
  };

  const handleShowModalForNewRide = () => {
    setRideMode("offer");
    setShowOfferRideModal(true);
  };

  const handleCloseModalForNewRide = () => {
    setRideMode("offer");
    setShowOfferRideModal(false);
  };

  const handlePickupSelect = useCallback((location) => {
    setPickupCoords([location.lat, location.lon]);
  }, []);

  const handleDropSelect = useCallback((location) => {
    setDropCoords([location.lat, location.lon]);
  }, []);

  const handleFindMyRide = async (type) => {
    if (!pickupCoords || !dropCoords) {
      toast.warn("Please select both pickup and drop locations.");
      return;
    }
    // Only fetch rides if both pickup and drop coordinates are selected
    if (pickupCoords && dropCoords) {
      setSearchType(type); // this is either "offer" or "request"
      setLoading(true); // Start loading
      setMatchingRides([]); // Clear any previous rides data

      // Get the current timestamp
      const currentTimestamp = Timestamp.now();

      // person who entered start time as 12 may not have started on 12 yet so we can show one hour earlier rides as well
      // later on this can be configurable to each user
      const date = currentTimestamp.toDate();
      // Subtract 1 hour (40 minutes * 60 seconds * 1000 milliseconds)
      date.setTime(date.getTime() - 1 * 60 * 60 * 1000);
      const oneHourAgoTimestamp = Timestamp.fromDate(date); // Convert back to Firebase Timestamp

      // Calculate the timestamp for 8 hours from now
      const eightHoursLater = new Timestamp(
        currentTimestamp.seconds + 48 * 3600,
        currentTimestamp.nanoseconds,
      );

      try {
        const ridesSnapshot = await getDocs(
          query(
            collection(db, "rides"),
            where("startDate", ">", oneHourAgoTimestamp),
            where("startDate", "<=", eightHoursLater),
            where("rider.email", "!=", user.email),
            where("type", "==", type),
          ),
        );
        const ridesList = ridesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })); // Map through documents

        // Find matching rides
        const matchedRides = ridesList.filter((ride) => {
          const startMatch =
            L.latLng(ride.route.start.coordinates).distanceTo(pickupCoords) <
            5000;
          const endMatch =
            L.latLng(ride.route.end.coordinates).distanceTo(dropCoords) < 5000;
          return startMatch && endMatch;
        });

        setMatchingRides(matchedRides);
        setSelectedRides([]);
        setTimeout(() => {
          setLoading(false);
          if (matchedRides.length < 1) {
            setShowNoRidesFound(true);
            toast.info(
              <div style={{ display: "flex", alignItems: "center" }}>
                {searchType === "request" && (
                  <span class="small">
                    No passengers found, try posting your ride by clicking{" "}
                    <b>"Offer a new ride"</b> button. New passengers will
                    contact you directly.
                  </span>
                )}
                {searchType === "offer" && (
                  <span class="small">
                    No rides available, try posting your ride by clicking{" "}
                    <b>"Request a new ride"</b> button. New riders will contact
                    you directly.
                  </span>
                )}
              </div>,
              {
                autoClose: 10000,
                closeOnClick: true,
                draggable: false,
                closeButton: true,
              },
            );
            setTimeout(() => {
              animateButton(type + "Button");
            }, 500);
          } else {
            setShowNoRidesFound(false);
          }
        }, 400);
      } catch (error) {
        setTimeout(() => {
          setLoading(false);
          toast.error("Something went wrong while fetching rides.", error);
        }, 400);
      } finally {
      }
    } else {
      toast.warn("Please select both pickup and drop locations.", {
        position: "top-left",
        autoClose: 2500, // Reduce auto-close time
        closeOnClick: true,
        pauseOnHover: false, // Disables pause on hover for quicker auto-close
        draggable: false, // Disable dragging to keep the UI compact
        className: "compact-toast", // Custom class for further styling
        bodyClassName: "compact-toast-body", // Additional styling for the message text
      });
    }
  };

  const animateButton = (id) => {
    const button = document.getElementById(id);
    if (button) {
      button.classList.add("enlarged-button");

      // Remove the class after a short delay to bring it back to normal size
      setTimeout(() => {
        button.classList.remove("enlarged-button");
      }, 700); // Matches the 0.3s transition defined in CSS
    }
  };

  return (
    <>
      <LoadingOverlay
        show={loading}
        icon={<i className="fa-solid fa-car-side fa-2x"></i>}
        text={"Finding " + ROLES[searchType] + " for you..."}
        backgroundColor="rgba(0, 0, 0, 0.6)"
        zIndex="10000000"
        style={{
          color: "white",
          fontSize: "1.0rem",
          fontWeight: "bold",
        }}
      />{" "}
      <div className="map-container">
        <div className="location-inputs">
          <LocationInput
            placeholder="Enter Pickup Location..."
            onLocationSelect={handlePickupSelect}
          />
          <LocationInput
            placeholder="Enter Drop Location..."
            onLocationSelect={handleDropSelect}
          />
          <div
            className="btn-group"
            role="group"
            aria-label="Feature Buttons Group"
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleFindMyRide("offer")}
              data-tippy-content="Select your start and destination and we will find a ride/car/bike for you."
              data-tippy-placement="bottom"
            >
              Find Ride
            </button>
            <button
              type="button"
              className="btn btn-success right-corners"
              onClick={() => handleFindMyRide("request")}
              data-tippy-content="Find a passenger for your ride."
              data-tippy-placement="bottom"
            >
              Find Passenger
            </button>
            <button
              type="button"
              className="d-none btn btn-primary"
              onClick={handleShowModalForNewRide}
              data-tippy-content="Submit your ride to the pool so others can join you."
              data-tippy-placement="bottom"
              style={{ fontSize: "13px" }}
            >
              Offer Ride
            </button>
            <UserProfile user={user} onLogout={handleLogout} />
            <div
              className="user-avatar user-avatar-offer"
              data-tippy-content="Offer new ride"
              data-tippy-placement="left"
              onClick={() => handleShowModalForNewRide(null)}
            >
              <i className="fas fa-user-tie"></i>
            </div>
            <div
              className="user-avatar user-avatar-request"
              data-tippy-content="Request a ride"
              data-tippy-placement="left"
              onClick={handleShowModalForNewRideRequest}
            >
              <FontAwesomeIcon icon={faCar} />
            </div>
          </div>
        </div>

        <MapContainer
          center={[19.2183, 72.9781]}
          zoom={13}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapMarkers
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            selectedRides={selectedRides}
            hoveredRideId={hoveredRideId}
            setHoveredRideId={setHoveredRideId}
          />
          {/* Add the PanToLocation component to manage panning the map */}
          <PanToLocation coords={pickupCoords || dropCoords} />
        </MapContainer>

        {/* Offer Ride Modal */}
        <OfferRideForm
          user={user}
          mode={rideMode}
          show={showOfferRideModal}
          handleClose={handleCloseModalForNewRide}
        />

        <div className="matching-rides-overlay">
          <div className="rides-container">
            <MatchingRides
              showNoRidesFound={showNoRidesFound}
              rides={matchingRides}
              setSelectedRides={setSelectedRides}
              selectedRides={selectedRides}
              searchType={searchType} // offer or requetst
              handleRequestANewRide={handleShowModalForNewRideRequest}
              handleShowModalForNewRide={handleShowModalForNewRide}
            />
            {matchingRides.length === 0 && (
              <p>
                <div class="container text-center mt-4">
                  <div
                    class="alert alert-info d-flex align-items-center justify-content-between"
                    style={{ flexDirection: "column" }}
                  >
                    <div>
                      {showNoRidesFound && (
                        <h5 class="mb-3">No {ROLES[searchType]} found.</h5>
                      )}
                      <p class="d-none mb-0" style={{ fontSize: "14px" }}>
                        Change "Pick-up" & "Drop" locations to search your ride
                      </p>
                    </div>
                    <div>
                      <a
                        href="#"
                        class="btn btn-success btn-sm"
                        onClick={handleShowModalForNewRideRequest}
                        data-tippy-content="Looking for a car/bike?"
                        data-tippy-placement="top"
                        id="offerButton"
                      >
                        Request a New Ride
                      </a>
                      &nbsp;&nbsp;&nbsp;Or&nbsp;&nbsp;&nbsp;
                      <a
                        href="#"
                        class="btn btn-warning btn-sm"
                        onClick={() => handleShowModalForNewRide(null)}
                        data-tippy-content="Looking for passenger?"
                        data-tippy-placement="top"
                        id="requestButton"
                      >
                        Offer a New Ride
                      </a>
                    </div>
                  </div>
                </div>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MapComponent;
