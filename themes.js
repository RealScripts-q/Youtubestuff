
const themeSquares = document.querySelectorAll('.theme-square');
const settingsButton = document.getElementById('settings-button');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsClose = document.getElementById('settings-close');
const themesBtn = document.getElementById('themes-btn');
const themesBack = document.getElementById('themes-back');
const themeGrid = document.getElementById('theme-grid');
const wrap = document.querySelector('.wrap');

// Theme switcher
function applyTheme(themeName) {
  document.body.classList.forEach(cls => {
    if (cls.startsWith('theme-')) document.body.classList.remove(cls);
  });
  document.body.classList.add('theme-' + themeName);
  localStorage.setItem('selectedTheme', themeName);
}

// Load saved theme
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  applyTheme(savedTheme);
});

// Open settings
settingsButton.addEventListener('click', () => {
  wrap.style.display = 'none';
  settingsOverlay.style.display = 'flex';
  themesBtn.style.display = 'block';
  themeGrid.style.display = 'none';
  themesBack.style.display = 'none';
});

// Close settings
settingsClose.addEventListener('click', () => {
  settingsOverlay.style.display = 'none';
  wrap.style.display = 'block';
});

// Show theme grid
themesBtn.addEventListener('click', () => {
  themesBtn.style.display = 'none';
  themeGrid.style.display = 'grid';
  themesBack.style.display = 'block';
});

// Back from theme grid
themesBack.addEventListener('click', () => {
  themesBtn.style.display = 'block';
  themeGrid.style.display = 'none';
  themesBack.style.display = 'none';
});

// Apply theme on click
themeSquares.forEach(square => {
  square.addEventListener('click', () => {
    applyTheme(square.dataset.theme);
  });
});

