import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, increment, onValue, onDisconnect, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8opUlOeceIHgVGlp3SAPnq0ojHMOSITA",
  authDomain: "fir-d8aef.firebaseapp.com",
  databaseURL: "https://fir-d8aef-default-rtdb.firebaseio.com", // make sure this matches your Firebase DB URL
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

// Only count once per browser (localStorage)
if (!localStorage.getItem("viewCounted")) {
  get(totalViewsRef).then(snapshot => {
    if (snapshot.exists()) {
      const current = snapshot.val();
      update(ref(db, "stats"), { totalViews: current + 1 });
    } else {
      set(totalViewsRef, 1);
    }
    localStorage.setItem("viewCounted", "true");
  });
}

// Listen to total views
onValue(totalViewsRef, (snap) => {
  document.getElementById("totalViews").textContent = snap.val() || 0;
});

// --- ACTIVE USERS ---
const sessionId = crypto.randomUUID();
const activeUserRef = ref(db, "activeUsers/" + sessionId);

// Add this user
set(activeUserRef, true);

// Remove when user leaves
onDisconnect(activeUserRef).remove();

// Count active users
const activeUsersRef = ref(db, "activeUsers");
onValue(activeUsersRef, (snap) => {
  const users = snap.val();
  const count = users ? Object.keys(users).length : 0;
  document.getElementById("activeUsers").textContent = count;
});
