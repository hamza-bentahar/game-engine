import { Character } from '../character.js';

class Mage extends Character {
    constructor(grid, characterName = 'Mage') {
        super(grid, 'mage', characterName);
        
        // Mage-specific stats
        this.maxHealth = 80;
        this.health = this.maxHealth;
        this.maxAP = 6;  // More AP for spells
        this.currentAP = this.maxAP;
        this.maxMP = 3;  // Less MP due to being ranged
        this.currentMP = this.maxMP;
        this.attackRange = 5; // Longer attack range
    }

    // Mage-specific attack method
    attack(target) {
        if (this.useAP(3)) {
            // Magical attack animation
            this.setAnimation('cast', this.currentDirection);
            return this.computeDamage(5, 9, 'fire', target);
        }
        return 0;
    }
}

export { Mage }; 