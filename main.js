// Let the Game Begin

// Settings
const roundTime = 30; // Set round time in seconds
const roundCount = 10; // Set rounds per game
const roundCountDown = 3; // Countdown in seconds between each new round start
const colors = ['red', 'green', 'blue']; // Set preset colors for logo and addition to random square colors in game

// Init
let playerScore = 0;
let computerScore = 0;
let savedPlayerScore = 0;
let savedComputerScore = 0;
let currentRound = 0;
let timerInterval;
let gameActive = false;
let squareMoveInterval;
let remainingTime = roundTime;
let pointsAvailable = true;
let isFirstMove = true;

// Selectors
const logo = document.querySelector(".square-logo");
const startGameSection = document.querySelector(".start-game-section");
const countdown = document.querySelector(".countdown");
const square = document.getElementById('square');
const squareClicked = document.querySelector('.clicked-square');
const statisticsSection = document.querySelector('.statistics-section');
const whoWon = document.querySelector('.who-won');
const statisticsWrapper = document.querySelector('.statistics-wrapper');
const scoreboardBorder = document.querySelector('.scoreboard-border');
const playerScoreSpan = document.getElementById('player-score');
const computerScoreSpan = document.getElementById('computer-score');
const timerSpan = document.getElementById('timer');
const playerNameInput = document.getElementById('player-name');
const resumePauseButton = document.getElementById('resume-pause-button');
const restartButton = document.getElementById('restart-button');
const startButton = document.getElementById('start-button');
const closeButton = document.getElementsByClassName("close-button")[0];
const currentRoundSpan = document.getElementById('current-round');

// Generate preset colors
function getRandomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}

// Generate random bright colors
function generateBrightColor() {
    const r = Math.floor(Math.random() * 155 + 100);
    const g = Math.floor(Math.random() * 155 + 100);
    const b = Math.floor(Math.random() * 155 + 100);

    return Math.random() < 0.5 ? getRandomColor(colors) : `rgb(${r}, ${g}, ${b})`;
}

// Generate random logo
function generateLogo() {
    logo.innerHTML = logo.textContent.split("").map(letter => {
        const color = getRandomColor(colors);
        return `<span ${letter.trim() === "" ? `style="display: block;"` : `class="block" style="background-color: ${color};"`}>${letter}</span>`;
    }).join("");
}

// Start game
function startGame() {
    let counter = roundCountDown+1;
    startGameSection.style.display = 'none';
    scoreboardBorder.style.display = 'block';
    scoreboardBorder.classList.add("scoreboard-slide-down");
    const interval = setInterval(() => {
        countdown.style.display = 'grid';
        resumePauseButton.setAttribute("disabled", "");
        countdown.textContent = counter-1;
        if(counter === 1) {
            countdown.textContent = "Start!";
        }
        counter--;
        
        if (counter < 0 ) {
            clearInterval(interval);
            gameActive = true;
            square.style.display = 'inline-block';
            countdown.style.display = 'none';
            resumePauseButton.removeAttribute("disabled");
            resumePauseButton.textContent = 'Pause Game';
            if (currentRound === 0 || currentRound > roundCount) {
                currentRound = 0;
                startRound();
            } else {
                resumeRound();
            }
            moveSquare(); // Show square on first round
            squareMoveInterval = setInterval(moveSquare, 1000);
        }
    }, 1000);
}

// Pause game
function pauseGame() {
    gameActive = false;
    square.style.pointerEvents = 'none';
    resumePauseButton.textContent = 'Continue Game';
    clearInterval(timerInterval);
    clearInterval(squareMoveInterval);
}

// Toggle start/pause game
function toggleGame() {
    if (gameActive) {
        pauseGame();
    } else {
        startGame();
        currentRoundSpan.textContent = currentRound;
        timerSpan.textContent = remainingTime;
        statisticsSection.style.display = 'none';
    }
}

// On resume game
function resumeRound() {
    timerInterval = setInterval(() => {
        remainingTime--;
        timerSpan.textContent = remainingTime;
        square.style.pointerEvents = 'auto';
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            if (pointsAvailable) {
                updateScores('Computer');
                pointsAvailable = false;
            }
            endRound();
        }
    }, 1000);
}

// On round start
function startRound() {
    currentRound++;
    remainingTime = roundTime;
    pointsAvailable = true;
    isFirstMove = true;
    resumeRound();

}

