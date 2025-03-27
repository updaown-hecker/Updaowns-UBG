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
        } else if (theme === 'cyberpunk') {
            // Add data flow effect
            const dataFlow = document.createElement('div');
            dataFlow.className = 'data-flow';
            document.body.appendChild(dataFlow);
            
            // Add glitch elements
            const glitchContainer = document.createElement('div');
            glitchContainer.className = 'glitch-container';
            
            // Add random glitch elements
            for (let i = 0; i < 5; i++) {
                const glitchElement = document.createElement('div');
                glitchElement.className = 'glitch-element';
                glitchElement.style.position = 'fixed';
                glitchElement.style.width = `${Math.random() * 200 + 50}px`;
                glitchElement.style.height = `${Math.random() * 5 + 1}px`;
                glitchElement.style.background = `rgba(${Math.random() > 0.5 ? '0, 240, 255' : '255, 0, 160'}, 0.7)`;
                glitchElement.style.top = `${Math.random() * 100}%`;
                glitchElement.style.left = `${Math.random() * 100}%`;
                glitchElement.style.opacity = '0';
                glitchElement.style.zIndex = '1';
                glitchElement.style.animation = `glitch ${Math.random() * 2 + 0.5}s linear ${Math.random() * 10}s infinite`;
                glitchContainer.appendChild(glitchElement);
            }
            
            document.body.appendChild(glitchContainer);
        } else if (theme === 'midnight') {
            // Add moon
            const moon = document.createElement('div');
            moon.className = 'moon';
            document.body.appendChild(moon);
            
            // Add aurora
            const aurora = document.createElement('div');
            aurora.className = 'aurora';
            document.body.appendChild(aurora);
            
            // Add stars
            const starsContainer = document.createElement('div');
            starsContainer.className = 'stars-container';
            for (let i = 0; i < 20; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.setProperty('--star-delay', Math.random() * 3);
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                starsContainer.appendChild(star);
            }
            document.body.appendChild(starsContainer);
            
            // Add shooting stars
            const shootingStarsContainer = document.createElement('div');
            shootingStarsContainer.className = 'shooting-stars-container';
            for (let i = 0; i < 3; i++) {
                const shootingStar = document.createElement('div');
                shootingStar.className = 'shooting-star';
                shootingStar.style.setProperty('--star-shoot-delay', Math.random() * 5);
                shootingStar.style.left = `${Math.random() * 50}%`;
                shootingStar.style.top = `${Math.random() * 30}%`;
                shootingStar.style.transform = `rotate(${Math.random() * 45 + 15}deg)`;
                shootingStarsContainer.appendChild(shootingStar);
            }
            document.body.appendChild(shootingStarsContainer);
        } else if (theme === 'pastel') {
            // Add bubbles
            const bubblesContainer = document.createElement('div');
            bubblesContainer.className = 'bubbles-container';
            for (let i = 0; i < 12; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.style.setProperty('--bubble-duration', 5 + Math.random() * 10);
                bubble.style.setProperty('--bubble-delay', Math.random() * 5);
                bubble.style.setProperty('--bubble-x', `${-50 + Math.random() * 100}px`);
                bubble.style.setProperty('--bubble-y', `${50 + Math.random() * 100}px`);
                bubble.style.width = `${10 + Math.random() * 20}px`;
                bubble.style.height = bubble.style.width;
                bubble.style.bottom = `${Math.random() * 100}%`;
                bubble.style.left = `${Math.random() * 100}%`;
                bubblesContainer.appendChild(bubble);
            }
            document.body.appendChild(bubblesContainer);
            
            // Add floating elements
            const floatContainer = document.createElement('div');
            floatContainer.className = 'float-container';
            for (let i = 0; i < 5; i++) {
                const floatElement = document.createElement('div');
                floatElement.className = 'float-element';
                floatElement.style.setProperty('--float-delay', Math.random() * 3);
                floatElement.style.width = `${30 + Math.random() * 20}px`;
                floatElement.style.height = `${30 + Math.random() * 20}px`;
                floatElement.style.borderRadius = '50%';
                floatElement.style.background = `rgba(${155 + Math.random() * 100}, ${155 + Math.random() * 100}, ${200 + Math.random() * 55}, 0.3)`;
                floatElement.style.top = `${Math.random() * 100}%`;
                floatElement.style.left = `${Math.random() * 100}%`;
                floatContainer.appendChild(floatElement);
            }
            document.body.appendChild(floatContainer);
            
            // Add hearts
            const heartsContainer = document.createElement('div');
            heartsContainer.className = 'hearts-container';
            for (let i = 0; i < 8; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.style.setProperty('--heart-duration', 10 + Math.random() * 15);
                heart.style.setProperty('--heart-delay', Math.random() * 5);
                heart.style.top = `${Math.random() * 100}%`;
                heart.style.left = `${Math.random() * 100}%`;
                heart.style.opacity = 0.3 + Math.random() * 0.4;
                heartsContainer.appendChild(heart);
            }
            document.body.appendChild(heartsContainer);
            
            // Add rainbow spinner
            const spinnerContainer = document.createElement('div');
            spinnerContainer.className = 'spinner-container';
            const rainbowSpinner = document.createElement('div');
            rainbowSpinner.className = 'rainbow-spinner';
            rainbowSpinner.style.top = '80%';
            rainbowSpinner.style.left = '80%';
            spinnerContainer.appendChild(rainbowSpinner);
            
            const rainbowSpinner2 = document.createElement('div');
            rainbowSpinner2.className = 'rainbow-spinner';
            rainbowSpinner2.style.top = '20%';
            rainbowSpinner2.style.left = '20%';
            rainbowSpinner2.style.width = '150px';
            rainbowSpinner2.style.height = '150px';
            rainbowSpinner2.style.animationDirection = 'reverse';
            spinnerContainer.appendChild(rainbowSpinner2);
            
            document.body.appendChild(spinnerContainer);
        }
    }

    // Update theme class when theme changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            // Remove existing theme elements
            const elements = document.querySelectorAll('.wave1, .wave2, .bubble-container, .leaves, .fireflies, .animal-container, .sun, .clouds, .data-flow, .moon, .aurora, .stars-container, .bubbles-container, .float-container, .glitch-container, .shooting-stars-container, .hearts-container, .spinner-container');
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
                } else if (e.newValue === 'cyberpunk') {
                    // Add data flow effect
                    const dataFlow = document.createElement('div');
                    dataFlow.className = 'data-flow';
                    document.body.appendChild(dataFlow);
                    
                    // Add glitch elements
                    const glitchContainer = document.createElement('div');
                    glitchContainer.className = 'glitch-container';
                    
                    // Add random glitch elements
                    for (let i = 0; i < 5; i++) {
                        const glitchElement = document.createElement('div');
                        glitchElement.className = 'glitch-element';
                        glitchElement.style.position = 'fixed';
                        glitchElement.style.width = `${Math.random() * 200 + 50}px`;
                        glitchElement.style.height = `${Math.random() * 5 + 1}px`;
                        glitchElement.style.background = `rgba(${Math.random() > 0.5 ? '0, 240, 255' : '255, 0, 160'}, 0.7)`;
                        glitchElement.style.top = `${Math.random() * 100}%`;
                        glitchElement.style.left = `${Math.random() * 100}%`;
                        glitchElement.style.opacity = '0';
                        glitchElement.style.zIndex = '1';
                        glitchElement.style.animation = `glitch ${Math.random() * 2 + 0.5}s linear ${Math.random() * 10}s infinite`;
                        glitchContainer.appendChild(glitchElement);
                    }
                    
                    document.body.appendChild(glitchContainer);
                } else if (e.newValue === 'midnight') {
                    // Add moon
                    const moon = document.createElement('div');
                    moon.className = 'moon';
                    document.body.appendChild(moon);
                    
                    // Add aurora
                    const aurora = document.createElement('div');
                    aurora.className = 'aurora';
                    document.body.appendChild(aurora);
                    
                    // Add stars
                    const starsContainer = document.createElement('div');
                    starsContainer.className = 'stars-container';
                    for (let i = 0; i < 20; i++) {
                        const star = document.createElement('div');
                        star.className = 'star';
                        star.style.setProperty('--star-delay', Math.random() * 3);
                        star.style.left = `${Math.random() * 100}%`;
                        star.style.top = `${Math.random() * 100}%`;
                        starsContainer.appendChild(star);
                    }
                    document.body.appendChild(starsContainer);
                    
                    // Add shooting stars
                    const shootingStarsContainer = document.createElement('div');
                    shootingStarsContainer.className = 'shooting-stars-container';
                    for (let i = 0; i < 3; i++) {
                        const shootingStar = document.createElement('div');
                        shootingStar.className = 'shooting-star';
                        shootingStar.style.setProperty('--star-shoot-delay', Math.random() * 5);
                        shootingStar.style.left = `${Math.random() * 50}%`;
                        shootingStar.style.top = `${Math.random() * 30}%`;
                        shootingStar.style.transform = `rotate(${Math.random() * 45 + 15}deg)`;
                        shootingStarsContainer.appendChild(shootingStar);
                    }
                    document.body.appendChild(shootingStarsContainer);
                } else if (e.newValue === 'pastel') {
                    // Add bubbles
                    const bubblesContainer = document.createElement('div');
                    bubblesContainer.className = 'bubbles-container';
                    for (let i = 0; i < 12; i++) {
                        const bubble = document.createElement('div');
                        bubble.className = 'bubble';
                        bubble.style.setProperty('--bubble-duration', 5 + Math.random() * 10);
                        bubble.style.setProperty('--bubble-delay', Math.random() * 5);
                        bubble.style.setProperty('--bubble-x', `${-50 + Math.random() * 100}px`);
                        bubble.style.setProperty('--bubble-y', `${50 + Math.random() * 100}px`);
                        bubble.style.width = `${10 + Math.random() * 20}px`;
                        bubble.style.height = bubble.style.width;
                        bubble.style.bottom = `${Math.random() * 100}%`;
                        bubble.style.left = `${Math.random() * 100}%`;
                        bubblesContainer.appendChild(bubble);
                    }
                    document.body.appendChild(bubblesContainer);
                    
                    // Add floating elements
                    const floatContainer = document.createElement('div');
                    floatContainer.className = 'float-container';
                    for (let i = 0; i < 5; i++) {
                        const floatElement = document.createElement('div');
                        floatElement.className = 'float-element';
                        floatElement.style.setProperty('--float-delay', Math.random() * 3);
                        floatElement.style.width = `${30 + Math.random() * 20}px`;
                        floatElement.style.height = `${30 + Math.random() * 20}px`;
                        floatElement.style.borderRadius = '50%';
                        floatElement.style.background = `rgba(${155 + Math.random() * 100}, ${155 + Math.random() * 100}, ${200 + Math.random() * 55}, 0.3)`;
                        floatElement.style.top = `${Math.random() * 100}%`;
                        floatElement.style.left = `${Math.random() * 100}%`;
                        floatContainer.appendChild(floatElement);
                    }
                    document.body.appendChild(floatContainer);
                    
                    // Add hearts
                    const heartsContainer = document.createElement('div');
                    heartsContainer.className = 'hearts-container';
                    for (let i = 0; i < 8; i++) {
                        const heart = document.createElement('div');
                        heart.className = 'heart';
                        heart.style.setProperty('--heart-duration', 10 + Math.random() * 15);
                        heart.style.setProperty('--heart-delay', Math.random() * 5);
                        heart.style.top = `${Math.random() * 100}%`;
                        heart.style.left = `${Math.random() * 100}%`;
                        heart.style.opacity = 0.3 + Math.random() * 0.4;
                        heartsContainer.appendChild(heart);
                    }
                    document.body.appendChild(heartsContainer);
                    
                    // Add rainbow spinner
                    const spinnerContainer = document.createElement('div');
                    spinnerContainer.className = 'spinner-container';
                    const rainbowSpinner = document.createElement('div');
                    rainbowSpinner.className = 'rainbow-spinner';
                    rainbowSpinner.style.top = '80%';
                    rainbowSpinner.style.left = '80%';
                    spinnerContainer.appendChild(rainbowSpinner);
                    
                    const rainbowSpinner2 = document.createElement('div');
                    rainbowSpinner2.className = 'rainbow-spinner';
                    rainbowSpinner2.style.top = '20%';
                    rainbowSpinner2.style.left = '20%';
                    rainbowSpinner2.style.width = '150px';
                    rainbowSpinner2.style.height = '150px';
                    rainbowSpinner2.style.animationDirection = 'reverse';
                    spinnerContainer.appendChild(rainbowSpinner2);
                    
                    document.body.appendChild(spinnerContainer);
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
    if (theme === 'ocean' || theme === 'forest' || theme === 'sunset' || theme === 'cyberpunk' || theme === 'midnight' || theme === 'pastel') {
        requestAnimationFrame(animate);
    }
});