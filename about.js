// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue, onDisconnect, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA8opUlOeceIHgVGlp3SAPnq0ojHMOSITA",
  authDomain: "fir-d8aef.firebaseapp.com",
  projectId: "fir-d8aef",
  storageBucket: "fir-d8aef.appspot.com",
  messagingSenderId: "960351275873",
  appId: "1:960351275873:web:cb6af1244a6b5535215320",
  measurementId: "G-GPS17MR0PZ",
  databaseURL: "https://fir-d8aef-default-rtdb.firebaseio.com/"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elements
const totalViewsEl = document.getElementById("totalViews");
const activeUsersEl = document.getElementById("activeUsers");

// Count unique views (store in localStorage so 1 view per person)
async function incrementTotalViews() {
  if (!localStorage.getItem("visited")) {
    const totalRef = ref(db, "siteStats/totalViews");

    const snapshot = await get(totalRef);
    let currentViews = snapshot.exists() ? snapshot.val() : 0;

    await set(totalRef, currentViews + 1);

    localStorage.setItem("visited", "true");
  }
}

// Track active users
function trackActiveUsers() {
  const userRef = ref(db, "activeUsers/" + Math.random().toString(36).slice(2));
  set(userRef, { online: true, timestamp: serverTimestamp() });

  // Remove when they leave
  onDisconnect(userRef).remove();

  // Update active count live
  const activeRef = ref(db, "activeUsers");
  onValue(activeRef, (snapshot) => {
    const users = snapshot.val();
    activeUsersEl.textContent = users ? Object.keys(users).length : 0;
  });
}

// Show total views live
function watchTotalViews() {
  const totalRef = ref(db, "siteStats/totalViews");
  onValue(totalRef, (snapshot) => {
    totalViewsEl.textContent = snapshot.exists() ? snapshot.val() : 0;
  });
}

// Init
incrementTotalViews();
trackActiveUsers();
watchTotalViews();
