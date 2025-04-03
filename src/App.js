import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import MapComponent from "./components/MapComponent";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SignUpForm } from "./components/SignUpForm";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Router components
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth"; // Firebase imports
import {
  requestNotificationPermission,
  saveFcmTokenToFirestore,
} from "../src/services/fcmService";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    // let deferredPrompt;
    // Monitor the auth state to update UI if user is logged in or not
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set the logged-in user
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [auth]);

  const handleFacebookSignIn = async () => {
    const auth = getAuth();
    const provider = new FacebookAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in with Facebook successfully!");
    } catch (error) {
      toast.error(`Facebook login failed: ${error.message}`);
    }
  };

  const saveToken = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        console.log("FCM Token: ", token);
        // Save token to Firestore
        await saveFcmTokenToFirestore(token);
      }
    } catch (error) {
      console.error("Error getting or saving FCM token:", error);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        await saveToken();
        setUser(user); // Set the logged-in user
        setIsAuthenticated(true);
        toast.success("Welcome " + user.displayName);
      })
      .catch((error) => {
        // const errorCode = error.code;
        // const errorMessage = error.message;
        setIsAuthenticated(false);
        toast.warn("Can't login!!");
      });
  };

  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="container-fluid p-0">
          <Routes>
            <Route path="/" element={<MapComponent user={user} />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/adminDashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          {!isAuthenticated && (
            <div className="overlay">
              <div className="overlay-content">
                <SignUpForm
                  googleHandler={handleGoogleSignIn}
                  facebookHandler={handleFacebookSignIn}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
