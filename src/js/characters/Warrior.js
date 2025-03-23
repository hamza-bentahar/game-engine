import { Character } from '../character.js';

class Warrior extends Character {
    constructor(grid, characterName = 'Warrior') {
        super(grid, 'warrior', characterName);
        
        // Warrior-specific stats
        this.maxHealth = 120;
        this.health = this.maxHealth;
        this.maxAP = 6;
        this.currentAP = this.maxAP;
        this.maxMP = 3;
        this.currentMP = this.maxMP;
        this.attackRange = 1; // Melee range
        this.attackDamage = 30;
        this.defense = 20; // Additional warrior-specific stat
        
        // Warrior-specific animations
        this.animations = {
            ...this.animations,
            'slash': {
                'down':  [0, 4, 6, 100],
                'left':  [0, 5, 6, 100],
                'right': [0, 6, 6, 100],
                'up':    [0, 7, 6, 100]
            }
        };
    }

    // Warrior-specific attack method
    attack(target) {
        if (this.useAP(6)) {
            // Melee attack animation
            this.setAnimation('slash', this.currentDirection);
            return this.attackDamage;
        }
        return 0;
    }

    // Warrior-specific damage reduction
    takeDamage(amount) {
        const reducedDamage = Math.max(0, amount - (this.defense * 0.1));
        return super.takeDamage(reducedDamage);
    }
}

export { Warrior }; 