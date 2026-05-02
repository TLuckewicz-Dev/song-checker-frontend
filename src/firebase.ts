// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWxqOgLJ_dza-HwPJjILyuz9_KxYZWqJw",
  authDomain: "song-checker-5a454.firebaseapp.com",
  projectId: "song-checker-5a454",
  storageBucket: "song-checker-5a454.firebasestorage.app",
  messagingSenderId: "1051582834723",
  appId: "1:1051582834723:web:23d9ffd815ef17cddfe996",
  measurementId: "G-X6FDB1PMS2",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
