// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, serverTimestamp, onDisconnect } from "firebase/database";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA8opUlOeceIHgVGlp3SAPnq0ojHMOSITA",
  authDomain: "fir-d8aef.firebaseapp.com",
  databaseURL: "https://fir-d8aef-default-rtdb.firebaseio.com", // <-- IMPORTANT
  projectId: "fir-d8aef",
  storageBucket: "fir-d8aef.appspot.com",
  messagingSenderId: "960351275873",
  appId: "1:960351275873:web:cb6af1244a6b5535215320",
  measurementId: "G-GPS17MR0PZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Total views (only once per visitor)
const viewsRef = ref(db, "siteStats/views");
if (!localStorage.getItem("hasVisited")) {
  get(viewsRef).then(snapshot => {
    let views = snapshot.exists() ? snapshot.val() : 0;
    set(viewsRef, views + 1);
    localStorage.setItem("hasVisited", "true");
  });
}

// ✅ Active users (real-time presence system)
const activeRef = ref(db, "siteStats/active/" + Date.now());
set(activeRef, { online: true, timestamp: serverTimestamp() });

// Remove user when they leave
onDisconnect(activeRef).remove();

// Count active users in real time
const activeUsersRef = ref(db, "siteStats/active");
onValue(activeUsersRef, snapshot => {
  const activeUsers = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  document.getElementById("activeUsers").textContent = activeUsers;
});

// Show total views
onValue(viewsRef, snapshot => {
  document.getElementById("totalViews").textContent = snapshot.val();
});
