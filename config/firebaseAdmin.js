const admin = require("firebase-admin");
require("dotenv").config();

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0SUmiyXAJLZjMQDE9vxKJMeYlr6ozHY8",
  authDomain: "sla-app-32641.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "sla-app-32641",
  storageBucket: "sla-app-32641.firebasestorage.app",
  messagingSenderId: "66519134547",
  appId: "1:66519134547:web:5cdf8e1bef210e43d371a6",
  measurementId: "G-WMCHBX3WZG",
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

module.exports = admin;

