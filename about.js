import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8opUlOeceIHgVGlp3SAPnq0ojHMOSITA",
  authDomain: "fir-d8aef.firebaseapp.com",
  databaseURL: "https://fir-d8aef-default-rtdb.firebaseio.com", // 🔥 make sure this is correct
  projectId: "fir-d8aef",
  storageBucket: "fir-d8aef.appspot.com",
  messagingSenderId: "960351275873",
  appId: "1:960351275873:web:cb6af1244a6b5535215320",
  measurementId: "G-GPS17MR0PZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- TOTAL VIEWS ---
const totalViewsRef = ref(db, "stats/totalViews");

// Only increment once per browser (saved in localStorage)
if (!localStorage.getItem("viewCounted")) {
  get(totalViewsRef).then(snapshot => {
    const current = snapshot.exists() ? snapshot.val() : 0;
    set(totalViewsRef, current + 1);
    localStorage.setItem("viewCounted", "true");
  });
}

// Listen for total views updates
onValue(totalViewsRef, (snap) => {
  document.getElementById("totalViews").textContent = snap.val() || 0;
});

// --- ACTIVE USERS ---
const sessionId = crypto.randomUUID(); // unique ID per tab
const activeUserRef = ref(db, "activeUsers/" + sessionId);

// Mark user as active
set(activeUserRef, true);

// Remove when user closes tab
onDisconnect(activeUserRef).remove();

// Listen for active user count
onValue(ref(db, "activeUsers"), (snap) => {
  const users = snap.val();
  const count = users ? Object.keys(users).length : 0;
  document.getElementById("activeUsers").textContent = count;
});
