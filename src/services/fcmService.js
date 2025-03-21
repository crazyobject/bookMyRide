// src/services/fcmService.js
import { db, messaging, auth } from "../firebase";
import { getToken } from "firebase/messaging";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
  where,
  query,
} from "firebase/firestore";
import L from "leaflet";

export const sendNotificationOnRideCreation = async (rideData) => {
  try {
    // TODO : create a backend API which will send the notifications.
    const response = await fetch(
      "YOUR_BACKEND_API_URL/send-matching-ride-notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rideData), // Send the new ride data to your backend
      },
    );

    if (!response.ok) {
      throw new Error("Failed to send notification");
    }
    console.log("Notifications triggered successfully!");
    return true;
  } catch (error) {
    console.error("Error triggering notifications:", error);
    return false;
  }
};

export const sendPushNotification = async (newRide) => {
  try {
    const { type, route, rider } = newRide;
    const reverseType = type === "offer" ? "request" : "offer"; // Match opposite type

    // Define coordinates of the new ride
    const pickupCoords = L.latLng(
      route.start.coordinates[0],
      route.start.coordinates[1],
    );
    const dropCoords = L.latLng(
      route.end.coordinates[0],
      route.end.coordinates[1],
    );

    // Get rides that match the reverse type and search logic
    const ridesSnapshot = await getDocs(
      query(
        collection(db, "rides"),
        //where("startDate", ">", newRide.startDate - 3600000), // One hour ago
        //where("startDate", "<=", newRide.startDate + 28800000), // Eight hours later
        where("type", "==", reverseType), // Opposite type
        where("rider.email", "!=", rider.email), // Exclude the same user
      ),
    );

    const ridesList = ridesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Match logic
    const matchedRides = ridesList.filter((ride) => {
      const startMatch =
        L.latLng(ride.route.start.coordinates).distanceTo(pickupCoords) < 5000; // 5km radius
      const endMatch =
        L.latLng(ride.route.end.coordinates).distanceTo(dropCoords) < 5000; // 5km radius
      return startMatch && endMatch;
    });

    // Send notifications to matched users
    for (const match of matchedRides) {
      //const userSnapshot = await db.collection("users").doc(match.userid).get();
      //const fcmToken = userSnapshot.data().fcmToken;
      const fcmToken =
        "fT3cYLTR7Wo4y6oQ3om5Dn:APA91bHvraMZweiYmztJ7a5pVCX7L99PNHSnVKitSVvqF_MjmFgxAbIiWHHqpxiVjYD-GXFMmyQH2ToHsguqlgOeCw0sqJ_i88KcXKdD0W7Go-TtwnVpIZI";
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
};

export const saveFcmTokenToFirestore = async (fcmToken) => {
  try {
    const user = auth.currentUser; // Get the logged-in user
    if (user && fcmToken) {
      // Create a reference to the "users" collection with UID as the document ID
      const userRef = doc(db, "users", user.uid);

      // Prepare the data to save
      const userData = {
        fcmToken, // Save the FCM token
        name: user.displayName || "Anonymous", // Get the user's display name or default to "Anonymous"
        timestamp: serverTimestamp(), // Automatically calculate the current timestamp
        userId: user.uid, // Save the user's UID
      };

      // Save the data to Firestore, merging it with existing data
      await setDoc(userRef, userData, { merge: true });
      console.log("FCM token and user data saved successfully!");
    } else {
      console.error("User not authenticated or no FCM token");
    }
  } catch (error) {
    console.error("Error saving FCM token:", error);
  }
};

// this function is to get the fcm token
export const requestNotificationPermission = async () => {
  try {
    // Request notification permission
    await Notification.requestPermission();

    if (Notification.permission === "granted") {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey:
          "BHSTVWSu9_rX71zaKzc_zQcH62HO8qwh1IuOqiUdwR0hPn7N-_rYueLXAgGJctMuGBNsF1PP0rB_O83ON1VeY4c", // Use your own VAPID key here
      });
      console.log("FCM Token: ", token);
      return token;
    } else {
      console.error("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};
