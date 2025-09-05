// RealScripts statsj

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  onDisconnect,
  runTransaction,
  remove
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

(async () => {
  // ======== CONFIG ========
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

  const NAMESPACE = "realscripts-q-youtubestuff";

  // DOM targets
  const totalEl = document.getElementById("totalViews");
  const activeEl = document.getElementById("activeUsers");
  const statusEl = document.getElementById("totalStatus");
  const statsPanel = document.getElementById("statsPanel");
  const toggleBtn = document.getElementById("toggleStats");

  // Toggle button
  if (toggleBtn && statsPanel) {
    toggleBtn.addEventListener("click", () => {
      statsPanel.style.display =
        statsPanel.style.display === "none" ? "block" : "none";
      toggleBtn.textContent = statsPanel.style.display === "none" ? "+" : "–";
    });
  }

  function setStatus(text, cls = "") {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = cls;
  }

  function showTotal(n) {
    if (totalEl) totalEl.textContent = n == null ? "—" : Number(n).toLocaleString();
  }

  function showActive(n) {
    if (activeEl) activeEl.textContent = n == null ? "0" : Number(n);
  }

  function genSessionId() {
    return "rs-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  // === Firebase init ===
  let db;
  try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  } catch (err) {
    console.error("Firebase init error:", err);
    setStatus("error");
    showTotal(null);
    showActive(0);
    return;
  }

  // === Unique Visitors ===
  let sessionId = localStorage.getItem("rs_session_id");
  if (!sessionId) {
    sessionId = genSessionId();
    localStorage.setItem("rs_session_id", sessionId);
  }

  const uniqueVisitorRef = ref(db, `uniqueVisitors/${NAMESPACE}/${sessionId}`);
  const counterRef = ref(db, `counters/${NAMESPACE}/uniqueVisitors`);

  try {
    const existing = await get(uniqueVisitorRef);
    if (!existing.exists()) {
      await runTransaction(counterRef, (current = 0) => (current || 0) + 1);
      await set(uniqueVisitorRef, { created: Date.now() });
    }
  } catch (err) {
    console.warn("Unique visitor registration failed:", err);
  }

  onValue(counterRef, (snap) => {
    const v = snap.exists() ? Number(snap.val() || 0) : 0;
    showTotal(v);
    setStatus("online");
  });

  // === Active Visitors ===
  const presencePath = `presence/${NAMESPACE}`;
  const myPresenceRef = ref(db, `${presencePath}/${sessionId}`);
  const presenceParentRef = ref(db, presencePath);

  const HEARTBEAT_MS = 5000;
  const ACTIVE_TTL = 15000;

  async function heartbeat() {
    await set(myPresenceRef, { lastSeen: Date.now() });
    try {
      onDisconnect(myPresenceRef).remove();
    } catch {}
  }

  heartbeat();
  const hbInterval = setInterval(heartbeat, HEARTBEAT_MS);

  function computeActiveCount(snapshot) {
    const now = Date.now();
    let count = 0;
    snapshot.forEach((child) => {
      const val = child.val();
      if (val && val.lastSeen && now - val.lastSeen < ACTIVE_TTL) count++;
    });
    return count;
  }

  onValue(presenceParentRef, (snap) => {
    showActive(computeActiveCount(snap));
  });

  window.addEventListener("beforeunload", () => {
    try {
      remove(myPresenceRef);
    } catch {}
  });

  // Debug helpers
  window.ViewCounter = {
    sessionId,
    resetLocal: () => {
      localStorage.removeItem("rs_session_id");
      console.log("Local session reset.");
    },
    stop: () => {
      clearInterval(hbInterval);
      remove(myPresenceRef).catch(() => {});
      console.log("Stopped heartbeat.");
    }
  };
})();
