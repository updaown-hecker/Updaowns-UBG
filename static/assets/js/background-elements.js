// Performance optimized background elements
document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme');
    if (theme) {
        document.body.classList.add(`theme-${theme}`);
        
        // Add theme-specific elements
        if (theme === 'ocean') {
            // Add waves
            const wave1 = document.createElement('div');
            wave1.className = 'wave1';
            document.body.appendChild(wave1);
            
            const wave2 = document.createElement('div');
            wave2.className = 'wave2';
            document.body.appendChild(wave2);
            
            // Add bubbles
            const bubbleContainer = document.createElement('div');
            bubbleContainer.className = 'bubble-container';
            for (let i = 0; i < 9; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubbleContainer.appendChild(bubble);
            }
            document.body.appendChild(bubbleContainer);
        } else if (theme === 'forest') {
            // Add leaves
            const leaves = document.createElement('div');
            leaves.className = 'leaves';
            document.body.appendChild(leaves);
            
            // Add fireflies
            const fireflies = document.createElement('div');
            fireflies.className = 'fireflies';
            document.body.appendChild(fireflies);
            
            // Add animal silhouettes
            const animalContainer = document.createElement('div');
            animalContainer.className = 'animal-container';
            for (let i = 0; i < 3; i++) {
                const animal = document.createElement('div');
                animal.className = 'animal';
                animalContainer.appendChild(animal);
            }
            document.body.appendChild(animalContainer);
        } else if (theme === 'sunset') {
            // Add sun
            const sun = document.createElement('div');
            sun.className = 'sun';
            document.body.appendChild(sun);
            
            // Add clouds
            const clouds = document.createElement('div');
            clouds.className = 'clouds';
            document.body.appendChild(clouds);
        }
    }

    // Update theme class when theme changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            // Remove existing theme elements
            const elements = document.querySelectorAll('.wave1, .wave2, .bubble-container, .leaves, .fireflies, .animal-container, .sun, .clouds');
            elements.forEach(el => el.remove());

            document.body.className = document.body.className
                .replace(/theme-\w+/, '')
                .trim();
                
            if (e.newValue) {
                document.body.classList.add(`theme-${e.newValue}`);
                
                // Add new theme elements
                if (e.newValue === 'ocean') {
                    // Add waves
                    const wave1 = document.createElement('div');
                    wave1.className = 'wave1';
                    document.body.appendChild(wave1);
                    
                    const wave2 = document.createElement('div');
                    wave2.className = 'wave2';
                    document.body.appendChild(wave2);
                    
                    // Add bubbles
                    const bubbleContainer = document.createElement('div');
                    bubbleContainer.className = 'bubble-container';
                    for (let i = 0; i < 9; i++) {
                        const bubble = document.createElement('div');
                        bubble.className = 'bubble';
                        bubbleContainer.appendChild(bubble);
                    }
                    document.body.appendChild(bubbleContainer);
                } else if (e.newValue === 'forest') {
                    // Add leaves
                    const leaves = document.createElement('div');
                    leaves.className = 'leaves';
                    document.body.appendChild(leaves);
                    
                    // Add fireflies
                    const fireflies = document.createElement('div');
                    fireflies.className = 'fireflies';
                    document.body.appendChild(fireflies);
                    
                    // Add animal silhouettes
                    const animalContainer = document.createElement('div');
                    animalContainer.className = 'animal-container';
                    for (let i = 0; i < 3; i++) {
                        const animal = document.createElement('div');
                        animal.className = 'animal';
                        animalContainer.appendChild(animal);
                    }
                    document.body.appendChild(animalContainer);
                } else if (e.newValue === 'sunset') {
                    // Add sun
                    const sun = document.createElement('div');
                    sun.className = 'sun';
                    document.body.appendChild(sun);
                    
                    // Add clouds
                    const clouds = document.createElement('div');
                    clouds.className = 'clouds';
                    document.body.appendChild(clouds);
                }
            }
        }
    });

    // Use requestAnimationFrame for smooth animations
    let lastTime = 0;
    const animate = (currentTime) => {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Only update if visible
        if (document.hidden) return;

        requestAnimationFrame(animate);
    };

    // Start animation loop if theme has animations
    if (theme === 'ocean' || theme === 'forest' || theme === 'sunset') {
        requestAnimationFrame(animate);
    }
}); 