// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_jUmHAOoDRelCigBH9jbmD-FA9vDAqPs",
  authDomain: "neoncitygamewebsite.firebaseapp.com",
  projectId: "neoncitygamewebsite",
  storageBucket: "neoncitygamewebsite.firebasestorage.app",
  messagingSenderId: "379757495634",
  appId: "1:379757495634:web:6f801e38d2cefb3776e68b",
  measurementId: "G-8ES014EJZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export instances to be used in other files
export { app, analytics, auth, db };
