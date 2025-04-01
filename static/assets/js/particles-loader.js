// Particles Loader - Handles all particle effects across the site
const particlesLoader = (() => {
  // Track all particle overlays
  const particleOverlays = {};
  const particleTypes = ['rain', 'snow', 'confetti', 'bubbles', 'fireflies', 'stars', 'matrix', 'geometric'];
  
  // Initialize all enabled particle effects on page load
  document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const authToken = localStorage.getItem('authToken');
    const isLoggedIn = !!(authToken && userData);
    
    particleTypes.forEach(type => {
      const isEnabled = localStorage.getItem(`${type}Enabled`) === 'true';
      
      // If not logged in, only allow rain particles
      if (!isLoggedIn && type !== 'rain') {
        if (isEnabled) {
          console.log(`User not logged in. Disabling ${type} particles.`);
          localStorage.setItem(`${type}Enabled`, 'false');
        }
        return;
      }
      
      // If logged in, check if particle is unlocked
      if (isLoggedIn && isEnabled) {
        const unlockedParticles = userData.unlockedParticles || ['rain'];
        if (!unlockedParticles.includes(type)) {
          console.log(`Particle ${type} not unlocked. Disabling.`);
          localStorage.setItem(`${type}Enabled`, 'false');
          return;
        }
      }
      
      if (isEnabled) {
        createParticleOverlay(type);
      }
    });
    
    // Listen for storage events to sync particle effects across tabs
    window.addEventListener('storage', (e) => {
      // Check for auth changes
      if (e.key === 'authToken' || e.key === 'userData') {
        // Re-validate all enabled particles
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const authToken = localStorage.getItem('authToken');
        const isLoggedIn = !!(authToken && userData);
        
        particleTypes.forEach(type => {
          const isEnabled = localStorage.getItem(`${type}Enabled`) === 'true';
          
          // If not logged in, only allow rain particles
          if (!isLoggedIn && type !== 'rain') {
            if (isEnabled) {
              console.log(`User not logged in. Disabling ${type} particles.`);
              localStorage.setItem(`${type}Enabled`, 'false');
              removeParticleOverlay(type);
            }
            return;
          }
          
          // If logged in, check if particle is unlocked
          if (isLoggedIn && isEnabled) {
            const unlockedParticles = userData.unlockedParticles || ['rain'];
            if (!unlockedParticles.includes(type)) {
              console.log(`Particle ${type} not unlocked. Disabling.`);
              localStorage.setItem(`${type}Enabled`, 'false');
              removeParticleOverlay(type);
              return;
            }
          }
        });
      }
      
      // Handle direct particle toggle events
      particleTypes.forEach(type => {
        if (e.key === `${type}Enabled`) {
          const isEnabled = e.newValue === 'true';
          
          // Check if user is logged in
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const authToken = localStorage.getItem('authToken');
          const isLoggedIn = !!(authToken && userData);
          
          // If not logged in, only allow rain particles
          if (!isLoggedIn && type !== 'rain' && isEnabled) {
            console.log(`User not logged in. Cannot enable ${type} particles.`);
            localStorage.setItem(`${type}Enabled`, 'false');
            return;
          }
          
          // If logged in, check if particle is unlocked
          if (isLoggedIn && isEnabled) {
            const unlockedParticles = userData.unlockedParticles || ['rain'];
            if (!unlockedParticles.includes(type)) {
              console.log(`Particle ${type} not unlocked. Cannot enable.`);
              localStorage.setItem(`${type}Enabled`, 'false');
              return;
            }
          }
          
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
      delete particleOverlays[type];
    }
  }
  
  // Public API
  return {
    load: function(type) {
      // Check if user is logged in
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const authToken = localStorage.getItem('authToken');
      const isLoggedIn = !!(authToken && userData);
      
      // If not logged in, only allow rain particles
      if (!isLoggedIn && type !== 'rain') {
        console.log(`User not logged in. Cannot enable ${type} particles.`);
        return false;
      }
      
      // If logged in, check if particle is unlocked
      if (isLoggedIn) {
        const unlockedParticles = userData.unlockedParticles || ['rain'];
        if (!unlockedParticles.includes(type)) {
          console.log(`Particle ${type} not unlocked. Cannot enable.`);
          return false;
        }
      }
      
      localStorage.setItem(`${type}Enabled`, 'true');
      createParticleOverlay(type);
      return true;
    },
    unload: function(type) {
      localStorage.setItem(`${type}Enabled`, 'false');
      removeParticleOverlay(type);
      return true;
    },
    isEnabled: function(type) {
      return localStorage.getItem(`${type}Enabled`) === 'true';
    }
  };
})();
