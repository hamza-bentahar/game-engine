export class Team {
    constructor(name, entities = []) {
        this.name = name;
        this.entities = entities;
        this.type = this.determineTeamType(entities);
    }

    determineTeamType(entities) {
        if (entities.length === 0) return null;
        // Check if first entity is a player or monster to determine team type
        return entities[0].constructor.name === 'Character' ? 'players' : 'monsters';
    }

    addEntity(entity) {
        // Ensure we don't mix players and monsters
        if (this.type === null) {
            this.type = entity.constructor.name === 'Character' ? 'players' : 'monsters';
        } else if ((this.type === 'players' && entity.constructor.name !== 'Character') ||
                   (this.type === 'monsters' && entity.constructor.name === 'Character')) {
            throw new Error('Cannot mix players and monsters in the same team');
        }
        this.entities.push(entity);
    }

    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    getLivingEntities() {
        return this.entities.filter(entity => entity.health > 0);
    }

    getDeadEntities() {
        return this.entities.filter(entity => entity.health <= 0);
    }

    isDefeated() {
        return this.getLivingEntities().length === 0;
    }

    resetTeam() {
        this.entities.forEach(entity => entity.resetStats());
    }
} 