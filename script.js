document.addEventListener('DOMContentLoaded', () => {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop();

    // Index Page Logic
    if (currentPage === 'index.html') {
        const playerNameInput = document.getElementById('playerName');
        const startButton = document.getElementById('startButton');

        startButton.addEventListener('click', () => {
            const playerName = playerNameInput.value.trim();
            
            if (playerName) {
                // Generate a random player number
                const playerNumber = Math.floor(Math.random() * 999).toString().padStart(3, '0');
                
                // Store player information in localStorage
                localStorage.setItem('playerName', playerName);
                localStorage.setItem('playerNumber', playerNumber);
                
                // Navigate to main.html
                window.location.href = 'main.html';
            } else {
                alert('Please enter a player name');
            }
        });
    }

    // Main Page (Rules) Logic
    if (currentPage === 'main.html') {
        const startGameButton = document.getElementById('startGameButton');
        const rulesButton = document.getElementById('rulesButton');
        
        // Retrieve and display player info from localStorage
        const playerName = localStorage.getItem('playerName') || 'Player';
        const playerNumber = localStorage.getItem('playerNumber') || '000';
        
        document.getElementById('playerNameDisplay').textContent = playerName;
        document.getElementById('playerNumber').textContent = playerNumber;

        startGameButton.addEventListener('click', () => {
            window.location.href = 'game.html';
        });

        rulesButton.addEventListener('click', () => {
            // Optional: Could add a modal or scroll to rules section
            alert('Game Rules:\n1. You have 3 minutes to complete the game.\n2. Both players start with 10 marbles.\n3. Take turns hiding and guessing marbles.\n4. Collect 20 marbles to win.');
        });
    }

    // Game Page Logic
    if (currentPage === 'game.html') {
        const gamePage = document.getElementById('hideBox');

        if (gamePage) {
            const playerNameDisplay = document.getElementById('playerNameDisplay');
            const playerNumberDisplay = document.getElementById('playerNumber');
            const timerDisplay = document.getElementById('timer');
            const playerStatusDisplay = document.getElementById('playerStatus');
            const userMarbles = document.getElementById('userMarbles');
            const userMarbleCountDisplay = document.getElementById('userMarbleCount');
            const hideBoxMarbles = document.getElementById('hideBoxMarbles');
            const userHideButton = document.getElementById('userHideButton');
            const resultText = document.getElementById('resultText');
            const userMarbleInput = document.getElementById('userMarbleInput');
            const userEvenButton = document.getElementById('userEvenButton');
            const userOddButton = document.getElementById('userOddButton');
            const userHideInput = document.getElementById('userHideInput');
            const userGuessInput = document.getElementById('userGuessInput');
            const hideBox = document.getElementById('hideBox');

            // Add CSS to slow down the rotate transition - Updated to 3 seconds
            const style = document.createElement('style');
            style.textContent = `
                #hideBox {
                    transition: transform 3s ease-in-out !important;
                }
                #hideBox.open {
                    transform: rotateX(180deg);
                }
            `;
            document.head.appendChild(style);

            // Retrieve player info from localStorage
            const playerName = localStorage.getItem('playerName') || 'Player';
            const playerNumber = localStorage.getItem('playerNumber') || '000';
            playerNameDisplay.textContent = playerName;
            playerNumberDisplay.textContent = playerNumber;

            // Game state variables
            let userMarbleCount = 10;
            let computerMarbleCount = 10;
            let hideBoxTotal = 0;
            const WINNING_MARBLES = 20;
            let timeLeft = 180; // 3 minutes in seconds
            let isUserHiding = Math.random() < 0.5; // Randomly decide who hides first
            let hiddenMarbles = 0;
            const REVEAL_DURATION = 4000; // Longer time to see marbles (4 seconds)

            // Initialize marbles (User visible only)
            function initializeMarbles(container, count) {
                container.innerHTML = '';
                for (let i = 0; i < count; i++) {
                    const marble = document.createElement('div');
                    marble.classList.add('marble');
                    container.appendChild(marble);
                }
            }

            // Start timer
            const timerInterval = setInterval(() => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                timeLeft--;

                checkGameEnd();
            }, 1000);

            // Make the timer stop function available globally
            window.stopTimer = function() {
                clearInterval(timerInterval);
            };

            // Check game end condition
            function checkGameEnd() {
                if (timeLeft < 0 || userMarbleCount >= WINNING_MARBLES || computerMarbleCount >= WINNING_MARBLES) {
                    clearInterval(timerInterval);
                    if (userMarbleCount >= WINNING_MARBLES) {
                        resultText.textContent = 'Game Over! Player Wins!';
                        playerStatusDisplay.textContent = 'Winner!';
                        playerStatusDisplay.classList.replace('text-green-500', 'text-green-500');
                        disableGameplay();
                        // Call endGame with player as winner
                        window.endGame(true);
                    } else if (computerMarbleCount >= WINNING_MARBLES) {
                        resultText.textContent = 'Game Over! CPU Wins!';
                        playerStatusDisplay.textContent = 'Eliminated';
                        playerStatusDisplay.classList.replace('text-green-500', 'text-red-500');
                        disableGameplay();
                        // Call endGame with player as loser
                        window.endGame(false);
                    } else {
                        resultText.textContent = 'Game Over! Time Up!';
                        playerStatusDisplay.textContent = 'Eliminated';
                        playerStatusDisplay.classList.replace('text-green-500', 'text-red-500');
                        disableGameplay();
                        // Call endGame with player as loser due to time
                        window.endGame(false);
                    }
                }
            }

            // Restart game function
            window.restartGame = function() {
                userMarbleCount = 10;
                computerMarbleCount = 10;
                timeLeft = 180;
                isUserHiding = Math.random() < 0.5;
                
                // Reset display
                updateMarbles();
                playerStatusDisplay.textContent = 'Alive';
                playerStatusDisplay.className = 'text-green-500';
                resultText.textContent = '';
                
                // Re-enable gameplay elements
                userHideButton.disabled = false;
                userEvenButton.disabled = false;
                userOddButton.disabled = false;
                userMarbleInput.disabled = false;
                
                // Restart timer
                const timerInterval = setInterval(() => {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    timeLeft--;

                    checkGameEnd();
                }, 1000);
                
                // Setup initial turn
                setupInitialTurn();
            };

            // Disable gameplay elements
            function disableGameplay() {
                userHideButton.disabled = true;
                userEvenButton.disabled = true;
                userOddButton.disabled = true;
                userMarbleInput.disabled = true;
            }

            // Update marble display
            function updateMarbles() {
                initializeMarbles(userMarbles, userMarbleCount);
                userMarbleCountDisplay.textContent = userMarbleCount;
            }

            // Initial setup based on who hides first
            function setupInitialTurn() {
                if (isUserHiding) {
                    userHideInput.classList.remove('hidden');
                    userGuessInput.classList.add('hidden');
                    resultText.textContent = 'Player, hide your marbles.';
                } else {
                    cpuTurn();
                }
            }

            // Player hides marbles
            userHideButton.addEventListener('click', () => {
                const userInput = parseInt(userMarbleInput.value);
                if (userInput >= 1 && userInput <= userMarbleCount) {
                    hideBoxTotal = userInput;
                    resultText.textContent = `Player hide ${userInput} marbles`;
                    userHideInput.classList.add('hidden');
                    
                    // Add delay before CPU guess to let player read message
                    setTimeout(() => {
                        // Call CPU guess function
                        cpuGuess();
                    }, 1500);
                } else {
                    resultText.textContent = `Enter a valid number of marbles (1-${userMarbleCount})!`;
                }
            });

            // Player guesses
            userEvenButton.addEventListener('click', () => {
                userEvenButton.classList.add('hidden');
                userOddButton.classList.add('hidden');
                guess('even', true);
            });
            userOddButton.addEventListener('click', () => {
                userEvenButton.classList.add('hidden');
                userOddButton.classList.add('hidden');
                guess('odd', true);
            });

            // Guess function
            function guess(guessType, isPlayerGuess) {
                const isEven = hideBoxTotal % 2 === 0;
                const guessCorrect = (guessType === 'even' && isEven) || (guessType === 'odd' && !isEven);

                // First display the guess message
                if (isPlayerGuess) {
                    resultText.textContent = `You guessed ${guessType}...`;
                } else {
                    resultText.textContent = `CPU guessed ${guessType}...`;
                }

                // Add a small delay before showing the animation and result
                setTimeout(() => {
                    // Show hidden marbles
                    hideBox.classList.add('active');
                    hideBox.classList.add('open');
                    hideBoxMarbles.innerHTML = '';
                    for (let i = 0; i < hideBoxTotal; i++) {
                        const marble = document.createElement('div');
                        marble.className = 'marble';
                        hideBoxMarbles.appendChild(marble);
                    }

                    // Determine winner and update marble counts after the animation completes
                    // Updated delay to match the longer transition time
                    setTimeout(() => {
                        let resultMessage;
                        if (isPlayerGuess) {
                            if (guessCorrect) {
                                userMarbleCount += hideBoxTotal;
                                computerMarbleCount -= hideBoxTotal;
                                resultMessage = `Correct! You gain ${hideBoxTotal} marbles from CPU.`;
                            } else {
                                computerMarbleCount += hideBoxTotal;
                                userMarbleCount -= hideBoxTotal;
                                resultMessage = `Wrong! CPU gains ${hideBoxTotal} marbles from you.`;
                            }
                        } else {
                            if (guessCorrect) {
                                computerMarbleCount += hideBoxTotal;
                                userMarbleCount -= hideBoxTotal;
                                resultMessage = `CPU Correct! CPU gains ${hideBoxTotal} marbles from you.`;
                            } else {
                                userMarbleCount += hideBoxTotal;
                                computerMarbleCount -= hideBoxTotal;
                                resultMessage = `CPU Wrong! You gain ${hideBoxTotal} marbles from CPU.`;
                            }
                        }

                        // Show the result message
                        resultText.textContent = resultMessage;
                        
                        // Update the marble display
                        updateMarbles();
                        
                        // Check if the game has ended
                        checkGameEnd();
                    }, 3000); // Updated to match the 3s transition duration

                    // Reset turn after a longer delay to give user time to see the marbles
                    resetTurn(REVEAL_DURATION + 1800); // Adjusted to account for longer transition
                }, 800);
            }

            // Reset turn with configurable delay
            function resetTurn(delay = 2000) {
                setTimeout(() => {
                    hideBox.classList.remove('open');
                    hideBox.classList.remove('active');
                    hideBoxMarbles.innerHTML = '';
                    hideBoxTotal = 0;
                    isUserHiding = !isUserHiding;
                    
                    // Add a small delay before starting the next turn
                    setTimeout(() => {
                        setupInitialTurn();
                    }, 500);
                }, delay);
            }

            // CPU turn to hide marbles
            function cpuTurn() {
                hideBoxTotal = Math.floor(Math.random() * computerMarbleCount) + 1;
                resultText.textContent = `CPU is hiding marbles...`;
                
                // Add delay before showing the guess buttons to let player read the message
                setTimeout(() => {
                    resultText.textContent = `CPU hide some marbles. Guess odd or even.`;
                    // Show odd and even buttons
                    userEvenButton.classList.remove('hidden');
                    userOddButton.classList.remove('hidden');
                    userGuessInput.classList.remove('hidden');
                }, 1500);
            }

            // CPU guess
            function cpuGuess() {
                const cpuGuess = Math.random() < 0.5 ? 'even' : 'odd';
                resultText.textContent = `CPU is thinking...`;
                
                // Add delay before revealing CPU's guess
                setTimeout(() => {
                    resultText.textContent = `CPU guesses ${cpuGuess}`;
                    
                    // Add another delay before revealing marbles
                    setTimeout(() => {
                        guess(cpuGuess, false);
                    }, 1200);
                }, 1200);
            }

            // Initialize game
            initializeMarbles(userMarbles, userMarbleCount);
            userMarbleCountDisplay.textContent = userMarbleCount;
            setupInitialTurn();
        }
    }
});