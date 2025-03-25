import { CombatUI } from './CombatUI.js';

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
        this.turnCounter = 0;
        
        // Create combat UI
        this.ui = new CombatUI();
    }

    startCombat(monster) {
        this.inCombat = true;
        this.currentEnemy = monster;
        this.currentPhase = 'preparation';
        this.ui.show();
        
        // Set character to combat-idle animation
        this.game.character.setAnimation('combat-idle', this.game.character.currentDirection);
        
        // Hide all monsters except the current enemy
        this.game.monsters.forEach(m => {
            if (m !== monster) {
                console.log('Hiding monster: ' + m.monsterType);
                m.isVisible = false;
            }
        });
        
        // Update monster stats display
        this.ui.updateMonsterStats(this.currentEnemy);
        
        // Generate 3 starting positions
        this.generateStartingPositions();
        
        // Update UI
        this.ui.updatePhaseDisplay(this.currentPhase);
        this.ui.mainButton.textContent = 'Ready';
        this.ui.mainButton.style.display = 'block';
        this.ui.attackButton.style.display = 'none';
        
        // Setup button listeners
        this.ui.mainButton.onclick = () => this.startCombatPhase();
        
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
        this.ui.mainButton.disabled = false;
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
        this.turnCounter++;
        this.currentPhase = 'playerTurn';
        this.ui.updatePhaseDisplay(this.currentPhase);
        
        // Reset character's AP and MP
        this.game.character.resetStats();
        
        // Show attack button if in range
        this.updateAttackButton();
        
        // Update UI
        this.ui.mainButton.textContent = 'End Turn';
        this.ui.mainButton.style.display = 'block';
        this.ui.mainButton.onclick = () => this.endPlayerTurn();
        
        // Start turn timer
        this.startTimer(() => this.endPlayerTurn());
    }

    updateAttackButton() {
        const inRange = this.isInAttackRange(this.game.character.attackRange);
        this.ui.attackButton.style.display = inRange ? 'block' : 'none';
        this.ui.attackButton.disabled = this.game.character.currentAP < 6;
        
        if (inRange) {
            this.ui.attackButton.onclick = () => this.performAttack();
        }
    }

    isInAttackRange(range) {
        const dx = this.game.character.x - this.currentEnemy.x;
        const dy = this.game.character.y - this.currentEnemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= range;
    }

    performAttack() {
        const damage = this.game.character.attack(this.currentEnemy);
        if (damage > 0) {
            // Deal damage
            this.currentEnemy.takeDamage(damage);
            
            // Update UI
            this.updateAttackButton();
            this.ui.updateMonsterStats(this.currentEnemy);
            
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
        this.ui.updatePhaseDisplay(this.currentPhase);
        
        // Reset monster's AP and MP
        this.currentEnemy.resetStats();
        
        // Hide action buttons during monster turn
        this.ui.mainButton.style.display = 'none';
        this.ui.attackButton.style.display = 'none';
        
        // Start monster AI
        setTimeout(() => {
            this.performMonsterTurn();
        }, 1000);
    }

    performMonsterTurn() {
        const monsterWon = this.currentEnemy.performTurn(this.game.character, this.game.grid, this.ui);
        if (monsterWon) {
            this.endCombat(false);
            return;
        }
        
        // End turn after a delay
        setTimeout(() => {
            this.startPlayerTurn();
        }, 1000);
    }

    endCombat(playerWon) {
        this.inCombat = false;
        this.ui.hide();
        clearTimeout(this.turnTimer);
        
        // Show all surviving monsters again
        this.game.monsters.forEach(m => {
            m.isVisible = true;
        });

        this.game.character.resetHealth();
        
        if (playerWon) {
            // Remove defeated monster
            this.game.monsters = this.game.monsters.filter(m => m !== this.currentEnemy);
            
            // Calculate experience based on monster's level
            const baseExperience = 100;
            const levelDifference = this.currentEnemy.level - this.game.character.level;
            const experienceMultiplier = Math.max(0.5, 1 + (levelDifference * 0.1));
            const experienceGained = Math.floor(baseExperience * this.currentEnemy.level * experienceMultiplier);
            console.log('Experience gained: ' + experienceGained);

            this.game.character.gainExperience(experienceGained);
            
            alert(`Victory! You defeated the monster in ${this.turnCounter} turns and gained ${experienceGained} experience!`);
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
                this.ui.updateTimer(remaining);
                requestAnimationFrame(updateTimer);
            } else {
                this.ui.setTimerExpired();
                callback();
            }
        };
        
        updateTimer();
        this.turnTimer = setTimeout(callback, this.turnTimeLimit);
    }
}

export { CombatManager }; 