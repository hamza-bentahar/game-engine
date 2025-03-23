class CombatManager {
    constructor(game) {
        this.game = game;
        this.inCombat = false;
        this.currentPhase = null; // 'preparation', 'playerTurn', 'monsterTurn'
        this.currentEnemy = null;
        this.turnTimeLimit = 30000; // 30 seconds in milliseconds
        this.turnTimer = null;
        this.startingPositions = [];
        this.selectedStartPosition = null;
        this.timerStartTime = null;
        
        // Create combat UI
        this.createCombatUI();
    }

    createCombatUI() {
        // Create main combat container
        this.combatUI = document.createElement('div');
        this.combatUI.id = 'combat-ui';
        this.combatUI.style.position = 'absolute';
        this.combatUI.style.right = '20px';
        this.combatUI.style.top = '20px';
        this.combatUI.style.backgroundColor = 'rgba(44, 62, 80, 0.9)';
        this.combatUI.style.padding = '15px';
        this.combatUI.style.borderRadius = '5px';
        this.combatUI.style.color = '#ecf0f1';
        this.combatUI.style.fontFamily = 'Arial, sans-serif';
        this.combatUI.style.display = 'none';
        this.combatUI.style.minWidth = '300px';
        
        // Create timer display
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.id = 'combat-timer';
        this.timerDisplay.style.fontSize = '24px';
        this.timerDisplay.style.marginBottom = '15px';
        this.timerDisplay.style.textAlign = 'center';
        this.combatUI.appendChild(this.timerDisplay);
        
        // Create phase display
        this.phaseDisplay = document.createElement('div');
        this.phaseDisplay.id = 'combat-phase';
        this.phaseDisplay.style.fontSize = '18px';
        this.phaseDisplay.style.marginBottom = '15px';
        this.phaseDisplay.style.textAlign = 'center';
        this.combatUI.appendChild(this.phaseDisplay);

        // Create monster stats container
        this.monsterStats = document.createElement('div');
        this.monsterStats.style.marginBottom = '15px';
        this.monsterStats.style.padding = '10px';
        this.monsterStats.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        this.monsterStats.style.borderRadius = '3px';
        this.combatUI.appendChild(this.monsterStats);

        // Create monster name
        this.monsterName = document.createElement('div');
        this.monsterName.style.fontSize = '16px';
        this.monsterName.style.fontWeight = 'bold';
        this.monsterName.style.marginBottom = '10px';
        this.monsterStats.appendChild(this.monsterName);

        // Create monster stat bars
        this.monsterHP = this.createStatBar('#e74c3c', 'HP');
        this.monsterAP = this.createStatBar('#3498db', 'AP');
        this.monsterMP = this.createStatBar('#2ecc71', 'MP');
        this.monsterStats.appendChild(this.monsterHP.container);
        this.monsterStats.appendChild(this.monsterAP.container);
        this.monsterStats.appendChild(this.monsterMP.container);
        
        // Create action buttons container
        this.actionButtons = document.createElement('div');
        this.actionButtons.style.display = 'flex';
        this.actionButtons.style.flexDirection = 'column';
        this.actionButtons.style.gap = '10px';
        this.combatUI.appendChild(this.actionButtons);
        
        // Create Ready/Done button
        this.mainButton = this.createButton('Ready');
        this.mainButton.style.display = 'none';
        this.actionButtons.appendChild(this.mainButton);
        
        // Create Attack button
        this.attackButton = this.createButton('Attack (6 AP)');
        this.attackButton.style.display = 'none';
        this.actionButtons.appendChild(this.attackButton);
        
        document.body.appendChild(this.combatUI);
    }

    createButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.padding = '10px 20px';
        button.style.fontSize = '16px';
        button.style.backgroundColor = '#3498db';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.2s';
        
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#2980b9';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#3498db';
        });
        
        return button;
    }

    createStatBar(color, label) {
        const container = document.createElement('div');
        container.style.marginBottom = '8px';
        
        const labelDiv = document.createElement('div');
        labelDiv.style.fontSize = '14px';
        labelDiv.style.marginBottom = '4px';
        labelDiv.textContent = label;
        container.appendChild(labelDiv);
        
        const barContainer = document.createElement('div');
        barContainer.style.width = '100%';
        barContainer.style.height = '12px';
        barContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        barContainer.style.borderRadius = '6px';
        barContainer.style.overflow = 'hidden';
        container.appendChild(barContainer);
        
        const bar = document.createElement('div');
        bar.style.width = '100%';
        bar.style.height = '100%';
        bar.style.backgroundColor = color;
        bar.style.transition = 'width 0.3s ease';
        barContainer.appendChild(bar);
        
        const value = document.createElement('div');
        value.style.fontSize = '12px';
        value.style.textAlign = 'right';
        value.style.marginTop = '2px';
        container.appendChild(value);
        
        return {
            container,
            bar,
            value
        };
    }

    updateMonsterStats() {
        if (!this.currentEnemy) return;

        // Update monster name
        this.monsterName.textContent = `${this.currentEnemy.monsterType.charAt(0).toUpperCase() + this.currentEnemy.monsterType.slice(1)}`;

        // Update HP bar
        const hpPercent = (this.currentEnemy.health / this.currentEnemy.maxHealth) * 100;
        this.monsterHP.bar.style.width = `${hpPercent}%`;
        this.monsterHP.value.textContent = `${this.currentEnemy.health}/${this.currentEnemy.maxHealth}`;

        // Update AP bar
        const apPercent = (this.currentEnemy.currentAP / this.currentEnemy.maxAP) * 100;
        this.monsterAP.bar.style.width = `${apPercent}%`;
        this.monsterAP.value.textContent = `${this.currentEnemy.currentAP}/${this.currentEnemy.maxAP}`;

        // Update MP bar
        const mpPercent = (this.currentEnemy.currentMP / this.currentEnemy.maxMP) * 100;
        this.monsterMP.bar.style.width = `${mpPercent}%`;
        this.monsterMP.value.textContent = `${this.currentEnemy.currentMP}/${this.currentEnemy.maxMP}`;
    }

    startCombat(monster) {
        this.inCombat = true;
        this.currentEnemy = monster;
        this.currentPhase = 'preparation';
        this.combatUI.style.display = 'block';
        
        // Set character to combat-idle animation
        this.game.character.setAnimation('combat-idle', this.game.character.currentDirection);
        
        // Hide all monsters except the current enemy
        this.game.monsters.forEach(m => {
            if (m !== monster) {
                m.isVisible = false;
            }
        });
        
        // Update monster stats display
        this.updateMonsterStats();
        
        // Generate 3 starting positions
        this.generateStartingPositions();
        
        // Update UI
        this.updatePhaseDisplay();
        this.mainButton.textContent = 'Ready';
        this.mainButton.style.display = 'block';
        this.attackButton.style.display = 'none';
        
        // Setup button listeners
        this.mainButton.onclick = () => this.startCombatPhase();
        
        // Start preparation timer
        this.startTimer(() => this.startCombatPhase());
        
        // Highlight starting positions on the grid
        this.showStartingPositions();
    }

    generateStartingPositions() {
        this.startingPositions = [];
        const monster = this.currentEnemy;
        
        // Get positions 3-4 tiles away from the monster in different directions
        const directions = [
            { dx: -3, dy: 0 }, // Left
            { dx: 3, dy: 0 },  // Right
            { dx: 0, dy: -3 }  // Up
        ];
        
        for (const dir of directions) {
            const pos = {
                x: Math.round(monster.x + dir.dx),
                y: Math.round(monster.y + dir.dy)
            };
            
            // Verify the position is valid (on the grid and not blocked)
            if (!this.game.grid.hasObstacle(pos.x, pos.y) && 
                this.game.grid.tiles.has(`${pos.x},${pos.y}`)) {
                this.startingPositions.push(pos);
            }
        }
    }

    showStartingPositions() {
        // Clear any existing position markers
        const existingMarkers = document.querySelectorAll('.starting-position-marker');
        existingMarkers.forEach(marker => marker.remove());
        
        // Create markers for each starting position
        this.startingPositions.forEach((pos, index) => {
            const screenPos = this.game.grid.toScreen(pos.x, pos.y);
            
            const marker = document.createElement('div');
            marker.className = 'starting-position-marker';
            marker.style.position = 'absolute';
            marker.style.left = `${screenPos.x - 15}px`;
            marker.style.top = `${screenPos.y - 15}px`;
            marker.style.width = '30px';
            marker.style.height = '30px';
            marker.style.backgroundColor = 'rgba(46, 204, 113, 0.5)';
            marker.style.borderRadius = '50%';
            marker.style.cursor = 'pointer';
            marker.style.zIndex = '1000';
            marker.style.display = 'flex';
            marker.style.justifyContent = 'center';
            marker.style.alignItems = 'center';
            marker.style.color = 'white';
            marker.style.fontSize = '16px';
            marker.textContent = (index + 1).toString();
            
            marker.onclick = () => {
                this.selectStartingPosition(pos);
                document.querySelectorAll('.starting-position-marker').forEach(m => {
                    m.style.backgroundColor = 'rgba(46, 204, 113, 0.5)';
                });
                marker.style.backgroundColor = 'rgba(46, 204, 113, 0.8)';
            };
            
            document.body.appendChild(marker);
        });
    }

    selectStartingPosition(pos) {
        this.selectedStartPosition = pos;
        this.mainButton.disabled = false;
    }

    startCombatPhase() {
        // Remove starting position markers
        document.querySelectorAll('.starting-position-marker').forEach(marker => marker.remove());
        
        // Move character to selected starting position if one was chosen
        if (this.selectedStartPosition) {
            this.game.character.x = this.selectedStartPosition.x;
            this.game.character.y = this.selectedStartPosition.y;
        }
        
        // Start player's turn
        this.startPlayerTurn();
    }

    startPlayerTurn() {
        this.currentPhase = 'playerTurn';
        this.updatePhaseDisplay();
        
        // Reset character's AP and MP
        this.game.character.resetStats();
        
        // Show attack button if in range
        this.updateAttackButton();
        
        // Update UI
        this.mainButton.textContent = 'End Turn';
        this.mainButton.style.display = 'block';
        this.mainButton.onclick = () => this.endPlayerTurn();
        
        // Start turn timer
        this.startTimer(() => this.endPlayerTurn());
    }

    updateAttackButton() {
        const inRange = this.isInAttackRange();
        this.attackButton.style.display = inRange ? 'block' : 'none';
        this.attackButton.disabled = this.game.character.currentAP < 6;
        
        if (inRange) {
            this.attackButton.onclick = () => this.performAttack();
        }
    }

    isInAttackRange() {
        const dx = this.game.character.x - this.currentEnemy.x;
        const dy = this.game.character.y - this.currentEnemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= 1.5; // Attack range of 1 tile
    }

    performAttack() {
        const damage = this.game.character.attack(this.currentEnemy);
        if (damage > 0) {
            // Deal damage
            this.currentEnemy.takeDamage(damage);
            
            // Update UI
            this.updateAttackButton();
            this.updateMonsterStats();
            
            // Check for combat end
            if (this.currentEnemy.health <= 0) {
                this.endCombat(true);
            }
        }
    }

    endPlayerTurn() {
        clearTimeout(this.turnTimer);
        this.startMonsterTurn();
    }

    startMonsterTurn() {
        this.currentPhase = 'monsterTurn';
        this.updatePhaseDisplay();
        
        // Reset monster's AP and MP
        this.currentEnemy.resetStats();
        
        // Hide action buttons during monster turn
        this.mainButton.style.display = 'none';
        this.attackButton.style.display = 'none';
        
        // Start monster AI
        setTimeout(() => {
            this.performMonsterTurn();
        }, 1000);
    }

    performMonsterTurn() {
        const monster = this.currentEnemy;
        const character = this.game.character;
        
        // Simple AI: Move towards player if not in range, attack if in range
        if (!this.isInAttackRange()) {
            // Move towards player
            const dx = character.x - monster.x;
            const dy = character.y - monster.y;
            const angle = Math.atan2(dy, dx);
            
            // Calculate new position
            const newX = monster.x + Math.round(Math.cos(angle));
            const newY = monster.y + Math.round(Math.sin(angle));
            
            // Move if valid position
            if (monster.useMP(1) && !this.game.grid.hasObstacle(newX, newY)) {
                monster.x = newX;
                monster.y = newY;
                this.updateMonsterStats();
            }
        }
        
        // Attack if in range
        if (this.isInAttackRange()) {
            const damage = monster.attack(character);
            character.takeDamage(damage);
            this.updateMonsterStats();
            
            // Check for combat end
            if (character.health <= 0) {
                this.endCombat(false);
                return;
            }
        }
        
        // End turn after a delay
        setTimeout(() => {
            this.startPlayerTurn();
        }, 1000);
    }

    endCombat(playerWon) {
        this.inCombat = false;
        this.combatUI.style.display = 'none';
        clearTimeout(this.turnTimer);
        
        // Show all surviving monsters again
        this.game.monsters.forEach(m => {
            m.isVisible = true;
        });
        
        if (playerWon) {
            // Remove defeated monster
            this.game.monsters = this.game.monsters.filter(m => m !== this.currentEnemy);
            
            // Calculate experience based on monster's level
            const baseExperience = 100;
            const levelDifference = this.currentEnemy.level - this.game.character.level;
            const experienceMultiplier = Math.max(0.5, 1 + (levelDifference * 0.1));
            const experienceGained = Math.floor(baseExperience * this.currentEnemy.level * experienceMultiplier);

            // Give experience to player after alert is dismissed
            this.game.character.gainExperience(experienceGained);
            this.game.character.updateExperienceBar(true);
            
            // First show the alert before updating experience
            alert(`Victory! You defeated the monster and gained ${experienceGained} experience!`);
        } else {
            alert('Defeat! The monster has defeated you!');
            // Optionally reset the game or implement game over screen
        }
        
        this.currentEnemy = null;
        this.currentPhase = null;
    }

    startTimer(callback) {
        clearTimeout(this.turnTimer);
        this.timerStartTime = Date.now();
        
        const updateTimer = () => {
            const elapsed = Date.now() - this.timerStartTime;
            const remaining = Math.max(0, this.turnTimeLimit - elapsed);
            
            if (remaining > 0) {
                this.timerDisplay.textContent = `Time: ${Math.ceil(remaining / 1000)}s`;
                requestAnimationFrame(updateTimer);
            } else {
                this.timerDisplay.textContent = "Time's up!";
                callback();
            }
        };
        
        updateTimer();
        this.turnTimer = setTimeout(callback, this.turnTimeLimit);
    }

    updatePhaseDisplay() {
        let phaseText = '';
        switch (this.currentPhase) {
            case 'preparation':
                phaseText = 'Preparation Phase - Choose starting position';
                break;
            case 'playerTurn':
                phaseText = 'Your Turn';
                break;
            case 'monsterTurn':
                phaseText = "Monster's Turn";
                break;
        }
        this.phaseDisplay.textContent = phaseText;
    }
}

export { CombatManager }; 