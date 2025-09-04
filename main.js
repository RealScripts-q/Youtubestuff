import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// ----- Firebase Config -----
const firebaseConfig = {
  apiKey: "AIzaSyByjy-54upbb6-BHf4SSbInNN-EtUTOFcg",
  authDomain: "realscriptsstats.firebaseapp.com",
  databaseURL: "https://realscriptsstats-default-rtdb.firebaseio.com",
  projectId: "realscriptsstats",
  storageBucket: "realscriptsstats.firebasestorage.app",
  messagingSenderId: "221204397485",
  appId: "1:221204397485:web:238c5068057dbce166b524",
  measurementId: "G-RL585C0KYK"
};

// ----- Initialize Firebase -----
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ----- Total Views Logic -----
document.addEventListener("DOMContentLoaded", async () => {
  const totalViewsEl = document.getElementById("totalViews");
  if (!totalViewsEl) return; // Stop if element not found

  const viewsRef = ref(db, "stats/totalViews");

  try {
    // Increment view once per browser
    if (!localStorage.getItem("viewCounted")) {
      await runTransaction(viewsRef, (current) => {
        if (current === null) return 1; // Initialize if empty
        return current + 1; // Increment
      });
      localStorage.setItem("viewCounted", "true");
    }

    // Real-time display
    onValue(viewsRef, (snapshot) => {
      const total = snapshot.exists() ? snapshot.val() : 0;
      totalViewsEl.textContent = total;
    });

  } catch (err) {
    console.error("Firebase error:", err);
    totalViewsEl.textContent = "Error";
  }
});
