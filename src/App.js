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
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import {
  requestNotificationPermission,
  saveFcmTokenToFirestore,
} from "../src/services/fcmService";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Users from "./components/admin/Users.jsx";
import Rides from "./components/admin/Rides";
import ActiveRides from "./components/admin/ActiveRides";
import RideHistory from "./components/admin/RideHistory";
import Analytics from "./components/admin/Analytics";
import Notifications from "./components/admin/Notifications";
import Settings from "./components/admin/Settings";
import Security from "./components/admin/Security";

// Wrapper component to handle the overlay logic
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

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
        await saveFcmTokenToFirestore(token);
      }
    } catch (error) {
      console.error("Error getting or saving FCM token:", error);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        await saveToken();
        setUser(user);
        setIsAuthenticated(true);
        toast.success("Welcome " + user.displayName);
      })
      .catch((error) => {
        setIsAuthenticated(false);
        toast.warn("Can't login!!");
      });
  };

  // Check if we're on the admin routes
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
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
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rides"
            element={
              <ProtectedRoute>
                <Rides />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/active-rides"
            element={
              <ProtectedRoute>
                <ActiveRides />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ride-history"
            element={
              <ProtectedRoute>
                <RideHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/security"
            element={
              <ProtectedRoute>
                <Security />
              </ProtectedRoute>
            }
          />
          {/* Add other admin module routes here */}
        </Routes>
        {!isAuthenticated && !isAdminRoute && (
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
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
