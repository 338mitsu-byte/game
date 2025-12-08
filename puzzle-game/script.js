document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const moveCountDisplay = document.getElementById('move-count');
    const resetBtn = document.getElementById('reset-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const winMessage = document.getElementById('win-message');
    const finalMovesDisplay = document.getElementById('final-moves');

    // Hint Elements
    const hintBtn = document.getElementById('hint-btn');
    const hintOverlay = document.getElementById('hint-overlay');

    let tiles = []; // Array to store current state
    let moves = 0;
    const SIZE = 4;
    const TOTAL_TILES = SIZE * SIZE;

    // Initialize the game
    function initGame() {
        tiles = Array.from({ length: TOTAL_TILES }, (_, i) => i + 1);
        tiles[TOTAL_TILES - 1] = 0;

        moves = 0;
        updateMoveDisplay();
        shuffle();
        render();
        winMessage.classList.add('hidden');
        removeConfetti(); // Clear any existing confetti
    }

    // Shuffle tiles
    function shuffle() {
        let emptyIdx = 15;
        let previousIdx = -1;

        // Simulate 250 random valid moves
        for (let i = 0; i < 250; i++) {
            const neighbors = getNeighbors(emptyIdx);
            const validNeighbors = neighbors.filter(n => n !== previousIdx);
            const randomNeighbor = validNeighbors.length > 0
                ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)]
                : neighbors[Math.floor(Math.random() * neighbors.length)];

            swap(emptyIdx, randomNeighbor);
            previousIdx = emptyIdx;
            emptyIdx = randomNeighbor;
        }
    }

    function getNeighbors(idx) {
        const neighbors = [];
        const row = Math.floor(idx / SIZE);
        const col = idx % SIZE;

        if (row > 0) neighbors.push(idx - SIZE); // Top
        if (row < SIZE - 1) neighbors.push(idx + SIZE); // Bottom
        if (col > 0) neighbors.push(idx - 1); // Left
        if (col < SIZE - 1) neighbors.push(idx + 1); // Right

        return neighbors;
    }

    function handleTileClick(index) {
        const emptyIdx = tiles.indexOf(0);

        if (isAdjacent(index, emptyIdx)) {
            swap(index, emptyIdx);
            moves++;
            updateMoveDisplay();
            render();

            if (checkWin()) {
                setTimeout(() => {
                    showWinMessage();
                    fireConfetti();
                }, 200);
            }
        }
    }

    function isAdjacent(idx1, idx2) {
        const row1 = Math.floor(idx1 / SIZE);
        const col1 = idx1 % SIZE;
        const row2 = Math.floor(idx2 / SIZE);
        const col2 = idx2 % SIZE;

        return (row1 === row2 && Math.abs(col1 - col2) === 1) ||
            (col1 === col2 && Math.abs(row1 - row2) === 1);
    }

    function swap(idx1, idx2) {
        [tiles[idx1], tiles[idx2]] = [tiles[idx2], tiles[idx1]];
    }

    function checkWin() {
        for (let i = 0; i < tiles.length - 1; i++) {
            if (tiles[i] !== i + 1) return false;
        }
        return true;
    }

    function showWinMessage() {
        finalMovesDisplay.textContent = moves;
        winMessage.classList.remove('hidden');
    }

    function updateMoveDisplay() {
        moveCountDisplay.textContent = moves;
    }

    function render() {
        grid.innerHTML = '';
        tiles.forEach((num, index) => {
            const tile = document.createElement('div');
            tile.className = `tile ${num === 0 ? 'empty' : ''}`;

            if (num !== 0) {
                const originalIndex = num - 1;
                const origRow = Math.floor(originalIndex / SIZE);
                const origCol = originalIndex % SIZE;

                const x = origCol * 100 / (SIZE - 1);
                const y = origRow * 100 / (SIZE - 1);

                tile.style.backgroundPosition = `${x}% ${y}%`;
                // tile.textContent = num; // Debugging
                tile.addEventListener('click', () => handleTileClick(index));
            }
            grid.appendChild(tile);
        });
    }

    // Hint Functionality
    hintBtn.addEventListener('click', () => {
        hintOverlay.classList.remove('hidden');
    });

    hintOverlay.addEventListener('click', () => {
        hintOverlay.classList.add('hidden');
    });

    resetBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);

    // --- Simple Confetti Implementation ---
    let confettiInterval;

    function fireConfetti() {
        const count = 200;
        const defaults = { origin: { y: 0.7 } };

        // Dynamic dynamic import of canvas-confetti from CDN would be ideal,
        // but let's write a minimal particle system here to keep it vanilla and self-contained.

        // Remove existing canvas if any
        let canvas = document.getElementById('confetti-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'confetti-canvas';
            document.body.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#8b5cf6'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height, // Start above
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: (Math.random() - 0.5) * 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let activeParticles = 0;

            particles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;

                if (p.y < canvas.height) {
                    activeParticles++;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation * Math.PI / 180);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctx.restore();
                }
            });

            if (activeParticles > 0) {
                confettiInterval = requestAnimationFrame(animate);
            } else {
                canvas.remove();
            }
        }

        animate();
    }

    function removeConfetti() {
        if (confettiInterval) cancelAnimationFrame(confettiInterval);
        const canvas = document.getElementById('confetti-canvas');
        if (canvas) canvas.remove();
    }

    initGame();
});
