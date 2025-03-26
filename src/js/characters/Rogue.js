import { Character } from '../character.js';

class Rogue extends Character {
    constructor(grid, characterName = 'Rogue') {
        super(grid, 'rogue', characterName);
        
        // Rogue-specific stats
        this.maxHealth = 90;
        this.health = this.maxHealth;
        this.maxAP = 7;
        this.currentAP = this.maxAP;
        this.maxMP = 4;  // More MP for mobility
        this.currentMP = this.maxMP;

        // Rogue moves faster
        this.moveSpeed = 0.07;
    }

    // Mage-specific attack method
    attack(target) {
        if (this.useAP(3)) {
            // Magical attack animation
            this.setAnimation('cast', this.currentDirection);
            return this.computeDamage(5, 9, 'air', target);
        }
        return 0;
    }
}

export { Rogue }; 