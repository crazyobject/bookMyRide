import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Adjust the import according to your Firebase setup
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import LoadingOverlay from "./LoadingOverlay";
import { DateTime } from "./DateTime";
import { Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import OfferRideForm from "./OfferRideForm";

const MyRides = ({ user, setModalShow, showOfferRideForm }) => {
  const [offeredRides, setOfferedRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);
  const [activeTab, setActiveTab] = useState("offer");
  const [loading, setLoading] = useState(false);
  const [showOfferRideModal, setShowOfferRideModal] = useState(false);
  const [rideMode, setRideMode] = useState();
  const [editData, setEditData] = useState();

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        const ridesCollection = collection(db, "rides");

        // Fetch offered rides for the logged-in user
        const offerQuery = query(
          ridesCollection,
          where("type", "==", "offer"),
          where("rider.email", "==", user.email),
          orderBy("startDate", "desc"),
        );
        const offerSnapshot = await getDocs(offerQuery);
        const offers = offerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOfferedRides(offers);

        // Fetch requested rides for the logged-in user
        const requestQuery = query(
          ridesCollection,
          where("type", "==", "request"),
          where("rider.email", "==", user.email),
          orderBy("startDate", "desc"),
        );
        const requestSnapshot = await getDocs(requestQuery);
        const requests = requestSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequestedRides(requests);
      } catch (error) {
        console.error("Error fetching rides: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [user.email]);

  // Determine if the ride is active
  const isActiveRide = (startDate) => {
    const currentTimestamp = Timestamp.now();
    const oneHourAgo = new Timestamp(
      currentTimestamp.seconds - 3600,
      currentTimestamp.nanoseconds,
    );
    const nHours = 48; // ride time within 48 hours from current time
    const nHoursLater = new Timestamp(
      currentTimestamp.seconds + nHours * 3600,
      currentTimestamp.nanoseconds,
    );

    return startDate > oneHourAgo && startDate <= nHoursLater;
  };

  const actionHandler = async (isActive, rideDetails) => {
    if (isActive) {
      // delete ride
      try {
        setLoading(true);
        const rideDocRef = doc(db, "rides", rideDetails.id);
        await deleteDoc(rideDocRef);
        if (rideDetails.type === "offer") {
          setOfferedRides((prevRides) =>
            prevRides.filter((ride) => ride.id !== rideDetails.id),
          );
        } else if (rideDetails.type === "request") {
          setRequestedRides((prevRides) =>
            prevRides.filter((ride) => ride.id !== rideDetails.id),
          );
        }
        setTimeout(() => {
          toast.success("Ride has been successfully canceled and deleted.");
          setLoading(false);
        }, 500);
      } catch (error) {
        setTimeout(() => {
          setLoading(false);
          toast.warn("Failed to cancel the ride.", error);
        }, 300);
      }
    } else {
      // repeat ride
      rideDetails.isRepeatRide = true;
      setRideMode(rideDetails.type);
      setEditData(rideDetails);
      setShowOfferRideModal(true);
    }
  };

  // Render "Cancel" or "Repeat Ride" button based on ride status
  const RideActionButton = ({ rideDetails }) => {
    const isActive = isActiveRide(rideDetails.startDate);

    return (
      <button
        onClick={() => {
          actionHandler(isActive, rideDetails);
        }}
        className={`btn ${isActive ? "btn-danger" : "btn-primary"} w-100`}
      >
        {isActive ? "Cancel & delete" : "Repeat Ride--" + rideDetails.startDate}
      </button>
    );
  };

  const handleCloseModalForNewRide = () => {
    setShowOfferRideModal(false);
  };

  // Renders rides in a table or card layout
  const RidesTable = ({ rides }) => (
    <>
      <OfferRideForm
        mode={rideMode}
        show={showOfferRideModal}
        editData={editData}
        handleClose={handleCloseModalForNewRide}
      />
      {!showOfferRideModal && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered d-none d-lg-table">
            <thead className="table-dark">
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <React.Fragment key={ride.id}>
                  <tr>
                    <td>{ride.route.start.address}</td>
                    <td>{ride.route.end.address}</td>
                    <td>
                      <DateTime dateTime={ride.startDate} />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4">
                      <RideActionButton rideDetails={ride} />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {/* Card layout for mobile view */}
          <div className="d-lg-none">
            {rides.map((ride) => (
              <div key={ride.id} className="card mb-3">
                <div className="card-body">
                  <p className="card-text">
                    <strong>From:</strong> {ride.route.start.address}
                  </p>
                  <p className="card-text">
                    <strong>To:</strong> {ride.route.end.address}
                  </p>
                  <p className="card-text">
                    <strong>Date:</strong>{" "}
                    <DateTime dateTime={ride.startDate} />
                  </p>
                  <div className="text-center">
                    <RideActionButton rideDetails={ride} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <LoadingOverlay
        show={loading}
        icon={<i className="fa-solid fa-car-side fa-2x"></i>}
        text={"Loading"}
        backgroundColor="rgba(0, 0, 0, 0.6)"
        zIndex="10000000"
        style={{
          color: "white",
          fontSize: "1.0rem",
          fontWeight: "bold",
        }}
      />
      <div show={!loading} className="my-rides container">
        <div className="nav nav-tabs justify-content-center mb-4">
          <button
            className={`nav-link ${activeTab === "offer" ? "active" : ""}`}
            onClick={() => setActiveTab("offer")}
          >
            <i className="fas fa-car-side me-1"></i>Offered
          </button>
          <button
            className={`nav-link ${activeTab === "request" ? "active" : ""}`}
            onClick={() => setActiveTab("request")}
          >
            <i className="fas fa-users me-1"></i>Requested
          </button>
        </div>

        <div className="rides-list">
          {activeTab === "offer" ? (
            offeredRides.length > 0 ? (
              <RidesTable rides={offeredRides} />
            ) : (
              <p className="text-center">No offered rides found.</p>
            )
          ) : requestedRides.length > 0 ? (
            <RidesTable rides={requestedRides} />
          ) : (
            <p className="text-center">No requested rides found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default MyRides;
