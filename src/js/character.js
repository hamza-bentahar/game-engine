class Character {
    constructor(grid, characterType = 'mage', characterName = 'Adventurer') {
        this.grid = grid;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isMoving = false;
        this.moveSpeed = 0.05; // Base speed
        this.minSpeed = 0.01;
        this.maxSpeed = 0.5;
        this.speedStep = 0.01;
        this.path = []; // Store the path
        this.currentResizeHandler = null; // Store the current resize handler
        this.isInSpecialAnimation = false;
        this.specialAnimationEndTime = 0;

        // Base character stats - these will be overridden by specific classes
        this.level = 1;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxAP = 6;
        this.currentAP = this.maxAP;
        this.maxMP = 3;
        this.currentMP = this.maxMP;
        this.attackRange = 1;
        this.attackDamage = 20;
        this.strength = 0;
        this.agility = 0;
        this.intelligence = 0;
        this.luck = 0;
        this.power = 0;

        // Base spell list - should be overridden by specific classes
        this.spellList = [
            {
                name: 'Basic Attack',
                minDamage: 5,
                maxDamage: 8,
                cost: 6,
                range: 1,
                element: 'physical',
                description: 'A basic physical attack.'
            }
        ];

        this.fireResistance = 0;
        this.waterResistance = 0;
        this.earthResistance = 0;
        this.airResistance = 0;
        
        

        // Experience system
        this.experience = 0;
        this.experienceToLevel = [
            0,      // Level 0 to 1 (not used)
            110,    // Level 1 to 2
            650,    // Level 2 to 3
            1500,   // Level 3 to 4
            2800,   // Level 4 to 5
            4800,   // Level 5 to 6
            7300,   // Level 6 to 7
            10500,  // Level 7 to 8
            14500,  // Level 8 to 9
            19200,  // Level 9 to 10
            25200,  // Level 10 to 11
            32600,  // Level 11 to 12
            41000,  // Level 12 to 13
            50500,  // Level 13 to 14
            61000,  // Level 14 to 15
            75000,  // Level 15 to 16
            91000,  // Level 16 to 17
            115000, // Level 17 to 18
            142000, // Level 18 to 19
            171000  // Level 19 to 20
        ];

        // Character info
        this.characterType = characterType;
        this.name = characterName;

        // Animation properties
        this.currentAnimation = 'idle';
        this.currentDirection = 'down';
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.lastTime = 0;
        this.spriteSheet = new Image();
        this.spriteSheet.src = `assets/${this.characterType}_sprites.png`;
        this.spriteWidth = 64;
        this.spriteHeight = 64;
        this.scale = 2.5;
        this.verticalOffset = 32;

        // Base animation frames mapping
        this.animations = {
            'idle': {
                'up':    [0, 3, 1, 100],
                'left':  [0, 1, 1, 100],
                'down':  [0, 0, 1, 100],
                'right': [0, 2, 1, 100]
            },
            'animated-idle': {
                'up':    [0, 22, 2, 200],
                'left':  [0, 23, 2, 200],
                'down':  [0, 24, 2, 200],
                'right': [0, 25, 2, 200]
            },
            'walk': {
                'up':    [0, 8, 8, 120],
                'left':  [0, 9, 8, 120],
                'down':  [0, 10, 8, 120],
                'right': [0, 11, 8, 120]
            },
            'cast': {
                'up':    [0, 0, 6, 120],
                'left':  [0, 1, 6, 120],
                'down':  [0, 2, 6, 120],
                'right': [0, 3, 6, 120]
            },
            'slash': {
                'up':    [0, 12, 6, 120],
                'left':  [0, 13, 6, 120],
                'down':  [0, 14, 6, 120],
                'right': [0, 15, 6, 120]
            },
            'one-handed-back-slash': {
                'up':    [0, 16, 13, 120],
                'left':  [0, 17, 13, 120],
                'down':  [0, 18, 13, 120],
                'right': [0, 19, 13, 120]
            },
            'shoot': {
                'up':    [0, 4, 8, 120],
                'left':  [0, 5, 8, 120],
                'down':  [0, 6, 8, 120],
                'right': [0, 7, 8, 120]
            },
            'hurt': {
                'up':    [0, 20, 6, 120],
                'left':  [0, 20, 6, 120],
                'down':  [0, 20, 6, 120],
                'right': [0, 20, 6, 120],
            },
            'climb': {
                'up':    [0, 21, 6, 120],
                'left':  [0, 21, 6, 120],
                'down':  [0, 21, 6, 120],
                'right': [0, 21, 6, 120],
            },
            'jump': {
                'up':    [0, 26, 5, 120],
                'left':  [0, 27, 5, 120],
                'down':  [0, 28, 5, 120],
                'right': [0, 29, 5, 120],
            },
            'sit': {
                'up':    [0, 30, 3, 200],
                'left':  [0, 31, 3, 200],
                'down':  [0, 32, 3, 200],
                'right': [0, 33, 3, 200],
            },
            'emote': {
                'up':    [0, 34, 3, 200],
                'left':  [0, 35, 3, 200],
                'down':  [0, 36, 3, 200],
                'right': [0, 37, 3, 200],
            },
            'run': {
                'up':    [0, 38, 8, 120],
                'left':  [0, 39, 8, 120],
                'down':  [0, 40, 8, 120],
                'right': [0, 41, 8, 120],
            },
            'combat-idle': {
                'up':    [0, 42, 2, 250],
                'left':  [0, 43, 2, 250],
                'down':  [0, 44, 2, 250],
                'right': [0, 45, 2, 250],
            },
            'one-handed-back-slash': {
                'up':    [0, 46, 13, 120],
                'left':  [0, 47, 13, 120],
                'down':  [0, 48, 13, 120],
                'right': [0, 49, 13, 120],
            },
            'one-handed-slash': {
                'up':    [0, 50, 6, 120],
                'left':  [0, 51, 13, 120],
                'down':  [0, 52, 13, 120],
                'right': [0, 53, 13, 120],
            },
            
        };
    }

    computeDamage(minDamage, maxDamage, element, target) {
        const base= Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
        const elementMultipliers = {
            fire: this.intelligence,
            water: this.luck,
            earth: this.strength,
            air: this.agility
        };
        const elementResistances = {
            fire: target.fireResistance,
            water: target.waterResistance,
            earth: target.earthResistance,
            air: target.airResistance
        };
        let elementMultiplier = elementMultipliers[element] || 0;
        let elementResistance = elementResistances[element] || 0;

        const multiplier = (100 + elementMultiplier + this.power) / 100;
        let damage = base * multiplier * (1 - (elementResistance/100));
        damage = Math.floor(damage);
        return damage;
    }

    getSpell(spellName) {
        return this.spellList.find(s => s.name === spellName);
    }

    // Base attack method - should be overridden by specific classes
    attack(target, spellName = 'Basic Attack') {
        console.log('Character attacking with', spellName);
        const spell = this.getSpell(spellName)
        
        if (!spell) {
            console.error('Spell not found:', spellName);
            return 0;
        }

        if (this.useAP(spell.cost)) {
            // Set animation based on spell type (can be expanded later)
            if (spell.element === 'physical') {
                this.setAnimation('slash', this.currentDirection);
            } else {
                this.setAnimation('cast', this.currentDirection);
            }
            return this.computeDamage(spell.minDamage, spell.maxDamage, spell.element, target);
        }
        return 0;
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
            
            // Check if the new position is walkable and exists in the grid
            if (!this.grid.hasObstacle(newX, newY) && this.grid.tiles.has(newPos)) {
                // For diagonal movements, check if we can actually move there
                if (Math.abs(dir.dx) === 1 && Math.abs(dir.dy) === 1) {
                    // Check if both adjacent tiles are free and exist
                    const straightX = `${x + dir.dx},${y}`;
                    const straightY = `${x},${y + dir.dy}`;
                    const canMoveDiagonally = !this.grid.hasObstacle(x + dir.dx, y) && 
                                            !this.grid.hasObstacle(x, y + dir.dy) &&
                                            this.grid.tiles.has(straightX) &&
                                            this.grid.tiles.has(straightY);
                    
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
        // If target is an obstacle or not in the grid, don't even try
        const targetPos = `${targetX},${targetY}`;
        if (this.grid.hasObstacle(targetX, targetY) || !this.grid.tiles.has(targetPos)) {
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
        // Check if special animation has ended
        if (this.isInSpecialAnimation && performance.now() >= this.specialAnimationEndTime) {
            this.isInSpecialAnimation = false;
            // If in combat, return to combat-idle instead of regular idle
            if (this.grid.game.combatManager.inCombat) {
                this.setAnimation('combat-idle', this.currentDirection);
            } else {
                this.setAnimation('idle', this.currentDirection);
            }
        }

        if (!this.isMoving && !this.isInSpecialAnimation) {
            // Use combat-idle during combat, regular idle otherwise
            if (this.grid.game.combatManager.inCombat) {
                this.setAnimation('combat-idle', this.currentDirection);
            } else {
                this.setAnimation('idle', this.currentDirection);
            }
        }

        if (this.isMoving && !this.isInSpecialAnimation) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Update direction based on movement
            if (Math.abs(dx) > Math.abs(dy)) {
                this.currentDirection = dx > 0 ? 'right' : 'left';
            } else {
                this.currentDirection = dy > 0 ? 'down' : 'up';
            }
            this.setAnimation('walk', this.currentDirection);

            if (distance < this.moveSpeed) {
                this.x = this.targetX;
                this.y = this.targetY;
                
                this.path.shift();
                
                if (this.path.length > 0) {
                    this.targetX = this.path[0].x;
                    this.targetY = this.path[0].y;
                } else {
                    this.isMoving = false;
                    this.setAnimation('idle', this.currentDirection);
                    
                    const nextGrid = this.grid.getNextGrid(Math.round(this.x), Math.round(this.y));
                    
                    if (nextGrid) {
                        console.log(`Loading next grid: ${nextGrid}`);
                        this.currentResizeHandler = this.createTransitionEffect(() => {
                            const layoutName = nextGrid;
                            this.grid.loadLayout(layoutName);
                            this.x = 0;
                            this.y = 0;
                            this.targetX = 0;
                            this.targetY = 0;
                            this.fadeInAfterTransition();
                        });
                    }
                }
                return;
            }

            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * this.moveSpeed;
            this.y += Math.sin(angle) * this.moveSpeed;
        }

        // Update animation
        const currentTime = performance.now();
        if (!this.lastTime) this.lastTime = currentTime;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.animationTimer += deltaTime;
        const currentAnim = this.animations[this.currentAnimation][this.currentDirection];
        
        if (this.animationTimer >= currentAnim[3]) {
            this.animationFrame = (this.animationFrame + 1) % currentAnim[2];
            this.animationTimer = 0;
        }
    }

    setAnimation(animName, direction) {
        if (this.currentAnimation === animName && this.currentDirection === direction) {
            return;
        }
        this.currentAnimation = animName;
        this.currentDirection = direction;
        this.animationFrame = 0;
        this.animationTimer = 0;

        // Set special animation flag for non-idle/walk animations
        if (animName !== 'idle' && animName !== 'walk') {
            this.isInSpecialAnimation = true;
            // Set end time based on animation duration
            const animFrames = this.animations[animName][direction][2];
            const frameDuration = this.animations[animName][direction][3];
            this.specialAnimationEndTime = performance.now() + (animFrames * frameDuration);
        }
    }

    // Create a transition effect when loading a new grid
    createTransitionEffect(callback) {
        // Create an overlay that matches the canvas size and position
        const canvas = this.grid.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        
        const overlay = document.createElement('div');
        overlay.id = 'grid-transition-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = `${canvasRect.top}px`;
        overlay.style.left = `${canvasRect.left}px`;
        overlay.style.width = `${canvasRect.width}px`;
        overlay.style.height = `${canvasRect.height}px`;
        overlay.style.backgroundColor = 'black';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease-in-out';
        overlay.style.zIndex = '9999'; // Just above the canvas but below other UI
        overlay.style.pointerEvents = 'none';
        
        document.body.appendChild(overlay);
        
        // Add resize listener to keep the overlay positioned correctly
        const updateOverlayPosition = () => {
            const updatedRect = canvas.getBoundingClientRect();
            overlay.style.top = `${updatedRect.top}px`;
            overlay.style.left = `${updatedRect.left}px`;
            overlay.style.width = `${updatedRect.width}px`;
            overlay.style.height = `${updatedRect.height}px`;
        };
        
        window.addEventListener('resize', updateOverlayPosition);
        
        // Fade in the overlay
        setTimeout(() => {
            overlay.style.opacity = '1';
            
            // Execute the callback after the fade-in completes
            setTimeout(() => {
                callback();
                
                // Don't remove the overlay here, it will be faded out in fadeInAfterTransition
            }, 500);
        }, 10);
        
        // Return the resize handler so it can be removed later
        return updateOverlayPosition;
    }
    
    // Fade back in after the transition
    fadeInAfterTransition() {
        const overlay = document.getElementById('grid-transition-overlay');
        if (overlay) {
            // Remove the resize event listener
            window.removeEventListener('resize', this.currentResizeHandler);
            this.currentResizeHandler = null;
            
            // Fade out the overlay
            overlay.style.opacity = '0';
            
            // Remove the overlay after the fade-out completes
            setTimeout(() => {
                overlay.remove();
                
                // Show a notification about the new grid
                this.showGridChangeNotification(this.grid.currentLayout);
            }, 500);
        }
    }
    
    // Show a notification when the grid changes
    showGridChangeNotification(layoutName) {
        // Get canvas position for positioning the notification
        const canvas = this.grid.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'grid-change-notification';
        notification.style.position = 'absolute';
        notification.style.top = `${canvasRect.top + 20}px`;
        notification.style.left = `${canvasRect.left + (canvasRect.width / 2)}px`;
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '16px';
        notification.style.zIndex = '10000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        notification.textContent = `Entered new area: ${layoutName}`;
        
        document.body.appendChild(notification);
        
        // Add resize listener to keep the notification positioned correctly
        const updateNotificationPosition = () => {
            const updatedRect = canvas.getBoundingClientRect();
            notification.style.top = `${updatedRect.top + 20}px`;
            notification.style.left = `${updatedRect.left + (updatedRect.width / 2)}px`;
        };
        
        window.addEventListener('resize', updateNotificationPosition);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
            
            // Fade out and remove after a few seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    // Remove the resize event listener
                    window.removeEventListener('resize', updateNotificationPosition);
                    notification.remove();
                }, 300);
            }, 3000);
        }, 10);
    }

    draw(ctx) {
        // Draw path
        if (this.path.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 2;
            
            const start = this.grid.toScreen(this.x, this.y);
            ctx.moveTo(start.x, start.y + this.grid.tileHeight / 2);
            
            for (const point of this.path) {
                const screen = this.grid.toScreen(point.x, point.y);
                ctx.lineTo(screen.x, screen.y + this.grid.tileHeight / 2);
            }
            ctx.stroke();
        }

        // Draw character sprite
        const { x: screenX, y: screenY } = this.grid.toScreen(this.x, this.y);
        const currentAnim = this.animations[this.currentAnimation][this.currentDirection];
        const frameX = (currentAnim[0] + this.animationFrame) * this.spriteWidth;
        const frameY = currentAnim[1] * this.spriteHeight;

        // Calculate position to center the sprite on the isometric tile
        const scaledWidth = this.spriteWidth * this.scale;
        const scaledHeight = this.spriteHeight * this.scale;
        const drawX = screenX - scaledWidth / 2;
        const drawY = screenY - scaledHeight + this.verticalOffset;

        ctx.drawImage(
            this.spriteSheet,
            frameX,
            frameY,
            this.spriteWidth,
            this.spriteHeight,
            drawX,
            drawY,
            scaledWidth,
            scaledHeight
        );

        // Draw character name above the sprite
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const nameY = drawY - 10;
        const displayText = `${this.name} Lv.${this.level}`;
        ctx.strokeText(displayText, screenX, nameY);
        ctx.fillText(displayText, screenX, nameY);

        // Draw speed indicator only in debug mode
        if (this.grid.debugMode) {
            ctx.font = '14px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`Speed: ${this.moveSpeed.toFixed(2)}`, screenX, screenY);
        }
    }

    // Add methods to manage stats
    resetStats() {
        this.currentAP = this.maxAP;
        this.currentMP = this.maxMP;
    }

    resetHealth() {
        this.health = this.maxHealth;
    }

    
    useAP(amount) {
        if (this.currentAP >= amount) {
            this.currentAP -= amount;
            return true;
        }
        return false;
    }

    useMP(amount) {
        if (this.currentMP >= amount) {
            this.currentMP -= amount;
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        // Show damage text
        this.showDamageText(amount);
        return this.health > 0;
    }

    showDamageText(amount) {
        // Get screen coordinates for the character
        const { x: screenX, y: screenY } = this.grid.toScreen(this.x, this.y);
        
        // Create damage text element
        const damageText = document.createElement('div');
        damageText.style.position = 'absolute';
        damageText.style.left = `${screenX}px`;
        damageText.style.top = `${screenY - 60}px`; // Position above health bar
        damageText.style.color = '#ff3333';
        damageText.style.fontFamily = 'Arial, sans-serif';
        damageText.style.fontSize = '40px';
        damageText.style.fontWeight = 'bold';
        damageText.style.textShadow = '2px 2px 2px rgba(0,0,0,0.5)';
        damageText.style.zIndex = '10000';
        damageText.style.transition = 'all 3s ease-out';
        damageText.style.pointerEvents = 'none'; // Make sure it doesn't interfere with clicks
        damageText.textContent = `-${amount}`;
        
        document.body.appendChild(damageText);
        
        // Add resize listener to keep the damage text positioned correctly
        const updateDamagePosition = () => {
            const { x: updatedX, y: updatedY } = this.grid.toScreen(this.x, this.y);
            damageText.style.left = `${updatedX}px`;
            damageText.style.top = `${updatedY - 60}px`;
        };
        
        window.addEventListener('resize', updateDamagePosition);
        
        // Animate the damage text
        requestAnimationFrame(() => {
            damageText.style.transform = 'translateY(-30px)';
            damageText.style.opacity = '0';
        });
        
        // Remove the element after animation
        setTimeout(() => {
            window.removeEventListener('resize', updateDamagePosition);
            damageText.remove();
        }, 1000);
    }

    resetHealth() {
        this.health = this.maxHealth;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    gainExperience(amount) {
        if (this.level >= 20) return; // Max level reached

        this.experience += amount;
        
        // Check if we can level up
        while (this.level < 20 && this.experience >= this.experienceToLevel[this.level]) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level += 1;
        
        // Increase stats based on level
        this.maxHealth += Math.floor(20);
        this.health = this.maxHealth;
        this.attackDamage += Math.floor(this.level * 0.5);
        
        this.resetStats();
        // Show level up notification
        this.showLevelUpNotification();
    }

    isInAttackRange(otherCharacter, range) {
        const dx = this.x - otherCharacter.x;
        const dy = this.y - otherCharacter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= range;
    }

    showLevelUpNotification() {
        // Get canvas position for positioning the notification
        const canvas = this.grid.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'level-up-notification';
        notification.style.position = 'absolute';
        notification.style.top = `${canvasRect.top + 20}px`;
        notification.style.left = `${canvasRect.left + (canvasRect.width / 2)}px`;
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(255, 215, 0, 0.9)';
        notification.style.color = '#2c3e50';
        notification.style.padding = '15px 30px';
        notification.style.borderRadius = '5px';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '18px';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '10000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        notification.textContent = `Level Up! You are now level ${this.level}!`;
        
        document.body.appendChild(notification);
        
        // Add resize listener to keep the notification positioned correctly
        const updateNotificationPosition = () => {
            const updatedRect = canvas.getBoundingClientRect();
            notification.style.top = `${updatedRect.top + 20}px`;
            notification.style.left = `${updatedRect.left + (updatedRect.width / 2)}px`;
        };
        
        window.addEventListener('resize', updateNotificationPosition);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
            
            // Fade out and remove after a few seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    window.removeEventListener('resize', updateNotificationPosition);
                    notification.remove();
                }, 300);
            }, 3000);
        }, 10);
    }
}

export { Character };