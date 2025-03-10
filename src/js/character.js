class Character {
    constructor(grid) {
        this.grid = grid;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isMoving = false;
        this.moveSpeed = 0.1; // Base speed
        this.minSpeed = 0.01;
        this.maxSpeed = 0.5;
        this.speedStep = 0.01;
        this.path = []; // Store the path
    }

    // Adjust movement speed
    increaseSpeed() {
        this.moveSpeed = Math.min(this.maxSpeed, this.moveSpeed + this.speedStep);
    }

    decreaseSpeed() {
        this.moveSpeed = Math.max(this.minSpeed, this.moveSpeed - this.speedStep);
    }

    // Get neighboring tiles that are walkable
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            {dx: 1, dy: 0},   // right
            {dx: -1, dy: 0},  // left
            {dx: 0, dy: 1},   // down
            {dx: 0, dy: -1},  // up
            {dx: 1, dy: 1},   // diagonal right-down
            {dx: -1, dy: -1}, // diagonal left-up
            {dx: 1, dy: -1},  // diagonal right-up
            {dx: -1, dy: 1}   // diagonal left-down
        ];

        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            const newPos = `${newX},${newY}`;
            
            // Check if the new position is walkable and available
            if (!this.grid.hasObstacle(newX, newY) && this.grid.availableTiles.has(newPos)) {
                // For diagonal movements, check if we can actually move there
                if (Math.abs(dir.dx) === 1 && Math.abs(dir.dy) === 1) {
                    // Check if both adjacent tiles are free and available
                    const straightX = `${x + dir.dx},${y}`;
                    const straightY = `${x},${y + dir.dy}`;
                    const canMoveDiagonally = !this.grid.hasObstacle(x + dir.dx, y) && 
                                            !this.grid.hasObstacle(x, y + dir.dy) &&
                                            this.grid.availableTiles.has(straightX) &&
                                            this.grid.availableTiles.has(straightY);
                    
                    if (canMoveDiagonally) {
                        neighbors.push({x: newX, y: newY});
                    }
                } else {
                    // For non-diagonal movements, just add the neighbor
                    neighbors.push({x: newX, y: newY});
                }
            }
        }
        return neighbors;
    }

    // Manhattan distance heuristic
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    // A* pathfinding algorithm
    findPath(startX, startY, targetX, targetY) {
        const openSet = new Set();
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const start = `${startX},${startY}`;
        const goal = `${targetX},${targetY}`;

        openSet.add(start);
        gScore.set(start, 0);
        fScore.set(start, this.heuristic(startX, startY, targetX, targetY));

        while (openSet.size > 0) {
            // Find node with lowest fScore
            let current = null;
            let lowestF = Infinity;
            for (const pos of openSet) {
                const f = fScore.get(pos);
                if (f < lowestF) {
                    lowestF = f;
                    current = pos;
                }
            }

            if (current === goal) {
                // Reconstruct path
                const path = [];
                let curr = current;
                while (curr) {
                    const [x, y] = curr.split(',').map(Number);
                    path.unshift({x, y});
                    curr = cameFrom.get(curr);
                }
                return path;
            }

            openSet.delete(current);
            closedSet.add(current);

            const [x, y] = current.split(',').map(Number);
            const neighbors = this.getNeighbors(x, y);

            for (const neighbor of neighbors) {
                const neighborPos = `${neighbor.x},${neighbor.y}`;
                if (closedSet.has(neighborPos)) continue;

                const tentativeG = gScore.get(current) + 1;

                if (!openSet.has(neighborPos)) {
                    openSet.add(neighborPos);
                } else if (tentativeG >= gScore.get(neighborPos)) {
                    continue;
                }

                cameFrom.set(neighborPos, current);
                gScore.set(neighborPos, tentativeG);
                fScore.set(neighborPos, tentativeG + this.heuristic(neighbor.x, neighbor.y, targetX, targetY));
            }
        }

        return null; // No path found
    }

    moveTo(targetX, targetY) {
        // If target is an obstacle or not available, don't even try
        const targetPos = `${targetX},${targetY}`;
        if (this.grid.hasObstacle(targetX, targetY) || !this.grid.availableTiles.has(targetPos)) {
            return;
        }

        // Find path to target
        const path = this.findPath(Math.round(this.x), Math.round(this.y), targetX, targetY);
        
        if (path) {
            this.path = path;
            this.targetX = path[0].x;
            this.targetY = path[0].y;
            this.isMoving = true;
        }
    }

    update() {
        if (!this.isMoving) return;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.moveSpeed) {
            this.x = this.targetX;
            this.y = this.targetY;
            
            // Remove the current target from path
            this.path.shift();
            
            // If there are more points in the path, move to the next one
            if (this.path.length > 0) {
                this.targetX = this.path[0].x;
                this.targetY = this.path[0].y;
            } else {
                this.isMoving = false;
            }
            return;
        }

        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * this.moveSpeed;
        this.y += Math.sin(angle) * this.moveSpeed;
    }

    draw(ctx) {
        // Draw path
        if (this.path.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 2;
            
            // Start from current position
            const start = this.grid.toScreen(this.x, this.y);
            ctx.moveTo(start.x, start.y + this.grid.tileHeight / 2);
            
            // Draw lines through all path points
            for (const point of this.path) {
                const screen = this.grid.toScreen(point.x, point.y);
                ctx.lineTo(screen.x, screen.y + this.grid.tileHeight / 2);
            }
            ctx.stroke();
        }

        // Draw character
        const { x: screenX, y: screenY } = this.grid.toScreen(this.x, this.y);
        ctx.beginPath();
        ctx.arc(screenX, screenY + this.grid.tileHeight / 2, this.grid.tileHeight / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.stroke();

        // Draw speed indicator only in debug mode
        if (this.grid.debugMode) {
            ctx.font = '14px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`Speed: ${this.moveSpeed.toFixed(2)}`, screenX, screenY);
        }
    }
}

export { Character };