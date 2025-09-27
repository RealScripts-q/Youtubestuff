const themeSelect = document.getElementById("theme-select");
 
// Apply a given theme
function applyTheme(themeName) {
  // Remove only existing theme-* classes, not other body classes
  document.body.classList.forEach(cls => {
    if (cls.startsWith("theme-")) {
      document.body.classList.remove(cls);
    }
  });
 
  // Always add the chosen theme
  document.body.classList.add(`theme-${themeName}`);
  localStorage.setItem("selectedTheme", themeName);
}
 
// Load saved theme on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("selectedTheme") || "default";
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);
});
 
// Update theme when dropdown changes
themeSelect.addEventListener("change", (e) => {
  applyTheme(e.target.value);
});
 
