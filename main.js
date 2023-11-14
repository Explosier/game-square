// Let the Game Begin

let playerScore = 0;
let computerScore = 0;
let savedPlayerScore = 0;
let savedComputerScore = 0;
let currentRound = 0;
let timerInterval;
let gameActive = false;
let squareMoveInterval;
let remainingTime = 30;
let pointsAvailable = true;

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
const restartButton = document.getElementById('restart-button');
const playerNameInput = document.getElementById('player-name');
const resumePauseButton = document.getElementById('resume-pause-button');
const startButton = document.getElementById('start-button');
const closeButton = document.getElementsByClassName("close-button")[0];
const currentRoundSpan = document.getElementById('current-round');

function getRandomColor() {
    const colors = ['red', 'green', 'blue'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Square Game Logo
function generateLogo() {
    logo.innerHTML = logo.textContent.split("").map(letter => {
        const color = getRandomColor();
        return `<span ${letter.trim() === "" ? `style="display: block;"` : `class="block" style="background-color: ${color};"`}>${letter}</span>`;
    }).join("");
    console.log("test");
}

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

function startGame() {
    let counter = 4;
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
            if (currentRound === 0 || currentRound > 10) {
                currentRound = 0;
                startRound();
            } else {
                resumeRound();
            }
            squareMoveInterval = setInterval(moveSquare, 1000);
        }
    }, 1000);
}

function pauseGame() {
    gameActive = false;
    square.style.pointerEvents = 'none';
    resumePauseButton.textContent = 'Continue Game';
    clearInterval(timerInterval);
    clearInterval(squareMoveInterval);
}

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
           /* if (pointsAvailable) {
                updateScores('Computer');
            }
            setTimeout(startRound, 1000);*/
        }
    }, 1000);
}

function endRound() {
    if (pointsAvailable) {
        updateScores('Computer');
        pointsAvailable = false;
    }
    let roundPlayerScore = playerScore - (savedPlayerScore || 0);
    let roundComputerScore = computerScore - (savedComputerScore || 0);

    saveStatistics(roundPlayerScore, roundComputerScore);

    savedPlayerScore = playerScore;
    savedComputerScore = computerScore;

    startRound();
    pauseGame();
    square.style.display = 'none';
    displayStatistics();
}

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

        //console.log(`Round ${roundNumber}: ${playerName} Score - ${playerRoundScore}, Computer Score - ${computerRoundScore}`);

    });


    if(currentRound <= 10) {
        if(isWinner === "Draw") {
            whoWon.innerHTML = "<span class='winner'>Draw! There is no winner in this Round!</span>";
        } else {
            whoWon.innerHTML = `<span class='winner'>${isWinner}</span> won the Round!`;
        }
    } else {
        if(playerScore > computerScore) {
            isWinner = playerName;
         } else
        if(playerRoundScore === computerRoundScore) {
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
   /* if(isRoundWinner === "Draw") {
        if(currentRound <= 10) {
            whoWon.innerHTML = "<span class='winner'>Draw! There is no winner in this Round!</span>";
        } else {
            whoWon.innerHTML = "<span class='winner'>Draw! There is no winner in this Game!</span>";
        }
    } else {
        if(currentRound <= 10) {
            whoWon.innerHTML = `<span class='winner${(isRoundWinner==="Computer")?"-pc"}'>${isWinner}</span> won the Round!`;
        } else {
            whoWon.innerHTML = `<span class='winner${(isRoundWinner==="Computer")?"-pc"}'>${isWinner}</span> won the Game!`;
        }
    }*/

    statisticsWrapper.innerHTML = scoresTable;

}

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

function generateBrightColor() {
    const r = Math.floor(Math.random() * 155 + 100);
    const g = Math.floor(Math.random() * 155 + 100);
    const b = Math.floor(Math.random() * 155 + 100);

    return Math.random() < 0.5 ? getRandomColor() : `rgb(${r}, ${g}, ${b})`;
}

function moveSquare() {
    const x = Math.random() * (450);
    const y = Math.random() * (450);

    if(square.classList.contains("clicked-square")){
        square.classList.remove("clicked-square");
    }

    square.style.left = `${x}px`;
    square.style.top = `${y}px`;
    square.style.backgroundColor = generateBrightColor();

    if (pointsAvailable) {
        updateScores('Computer');
    }

    pointsAvailable = true;
}

function startRound() {
    currentRound++;
    //currentRoundSpan.textContent = currentRound;
    remainingTime = 30;
    pointsAvailable = true;

    if (currentRound > 10) {
        endGame();
        return;
    }

    resumeRound();

}

function endGame() {
    const winner = playerScore > computerScore ? 'Player' : 'Computer';
    showModal(`Game Over! Winner: ${winner}`);
    saveStatistics();
    restartButton.style.display = 'block';
}

square.addEventListener('click', () => {
    if (pointsAvailable && gameActive) {
        updateScores('Player');
        square.classList.add("clicked-square");
        pointsAvailable = false;
    }
});

restartButton.addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    playerScoreSpan.textContent = 0;
    computerScoreSpan.textContent = 0;
    restartButton.style.display = 'none';
   
});

window.addEventListener('DOMContentLoaded', () => {
    generateLogo();
    square.style.display = 'none';
    localStorage.clear();
});

logo.addEventListener('click', generateLogo);
startButton.addEventListener('click', startGame);
resumePauseButton.addEventListener('click', toggleGame);