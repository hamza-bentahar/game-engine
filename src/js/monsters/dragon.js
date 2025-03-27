import { Monster } from '../monster.js';

class Dragon extends Monster {
    constructor(grid, monsterType = 'dragon', level = 1) {
        // Call parent constructor with monster-specific sprite
        super(grid, `${monsterType}`, 'Dragon');
        
        this.monsterType = monsterType;
        this.level = level;
        // Base health is 30, scales by 20 per level like characters
        this.maxHealth = 30 + (level - 1) * 20;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.isAggressive = true;
        this.attackRange = 1;

        this.maxAP = 6;
        this.currentAP = this.maxAP;
        this.maxMP = 3;
        this.currentMP = this.maxMP;
        
        // Override scale for monsters
        this.scale = 1 + (level * 0.3);
        this.intelligence = 10 + (level * 5);

        this.fireResistance = Math.max((15 + (level * 2)), 40);

        this.spellList = [
            {
                name: 'Fireball',
                minDamage: 5,
                maxDamage: 9,
                cost: 3,
                range: 5,
                element: 'fire',
                description: 'A fiery explosion that deals fire damage to all enemies in range.'
            }
        ];

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

    performTurn(character, grid, combatUI) {
        console.log('Dragon performing turn');
        while (!this.isInAttackRange(this.attackRange, character) && this.currentMP > 0) {
            // Move towards player
            const dx = character.x - this.x;
            const dy = character.y - this.y;
            const angle = Math.atan2(dy, dx);
            
            // Calculate new position
            const newX = this.x + Math.round(Math.cos(angle));
            const newY = this.y + Math.round(Math.sin(angle));

            // Move if valid position and not on player's tile
            if (this.useMP(1) && !grid.hasObstacle(newX, newY) && !(newX === character.x && newY === character.y)) {
                this.x = newX;
                this.y = newY;
                combatUI.updateMonsterStats(this);
            } else {
                // If we can't move in the desired direction, break to avoid infinite loop
                break;
            }
        }

        // Attack if in range
        const actions = [];
        const spellName = 'Fireball';
        const spell = this.getSpell(spellName);
        if (this.isInAttackRange(character, spell.range)) {
            const damage = this.attack(character, spellName);
            character.takeDamage(damage);
            combatUI.updateMonsterStats();
            actions.push({  
                spellName: spellName,
                damage: damage
            });
        }
        return actions;
    }
}

export { Dragon }; 