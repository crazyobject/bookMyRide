import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import { Timestamp } from "firebase/firestore";
import LocationInput from "./LocationInput"; // Import your custom LocationInput
import "./OfferRideForm.css"; // Add your custom styling here
import LoadingOverlay from "./LoadingOverlay";
import { toast } from "react-toastify";

// database
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const OfferRideForm = ({ show, handleClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [route, setRoute] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [departureTime, setDepartureTime] = useState("10:00");
  const [carModel, setCarModel] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [seats, setSeats] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false); // State to control loading overlay
  const [toastData, setToastData] = useState({});

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isDateDisabled = (date) => {
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return (
      date.getTime() === today.getTime() ||
      date.getTime() === tomorrow.getTime()
    );
  };

  // Assuming selectedDate is a Date object, and departureTime is a string like "00:23" or "12:23"
  const combineDateAndTime = (date, time) => {
    // Get the date part from selectedDate
    const selectedDateString = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Combine the date part with the time part
    const dateTimeString = `${selectedDateString}T${time}:00`; // e.g., "2024-10-09T12:23:00"

    // Create a new Date object from the combined string
    const combinedDateTime = new Date(dateTimeString);

    // Return the combined Date object
    return combinedDateTime;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fromLocation || !toLocation) {
      toast.error("Please fill out all required fields.");
      return;
    }

    // Example usage
    const combinedDate = combineDateAndTime(selectedDate, departureTime);
    const firebaseTimestamp = Timestamp.fromDate(combinedDate);

    // Gather ride data from your form
    const rideData = {
      rider: {
        fName: firstName,
        lName: lastName,
        contact: contactNumber,
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
      setLoading(true); // Show the loading overlay
      const ridesCollectionRef = collection(db, "rides");
      await addDoc(ridesCollectionRef, rideData);
      console.log("Ride added successfully");

      // Store toast type/message in state instead of showing immediately
      setToastData({
        type: "success",
        message: "Your ride has been added successfully!",
      });
    } catch (error) {
      console.error("Error adding ride: ", error);

      // Store error toast in state
      setToastData({
        type: "error",
        message: "Failed to add the ride. Please try again.",
      });
    } finally {
      setTimeout(() => {
        setLoading(false); // Hide loading overlay
        handleClose(); // Call your close handler

        // After overlay is hidden, show the toast notification
        if (toastData) {
          if (toastData.type === "success") {
            toast.success(toastData.message);
          } else if (toastData.type === "error") {
            toast.error(toastData.message);
          }
        }
      }, 600); // Delay to ensure overlay removal
    }
  };

  const handleFromLocationSelect = (location) => {
    setFromLocation(location); // Set the selected location for "From"
  };

  const handleToLocationSelect = (location) => {
    setToLocation(location); // Set the selected location for "To"
  };

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
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Control
                    type="text"
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
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  {/* Replace this Form.Control with LocationInput for "From" */}
                  <LocationInput
                    placeholder="Starting from"
                    onLocationSelect={handleFromLocationSelect} // Set "fromLocation" on selection
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <LocationInput
                    placeholder="Goging to"
                    onLocationSelect={handleToLocationSelect} // Set "toLocation" on selection
                  />
                </Form.Group>
              </Col>
            </Row>
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
                  <TimePicker
                    onChange={setDepartureTime}
                    value={departureTime}
                    disableClock={true}
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Route"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                required
                className="custom-input"
              />
            </Form.Group>
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
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="button-group">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OfferRideForm;
