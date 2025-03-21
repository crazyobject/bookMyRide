import React, { useEffect, useState } from "react";
import "./SignUpForm.css";
import { toast } from "react-toastify";

export const SignUpForm = ({ googleHandler, facebookHandler }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    let deferredPrompt;

    // Detect if the user is on a mobile device
    const isUserMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(
      navigator.userAgent,
    );
    setIsMobile(isUserMobile);

    // Detect if the app is opened as a standalone app
    const checkStandaloneMode = () => {
      const isStandaloneMode =
        window.navigator.standalone ||
        window.matchMedia("(display-mode: standalone)").matches;
      setIsStandalone(isStandaloneMode);
    };

    // Run the check once on component mount
    checkStandaloneMode();

    const handleInstallPrompt = (e) => {
      e.preventDefault();  
      deferredPrompt = e;  
    
      const installButton = document.getElementById("install-button");
    
       
      if (installButton) {
        installButton.style.display = "block";  
    
        installButton.addEventListener("click", () => {
          installButton.style.display = "none";  
          deferredPrompt.prompt();  
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
              console.log("User accepted the PWA prompt");
              toast.success("App installed successfully! You can open the app now.");  
            } else {
              console.log("User dismissed the PWA prompt");
              toast.info("App installation canceled.");  
            }
            deferredPrompt = null;  
          });
        });
      } else {
        console.error("Install button not found.");
      }
    };
    

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []); // Empty dependency array to run once on mount

  return (
    <div class="signup-form">
      <div class="form-logo">
        <img
          src="/favicon/android-chrome-512x512.png"
          alt="Book My Ride Logo"
        />
      </div>
      <h3 class="text-center mt-4">Welcome to Book My Ride</h3>

      <p class="slogan">Book a ride with safety and trust</p>

      <button
        onClick={googleHandler}
        className="btn btn-outline-dark btn-google"
      >
        <img src="/google-signin.png" alt="Facebook Logo" width="20" />
        Continue with Google
      </button>

      <button
        onClick={facebookHandler}
        class="d-none btn btn-outline-dark btn-google"
      >
        <img src="/Facebook_f_logo_.svg" alt="Facebook Logo" width="20" />
        Continue with Facebook
      </button>
      {isMobile && !isStandalone && (
        <button class="btn btn-outline-dark btn-google" id="install-button">
          <img src="./android-icon.png" alt="use as android" width="30" />
          Use as Android app
        </button>
      )}
      <button
        id="install-button-old"
        style={{
          display: "none",
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: "1000",
          border: "none",
        }}
      >
        Install App
      </button>
      <p class="disclaimer">
        By continuing, you agree to BookMyRide's <a href="#">Terms of Use</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </p>
    </div>
  );
};
