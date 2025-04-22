// Particles Loader - Handles all particle effects across the site
const particlesLoader = (() => {
  // Track all particle overlays
  const particleOverlays = {};
  const particleTypes = [
    "rain",
    "snow",
    "confetti",
    "bubbles",
    "fireflies",
    "stars",
    "matrix",
    "geometric",
  ];

  // Function to create a particle overlay
  const createParticleOverlay = type => {
    if (!particleOverlays[type]) {
      const overlay = document.createElement("iframe");
      overlay.id = `${type}-overlay`;
      overlay.src = `assets/particles/${type}.html`;
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.border = "none";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "-1";
      document.body.appendChild(overlay);
      particleOverlays[type] = overlay;
    }
  };

  // Function to remove a particle overlay
  const removeParticleOverlay = type => {
    if (particleOverlays[type]) {
      particleOverlays[type].remove();
      delete particleOverlays[type];
    }
  };

  // Initialize all enabled particle effects on page load
  document.addEventListener("DOMContentLoaded", () => {
    for (const type of particleTypes) {
      const isEnabled = localStorage.getItem(`${type}Enabled`) === "true";
      if (isEnabled) {
        createParticleOverlay(type);
      }
    }

    // Listen for storage events to sync particle effects across tabs
    window.addEventListener("storage", e => {
      for (const type of particleTypes) {
        if (e.key === `${type}Enabled`) {
          const isEnabled = e.newValue === "true";
          if (isEnabled) {
            if (!particleOverlays[type]) {
              createParticleOverlay(type);
            }
          } else {
            removeParticleOverlay(type);
          }
        }
      }
    });
  });

  // Public API for particle management
  return {
    load: type => {
      if (!particleTypes.includes(type)) {
        console.error(`Invalid particle type: ${type}`);
        return false;
      }

      if (particleOverlays[type]) {
        console.log(`Particle effect ${type} already active`);
        return false;
      }

      localStorage.setItem(`${type}Enabled`, "true");
      createParticleOverlay(type);
      return true;
    },
    unload: type => {
      if (!particleOverlays[type]) {
        console.log(`Particle effect ${type} not active`);
        return false;
      }

      localStorage.setItem(`${type}Enabled`, "false");
      removeParticleOverlay(type);
      return true;
    },
    isEnabled: type => localStorage.getItem(`${type}Enabled`) === "true",
  };
})();
