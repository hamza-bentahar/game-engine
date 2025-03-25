import { Character } from './character.js';

class Dragon extends Character {
    constructor(grid, monsterType = 'dragon') {
        // Call parent constructor with monster-specific sprite
        super(grid, `${monsterType}_monster`);
        
        this.monsterType = monsterType;
        this.maxHealth = 30;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.isAggressive = true;
        this.detectionRange = 5; // How many tiles away the monster can detect the player
        this.attackRange = 1; // How many tiles away the monster can attack
        
        // Override scale for monsters
        this.scale = monsterType === 'dragon' ? 3.0 : 2.5;

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

    update() {
        if (!this.isAlive) return;

        // Only update animations if not in combat
        if (!this.grid.game.combatManager.inCombat) {
            // Just update animation state
            if (!this.isMoving) {
                this.setAnimation('idle', this.currentDirection);
            }
            super.update();
            return;
        }

        // If in combat, only update if this monster is the current enemy
        if (this.grid.game.combatManager.currentEnemy === this) {
            super.update();
        } else {
            // Just update animation state for non-combat monsters
            if (!this.isMoving) {
                this.setAnimation('idle', this.currentDirection);
            }
            super.update();
        }
    }

    draw(ctx) {
        if (!this.isAlive || !this.isVisible) return;  // Don't draw if not visible

        if (!this.isAlive) {
            // Add transparency for death animation
            ctx.globalAlpha = 0.7;
        }

        // Log sprite sheet status
        if (!this.spriteSheet.complete) {
            console.log(`${this.monsterType} sprite sheet not yet loaded`);
            return;
        }

        // Get screen coordinates
        const { x: screenX, y: screenY } = this.grid.toScreen(this.x, this.y);

        // Call parent draw method
        super.draw(ctx);

        // Reset transparency
        ctx.globalAlpha = 1.0;

        // Draw health bar if monster is alive and has taken damage
        if (this.isAlive && this.health < this.maxHealth) {
            // Health bar background
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(screenX - 25, screenY - 40, 50, 5);
            
            // Health bar fill
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(screenX - 25, screenY - 40, (this.health / this.maxHealth) * 50, 5);
        }

        // Draw debug box around monster
        if (this.grid.debugMode) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            const size = this.spriteWidth * this.scale;
            ctx.strokeRect(screenX - size/2, screenY - size/2, size, size);
        }
    }

    // Mage-specific attack method
    attack(target) {
        console.log('Monster attacking');
        if (this.useAP(6)) {
            // Magical attack animation
            this.setAnimation('slash', this.currentDirection);
            return this.computeDamage(9, 11, 'water', target);
        }
        return 0;
    }
}

export { Dragon }; 