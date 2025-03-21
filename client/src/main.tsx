import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Firebase imports for Service Worker (optional, only if notifications are enabled)
import { getMessaging } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/lib/firebase"; // Adjust path if needed

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Register Firebase Service Worker for push notifications
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
      const messaging = getMessaging(app);
      // Optional: Uncomment to test FCM token in dev
      // import { getToken } from "firebase/messaging";
      // getToken(messaging, { vapidKey: "your-vapid-key" }).then((token) =>
      //   console.log("FCM Token:", token)
      // );
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

// Render the app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  // <React.StrictMode> // Uncomment for development
  <App />
  // </React.StrictMode>
);