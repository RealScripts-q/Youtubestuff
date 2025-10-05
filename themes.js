/* ==========================
   THEMES & SETTINGS OVERLAY
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  const settingsOverlay = document.getElementById("settings-overlay");
  const themeGrid = document.getElementById("theme-grid");
  const themesBtn = document.getElementById("themes-btn");
  const settingsCloseBtns = document.querySelectorAll(".settings-close");
  const resetBtn = document.getElementById("reset-settings");
  const cartNotifCheckbox = document.getElementById("cart-notifications");

  // Default cart notifications ON
  window.cartNotificationsEnabled = true;

  // Open settings overlay
  document.getElementById("settings-button").addEventListener("click", () => {
    settingsOverlay.style.display = "flex";
  });

  // Close overlay buttons
  settingsCloseBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      settingsOverlay.style.display = "none";
      themeGrid.style.display = "none"; // hide theme grid if open
    });
  });

  // Toggle theme grid
  themesBtn.addEventListener("click", () => {
    themeGrid.style.display = themeGrid.style.display === "grid" ? "none" : "grid";
  });

  // Apply theme
  document.querySelectorAll(".theme-square").forEach(square => {
    square.addEventListener("click", () => {
      const theme = square.dataset.theme;
      document.body.className = `theme-${theme}`;
      themeGrid.style.display = "none";
      localStorage.setItem("selectedTheme", theme);
    });
  });

  // Load saved theme
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme) document.body.className = `theme-${savedTheme}`;

  // Reset settings
  resetBtn?.addEventListener("click", () => location.reload());

  // Cart notifications toggle
  if (cartNotifCheckbox) {
    cartNotifCheckbox.checked = true; // default ON
    cartNotifCheckbox.addEventListener("change", () => {
      window.cartNotificationsEnabled = cartNotifCheckbox.checked;
      console.log("Cart notifications:", window.cartNotificationsEnabled ? "ON" : "OFF");
    });
  }

  // Font size adjustment
  window.adjustFontSize = function(change) {
    let currentSize = parseInt(getComputedStyle(document.documentElement).fontSize);
    let newSize = currentSize + change;
    if (newSize < 12) newSize = 12;
    if (newSize > 24) newSize = 24;
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  // Currency selector (dummy function for shop)
  window.changeCurrency = function(curr) {
    console.log("Currency changed to:", curr);
    // Could implement price conversion here
  };
});
