import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALyLS1XTbgAmgea3ifsZm5RzrtU6B-WPk",
  authDomain: "fiitjee-online.firebaseapp.com",
  databaseURL: "https://fiitjee-online-default-rtdb.firebaseio.com",
  projectId: "fiitjee-online",
  storageBucket: "fiitjee-online.firebasestorage.app",
  messagingSenderId: "880773462295",
  appId: "1:880773462295:web:67f8fd68065edbfd021f52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
