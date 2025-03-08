// Game Container Management
function createGameContainer(gameTitle, gameUrl) {
    // Create container elements
    const container = document.createElement('div');
    container.className = 'game-container';

    const header = document.createElement('div');
    header.className = 'game-header';

    const title = document.createElement('h1');
    title.className = 'game-title';
    title.textContent = gameTitle;

    const controls = document.createElement('div');
    controls.className = 'game-controls';

    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'game-control-button';
    fullscreenBtn.textContent = 'Full Screen';
    fullscreenBtn.onclick = () => toggleFullscreen(frameContainer);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'game-control-button close';
    closeBtn.textContent = 'X';
    closeBtn.onclick = () => container.remove();

    const frameContainer = document.createElement('div');
    frameContainer.className = 'game-frame-container';

    const frame = document.createElement('iframe');
    frame.className = 'game-frame';
    frame.src = gameUrl;
    frame.allowFullscreen = true;

    // Assemble the container
    controls.appendChild(fullscreenBtn);
    controls.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(controls);
    frameContainer.appendChild(frame);
    container.appendChild(header);
    container.appendChild(frameContainer);

    // Add to document
    document.body.appendChild(container);
}

// Fullscreen handling
function toggleFullscreen(element) {
    if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Update game buttons to use the container
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.button');
        if (button) {
            e.preventDefault();
            const gameTitle = button.getAttribute('data-game-name');
            const gameUrl = button.getAttribute('data-game-url');
            createGameContainer(gameTitle, gameUrl);
        }
    });
}); 