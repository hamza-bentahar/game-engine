import { Character } from './character.js';
import { Monster } from './monster.js';
import { IsometricGrid } from './grid.js';
import { ControlPanel } from './controlPanel.js';

class IsometricGame {
    constructor(characterType = 'mage', characterName = 'Adventurer') {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Create stats canvas
        this.statsCanvas = document.createElement('canvas');
        this.statsCanvas.id = 'statsCanvas';
        this.statsCtx = this.statsCanvas.getContext('2d');
        
        // Position stats canvas below the main canvas
        this.canvas.parentElement.appendChild(this.statsCanvas);
        
        // Set canvas sizes
        this.updateCanvasSize();
        
        // Create grid
        this.grid = new IsometricGrid(this.canvas, 22, 22);
        
        // Add reference to game in grid for monster AI
        this.grid.game = this;
        
        // Create character with selected type and name
        this.character = new Character(this.grid, characterType, characterName);
        
        // Initialize monsters array
        this.monsters = [];
        
        // Create monsters for the current layout
        this.spawnMonsters();
        
        // Create control panel
        this.createControlPanel();
        
        // Track mouse state
        this.isRightMouseDown = false;
        this.lastObstaclePos = null;
        
        // Add isPlacingObstacle property to grid
        this.grid.isPlacingObstacle = false;
        
        // Bind methods
        this.render = this.render.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        
        // Add click handler for character movement and nextGrid selection (left click)
        this.canvas.addEventListener('click', this.handleClick);
        
        // Add mousedown handler for tile placement (both left and right click)
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        
        // Add mousemove handler
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        
        // Add mouseup handler
        this.canvas.addEventListener('mouseup', (event) => {
            if (event.button === 2) { // Right mouse button
                this.isRightMouseDown = false;
                this.lastObstaclePos = null;
            }
        });
        
        // Add mouseleave handler
        this.canvas.addEventListener('mouseleave', () => {
            this.isRightMouseDown = false;
            this.lastObstaclePos = null;
        });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        
        // Add debug toggle key listener
        window.addEventListener('keydown', (event) => {
            if (event.key === 'd') {
                this.grid.toggleDebug();
            } else if (event.key === 'e') {
                const isEditMode = this.grid.toggleEditMode();
                this.updateControlPanelVisibility(isEditMode);
            }
        });

        // Add speed control key listeners
        window.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'ArrowUp':
                    this.character.increaseSpeed();
                    break;
                case 'ArrowDown':
                    this.character.decreaseSpeed();
                    break;
            }
        });
        
        // Start the game loop
        this.render();
    }
    
    updateCanvasSize() {
        const maxWidth = window.innerWidth * 1;
        const maxHeight = window.innerHeight * 0.70;
        
        // Calculate dimensions maintaining 16:9 ratio for main canvas
        const targetRatio = 16 / 9;
        let width = maxWidth;
        let height = width / targetRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * targetRatio;
        }
        
        this.canvas.width = Math.floor(width);
        this.canvas.height = Math.floor(height);
        
        // Set stats canvas size (same width, but shorter height)
        this.statsCanvas.width = this.canvas.width;
        this.statsCanvas.height = 80; // Fixed height for stats
        
        // Position canvases
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '20px';
        this.canvas.style.top = '20px';
        
        this.statsCanvas.style.position = 'absolute';
        this.statsCanvas.style.left = '20px';
        this.statsCanvas.style.top = `${20 + this.canvas.height + 10}px`; // 10px gap
        this.statsCanvas.style.backgroundColor = '#2c3e50'; // Dark blue-grey background
        this.statsCanvas.style.borderRadius = '5px';
    }
    
    // Handle mousedown for tile placement
    handleMouseDown(event) {
        // Only handle tile placement in edit mode
        if (!this.grid.editMode) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const gridPos = this.grid.toGrid(mouseX, mouseY);
        
        // Handle right-click for tile placement
        if (event.button === 2) { // Right mouse button
            event.preventDefault();
            this.isRightMouseDown = true;
            this.tryCreateObstacle(gridPos);
        }
        // Handle left-click for tile placement
        else if (event.button === 0) { // Left mouse button
            this.tryCreateObstacle(gridPos);
        }
    }
    
    // Handle mouse movement
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        this.grid.updateHover(mouseX, mouseY);
        
        // Handle obstacle creation while dragging
        if (this.isRightMouseDown && this.grid.editMode) {
            const gridPos = this.grid.toGrid(mouseX, mouseY);
            this.tryCreateObstacle(gridPos);
        }
    }
    
    // Handle click for character movement and nextGrid selection
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const gridPos = this.grid.toGrid(mouseX, mouseY);
        
        // If in edit mode, select the tile for nextGrid editing
        if (this.grid.editMode) {
            // Update the selected tile
            if (this.grid.selectedTileKey) {
                const prevTile = this.grid.tiles.get(this.grid.selectedTileKey);
                if (prevTile) {
                    // Reset any visual indicators for the previously selected tile
                }
            }
            
            // Set the new selected tile
            this.grid.selectedTileKey = `${gridPos.x},${gridPos.y}`;
            
            // Show a visual indicator for the selected tile
            const selectedIndicator = document.getElementById('selected-tile-indicator');
            if (!selectedIndicator) {
                const newIndicator = document.createElement('div');
                newIndicator.id = 'selected-tile-indicator';
                newIndicator.style.position = 'absolute';
                newIndicator.style.fontSize = '16px';
                newIndicator.style.color = '#f1c40f'; // Yellow
                newIndicator.style.textShadow = '0 0 5px black';
                newIndicator.style.pointerEvents = 'none';
                newIndicator.style.zIndex = '9998';
                document.body.appendChild(newIndicator);
            }
            
            const indicator = document.getElementById('selected-tile-indicator');
            const tilePos = this.grid.toScreen(gridPos.x, gridPos.y);
            indicator.style.left = `${tilePos.x}px`;
            indicator.style.top = `${tilePos.y - 30}px`;
            indicator.textContent = '⬇️';
            indicator.style.display = 'block';
        } else {
            // In game mode, move the character
            this.character.moveTo(gridPos.x, gridPos.y);
            
            // Hide the selected tile indicator
            const indicator = document.getElementById('selected-tile-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }
    
    // Main render loop
    render() {
        // Render main game
        this.grid.render();
        
        // Update and draw all monsters
        this.monsters = this.monsters.filter(monster => monster.isAlive);
        this.monsters.forEach(monster => {
            monster.update();
            monster.draw(this.ctx);
        });
        
        // Update and draw character
        this.character.update();
        this.character.draw(this.ctx);
        
        // Render stats
        this.renderStats();
        
        // Request next frame
        requestAnimationFrame(this.render);
    }
    
    // Handle resize
    resize() {
        this.updateCanvasSize();
        this.grid.updateDimensions();
    }

    createControlPanel() {
        this.controlPanel = new ControlPanel(this);
    }

    updateLayoutSelector(selector) {
        this.controlPanel.updateLayoutSelector(selector);
    }

    updateControlPanelVisibility(visible) {
        this.controlPanel.setVisibility(visible);
    }

    tryCreateObstacle(gridPos) {
        // Don't create obstacle if it's the same position as last time
        const posKey = `${gridPos.x},${gridPos.y}`;
        if (this.lastObstaclePos === posKey) {
            return;
        }
        
        // Don't allow placing obstacles on the character
        const charX = Math.round(this.character.x);
        const charY = Math.round(this.character.y);
        if (gridPos.x === charX && gridPos.y === charY) {
            return;
        }
        
        this.grid.setTileAtPosition(gridPos.x, gridPos.y, this.grid.currentTileType, this.grid.isPlacingObstacle);
        this.lastObstaclePos = posKey;
        
        if (this.grid.isPlacingObstacle && this.character.isMoving) {
            const targetX = this.character.path[this.character.path.length - 1].x;
            const targetY = this.character.path[this.character.path.length - 1].y;
            this.character.moveTo(targetX, targetY);
        }
    }

    spawnMonsters() {
        // Clear existing monsters
        this.monsters = [];
        
        // Add a dragon to a random position
        this.addMonster('dragon', this.getRandomSpawnPosition());
        
        // Add a minotaur to a different random position
        this.addMonster('minotaur', this.getRandomSpawnPosition());
    }
    
    getRandomSpawnPosition() {
        // Get all valid tile positions from the grid
        const validPositions = Array.from(this.grid.tiles.keys())
            .map(key => {
                const [x, y] = key.split(',').map(Number);
                return { x, y };
            })
            .filter(pos => {
                // Filter out positions that:
                // 1. Are not obstacles
                // 2. Are not too close to the player
                // 3. Are not too close to other monsters
                const isNotObstacle = !this.grid.hasObstacle(pos.x, pos.y);
                const isFarFromPlayer = this.getDistanceToPlayer(pos) > 5;
                const isFarFromMonsters = this.monsters.every(monster => {
                    const dx = monster.x - pos.x;
                    const dy = monster.y - pos.y;
                    return Math.sqrt(dx * dx + dy * dy) > 3; // Keep monsters at least 3 tiles apart
                });
                
                return isNotObstacle && isFarFromPlayer && isFarFromMonsters;
            });

        // If no valid positions found, return a default position
        if (validPositions.length === 0) {
            console.warn('No valid spawn positions found!');
            return { x: 0, y: 0 };
        }

        // Return a random valid position
        const randomIndex = Math.floor(Math.random() * validPositions.length);
        return validPositions[randomIndex];
    }
    
    getDistanceToPlayer(position) {
        const dx = this.character.x - position.x;
        const dy = this.character.y - position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    addMonster(type, position) {
        const monster = new Monster(this.grid, type);
        monster.x = position.x;
        monster.y = position.y;
        console.log(`Spawned ${type} monster at (${monster.x}, ${monster.y})`);
        this.monsters.push(monster);
    }

    renderStats() {
        const ctx = this.statsCtx;
        const canvas = this.statsCanvas;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up fonts and colors
        ctx.font = '16px Arial';
        ctx.textBaseline = 'middle';
        
        const padding = 20;
        const barHeight = 20;
        const barWidth = 150;
        const spacing = 10;
        
        // Draw character name and level
        ctx.fillStyle = '#ecf0f1';
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`${this.character.name} - Level ${this.character.level}`, padding, 25);
        
        // Helper function to draw bars
        const drawBar = (x, y, current, max, fillColor, label) => {
            // Draw bar background
            ctx.fillStyle = '#34495e';
            ctx.fillRect(x, y - barHeight/2, barWidth, barHeight);
            
            // Draw bar fill
            ctx.fillStyle = fillColor;
            const fillWidth = (current / max) * barWidth;
            ctx.fillRect(x, y - barHeight/2, fillWidth, barHeight);
            
            // Draw border
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y - barHeight/2, barWidth, barHeight);
            
            // Draw text
            ctx.fillStyle = '#ecf0f1';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${label}: ${current}/${max}`, x + barWidth + spacing, y);
        };
        
        // Draw HP bar
        drawBar(padding, 55, this.character.health, this.character.maxHealth, '#e74c3c', 'HP');
        
        // Draw AP bar
        drawBar(padding + barWidth + 100, 25, this.character.currentAP, this.character.maxAP, '#3498db', 'AP');
        
        // Draw MP bar
        drawBar(padding + barWidth + 100, 55, this.character.currentMP, this.character.maxMP, '#2ecc71', 'MP');
    }
}

export { IsometricGame };