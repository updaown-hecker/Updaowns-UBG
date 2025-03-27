// Particles Loader - Handles all particle effects across the site
const particlesLoader = (() => {
  // Track all particle overlays
  const particleOverlays = {};
  const particleTypes = ['rain', 'snow', 'confetti', 'bubbles', 'fireflies'];
  
  // Initialize all enabled particle effects on page load
  document.addEventListener("DOMContentLoaded", () => {
    particleTypes.forEach(type => {
      const isEnabled = localStorage.getItem(`${type}Enabled`) === 'true';
      if (isEnabled) {
        createParticleOverlay(type);
      }
    });
    
    // Listen for storage events to sync particle effects across tabs
    window.addEventListener('storage', (e) => {
      particleTypes.forEach(type => {
        if (e.key === `${type}Enabled`) {
          const isEnabled = e.newValue === 'true';
          if (isEnabled) {
            createParticleOverlay(type);
          } else {
            removeParticleOverlay(type);
          }
        }
      });
    });
  });
  
  // Function to create a particle overlay
  function createParticleOverlay(type) {
    if (!particleOverlays[type]) {
      const overlay = document.createElement('iframe');
      overlay.id = `${type}-overlay`;
      overlay.src = `assets/particles/${type}.html`;
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.border = 'none';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '-1';
      document.body.appendChild(overlay);
      particleOverlays[type] = overlay;
    }
  }
  
  // Function to remove a particle overlay
  function removeParticleOverlay(type) {
    if (particleOverlays[type]) {
      particleOverlays[type].remove();
      particleOverlays[type] = null;
    }
  }
  
  // Public API
  return {
    load: function(type) {
      if (particleTypes.includes(type)) {
        createParticleOverlay(type);
      }
    },
    unload: function(type) {
      if (particleTypes.includes(type)) {
        removeParticleOverlay(type);
      }
    },
    isEnabled: function(type) {
      return particleOverlays[type] != null;
    }
  };
})();
