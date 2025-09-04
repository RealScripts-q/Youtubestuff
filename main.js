// =======================
// main.js for RealScripts
// =======================

(function () {
  // === Total Views ===
  const TOTAL_KEY = "site_total_views";
  const VISITED_KEY = "site_has_visited";

  function safeGet(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      if (value === null || isNaN(Number(value))) return fallback;
      return Number(value);
    } catch (e) {
      console.warn("Storage error, resetting:", e);
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (e) {
      console.error("Storage write error:", e);
    }
  }

  function updateTotalViews() {
    let total = safeGet(TOTAL_KEY, 0);

    // Increment only once per device/browser
    if (!localStorage.getItem(VISITED_KEY)) {
      total++;
      safeSet(TOTAL_KEY, total);
      localStorage.setItem(VISITED_KEY, "true");
    }

    // Update DOM
    const el = document.getElementById("totalViews");
    if (el) el.textContent = total;

    const status = document.getElementById("totalStatus");
    if (status) status.textContent = "online";
  }

  updateTotalViews();

  // Auto-heal check every 5s
  setInterval(() => {
    const total = safeGet(TOTAL_KEY, 0);
    if (isNaN(total) || total < 0) {
      console.warn("Corrupt counter detected, resetting...");
      safeSet(TOTAL_KEY, 0);
      localStorage.removeItem(VISITED_KEY);
      updateTotalViews();
    }
  }, 5000);

  // === Active Visitors ===
  const ACTIVE_KEY = "site_active_users";
  const ACTIVE_TIMEOUT = 10000; // 10s heartbeat
  const myId = Date.now() + "-" + Math.random();

  function updateActiveUsers() {
    const now = Date.now();
    let active = [];

    try {
      active = JSON.parse(localStorage.getItem(ACTIVE_KEY) || "[]");
    } catch {
      active = [];
    }

    // Keep only recent tabs (alive)
    active = active.filter(entry => now - entry.time < ACTIVE_TIMEOUT);

    // Add/refresh this tab
    active.push({ id: myId, time: now });

    // Save back
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));

    // Update DOM
    const el = document.getElementById("activeUsers");
    if (el) el.textContent = active.length;
  }

  // Run heartbeat every 5s
  setInterval(updateActiveUsers, 5000);
  updateActiveUsers();

  // Remove this tab from active list on close
  window.addEventListener("beforeunload", () => {
    let active = [];
    try {
      active = JSON.parse(localStorage.getItem(ACTIVE_KEY) || "[]");
    } catch {
      active = [];
    }
    active = active.filter(entry => entry.id !== myId);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
  });
})();
