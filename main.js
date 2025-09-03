// Global Total Views Counter (works across different HTML pages)

document.addEventListener("DOMContentLoaded", () => {
  const totalViewsEl = document.getElementById("totalViews");
  if (!totalViewsEl) return; // skip if this page doesn't use it

  // Get current total views from localStorage (fallback 0)
  let totalViews = parseInt(localStorage.getItem("totalViews")) || 0;

  // Check if this visitor has already been counted
  let hasVisited = localStorage.getItem("hasVisited");

  // If not visited before, count +1
  if (!hasVisited) {
    totalViews++;
    localStorage.setItem("totalViews", totalViews);
    localStorage.setItem("hasVisited", "true");
  }

  // Show updated views
  totalViewsEl.textContent = totalViews;
});
