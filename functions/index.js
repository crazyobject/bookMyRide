/*
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const L = require("leaflet"); // Add Leaflet for coordinate-based matching

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

exports.sendNotificationOnRideCreation = functions.firestore
  .document("rides/{rideId}")
  .onCreate(async (snapshot, context) => {
    const newRide = snapshot.data();

    try {
      const { type, route, rider } = newRide;
      const reverseType = type === "offer" ? "request" : "offer"; // Match opposite type

      // Define coordinates of the new ride
      const pickupCoords = L.latLng(
        route.start.coordinates[0],
        route.start.coordinates[1]
      );
      const dropCoords = L.latLng(
        route.end.coordinates[0],
        route.end.coordinates[1]
      );

      // Get rides that match the reverse type and search logic
      const ridesSnapshot = await db
        .collection("rides")
        .where("startDate", ">", newRide.startDate - 3600000) // One hour ago
        .where("startDate", "<=", newRide.startDate + 28800000) // Eight hours later
        .where("type", "==", reverseType) // Opposite type
        .where("rider.email", "!=", rider.email) // Exclude the same user
        .get();

      const ridesList = ridesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Match logic
      const matchedRides = ridesList.filter((ride) => {
        const startMatch =
          L.latLng(ride.route.start.coordinates).distanceTo(pickupCoords) <
          5000; // 5km radius
        const endMatch =
          L.latLng(ride.route.end.coordinates).distanceTo(dropCoords) < 5000; // 5km radius
        return startMatch && endMatch;
      });

      // Send notifications to matched users
      for (const match of matchedRides) {
        const userSnapshot = await db
          .collection("users")
          .doc(match.userid)
          .get();
        const fcmToken = userSnapshot.data().fcmToken;

        if (fcmToken) {
          const message = {
            token: fcmToken,
            notification: {
              title: "Matching Ride Found!",
              body: `A ${reverseType} ride has been posted from ${route.start.address} to ${route.end.address}.`,
            },
          };

          await messaging.send(message);
          console.log(`Notification sent to user: ${match.userid}`);
        }
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  });
*/
