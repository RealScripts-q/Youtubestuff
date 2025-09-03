// Firebase global total views
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, get, set, runTransaction } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA8opUlOeceIHgVGlp3SAPnq0ojHMOSITA",
  authDomain: "fir-d8aef.firebaseapp.com",
  databaseURL: "https://fir-d8aef-default-rtdb.firebaseio.com",
  projectId: "fir-d8aef",
  storageBucket: "fir-d8aef.appspot.com",
  messagingSenderId: "960351275873",
  appId: "1:960351275873:web:cb6af1244a6b5535215320",
  measurementId: "G-GPS17MR0PZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", async () => {
  const totalViewsEl = document.getElementById("totalViews");
  if (!totalViewsEl) return;

  // Track if this user has already been counted in this browser
  let hasVisited = localStorage.getItem("hasVisited");

  const viewsRef = ref(db, "totalViews");

  if (!hasVisited) {
    // Increment totalViews atomically
    await runTransaction(viewsRef, (current) => {
      return (current || 0) + 1;
    });
    localStorage.setItem("hasVisited", "true");
  }

  // Get the current total views
  get(viewsRef).then((snapshot) => {
    totalViewsEl.textContent = snapshot.val() || 0;
  });
});
