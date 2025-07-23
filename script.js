document.addEventListener('DOMContentLoaded', function () {

    // Game elements
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');
    const ball = document.getElementById('ball');
    const gravityWellLeft = document.getElementById('gravity-well-left');
    const gravityWellRight = document.getElementById('gravity-well-right');
    const goalAreaLeft = document.getElementById('goal-area-left');
    const goalAreaRight = document.getElementById('goal-area-right');
    const score1Element = document.getElementById('score1');
    const score2Element = document.getElementById('score2');
    const gameContainer = document.getElementById('game-container');

    // Game state
    let score1 = 0;
    let score2 = 0;
    let leftGravityActive = false;
    let rightGravityActive = false;
    let gameWidth = gameContainer.offsetWidth;
    let gameHeight = gameContainer.offsetHeight;

    // Positions
    let player1Pos = { x: 100, y: gameHeight / 2 };
    let player2Pos = { x: gameWidth - 100, y: gameHeight / 2 };
    let ballPos = { x: gameWidth / 2, y: gameHeight / 2 };
    let ballVel = { x: 0, y: 0 };

    // Key states
    const keys = {
        w: false, a: false, s: false, d: false, q: false,
        ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false, m: false
    };

    // Event listeners
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;

            // Toggle gravity wells
            if (e.key === 'q') {
                leftGravityActive = !leftGravityActive;
                gravityWellLeft.classList.toggle('active');
            }
            if (e.key === 'm') {
                rightGravityActive = !rightGravityActive;
                gravityWellRight.classList.toggle('active');
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });

    // Initialize positions
    function initPositions() {
        player1.style.left = player1Pos.x + 'px';
        player1.style.top = player1Pos.y + 'px';
        player2.style.left = player2Pos.x + 'px';
        player2.style.top = player2Pos.y + 'px';
        ball.style.left = ballPos.x + 'px';
        ball.style.top = ballPos.y + 'px';
    }

    // Check collision between two elements
    function checkCollision(pos1, radius1, pos2, radius2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < radius1 + radius2;
    }

    // Check if point is in rectangle
    function pointInRect(point, rect) {
        return point.x >= rect.left &&
            point.x <= rect.left + rect.width &&
            point.y >= rect.top &&
            point.y <= rect.top + rect.height;
    }

    // Apply gravity from a point
    function applyGravity(sourcePos, strength) {
        const dx = sourcePos.x - ballPos.x;
        const dy = sourcePos.y - ballPos.y;
        const distanceSq = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSq);

        if (distance < 150) { // Only affect within certain range
            const force = strength * (1 - distance / 150);
            ballVel.x += (dx / distance) * force * 0.1;
            ballVel.y += (dy / distance) * force * 0.1;
        }
    }

    // Game loop
    function gameLoop() {
        // Player movement
        const playerSpeed = 3;

        if (keys.w) player1Pos.y -= playerSpeed;
        if (keys.s) player1Pos.y += playerSpeed;
        if (keys.a) player1Pos.x -= playerSpeed;
        if (keys.d) player1Pos.x += playerSpeed;

        if (keys.ArrowUp) player2Pos.y -= playerSpeed;
        if (keys.ArrowDown) player2Pos.y += playerSpeed;
        if (keys.ArrowLeft) player2Pos.x -= playerSpeed;
        if (keys.ArrowRight) player2Pos.x += playerSpeed;

        // Boundary checks for players
        player1Pos.x = Math.max(15, Math.min(gameWidth - 15, player1Pos.x));
        player1Pos.y = Math.max(15, Math.min(gameHeight - 15, player1Pos.y));
        player2Pos.x = Math.max(15, Math.min(gameWidth - 15, player2Pos.x));
        player2Pos.y = Math.max(15, Math.min(gameHeight - 15, player2Pos.y));

        // Apply gravity if active
        if (leftGravityActive) {
            applyGravity({ x: 0, y: gameHeight / 2 }, 5);
        }
        if (rightGravityActive) {
            applyGravity({ x: gameWidth, y: gameHeight / 2 }, 5);
        }

        // Ball movement
        ballPos.x += ballVel.x;
        ballPos.y += ballVel.y;

        // Ball friction (very small in zero-G)
        ballVel.x *= 0.995;
        ballVel.y *= 0.995;

        // Ball boundary collision
        if (ballPos.x < 10 || ballPos.x > gameWidth - 10) {
            ballVel.x *= -0.9;
            ballPos.x = Math.max(10, Math.min(gameWidth - 10, ballPos.x));
        }
        if (ballPos.y < 10 || ballPos.y > gameHeight - 10) {
            ballVel.y *= -0.9;
            ballPos.y = Math.max(10, Math.min(gameHeight - 10, ballPos.y));
        }

        // Player-ball collision
        if (checkCollision(ballPos, 10, player1Pos, 15)) {
            const dx = ballPos.x - player1Pos.x;
            const dy = ballPos.y - player1Pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            ballVel.x = (dx / distance) * 8;
            ballVel.y = (dy / distance) * 8;
        }

        if (checkCollision(ballPos, 10, player2Pos, 15)) {
            const dx = ballPos.x - player2Pos.x;
            const dy = ballPos.y - player2Pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            ballVel.x = (dx / distance) * 8;
            ballVel.y = (dy / distance) * 8;
        }

        // Goal scoring - now checks if ball enters the goal area
        const goalAreaLeftRect = goalAreaLeft.getBoundingClientRect();
        const goalAreaRightRect = goalAreaRight.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();

        if (pointInRect(
            { x: ballRect.left + 10, y: ballRect.top + 10 },
            {
                left: goalAreaLeftRect.left, top: goalAreaLeftRect.top,
                width: goalAreaLeftRect.width, height: goalAreaLeftRect.height
            }
        )) {
            // Right player scores
            score2++;
            score2Element.textContent = score2;
            resetBall();
        } else if (pointInRect(
            { x: ballRect.left + 10, y: ballRect.top + 10 },
            {
                left: goalAreaRightRect.left, top: goalAreaRightRect.top,
                width: goalAreaRightRect.width, height: goalAreaRightRect.height
            }
        )) {
            // Left player scores
            score1++;
            score1Element.textContent = score1;
            resetBall();
        }

        // Update positions
        player1.style.left = player1Pos.x + 'px';
        player1.style.top = player1Pos.y + 'px';
        player2.style.left = player2Pos.x + 'px';
        player2.style.top = player2Pos.y + 'px';
        ball.style.left = ballPos.x + 'px';
        ball.style.top = ballPos.y + 'px';

        requestAnimationFrame(gameLoop);
    }

    // Reset ball to center
    function resetBall() {
        ballPos = { x: gameWidth / 2, y: gameHeight / 2 };
        // Give random initial velocity
        ballVel = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        };
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        gameWidth = gameContainer.offsetWidth;
        gameHeight = gameContainer.offsetHeight;
    });

    // Start game
    initPositions();
    resetBall();
    gameLoop();

});