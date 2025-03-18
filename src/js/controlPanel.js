export class ControlPanel {
    constructor(game) {
        this.game = game;
        this.grid = game.grid;
        this.panel = this.createPanel();
    }

    createPanel() {
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
        controlPanel.style.maxHeight = '80vh';
        controlPanel.style.overflowY = 'auto';

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

        // Create tile grid section
        const tileGridSection = document.createElement('div');
        tileGridSection.style.marginBottom = '15px';
        
        // Create tile grid title
        const tileGridTitle = document.createElement('div');
        tileGridTitle.textContent = 'Available Tiles:';
        tileGridTitle.style.marginBottom = '10px';
        tileGridTitle.style.fontWeight = 'bold';
        tileGridSection.appendChild(tileGridTitle);
        
        // Create tile grid container
        const tileGrid = document.createElement('div');
        tileGrid.style.display = 'grid';
        tileGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
        tileGrid.style.gap = '5px';
        tileGrid.style.maxWidth = '300px';
        
        // Create tiles for selection
        const createTileGrid = () => {
            if (!this.grid.sprites.isLoaded) {
                // If sprites aren't loaded yet, wait and try again
                setTimeout(createTileGrid, 100);
                return;
            }
            
            // Clear existing tiles
            tileGrid.innerHTML = '';
            
            // Create a tile for each sprite (0-120)
            for (let i = 0; i <= 120; i++) {
                const tileContainer = document.createElement('div');
                tileContainer.style.position = 'relative';
                tileContainer.style.width = '40px';
                tileContainer.style.height = '40px';
                tileContainer.style.cursor = 'pointer';
                tileContainer.style.border = '1px solid #555';
                tileContainer.style.backgroundColor = '#2c3e50';
                
                // Create canvas for the tile
                const tileCanvas = document.createElement('canvas');
                tileCanvas.width = 40;
                tileCanvas.height = 40;
                
                // Draw the tile
                const ctx = tileCanvas.getContext('2d');
                const tileType = this.grid.sprites.tiles[`tile${i}`];
                
                ctx.drawImage(
                    this.grid.sprites.sheet,
                    tileType.x,
                    tileType.y,
                    this.grid.sprites.tileWidth,
                    this.grid.sprites.tileHeight,
                    0,
                    0,
                    40,
                    40
                );
                
                // Add tile number label
                const tileLabel = document.createElement('div');
                tileLabel.textContent = i;
                tileLabel.style.position = 'absolute';
                tileLabel.style.bottom = '0';
                tileLabel.style.right = '0';
                tileLabel.style.backgroundColor = 'rgba(0,0,0,0.5)';
                tileLabel.style.color = 'white';
                tileLabel.style.fontSize = '10px';
                tileLabel.style.padding = '1px 3px';
                
                // Add selection indicator
                const selectionIndicator = document.createElement('div');
                selectionIndicator.style.position = 'absolute';
                selectionIndicator.style.top = '0';
                selectionIndicator.style.left = '0';
                selectionIndicator.style.width = '100%';
                selectionIndicator.style.height = '100%';
                selectionIndicator.style.border = '2px solid transparent';
                selectionIndicator.style.boxSizing = 'border-box';
                
                // Update selection indicator when current tile changes
                const updateSelection = () => {
                    if (this.grid.currentTileType === i) {
                        selectionIndicator.style.borderColor = '#3498db';
                    } else if (this.grid.tileTypes.obstacle === `tile${i}`) {
                        selectionIndicator.style.borderColor = '#e74c3c';
                    } else if (this.grid.tileTypes.default === `tile${i}`) {
                        selectionIndicator.style.borderColor = '#2ecc71';
                    } else {
                        selectionIndicator.style.borderColor = 'transparent';
                    }
                };
                
                // Initial selection state
                updateSelection();
                
                // Add click event to select this tile
                tileContainer.addEventListener('click', () => {
                    this.grid.currentTileType = i;
                    
                    // Update input field
                    const tileInput = document.getElementById('currentTileInput');
                    if (tileInput) {
                        tileInput.value = i;
                    }
                    
                    // Update all selection indicators
                    document.querySelectorAll('.tile-selection-indicator').forEach(indicator => {
                        indicator.updateSelection();
                    });
                });
                
                // Right-click to set as default or obstacle
                tileContainer.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    
                    // Toggle between default and obstacle
                    if (this.grid.tileTypes.default === `tile${i}`) {
                        this.grid.setTileType('obstacle', i);
                        obstacleTileInput.value = i;
                    } else {
                        this.grid.setTileType('default', i);
                        defaultTileInput.value = i;
                    }
                    
                    // Update all selection indicators
                    document.querySelectorAll('.tile-selection-indicator').forEach(indicator => {
                        indicator.updateSelection();
                    });
                });
                
                // Store the update function for external calls
                selectionIndicator.updateSelection = updateSelection;
                selectionIndicator.className = 'tile-selection-indicator';
                
                tileContainer.appendChild(tileCanvas);
                tileContainer.appendChild(tileLabel);
                tileContainer.appendChild(selectionIndicator);
                tileGrid.appendChild(tileContainer);
            }
        };
        
        // Call the function to create the tile grid
        createTileGrid();
        
        // Update when spritesheet loads
        this.grid.sprites.sheet.addEventListener('load', createTileGrid);
        
        tileGridSection.appendChild(tileGrid);
        
        // Create current tile section
        const currentTileSection = document.createElement('div');
        currentTileSection.style.marginBottom = '15px';
        
        // Current tile label
        const currentTileLabel = document.createElement('div');
        currentTileLabel.textContent = 'Current Tile:';
        currentTileLabel.style.marginBottom = '5px';
        
        // Current tile input
        const currentTileInput = document.createElement('input');
        currentTileInput.id = 'currentTileInput';
        currentTileInput.type = 'number';
        currentTileInput.min = '0';
        currentTileInput.max = '120';
        currentTileInput.value = this.grid.currentTileType;
        currentTileInput.style.width = '60px';
        currentTileInput.style.marginBottom = '10px';
        
        // Toggle obstacle button
        const toggleObstacleButton = document.createElement('button');
        toggleObstacleButton.textContent = 'Normal Tile';
        toggleObstacleButton.style.marginBottom = '10px';
        
        // Add event listeners
        currentTileInput.addEventListener('change', () => {
            const tileIndex = parseInt(currentTileInput.value);
            if (tileIndex >= 0 && tileIndex <= 120) {
                this.grid.currentTileType = tileIndex;
                
                // Update all selection indicators
                document.querySelectorAll('.tile-selection-indicator').forEach(indicator => {
                    indicator.updateSelection();
                });
            }
        });
        
        toggleObstacleButton.addEventListener('click', () => {
            this.grid.isPlacingObstacle = !this.grid.isPlacingObstacle;
            toggleObstacleButton.textContent = this.grid.isPlacingObstacle ? 'Obstacle Tile' : 'Normal Tile';
            toggleObstacleButton.style.backgroundColor = this.grid.isPlacingObstacle ? '#c0392b' : '';
        });
        
        // Assemble current tile section
        currentTileSection.appendChild(currentTileLabel);
        currentTileSection.appendChild(currentTileInput);
        currentTileSection.appendChild(toggleObstacleButton);
        
        // Add sections to control panel
        controlPanel.appendChild(tileGridSection);
        controlPanel.appendChild(currentTileSection);
        controlPanel.appendChild(tileSelectionDiv);
        controlPanel.appendChild(layoutSelect);
        controlPanel.appendChild(newLayoutInput);
        controlPanel.appendChild(buttonsContainer);

        // Add to document
        document.body.appendChild(controlPanel);
        return controlPanel;
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

    setVisibility(visible) {
        this.panel.style.display = visible ? 'block' : 'none';
    }
} 