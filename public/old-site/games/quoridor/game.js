// Elements for the popup and player names
const namePopup = document.getElementById("name-popup");
const nameForm = document.getElementById("name-form");
const player1Input = document.getElementById("player1-name");
const player2Input = document.getElementById("player2-name");

let player1Name = "Player 1";
let player2Name = "Player 2";
let currentPlayer = 1;  // Track whose turn it is (1 for Player 1, 2 for Player 2)

// Close popup and set player names
nameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Get the player names from the input fields, fall back to default if empty
    player1Name = player1Input.value || "Player 1";
    player2Name = player2Input.value || "Player 2";

    // Set the initial turn indicator to Player 1's turn
    updateTurnIndicator();
    
    // Hide the popup after submitting names
    namePopup.style.display = "none";
});

// Function to update the turn indicator dynamically
function updateTurnIndicator() {
    const turnIndicator = document.getElementById("turn-indicator");

    // Ensure the turn indicator reflects the player names based on whose turn it is
    if (currentPlayer === 1) {
        turnIndicator.innerText = `${player1Name}'s Turn`;  // Player 1's turn
    } else {
        turnIndicator.innerText = `${player2Name}'s Turn`;  // Player 2's turn
    }
}

// Switch turns after each move
function switchTurn() {
    // Toggle currentPlayer between 1 and 2
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateTurnIndicator();  // Update the turn indicator based on whose turn it is
}

// Show the popup on page load
window.onload = () => {
    // Ensure the popup shows up when the page is loaded
    namePopup.style.display = "flex";
};

const boardSize = 9;
let players = [
    { x: 4, y: 8, walls: 10, goal: 0 },
    { x: 4, y: 0, walls: 10, goal: 8 }
];
let currentPlayerIndex = 0;
let placingWall = false;
let walls = []; // Array to store walls
const board = document.getElementById('game-board');
const placeWallButton = document.getElementById('place-wall');
const turnIndicator = document.getElementById('turn-indicator');

// Initialize the board
function createBoard() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    }
}

// Handle clicks for moves or wall placement
function handleCellClick(event) {
    const cell = event.target;
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    if (placingWall) {
        placeWall(x, y);
    } else {
        movePlayer(x, y);
    }
}

// Move the player
function movePlayer(x, y) {
    const player = players[currentPlayerIndex];
    const dx = Math.abs(player.x - x);
    const dy = Math.abs(player.y - y);

    // Validate the move: adjacent cell, not occupied, and not blocked by a wall
    if (
        (dx === 1 && dy === 0 || dx === 0 && dy === 1) &&
        !isWallBlocking(player.x, player.y, x, y) &&
        !isWallAt(x, y)
    ) {
        player.x = x;
        player.y = y;

        // Check for victory
        if (player.y === player.goal) {
            alert(`${currentPlayer === 1 ? player1Name : player2Name} wins!`);
            resetGame();
            return;
        }

        switchPlayer();
    }
}

// Check if a wall blocks movement
function isWallBlocking(x1, y1, x2, y2) {
    return walls.some(wall => {
        if (wall.direction === 'H') {
            // Horizontal wall blocks vertical movement
            return (
                (wall.x === x1 && wall.y === Math.min(y1, y2)) ||
                (wall.x === x2 && wall.y === Math.min(y1, y2))
            );
        } else if (wall.direction === 'V') {
            // Vertical wall blocks horizontal movement
            return (
                (wall.y === y1 && wall.x === Math.min(x1, x2)) ||
                (wall.y === y2 && wall.x === Math.min(x1, x2))
            );
        }
        return false;
    });
}

// Check if there is a wall on a specific cell
function isWallAt(x, y) {
    return walls.some(wall => wall.x === x && wall.y === y);
}

// Place a wall
function placeWall(x, y) {
    const player = players[currentPlayerIndex];

    // Validate wall placement
    if (player.walls > 0 && isWallPlacementValid(x, y)) {
        walls.push({ x, y, direction: placingWall ? 'H' : 'V' });
        player.walls--;

        switchPlayer();
    }
}

// Validate wall placement
function isWallPlacementValid(x, y) {
    return !walls.some(wall => wall.x === x && wall.y === y);
}

// Switch turns
function switchPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % 2;
    placingWall = false;
    placeWallButton.textContent = "Place Wall";
    updateBoard();
    switchTurn();  // Switch turn based on currentPlayer
}

// Update the board
function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('player', 'player2');
        cell.classList.remove('wall');
    });

    players.forEach((player, index) => {
        const playerCell = document.querySelector(`[data-x="${player.x}"][data-y="${player.y}"]`);
        playerCell.classList.add(index === 0 ? 'player' : 'player2');
    });

    walls.forEach(wall => {
        const wallCell = document.querySelector(`[data-x="${wall.x}"][data-y="${wall.y}"]`);
        wallCell.classList.add('wall');
    });
}

// Reset the game
function resetGame() {
    players = [
        { x: 4, y: 8, walls: 10, goal: 0 },
        { x: 4, y: 0, walls: 10, goal: 8 }
    ];
    walls = [];
    currentPlayerIndex = 0;
    updateBoard();
    updateTurnIndicator();  // Ensure the turn indicator is updated after resetting the game
}

// Initialize the game
createBoard();
updateBoard();

// Handle wall placement toggle
placeWallButton.addEventListener('click', () => {
    placingWall = !placingWall;
    placeWallButton.textContent = placingWall ? 'Cancel Wall' : 'Place Wall';
});
