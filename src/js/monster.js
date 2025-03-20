import { Character } from './character.js';

class Monster extends Character {
    constructor(grid, monsterType = 'dragon') {
        // Call parent constructor with monster-specific sprite
        super(grid, `${monsterType}_monster`);
        
        this.monsterType = monsterType;
        this.health = 100;
        this.isAlive = true;
        this.isAggressive = true;
        this.detectionRange = 5; // How many tiles away the monster can detect the player
        this.attackRange = 1; // How many tiles away the monster can attack
        this.attackDamage = monsterType === 'dragon' ? 20 : 15; // Dragon does more damage
        this.moveSpeed = monsterType === 'dragon' ? 0.03 : 0.04; // Minotaur moves faster
        
        // Override scale for monsters
        this.scale = monsterType === 'dragon' ? 3.0 : 2.5;

        // Add sprite load event listener
        this.spriteSheet.onload = () => {
            console.log(`${monsterType} sprite sheet loaded successfully`);
        };

        this.spriteSheet.onerror = (error) => {
            console.error(`Error loading ${monsterType} sprite sheet:`, error);
        };
        
        // Add monster-specific animations
        this.animations = {
            ...this.animations, // Keep existing idle and walk animations
            'attack': {
                'down':  [0, 4, 6, 100],
                'left':  [0, 5, 6, 100],
                'right': [0, 6, 6, 100],
                'up':    [0, 7, 6, 100]
            },
            'death': {
                'down':  [0, 12, 6, 150],
                'left':  [0, 13, 6, 150],
                'right': [0, 14, 6, 150],
                'up':    [0, 15, 6, 150]
            }
        };

        console.log(`Monster created: ${monsterType}, Sprite path: ${this.spriteSheet.src}`);
    }

    update() {
        if (!this.isAlive) return;

        // Get player character reference
        const player = this.grid.game.character;
        
        // Calculate distance to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If player is within detection range and monster is aggressive
        if (this.isAggressive && distance <= this.detectionRange) {
            // If within attack range, attack
            if (distance <= this.attackRange) {
                console.log('Attacking player');
            } else {
                // Otherwise, move towards player
                this.moveTo(Math.round(player.x), Math.round(player.y));
            }
        }

        // Call parent update for animation and movement
        super.update();
    }

    draw(ctx) {
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
        
        // Log drawing position
        console.log(`Drawing ${this.monsterType} at screen coordinates: (${screenX}, ${screenY})`);
        console.log(`Current animation: ${this.currentAnimation}, Direction: ${this.currentDirection}`);

        // Call parent draw method
        super.draw(ctx);

        // Reset transparency
        ctx.globalAlpha = 1.0;

        // Draw health bar if monster is alive and has taken damage
        if (this.isAlive && this.health < 100) {
            // Health bar background
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(screenX - 25, screenY - 40, 50, 5);
            
            // Health bar fill
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(screenX - 25, screenY - 40, (this.health / 100) * 50, 5);
        }

        // Draw debug box around monster
        if (this.grid.debugMode) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            const size = this.spriteWidth * this.scale;
            ctx.strokeRect(screenX - size/2, screenY - size/2, size, size);
        }
    }
}

export { Monster }; 