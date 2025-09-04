import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// --- Your Firebase config ---
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

// DOM loaded
document.addEventListener("DOMContentLoaded", async () => {
  const totalViewsEl = document.getElementById("totalViews");
  if (!totalViewsEl) return;

  const viewsRef = ref(db, "stats/totalViews");

  // Increment view if not counted in this browser
  if (!localStorage.getItem("viewCounted")) {
    await runTransaction(viewsRef, (current) => {
      return (current || 0) + 1;
    });
    localStorage.setItem("viewCounted", "true");
  }

  // Listen for total views changes
  onValue(viewsRef, (snapshot) => {
    totalViewsEl.textContent = snapshot.exists() ? snapshot.val() : 0;
  });
});
