// 1. Change these to the full https URLs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGOseOsAgWpdz33quMRvFE0BMIKe6mutw",
  authDomain: "inncontrol-edf63.firebaseapp.com",
  projectId: "inncontrol-edf63",
  storageBucket: "inncontrol-edf63.firebasestorage.app",
  messagingSenderId: "776138930733",
  appId: "1:776138930733:web:c8c7037529a3b66bdcd6a4"
};

// 2. Initialize and Export
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);