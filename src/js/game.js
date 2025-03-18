import { Character } from './character.js';
import { IsometricGrid } from './grid.js';
import { ControlPanel } from './controlPanel.js';

class IsometricGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size with 16:9 aspect ratio
        this.updateCanvasSize();
        
        // Create grid
        this.grid = new IsometricGrid(this.canvas, 12, 11);
        
        // Create character
        this.character = new Character(this.grid);
        
        // Create control panel
        this.createControlPanel();
        
        // Track mouse state
        this.isRightMouseDown = false;
        this.lastObstaclePos = null;
        
        // Add isPlacingObstacle property to grid
        this.grid.isPlacingObstacle = false;
        
        // Bind methods
        this.render = this.render.bind(this);
        
        // Add click handler for character movement (left click)
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        // Add mousemove handler
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            this.grid.updateHover(mouseX, mouseY);
            
            // Handle obstacle creation while dragging
            if (this.isRightMouseDown && this.grid.editMode) {
                const gridPos = this.grid.toGrid(mouseX, mouseY);
                this.tryCreateObstacle(gridPos);
            }
        });
        
        // Add mousedown handler
        this.canvas.addEventListener('mousedown', (event) => {
            if (event.button === 2) { // Right mouse button
                event.preventDefault();
                this.isRightMouseDown = true;
                
                if (this.grid.editMode) {
                    const rect = this.canvas.getBoundingClientRect();
                    const mouseX = event.clientX - rect.left;
                    const mouseY = event.clientY - rect.top;
                    const gridPos = this.grid.toGrid(mouseX, mouseY);
                    this.tryCreateObstacle(gridPos);
                }
            }
        });
        
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
        const maxWidth = window.innerWidth * 0.89;
        const maxHeight = window.innerHeight * 0.7; // Changed from 0.8 to 0.6 (60% of window height)
        
        // Calculate dimensions maintaining 16:9 ratio
        const targetRatio = 16 / 9;
        let width = maxWidth;
        let height = width / targetRatio;
        
        // If height is too big, calculate based on height instead
        if (height > maxHeight) {
            height = maxHeight;
            width = height * targetRatio;
        }
        
        this.canvas.width = Math.floor(width);
        this.canvas.height = Math.floor(height);
        
        // Position canvas with padding from top-left corner
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '20px';
        this.canvas.style.top = '20px';
    }
    
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const gridPos = this.grid.toGrid(mouseX, mouseY);
        this.character.moveTo(gridPos.x, gridPos.y);
    }
    
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        this.grid.updateHover(mouseX, mouseY);
    }
    
    // Main render loop
    render() {
        this.grid.render();
        this.character.update();
        this.character.draw(this.ctx);
        
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
}

export { IsometricGame };