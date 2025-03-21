// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Import Firebase Authentication and Google provider
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCliGGvW2Eox7df0VRgSvP3uor8C-g583g",
  authDomain: "kpull-f862b.firebaseapp.com",
  projectId: "kpull-f862b",
  storageBucket: "kpull-f862b.appspot.com",
  messagingSenderId: "379862360702",
  appId: "1:379862360702:web:1f569e2aec2c5f9691ae2f",
  measurementId: "G-E70NGPSQVZ",
  vapId:
    "BHSTVWSu9_rX71zaKzc_zQcH62HO8qwh1IuOqiUdwR0hPn7N-_rYueLXAgGJctMuGBNsF1PP0rB_O83ON1VeY4c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

// Initialize Firebase Authentication and Google Provider
const auth = getAuth(app); // Initialize Firebase Authentication
const googleProvider = new GoogleAuthProvider(); // Set up Google Auth Provider

// Export the necessary Firebase services for use in other parts of your app
export { db, auth, googleProvider, messaging };
