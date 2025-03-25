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
        this.attackRange = 2; // Medium range for throwing daggers
        this.attackDamage = 20;
        this.criticalChance = 0.2; // 20% chance for critical hit
        
        // Rogue-specific animations
        this.animations = {
            ...this.animations,
            'throw': {
                'down':  [0, 4, 5, 100],
                'left':  [0, 5, 5, 100],
                'right': [0, 6, 5, 100],
                'up':    [0, 7, 5, 100]
            }
        };

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