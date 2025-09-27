// ==========================
// ELEMENT SELECTORS
// ==========================
const themeSquares = document.querySelectorAll('.theme-square');
const settingsButton = document.getElementById('settings-button');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsClose = document.getElementById('settings-close');
const wrap = document.querySelector('.wrap');
const themeGrid = document.querySelector('.theme-grid');

// Dynamically create only the "Themes" button inside the overlay
const themesBtn = document.createElement('button');
themesBtn.id = 'themes-btn';
themesBtn.classList.add('overlay-btn');
themesBtn.textContent = 'Themes';
settingsOverlay.prepend(themesBtn);

// ==========================
// THEME FUNCTIONS
// ==========================
function applyTheme(themeName) {
  document.body.classList.forEach(cls => {
    if (cls.startsWith('theme-')) document.body.classList.remove(cls);
  });
  document.body.classList.add('theme-' + themeName);
  localStorage.setItem('selectedTheme', themeName);
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  applyTheme(savedTheme);
});

// ==========================
// SETTINGS OVERLAY EVENTS
// ==========================

// Open settings overlay
settingsButton.addEventListener('click', () => {
  wrap.style.display = 'none';
  settingsOverlay.style.background = 'transparent';
  settingsOverlay.style.display = 'flex';
  themeGrid.style.display = 'none'; // hide grid initially
});

// Close overlay
settingsClose.addEventListener('click', () => {
  settingsOverlay.style.display = 'none';
  wrap.style.display = 'block';
});

// Show theme grid when Themes button clicked
themesBtn.addEventListener('click', () => {
  themeGrid.style.display = themeGrid.style.display === 'grid' ? 'none' : 'grid';
});

// Click theme square to apply theme
themeSquares.forEach(square => {
  square.addEventListener('click', () => {
    applyTheme(square.dataset.theme);
  });
});
