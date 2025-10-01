// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzwt7jHqsjBDETyNpG9fXDGjufUiCfQAk",
  authDomain: "storage-task-c47af.firebaseapp.com",
  projectId: "storage-task-c47af",
  storageBucket: "storage-task-c47af.firebasestorage.app",
  messagingSenderId: "579904689841",
  appId: "1:579904689841:web:0426a422c426799326f490",
  measurementId: "G-SVF9BMSW5X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
