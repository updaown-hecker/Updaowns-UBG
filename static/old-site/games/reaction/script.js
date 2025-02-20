// Retrieve personal best from localStorage, or set it to null if not found
let personalBest = localStorage.getItem("personalBest") ? parseFloat(localStorage.getItem("personalBest")) : null;
const personalBestDisplay = document.getElementById("personalBest");

if (personalBest) {
  personalBestDisplay.textContent = `Personal Best: ${personalBest.toFixed(5)} seconds`;
} else {
  personalBestDisplay.textContent = "Personal Best: --";
}

// Dragging functionality for leaderboard
let isDragging = false;
let offsetX, offsetY;
const leaderboard = document.getElementById("leaderboard");

leaderboard.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - leaderboard.offsetLeft;
  offsetY = e.clientY - leaderboard.offsetTop;
  leaderboard.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    leaderboard.style.left = `${e.clientX - offsetX}px`;
    leaderboard.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  leaderboard.style.cursor = "grab";
});

// Reaction time game logic
let gameActive = false;
let reactionBox = document.getElementById("reactionBox");
let timerInterval, reactionTimeout, startTime;

function startGame() {
  reactionBox.style.backgroundColor = "red";
  reactionBox.textContent = "Wait for Green...";
  gameActive = true;

  clearInterval(timerInterval);

  reactionTimeout = setTimeout(() => {
    reactionBox.style.backgroundColor = "green";
    reactionBox.textContent = "Click or Press Space!";
    startTime = performance.now();

    timerInterval = setInterval(() => {
      const reactionTime = ((performance.now() - startTime) / 1000).toFixed(5);
      reactionBox.textContent = `Time: ${reactionTime} seconds`;
    }, 10);
  }, Math.random() * 3000 + 1000);
}

function ageCategory(reactionTime) {
  // Categorize reaction time into more detailed "ages"
  if (reactionTime <= 0.0001) return "stop cheating";
  if (reactionTime <= 0.09) return "1 Years";
  if (reactionTime <= 0.10) return "Under 10 years";
  else if (reactionTime <= 0.12) return "10-12 years";
  else if (reactionTime <= 0.14) return "13-14 years";
  else if (reactionTime <= 0.16) return "15-16 years";
  else if (reactionTime <= 0.18) return "17-18 years";
  else if (reactionTime <= 0.20) return "19-20 years";
  else if (reactionTime <= 0.22) return "21-22 years";
  else if (reactionTime <= 0.24) return "23-24 years";
  else if (reactionTime <= 0.26) return "25-26 years";
  else if (reactionTime <= 0.28) return "27-28 years";
  else if (reactionTime <= 0.30) return "29-30 years";
  else if (reactionTime <= 0.32) return "31-32 years";
  else if (reactionTime <= 0.34) return "33-34 years";
  else if (reactionTime <= 0.36) return "35-36 years";
  else if (reactionTime <= 0.38) return "37-38 years";
  else if (reactionTime <= 0.40) return "39-40 years";
  else if (reactionTime <= 0.42) return "41-42 years";
  else if (reactionTime <= 0.44) return "43-44 years";
  else if (reactionTime <= 0.46) return "45-46 years";
  else if (reactionTime <= 0.48) return "47-48 years";
  else if (reactionTime <= 0.50) return "49-50 years";
  else if (reactionTime <= 0.55) return "51-55 years";
  else if (reactionTime <= 0.60) return "56-60 years";
  else if (reactionTime <= 0.65) return "61-65 years";
  else if (reactionTime <= 0.70) return "66-70 years";
  else if (reactionTime <= 0.75) return "71-75 years";
  else if (reactionTime <= 0.80) return "76-80 years";
  else if (reactionTime <= 0.85) return "81-85 years";
  else if (reactionTime <= 0.90) return "86-90 years";
  else return "Over 90 years";
}


function handleReaction() {
  if (!gameActive) return;

  if (reactionBox.style.backgroundColor === "red") {
    clearTimeout(reactionTimeout);
    clearInterval(timerInterval);
    reactionBox.textContent = "Too Soon! Press Space or Click to try again.";
    gameActive = false;
  } else if (reactionBox.style.backgroundColor === "green") {
    clearInterval(timerInterval);
    const reactionTime = ((performance.now() - startTime) / 1000).toFixed(5);
    const ageCategoryResult = ageCategory(parseFloat(reactionTime));  // Get the age category

    // Check and update the personal best
    if (!personalBest || parseFloat(reactionTime) < personalBest) {
      personalBest = parseFloat(reactionTime);
      localStorage.setItem("personalBest", personalBest);
      personalBestDisplay.textContent = `Personal Best: ${personalBest.toFixed(5)} seconds`;
    }

    // Show the reaction time and age category
    reactionBox.textContent = `Reaction time: ${reactionTime} seconds (${ageCategoryResult})\nPress Space or Click to try again.`;
    gameActive = false;
  }
}

function handleStart() {
  if (!gameActive) {
    startGame();
  } else {
    handleReaction();
  }
}

// Event listeners for game controls
reactionBox.addEventListener("click", handleStart);
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") handleStart();
});

// Show More button functionality for leaderboard
const showMoreBtn = document.getElementById("showMoreBtn");
const leaderboardList = document.getElementById("leaderboardList");
let isExpanded = false;

showMoreBtn.addEventListener("click", () => {
  const items = leaderboardList.getElementsByTagName("li");
  for (let i = 5; i < items.length; i++) {
    items[i].style.display = isExpanded ? "none" : "list-item";
  }
  showMoreBtn.textContent = isExpanded ? "Show More" : "Show Less";
  isExpanded = !isExpanded;
});

// Ensure additional leaderboard entries are hidden initially (after top 5)
const items = leaderboardList.getElementsByTagName("li");
for (let i = 5; i < items.length; i++) {
  items[i].style.display = "none"; // Hide all items after the first 5 initially
}

// Initial rendering of the leaderboard
renderLeaderboard();
