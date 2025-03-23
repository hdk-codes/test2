import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Firebase imports for Service Worker (optional, only if notifications are enabled)
import { getMessaging } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/lib/firebase"; // Adjust path if needed

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Remove or comment out the service worker registration for now
// const registerServiceWorker = async () => {
//   try {
//     await navigator.serviceWorker.register('/firebase-messaging-sw.js');
//   } catch (error) {
//     console.error('Service Worker registration failed:', error);
//   }
// };

// registerServiceWorker();

// Render the app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  // <React.StrictMode> // Uncomment for development
  <App />
  // </React.StrictMode>
);