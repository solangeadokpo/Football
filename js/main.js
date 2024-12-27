let score = 0;
let lives = 3;
let gameActive = true;
let isPaused = false;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
const scoreElement = document.querySelector('.container-menu h3');
const highScoreElement = document.createElement('h3');
let playerPosition = 1;

scoreElement.parentNode.insertBefore(highScoreElement, scoreElement.nextSibling);
updateHighScoreDisplay();

function updateHighScoreDisplay() {
    highScoreElement.textContent = `Meilleur Score : ${highScore}`;
}


function updateScore() {
    score++;
    scoreElement.textContent = `Score : ${score}`;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        updateHighScoreDisplay();
    }
}


function resetGame() {
    score = 0;
    lives = 3;
    gameActive = true;
    isPaused = false;
    scoreElement.textContent = `Score : ${score}`;
    document.getElementById('game-over').classList.add('hidden');

    const ball = document.getElementById('ball');
    ball.style.animation = 'none';
    setTimeout(() => {
        ball.style.animation = 'fall 2s linear infinite';
    }, 50);
}

function togglePause() {
    if (!gameActive) return; 
    
    isPaused = !isPaused;
    const ball = document.getElementById('ball');
    
    if (isPaused) {
        ball.style.animationPlayState = 'paused';
    } else {
        ball.style.animationPlayState = 'running';
    }
}

function showGameOver() {
    const gameOver = document.getElementById('game-over');
    gameOver.querySelector('p span').textContent = score;
    
    const highScoreSpan = document.createElement('p');
    highScoreSpan.textContent = `Meilleur Score : ${highScore}`;
    gameOver.querySelector('p').after(highScoreSpan);
    
    gameOver.classList.remove('hidden');
    gameActive = false;
    
    const ball = document.getElementById('ball');
    ball.style.animation = 'none';
}

function handleBallMiss() {
    if (isPaused) return; 
    
    lives--;
    if (lives <= 0) {
        showGameOver();
    } else {
        const ball = document.getElementById('ball');
        ball.style.animation = 'none';
        setTimeout(() => {
            if (gameActive && !isPaused) {
                ball.style.animation = 'fall 2s linear infinite';
            }
        }, 50);
    }
}

function playgame() {
    resetGame();
    const playerSvg = document.getElementById("player-svg");
    const ball = document.getElementById("ball");
    const divisions = document.querySelectorAll(".scene > div");
    const scene = document.querySelector(".scene");

    playerSvg.classList.remove("hidden");
    ball.classList.remove("hidden");

    function updatePlayerPosition() {
        const targetDivision = divisions[playerPosition];
        const centerX = targetDivision.offsetLeft + (targetDivision.offsetWidth / 2);
        playerSvg.style.left = `${centerX}px`;
        playerSvg.style.transform = 'translateX(-50%)';
    }

    function resetBallPosition() {
        if (!gameActive || isPaused) return;
        
        const randomPosition = Math.floor(Math.random() * 3);
        const targetDivision = divisions[randomPosition];
        const centerX = targetDivision.offsetLeft + (targetDivision.offsetWidth / 2);
        
        ball.style.left = `${centerX}px`;
        ball.style.transform = 'translateX(-50%)';
    }

    function detectCollision() {
        if (isPaused) return false;
        
        const ballRect = ball.getBoundingClientRect();
        const playerRect = playerSvg.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();

        if (ballRect.bottom >= sceneRect.bottom) {
            handleBallMiss();
            return false;
        }

        const ballCenterX = ballRect.left + (ballRect.width / 2);
        const playerCenterX = playerRect.left + (playerRect.width / 2);
        const maxDistance = 30;

        return (
            Math.abs(ballCenterX - playerCenterX) < maxDistance && 
            ballRect.bottom > playerRect.top &&
            ballRect.top < playerRect.bottom
        );
    }

    function onBallCollision() {
        if (!gameActive || isPaused) return;
        
        updateScore();
        ball.style.animation = "none";
        resetBallPosition();
        
        setTimeout(() => {
            if (gameActive && !isPaused) {
                ball.style.animation = "fall 2s linear infinite";
            }
        }, 50);
    }

    updatePlayerPosition();
    ball.addEventListener("animationiteration", resetBallPosition);
    resetBallPosition();

    const handleKeydown = (event) => {
        if (!gameActive) return;
        
        if (event.key === "ArrowLeft" && playerPosition > 0) {
            playerPosition--;
            updatePlayerPosition();
        } else if (event.key === "ArrowRight" && playerPosition < 2) {
            playerPosition++;
            updatePlayerPosition();
        } else if (event.key === "p" || event.key === "P") {
            togglePause();
        }
    };

    window.removeEventListener("keydown", handleKeydown);
    window.addEventListener("keydown", handleKeydown);

    function gameLoop() {
        if (!gameActive) return;
        
        if (detectCollision()) {
            onBallCollision();
        }
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}