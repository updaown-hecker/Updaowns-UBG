// Theme Loader
document.addEventListener('DOMContentLoaded', () => {
    function applyTheme(theme) {
        // Remove any existing theme stylesheet
        const existingTheme = document.querySelector('link[data-theme]');
        if (existingTheme) {
            existingTheme.remove();
        }

        // If not default theme, add the new theme stylesheet
        if (theme && theme !== 'default') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `/assets/css/themes/${theme}.css`;
            link.setAttribute('data-theme', theme);
            document.head.appendChild(link);

            // Add theme class to body
            document.body.classList.add(`theme-${theme}`);
        }
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    // Listen for theme changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            applyTheme(e.newValue);
        }
    });
}); 