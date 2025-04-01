// Theme Loader
// Immediately invoke function to check auth status and reset theme if needed
(function() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const authToken = localStorage.getItem('authToken');
  const isLoggedIn = !!(authToken && userData);
  const currentTheme = localStorage.getItem('theme');
  
  // If not logged in, force default theme
  if (!isLoggedIn && currentTheme !== 'default') {
    console.log('User not logged in. Forcing default theme.');
    localStorage.setItem('theme', 'default');
    
    // Remove any existing theme stylesheet immediately
    const existingTheme = document.querySelector("link[data-theme]");
    if (existingTheme) {
      existingTheme.remove();
    }
  }
  
  // If logged in, verify theme is unlocked
  if (isLoggedIn && currentTheme && currentTheme !== 'default') {
    const unlockedThemes = userData.unlockedThemes || ['default'];
    if (!unlockedThemes.includes(currentTheme)) {
      console.log('Theme not unlocked. Forcing default theme.');
      localStorage.setItem('theme', 'default');
      
      // Remove any existing theme stylesheet immediately
      const existingTheme = document.querySelector("link[data-theme]");
      if (existingTheme) {
        existingTheme.remove();
      }
    }
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  function applyTheme(theme) {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const authToken = localStorage.getItem('authToken');
    const isLoggedIn = !!(authToken && userData);
    
    // If not logged in, only allow default theme
    if (!isLoggedIn && theme !== 'default') {
      console.log('User not logged in. Restricting to default theme.');
      theme = 'default';
      localStorage.setItem('theme', 'default');
    }
    
    // If logged in, check if theme is unlocked
    if (isLoggedIn && theme !== 'default') {
      const unlockedThemes = userData.unlockedThemes || ['default'];
      if (!unlockedThemes.includes(theme)) {
        console.log('Theme not unlocked. Restricting to default theme.');
        theme = 'default';
        localStorage.setItem('theme', 'default');
      }
    }
    
    // Remove any existing theme stylesheet
    const existingTheme = document.querySelector("link[data-theme]");
    if (existingTheme) {
      existingTheme.remove();
    }

    // Clear any theme classes from body
    document.body.className = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('theme-'))
      .join(' ');

    // If not default theme, add the new theme stylesheet
    if (theme && theme !== "default") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `assets/css/themes/${theme}.css`;
      link.setAttribute("data-theme", theme);
      document.head.appendChild(link);

      // Add theme class to body
      document.body.classList.add(`theme-${theme}`);
    }
  }

  // Load saved theme
  const savedTheme = localStorage.getItem("theme") || 'default';
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  // Listen for theme changes
  window.addEventListener("storage", e => {
    if (e.key === "theme") {
      applyTheme(e.newValue || 'default');
    }
    
    // Also listen for auth changes to update theme if needed
    if (e.key === 'authToken' || e.key === 'userData') {
      const currentTheme = localStorage.getItem('theme') || 'default';
      applyTheme(currentTheme);
    }
  });
});

// Add a global function to verify and apply theme
window.verifyAndApplyTheme = function() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const authToken = localStorage.getItem('authToken');
  const isLoggedIn = !!(authToken && userData);
  const currentTheme = localStorage.getItem('theme') || 'default';
  
  // If not logged in, force default theme
  if (!isLoggedIn && currentTheme !== 'default') {
    console.log('User not logged in. Forcing default theme.');
    localStorage.setItem('theme', 'default');
    
    // Apply default theme
    const existingTheme = document.querySelector("link[data-theme]");
    if (existingTheme) {
      existingTheme.remove();
    }
    
    // Clear any theme classes from body
    document.body.className = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('theme-'))
      .join(' ');
    
    return 'default';
  }
  
  // If logged in, verify theme is unlocked
  if (isLoggedIn && currentTheme !== 'default') {
    const unlockedThemes = userData.unlockedThemes || ['default'];
    if (!unlockedThemes.includes(currentTheme)) {
      console.log('Theme not unlocked. Forcing default theme.');
      localStorage.setItem('theme', 'default');
      
      // Apply default theme
      const existingTheme = document.querySelector("link[data-theme]");
      if (existingTheme) {
        existingTheme.remove();
      }
      
      // Clear any theme classes from body
      document.body.className = document.body.className
        .split(' ')
        .filter(cls => !cls.startsWith('theme-'))
        .join(' ');
      
      return 'default';
    }
  }
  
  return currentTheme;
};
