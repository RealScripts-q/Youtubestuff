// main.js — works across all pages on GitHub Pages

(function () {
  const TOTAL_KEY = "site_total_views";
  const VISITED_KEY = "site_has_visited";

  // fallback if something corrupts storage
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

  function updateCounter() {
    let total = safeGet(TOTAL_KEY, 0);

    // Only increment once per user/device
    if (!localStorage.getItem(VISITED_KEY)) {
      total++;
      safeSet(TOTAL_KEY, total);
      localStorage.setItem(VISITED_KEY, "true");
    }

    // Update DOM if present
    const el = document.getElementById("totalViews");
    if (el) el.textContent = total;

    const status = document.getElementById("totalStatus");
    if (status) status.textContent = "online";
  }

  // run on load
  updateCounter();

  // Auto-heal: check every 5s, if broken reset counter
  setInterval(() => {
    const total = safeGet(TOTAL_KEY, 0);
    if (isNaN(total) || total < 0) {
      console.warn("Corrupt counter detected, resetting...");
      safeSet(TOTAL_KEY, 0);
      localStorage.removeItem(VISITED_KEY);
      updateCounter();
    }
  }, 5000);
})();
