import { Character } from './character.js';
import { IsometricGrid } from './grid.js';

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
        
        // Center the canvas on screen
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '50%';
        this.canvas.style.top = '50%';
        this.canvas.style.transform = 'translate(-50%, -50%)';
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
        // Create control panel container
        const controlPanel = document.createElement('div');
        controlPanel.id = 'controlPanel';
        controlPanel.style.position = 'absolute';
        controlPanel.style.right = '20px';
        controlPanel.style.top = '20px';
        controlPanel.style.padding = '10px';
        controlPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        controlPanel.style.color = 'white';
        controlPanel.style.borderRadius = '5px';
        controlPanel.style.display = 'none';

        // Create tile selection section
        const tileSelectionDiv = document.createElement('div');
        tileSelectionDiv.style.marginBottom = '15px';

        // Default tile selector
        const defaultTileLabel = document.createElement('div');
        defaultTileLabel.textContent = 'Default Tile:';
        defaultTileLabel.style.marginBottom = '5px';
        const defaultTileInput = document.createElement('input');
        defaultTileInput.type = 'number';
        defaultTileInput.min = '0';
        defaultTileInput.max = '120';
        defaultTileInput.value = '37'; // Default value
        defaultTileInput.style.width = '60px';
        defaultTileInput.style.marginBottom = '10px';

        // Obstacle tile selector
        const obstacleTileLabel = document.createElement('div');
        obstacleTileLabel.textContent = 'Obstacle Tile:';
        obstacleTileLabel.style.marginBottom = '5px';
        const obstacleTileInput = document.createElement('input');
        obstacleTileInput.type = 'number';
        obstacleTileInput.min = '0';
        obstacleTileInput.max = '120';
        obstacleTileInput.value = '15'; // Default value
        obstacleTileInput.style.width = '60px';

        // Add event listeners for tile selection
        defaultTileInput.addEventListener('change', () => {
            const tileIndex = parseInt(defaultTileInput.value);
            if (tileIndex >= 0 && tileIndex <= 120) {
                this.grid.setTileType('default', tileIndex);
            }
        });

        obstacleTileInput.addEventListener('change', () => {
            const tileIndex = parseInt(obstacleTileInput.value);
            if (tileIndex >= 0 && tileIndex <= 120) {
                this.grid.setTileType('obstacle', tileIndex);
            }
        });

        // Assemble tile selection section
        tileSelectionDiv.appendChild(defaultTileLabel);
        tileSelectionDiv.appendChild(defaultTileInput);
        tileSelectionDiv.appendChild(obstacleTileLabel);
        tileSelectionDiv.appendChild(obstacleTileInput);

        // Create layout selector
        const layoutSelect = document.createElement('select');
        layoutSelect.id = 'layoutSelect';
        layoutSelect.style.marginBottom = '10px';
        layoutSelect.style.width = '200px';
        this.updateLayoutSelector(layoutSelect);

        // Create new layout input
        const newLayoutInput = document.createElement('input');
        newLayoutInput.type = 'text';
        newLayoutInput.placeholder = 'New layout name';
        newLayoutInput.style.width = '200px';
        newLayoutInput.style.marginBottom = '10px';

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '5px';

        // Create buttons
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save New';
        const loadButton = document.createElement('button');
        loadButton.textContent = 'Load';
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';

        // Add event listeners
        layoutSelect.addEventListener('change', () => {
            this.grid.loadLayout(layoutSelect.value);
        });

        saveButton.addEventListener('click', () => {
            const name = newLayoutInput.value.trim();
            if (name) {
                this.grid.saveLayout(name);
                this.updateLayoutSelector(layoutSelect);
                newLayoutInput.value = '';
            }
        });

        loadButton.addEventListener('click', () => {
            this.grid.loadLayout(layoutSelect.value);
        });

        deleteButton.addEventListener('click', () => {
            const name = layoutSelect.value;
            if (name && confirm(`Delete layout "${name}"?`)) {
                if (this.grid.deleteLayout(name)) {
                    this.updateLayoutSelector(layoutSelect);
                }
            }
        });

        // Assemble control panel
        buttonsContainer.appendChild(saveButton);
        buttonsContainer.appendChild(loadButton);
        buttonsContainer.appendChild(deleteButton);

        controlPanel.appendChild(tileSelectionDiv);
        controlPanel.appendChild(layoutSelect);
        controlPanel.appendChild(newLayoutInput);
        controlPanel.appendChild(buttonsContainer);

        // Create tile preview section
        const previewSection = document.createElement('div');
        previewSection.style.marginBottom = '15px';
        
        // Create preview canvas
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 64;
        previewCanvas.height = 64;
        previewCanvas.style.border = '1px solid white';
        previewCanvas.style.marginBottom = '10px';
        previewCanvas.style.backgroundColor = '#2c3e50';

        // Create controls container
        const controlsDiv = document.createElement('div');
        controlsDiv.style.display = 'flex';
        controlsDiv.style.flexDirection = 'column';
        controlsDiv.style.gap = '5px';

        // Tile number input
        const tileInput = document.createElement('input');
        tileInput.type = 'number';
        tileInput.min = '0';
        tileInput.max = '120';
        tileInput.value = this.grid.currentTileType;
        tileInput.style.width = '60px';
        tileInput.style.marginBottom = '5px';

        // Toggle obstacle button
        const toggleObstacleButton = document.createElement('button');
        toggleObstacleButton.textContent = 'Normal Tile';
        toggleObstacleButton.style.marginBottom = '10px';

        // Update preview function
        const updatePreview = () => {
            const ctx = previewCanvas.getContext('2d');
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            
            if (this.grid.sprites.isLoaded) {
                const tileIndex = parseInt(tileInput.value);
                const tileType = this.grid.sprites.tiles[`tile${tileIndex}`];
                
                ctx.drawImage(
                    this.grid.sprites.sheet,
                    tileType.x,
                    tileType.y,
                    this.grid.sprites.tileWidth,
                    this.grid.sprites.tileHeight,
                    0,
                    0,
                    previewCanvas.width,
                    previewCanvas.height
                );
            }
        };

        // Add event listeners
        tileInput.addEventListener('change', () => {
            const tileIndex = parseInt(tileInput.value);
            if (tileIndex >= 0 && tileIndex <= 120) {
                this.grid.currentTileType = tileIndex;
                updatePreview();
            }
        });

        toggleObstacleButton.addEventListener('click', () => {
            this.grid.isPlacingObstacle = !this.grid.isPlacingObstacle;
            toggleObstacleButton.textContent = this.grid.isPlacingObstacle ? 'Obstacle Tile' : 'Normal Tile';
            toggleObstacleButton.style.backgroundColor = this.grid.isPlacingObstacle ? '#c0392b' : '';
        });

        // Update preview when spritesheet loads
        this.grid.sprites.sheet.addEventListener('load', updatePreview);

        // Assemble preview section
        previewSection.appendChild(previewCanvas);
        controlsDiv.appendChild(tileInput);
        controlsDiv.appendChild(toggleObstacleButton);
        previewSection.appendChild(controlsDiv);

        // Add preview section to control panel
        controlPanel.insertBefore(previewSection, controlPanel.firstChild);

        // Add to document
        document.body.appendChild(controlPanel);
        this.controlPanel = controlPanel;
    }

    updateLayoutSelector(selector) {
        const layouts = this.grid.getLayouts();
        selector.innerHTML = '';
        layouts.forEach(layout => {
            const option = document.createElement('option');
            option.value = layout;
            option.textContent = layout;
            if (layout === this.grid.currentLayout) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
    }

    updateControlPanelVisibility(visible) {
        this.controlPanel.style.display = visible ? 'block' : 'none';
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