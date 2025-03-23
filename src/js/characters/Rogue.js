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

    // Rogue-specific attack method with critical hits
    attack(target) {
        if (this.useAP(6)) {
            // Throwing attack animation
            this.setAnimation('throw', this.currentDirection);
            
            // Calculate critical hit
            const isCritical = Math.random() < this.criticalChance;
            const damage = isCritical ? this.attackDamage * 2 : this.attackDamage;
            
            return {
                damage,
                isCritical
            };
        }
        return {
            damage: 0,
            isCritical: false
        };
    }
}

export { Rogue }; 