import { Character } from '../character.js';

class Mage extends Character {
    constructor(grid, characterName = 'Mage') {
        super(grid, 'mage', characterName);
        
        // Mage-specific stats
        this.maxHealth = 80;
        this.health = this.maxHealth;
        this.maxAP = 8;  // More AP for spells
        this.currentAP = this.maxAP;
        this.maxMP = 2;  // Less MP due to being ranged
        this.currentMP = this.maxMP;
        this.attackRange = 3; // Longer attack range
        this.attackDamage = 25;
    }

    // Mage-specific attack method
    attack(target) {
        console.log('Mage attacking');
        if (this.useAP(6)) {
            // Magical attack animation
            this.setAnimation('cast', this.currentDirection);
            return this.attackDamage;
        }
        return 0;
    }
}

export { Mage }; 