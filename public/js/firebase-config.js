import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzrykQpwCjOGYijtUxdfISCnm_kfR87uE",
  authDomain: "maintenance-25bc2.firebaseapp.com",
  databaseURL: "https://maintenance-25bc2-default-rtdb.firebaseio.com",
  projectId: "maintenance-25bc2",
  storageBucket: "maintenance-25bc2.firebasestorage.app",
  messagingSenderId: "398184499459",
  appId: "1:398184499459:web:26cb39a3970e7564470136",
  measurementId: "G-DP84EWBV1K"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);