// On round end
function endRound() {
    if (pointsAvailable) {
        updateScores('Computer');
        pointsAvailable = false;
    }
    let roundPlayerScore = playerScore - savedPlayerScore;
    let roundComputerScore = computerScore - savedComputerScore;

    saveStatistics(roundPlayerScore, roundComputerScore);

    if (currentRound < roundCount) {
        resumePauseButton.textContent = 'Continue Game';
    } else {
        resumePauseButton.style.display = 'none';
        restartButton.style.display = 'inline-block';
    }

    savedPlayerScore = playerScore;
    savedComputerScore = computerScore;

    if (currentRound-1 < roundCount) {
        startRound();
    }

    pauseGame();
    square.style.display = 'none';
    displayStatistics();
}

// Saving statistics
function saveStatistics(roundPlayerScore, roundComputerScore) {
    let savedStats = JSON.parse(localStorage.getItem('gameStats')) || [];

    const currentRoundData = {
        roundNumber: currentRound,
        playerName: playerNameInput.value || 'Anonymous',
        playerRoundScore: roundPlayerScore,
        computerRoundScore: roundComputerScore
    };

    savedStats.push(currentRoundData);

    localStorage.setItem('gameStats', JSON.stringify(savedStats));
}

// Displaying statistics
function displayStatistics() {
    let isWinner;
    let scoresTable = "";
    statisticsSection.style.display = 'flex';

    let savedStats = JSON.parse(localStorage.getItem('gameStats')) || [];

    savedStats.forEach(roundData => {
        let roundNumber = roundData.roundNumber;
        let playerName = roundData.playerName;
        let playerRoundScore = roundData.playerRoundScore;
        let computerRoundScore = roundData.computerRoundScore;

        if(roundNumber === currentRound-1) {
            if(playerRoundScore > computerRoundScore) {
                isWinner = playerName;
             } else
            if(playerRoundScore === computerRoundScore) {
                isWinner = "Draw";
            } else {
                isWinner = "Computer";
            }
        }

        scoresTable += `<div>Round ${roundNumber}: ${playerName} Score - ${playerRoundScore}, Computer Score - ${computerRoundScore}</div>`;

    });


    if(currentRound-1 < roundCount) {
        if(isWinner === "Draw") {
            whoWon.innerHTML = "<span class='winner'>Draw! There is no winner in this Round!</span>";
        } else {
            whoWon.innerHTML = `<span class='winner'>${isWinner}</span> won the Round!`;
        }
    } else {
        if(playerScore > computerScore) {
            isWinner = playerNameInput.value || 'Anonymous';
         } else
        if(playerScore === computerScore) {
            isWinner = "Draw";
        } else {
            isWinner = "Computer";
        }
        if(isWinner === "Draw") {
            whoWon.innerHTML = "<span class='winner'>Draw! There is no winner in this Game!</span>";
        } else {
            whoWon.innerHTML = `<span class='winner'>${isWinner}</span> won the Game!`;
        }
    }

    statisticsWrapper.innerHTML = scoresTable;

}

// Internal score counting
function updateScores(winner) {
    if (winner === 'Player') {
        playerScore++;
        playerScoreSpan.textContent = playerScore;
    } else {
        computerScore++;
        computerScoreSpan.textContent = computerScore;
    }
    pointsAvailable = false;
}

// Square moving logics
function moveSquare() {
    const x = Math.random() * (450);
    const y = Math.random() * (450);

    if(square.classList.contains("clicked-square")){
        square.classList.remove("clicked-square");
    }

    square.style.left = `${x}px`;
    square.style.top = `${y}px`;
    square.style.backgroundColor = generateBrightColor();

    if(isFirstMove) {
        isFirstMove = false;
    } else {
        if(pointsAvailable) {
            updateScores('Computer');
        }
    }

    pointsAvailable = true;
}

// Event listeners
square.addEventListener('click', () => {
    if (pointsAvailable && gameActive) {
        updateScores('Player');
        square.classList.add("clicked-square");
        pointsAvailable = false;
    }
});

restartButton.addEventListener('click', () => {
    currentRound = 0;
    playerScore = 0;
    computerScore = 0;
    savedPlayerScore = 0;
    savedComputerScore = 0;
    playerScoreSpan.textContent = "0";
    computerScoreSpan.textContent = "0";
    currentRoundSpan.textContent = "1";
    restartButton.style.display = 'none';
    resumePauseButton.style.display = 'inline-block';
    statisticsSection.style.display = 'none';
    resumePauseButton.setAttribute("disabled", "");
    resumePauseButton.textContent = "Pause Game";
    localStorage.clear();
    startGame();
});

window.addEventListener('DOMContentLoaded', () => {
    generateLogo();
    square.style.display = 'none';
    localStorage.clear();
    timerSpan.textContent = remainingTime;
});

logo.addEventListener('click', generateLogo);
startButton.addEventListener('click', startGame);
resumePauseButton.addEventListener('click', toggleGame);