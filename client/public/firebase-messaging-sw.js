importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyD6IrWzwfKIiWOpgezUNsMinfRtVwNAFBc",
  authDomain: "birthday-f5ae9.firebaseapp.com",
  databaseURL: "https://birthday-f5ae9-default-rtdb.firebaseio.com",
  projectId: "birthday-f5ae9",
  storageBucket: "birthday-f5ae9.firebasestorage.app",
  messagingSenderId: "454492143559",
  appId: "1:454492143559:web:73d90434a3b322428363e2",
  measurementId: "G-NLMFMKSPHF"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/heart-icon.png", // Add a heart icon in public/
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});