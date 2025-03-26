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
        
        // Override base spellList with mage-specific spells
        this.spellList = [
            {
                name: 'Magic Bolt',
                minDamage: 3,
                maxDamage: 6,
                cost: 2,
                range: 5,
                element: 'arcane',
                description: 'A basic magical attack that deals arcane damage.'
            },
            {
                name: 'Fireball',
                minDamage: 5,
                maxDamage: 9,
                cost: 3,
                range: 5,
                element: 'fire',
                description: 'A fiery explosion that deals fire damage to all enemies in range.'
            },
            {
                name: 'Ice Blast',
                minDamage: 4,
                maxDamage: 8,
                cost: 2,
                range: 5,
                element: 'water',
                description: 'A freezing blast that deals ice damage to all enemies in range.'
            },
            {
                name: 'Lightning Strike',
                minDamage: 6,
                maxDamage: 10,
                cost: 4,
                range: 6,
                element: 'air',
                description: 'A powerful bolt of lightning that deals air damage with high accuracy.'
            },
            {
                name: 'Earth Spike',
                minDamage: 4,
                maxDamage: 7,
                cost: 3,
                range: 4,
                element: 'earth',
                description: 'Summons a spike of earth to impale enemies, dealing earth damage.'
            }
        ];
    }
}

export { Mage }; 