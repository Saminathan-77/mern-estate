// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-8cf0b.firebaseapp.com",
  projectId: "mern-estate-8cf0b",
  storageBucket: "mern-estate-8cf0b.appspot.com",
  messagingSenderId: "792357214329",
  appId: "1:792357214329:web:6ff402ce46a44e672f5ca8",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
