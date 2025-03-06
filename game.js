const playerNameDisplay = document.getElementById('playerNameDisplay');
const playerNumberDisplay = document.getElementById('playerNumber');
const timerDisplay = document.getElementById('timer');
const playerStatusDisplay = document.getElementById('playerStatus');

const userMarbles = document.getElementById('userMarbles');
const computerMarbles = document.getElementById('computerMarbles');
const hideBoxMarbles = document.getElementById('hideBoxMarbles');
const hideButton = document.getElementById('hideButton');
const resultText = document.getElementById('resultText');
const userMarbleCount = document.getElementById('userMarbleCount');
const computerMarbleCount = document.getElementById('computerMarbleCount');

// Get player data from localStorage (set in script.js)
const playerName = localStorage.getItem('playerName') || 'Player';
const playerNumber = localStorage.getItem('playerNumber') || '000';
playerNameDisplay.textContent = playerName;
playerNumberDisplay.textContent = playerNumber;

let userMarbleCountValue = 10;
let computerMarbleCountValue = 10;
let timeLeft = 180;
let timerInterval;
let isUserTurn = true;

// Initialize marbles
function initializeMarbles(container, count) {
  for (let i = 0; i < count; i++) {
    const marble = document.createElement('div');
    marble.classList.add('marble');
    container.appendChild(marble);
  }
}

initializeMarbles(userMarbles, userMarbleCountValue);
initializeMarbles(computerMarbles, computerMarbleCountValue);

// Start timer
timerInterval = setInterval(() => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  timeLeft--;

  if (timeLeft < 0 || userMarbleCountValue === 0 || computerMarbleCountValue === 0) {
    clearInterval(timerInterval);
    alert('Game Over!');
    if (userMarbleCountValue === 20) {
      playerStatusDisplay.textContent = "Winner!";
    } else {
      playerStatusDisplay.textContent = "Dead";
    }
  }
}, 1000);

// Hide marbles logic
hideButton.addEventListener('click', () => {
  const selectedMarbleCount = parseInt(prompt("Enter the number of marbles to hide:"));
  if (selectedMarbleCount > 0 && selectedMarbleCount <= userMarbleCountValue) {
    // Hide marbles from user
    for (let i = 0; i < selectedMarbleCount; i++) {
      userMarbles.removeChild(userMarbles.lastChild);
    }
    userMarbleCountValue -= selectedMarbleCount;
    userMarbleCount.textContent = userMarbleCountValue;

    // Add marbles to hide box (visually hidden)
    initializeMarbles(hideBoxMarbles, selectedMarbleCount);
    hideBoxMarbles.style.visibility = 'hidden';

    // Computer's turn to guess
    setTimeout(() => {
      const computerGuess = Math.random() < 0.5 ? 'even' : 'odd';
      const isEven = selectedMarbleCount % 2 === 0;
      const isCorrect = (computerGuess === 'even' && isEven) || (computerGuess === 'odd' && !isEven);

      // Show result and update marble counts
      hideBoxMarbles.style.visibility = 'visible';
      resultText.textContent = `Computer guessed ${computerGuess}. It's ${isCorrect ? 'correct!' : 'wrong!'}`;

      if (isCorrect) {
        computerMarbleCountValue -= selectedMarbleCount;
        userMarbleCountValue += selectedMarbleCount;
      } else {
        computerMarbleCountValue += selectedMarbleCount;
        userMarbleCountValue -= selectedMarbleCount;
      }
      userMarbleCount.textContent = userMarbleCountValue;
      computerMarbleCount.textContent = computerMarbleCountValue;

      // Clear hide box
      hideBoxMarbles.innerHTML = '';

      // Switch turn
      isUserTurn = !isUserTurn;
    }, 1000); // Simulate computer thinking time
  } else {
    alert("Invalid number of marbles.");
  }
});