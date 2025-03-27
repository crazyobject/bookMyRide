import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { Timestamp } from "firebase/firestore";
import LocationInput from "./LocationInput"; // Import your custom LocationInput
import "./OfferRideForm.css"; // Add your custom styling here
import LoadingOverlay from "./LoadingOverlay";
import { toast } from "react-toastify";
//import { sendNotificationOnRideCreation } from "../services/fcmService";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

// database
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

// Get the current time and format it for TimePicker
const currentTime = new Date().toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
});

// Initial state for new mode
/* const initialState = {
  firstName: "",
  lastName: "",
  contactNumber: "",
  email: "",
  photoUrl: "",
  startDate: new Date(),
  startTime: currentTime
    .replace(new RegExp(["AM", "PM"].join("|"), "g"), "")
    .replace(/\s{2,}/g, " ")
    .trim(),
  amount: "",
  carNumber: "",
  carModel: "",
  seats: "",
  fromLocation: "",
  toLocation: "",
};
*/
const OfferRideForm = ({
  show,
  handleClose,
  user,
  mode = "offer",
  editData,
}) => {
  const [firstName, setFirstName] = useState(user?.displayName?.split(" ")[0]);
  const [lastName, setLastName] = useState(user?.displayName?.split(" ")[1]);
  const [contactNumber, setContactNumber] = useState(
    user?.providerData?.phoneNumber,
  );
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL);
  const [email, setEmail] = useState(user?.email);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [route, setRoute] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [departureTime, setDepartureTime] = useState(
    currentTime
      .replace(new RegExp(["AM", "PM"].join("|"), "g"), "")
      .replace(/\s{2,}/g, " ")
      .trim(),
  );
  const [carModel, setCarModel] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [seats, setSeats] = useState("");
  const [amount, setAmount] = useState("");
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(false); // State to control loading overlay
  const [formSubmitted, setFormSubmitted] = useState(false); // State to track form submission
  // const [formData, setFormData] = useState(initialState);
  const [rideMode, setRideMode] = useState(mode);

  const SHOW_RECENT_RIDES = true; // hide recent rides selection
  const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/; // This pattern validates international numbers with + as well

  // Detect if we are in edit mode
  const isEditMode = Boolean(editData);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  useEffect(() => {
    tippy("[data-tippy-content]", {
      animation: "shift-away", // You can choose 'fade', 'scale', 'shift-away', 'shift-toward', or create a custom one
      duration: 300, // Duration of the animation in milliseconds
    });
  }, []);

  useEffect(() => {
    setRideMode(mode);
  }, [mode]);

  const isDateDisabled = (date) => {
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return (
      date.getTime() === today.getTime() ||
      date.getTime() === tomorrow.getTime()
    );
  };

  // Initialize form data based on editData
  useEffect(() => {
    if (isEditMode) {
      setSelectedDate(new Date());
      setDepartureTime(
        currentTime
          .replace(new RegExp(["AM", "PM"].join("|"), "g"), "")
          .replace(/\s{2,}/g, " ")
          .trim(),
      );
      setFirstName(editData.rider.fName || "");
      setLastName(editData.rider.lName || "");
      setEmail(editData.rider.email || "");
      setContactNumber(editData.rider.contact || "");
      setAmount(editData.car?.amount || "");
      setRoute(editData.route.routeText || "");
      setCarModel(editData.car?.model || "");
      setCarNumber(editData.car?.number || "");
      setSeats(editData.car?.seats || "");
      setPhotoUrl(editData.rider.photoURL || "");
      setFromLocation(
        {
          display_name: editData.route?.start?.address,
          lat: editData.route?.start?.coordinates[0],
          lon: editData.route?.start?.coordinates[1],
        } || "",
      );
      setToLocation(
        {
          display_name: editData.route?.end?.address,
          lat: editData.route?.end?.coordinates[0],
          lon: editData.route?.end?.coordinates[1],
        } || "",
      );
    } /* else {
      setFormData(initialState);
    } */
  }, [editData,isEditMode]);

  const LOCAL_STORAGE_KEY = "recentRides";

  const saveRideToLocalStorage = (rideData) => {
    let rides = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

    // Add new ride and limit to the last 3 rides
    rides = [rideData, ...rides.slice(0, 2)];

    // Store the updated rides back in local storage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rides));
  };

  const handleFillFormWithRide = (ride) => {
    setRideMode(ride.type);
    setContactNumber(ride.rider.contact);
    setFromLocation({
      display_name: ride.route.start.address,
      lat: ride.route.start.coordinates[0],
      lon: ride.route.start.coordinates[1],
    });
    setToLocation({
      display_name: ride.route.end.address,
      lat: ride.route.end.coordinates[0],
      lon: ride.route.end.coordinates[1],
    });
    setRoute(ride.route.routeText);
    setCarModel(ride.car.model);
    setCarNumber(ride.car.number);
    setSeats(ride.car.seats);
    setAmount(ride.car.amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true); // Set form submitted to true to trigger validation feedback

    if (!fromLocation || !toLocation) {
      return;
    }

    // Combine date and time
    const combinedDate = combineDateAndTime(selectedDate, departureTime);
    const firebaseTimestamp = Timestamp.fromDate(combinedDate);

    const rideData = {
      userid: user.uid,
      type: mode,
      rider: {
        fName: firstName,
        lName: lastName,
        contact: contactNumber,
        email: email,
        photoURL: photoUrl,
      },
      route: {
        start: {
          address: fromLocation.display_name,
          coordinates: [fromLocation.lat, fromLocation.lon],
        },
        end: {
          address: toLocation.display_name,
          coordinates: [toLocation.lat, toLocation.lon],
        },
        routeText: route,
      },
      startTime: departureTime,
      startDate: firebaseTimestamp,
      car: {
        model: carModel,
        number: carNumber,
        seats: seats,
        amount: amount,
      },
    };

    try {
      setLoading(true);

      const ridesCollectionRef = collection(db, "rides");
      await addDoc(ridesCollectionRef, rideData);

      toast.success("Your ride has been added successfully!");

      // Save the ride data to localStorage
      saveRideToLocalStorage(rideData);

      // send push notification
      // sendNotificationOnRideCreation(rideData);
    } catch (error) {
      toast.error("Failed to add the ride. Please try again." + error);
      console.log(error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const combineDateAndTime = (date, time) => {
    const selectedDateString = date.toISOString().split("T")[0];
    const dateTimeString = `${selectedDateString}T${time}:00`;
    return new Date(dateTimeString);
  };
  const handleFromLocationSelect = (location) => {
    setFromLocation(location); // Set the selected location for "From"
  };

  const handleToLocationSelect = (location) => {
    setToLocation(location); // Set the selected location for "To"
  };

  useEffect(() => {
    const { displayName, photoURL, providerData, email } = user || {};

    if (user && !isEditMode) {
      setFirstName(displayName?.split(" ")[0] || "");
      setLastName(displayName?.split(" ")[1] || "");
      setContactNumber(providerData?.phoneNumber || "");
      setEmail(email);
      setPhotoUrl(photoURL);
    }

    const ridesFromLocalStorage =
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    setRecentRides(ridesFromLocalStorage);
  }, [user, show,isEditMode]);

  return (
    <>
      <LoadingOverlay
        show={loading}
        icon={<i className="fa-solid fa-car-side fa-2x"></i>}
        text="Adding your ride to the pool..."
        backgroundColor="rgba(0, 0, 0, 0.6)"
        zIndex="10000000"
        style={{
          color: "white",
          fontSize: "1.0rem",
          fontWeight: "bold",
        }}
      />{" "}
      {/* Show loading spinner conditionally */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Body>
          {recentRides.length > 0 && SHOW_RECENT_RIDES && !isEditMode && (
            <div>
              <div className="recent-rides">
                {recentRides.slice(0, 1).map((ride, index) => (
                  /* <Button
                    key={index}
                    onClick={() => handleFillFormWithRide(ride)}
                    className="d-none recent-ride-button"
                  >
                    Ride {index + 1}
                  </Button> */
                  <Button
                    key={index}
                    onClick={() => handleFillFormWithRide(ride)}
                    className="recent-ride-button w-100"
                    data-tippy-content="Clicking on this will copy your last ride data in the form below."
                    data-tippy-placement="bottom"
                  >
                    Copy last ride data
                  </Button>
                ))}
              </div>
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Control
                    type="text"
                    readOnly
                    disabled
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Control
                    type="text"
                    readOnly
                    disabled
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Contact Number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                    className="custom-input"
                    isInvalid={
                      formSubmitted && !phoneNumberRegex.test(contactNumber)
                    } // Mark as invalid if the phone number is incorrect
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    style={{
                      marginTop: "-14px",
                      marginBottom: "10px",
                      fontSize: "14px",
                    }}
                  >
                    Invalid phone number.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Control
                    type="text"
                    value={email || user?.email}
                    required
                    disabled
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            {isEditMode && (
              <Row>
                <Col class="small">
                  <b>From :</b> {fromLocation.display_name}
                  <br />
                  <b>To :</b> {toLocation.display_name}
                  <br />
                  <div class="alert alert-danger border border-danger rounded p-3 pt-3 small">
                    Do not forget to update the date and time for your new ride.
                  </div>
                </Col>
              </Row>
            )}
            {!isEditMode && (
              <Row>
                <Col>
                  <Form.Group>
                    <LocationInput
                      value={fromLocation.display_name}
                      placeholder="Starting from"
                      onLocationSelect={handleFromLocationSelect} // Set "fromLocation" on selection
                    />
                    {formSubmitted && !fromLocation && (
                      <div
                        class="text-danger"
                        style={{ marginTop: "-14px", marginBottom: "10px" }}
                      >
                        Select start location!
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <LocationInput
                      placeholder="Going to"
                      value={toLocation.display_name}
                      onLocationSelect={handleToLocationSelect} // Set "toLocation" on selection
                    />
                    {formSubmitted && !toLocation && (
                      <div
                        style={{ marginTop: "-14px", marginBottom: "10px" }}
                        class="text-danger"
                      >
                        Select end location!
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            )}
            <Row>
              <Col>
                <Form.Group>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    filterDate={isDateDisabled}
                    dateFormat="dd/MM/yyyy"
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    min={currentTime
                      .replace(new RegExp(["AM", "PM"].join("|"), "g"), "")
                      .replace(/\s{2,}/g, " ")
                      .trim()}
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            {rideMode === "offer" && (
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Route"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            )}
            {rideMode === "offer" && (
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Swift, punch etc"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="MH 04 1234"
                      value={carNumber}
                      onChange={(e) => setCarNumber(e.target.value)}
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
            {rideMode === "offer" && (
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Control
                      as="select"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      required
                      className="custom-input"
                    >
                      <option value="" disabled>
                        Select number of seats
                      </option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="₹. 100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <div className="button-group">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {rideMode === "offer" ? "Offer Ride" : "Ask for Ride"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OfferRideForm;
