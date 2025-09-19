// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  apiKey: "AIzaSyCKxsmCHdN4q8TRxXK81Ah6fnMwfroGcdU",
  authDomain: "journalhabittracker.firebaseapp.com",
  projectId: "journalhabittracker",
  storageBucket: "journalhabittracker.firebasestorage.app",
  messagingSenderId: "130395456088",
  appId: "1:130395456088:web:13b9005e2b7e8efac3402d",
  measurementId: "G-S0D6C1N1NJ"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
  const { getAnalytics, isSupported } = require("firebase/analytics");
  isSupported().then((supported: boolean) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}