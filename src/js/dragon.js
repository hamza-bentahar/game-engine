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
        this.attackRange = 1; // How many tiles away the monster can attack
        
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