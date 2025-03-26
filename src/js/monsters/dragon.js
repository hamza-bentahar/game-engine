import { Monster } from '../monster.js';

class Dragon extends Monster {
    constructor(grid, monsterType = 'dragon') {
        // Call parent constructor with monster-specific sprite
        super(grid, `${monsterType}`);
        
        this.monsterType = monsterType;
        this.maxHealth = 30;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.isAggressive = true;
        this.attackRange = 1;

        this.maxAP = 6;
        this.currentAP = this.maxAP;
        this.maxMP = 3;
        this.currentMP = this.maxMP;
        
        // Override scale for monsters
        this.scale = 2;

        // Add sprite load event listener
        this.spriteSheet.onload = () => {
            console.log(`${monsterType} sprite sheet loaded successfully`);
        };

        this.spriteSheet.onerror = (error) => {
            console.error(`Error loading ${monsterType} sprite sheet:`, error);
        };

        this.isVisible = true;  // Add visibility flag

        console.log(`Monster created: ${monsterType}, Sprite path: ${this.spriteSheet.src}`);
    }

    performTurn(character, grid, combatUI) {
        console.log('Dragon performing turn');
        while (!this.isInAttackRange(this.attackRange, character) && this.currentMP > 0) {
            // Move towards player
            const dx = character.x - this.x;
            const dy = character.y - this.y;
            const angle = Math.atan2(dy, dx);
            
            // Calculate new position
            const newX = this.x + Math.round(Math.cos(angle));
            const newY = this.y + Math.round(Math.sin(angle));

            // Move if valid position and not on player's tile
            if (this.useMP(1) && !grid.hasObstacle(newX, newY) && !(newX === character.x && newY === character.y)) {
                this.x = newX;
                this.y = newY;
                combatUI.updateMonsterStats(this);
            } else {
                // If we can't move in the desired direction, break to avoid infinite loop
                break;
            }
        }

        // Attack if in range
        if (this.isInAttackRange(character, this.attackRange)) {
            const damage = this.attack(character);
            character.takeDamage(damage);
            combatUI.updateMonsterStats();
            
            // Check for combat end
            if (character.health <= 0) {
                return true;
            }
        }
        return false;
    }
}

export { Dragon }; 