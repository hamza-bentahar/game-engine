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

        // Create character size section
        const characterSection = document.createElement('div');
        characterSection.style.marginBottom = '15px';
        
        // Character section title
        const characterTitle = document.createElement('div');
        characterTitle.textContent = 'Character Settings:';
        characterTitle.style.marginBottom = '10px';
        characterTitle.style.fontWeight = 'bold';
        characterSection.appendChild(characterTitle);
        
        // Size control
        const sizeLabel = document.createElement('div');
        sizeLabel.textContent = 'Character Size:';
        sizeLabel.style.marginBottom = '5px';
        
        const sizeInput = document.createElement('input');
        sizeInput.type = 'range';
        sizeInput.min = '1';
        sizeInput.max = '4';
        sizeInput.step = '0.1';
        sizeInput.value = this.game.character.scale;
        sizeInput.style.width = '100%';
        sizeInput.style.marginBottom = '5px';
        
        const sizeValue = document.createElement('div');
        sizeValue.textContent = `Size: ${this.game.character.scale}x`;
        sizeValue.style.marginBottom = '10px';
        sizeValue.style.fontSize = '12px';
        
        sizeInput.addEventListener('input', () => {
            const newScale = parseFloat(sizeInput.value);
            this.game.character.scale = newScale;
            sizeValue.textContent = `Size: ${newScale.toFixed(1)}x`;
        });
        
        // Vertical offset control
        const offsetLabel = document.createElement('div');
        offsetLabel.textContent = 'Vertical Offset:';
        offsetLabel.style.marginBottom = '5px';
        
        const offsetInput = document.createElement('input');
        offsetInput.type = 'range';
        offsetInput.min = '0';
        offsetInput.max = '64';
        offsetInput.step = '1';
        offsetInput.value = this.game.character.verticalOffset;
        offsetInput.style.width = '100%';
        offsetInput.style.marginBottom = '5px';
        
        const offsetValue = document.createElement('div');
        offsetValue.textContent = `Offset: ${this.game.character.verticalOffset}px`;
        offsetValue.style.marginBottom = '10px';
        offsetValue.style.fontSize = '12px';
        
        offsetInput.addEventListener('input', () => {
            const newOffset = parseInt(offsetInput.value);
            this.game.character.verticalOffset = newOffset;
            offsetValue.textContent = `Offset: ${newOffset}px`;
        });
        
        // Assemble character section
        characterSection.appendChild(sizeLabel);
        characterSection.appendChild(sizeInput);
        characterSection.appendChild(sizeValue);
        characterSection.appendChild(offsetLabel);
        characterSection.appendChild(offsetInput);
        characterSection.appendChild(offsetValue);

        // Add character section to control panel (at the top)
        controlPanel.appendChild(characterSection);

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
        
        // Create next grid section
        const nextGridSection = document.createElement('div');
        nextGridSection.style.marginBottom = '15px';
        
        // Next grid section title
        const nextGridTitle = document.createElement('div');
        nextGridTitle.textContent = 'Next Grid Settings:';
        nextGridTitle.style.marginBottom = '10px';
        nextGridTitle.style.fontWeight = 'bold';
        nextGridSection.appendChild(nextGridTitle);
        
        // Create description
        const nextGridDescription = document.createElement('div');
        nextGridDescription.textContent = 'Set the next grid for the selected tile (click on a tile to select it):';
        nextGridDescription.style.marginBottom = '10px';
        nextGridDescription.style.fontSize = '12px';
        nextGridSection.appendChild(nextGridDescription);
        
        // Create selected tile display
        const selectedTileDisplay = document.createElement('div');
        selectedTileDisplay.id = 'selected-tile-display';
        selectedTileDisplay.style.marginBottom = '10px';
        selectedTileDisplay.style.fontSize = '14px';
        selectedTileDisplay.style.fontWeight = 'bold';
        selectedTileDisplay.style.color = '#f1c40f';
        selectedTileDisplay.textContent = 'No tile selected';
        nextGridSection.appendChild(selectedTileDisplay);
        
        // Create coordinate inputs container
        const coordInputsContainer = document.createElement('div');
        coordInputsContainer.style.display = 'flex';
        coordInputsContainer.style.alignItems = 'center';
        coordInputsContainer.style.marginBottom = '10px';
        
        // X coordinate input
        const xLabel = document.createElement('div');
        xLabel.textContent = 'X:';
        xLabel.style.marginRight = '5px';
        
        const xInput = document.createElement('input');
        xInput.type = 'number';
        xInput.id = 'nextGridXInput';
        xInput.style.width = '50px';
        xInput.style.marginRight = '10px';
        
        // Y coordinate input
        const yLabel = document.createElement('div');
        yLabel.textContent = 'Y:';
        yLabel.style.marginRight = '5px';
        
        const yInput = document.createElement('input');
        yInput.type = 'number';
        yInput.id = 'nextGridYInput';
        yInput.style.width = '50px';
        
        // Store the selectedTileDisplay and inputs as properties
        this.selectedTileDisplay = selectedTileDisplay;
        this.nextGridXInput = xInput;
        this.nextGridYInput = yInput;
        
        // Assemble coordinate inputs
        coordInputsContainer.appendChild(xLabel);
        coordInputsContainer.appendChild(xInput);
        coordInputsContainer.appendChild(yLabel);
        coordInputsContainer.appendChild(yInput);
        nextGridSection.appendChild(coordInputsContainer);
        
        // Create buttons container
        const nextGridButtonsContainer = document.createElement('div');
        nextGridButtonsContainer.style.display = 'flex';
        nextGridButtonsContainer.style.gap = '5px';
        
        // Set next grid button
        const setNextGridButton = document.createElement('button');
        setNextGridButton.textContent = 'Set Next Grid';
        setNextGridButton.style.backgroundColor = '#f1c40f';
        setNextGridButton.style.color = 'black';
        
        // Clear next grid button
        const clearNextGridButton = document.createElement('button');
        clearNextGridButton.textContent = 'Clear Next Grid';
        
        // Add event listeners
        setNextGridButton.addEventListener('click', () => {
            const x = parseInt(xInput.value);
            const y = parseInt(yInput.value);
            
            if (!isNaN(x) && !isNaN(y) && this.grid.selectedTileKey) {
                const [tileX, tileY] = this.grid.selectedTileKey.split(',').map(Number);
                const nextGridValue = `${x},${y}`;
                this.grid.setNextGrid(tileX, tileY, nextGridValue);
            }
        });
        
        clearNextGridButton.addEventListener('click', () => {
            if (this.grid.selectedTileKey) {
                const [tileX, tileY] = this.grid.selectedTileKey.split(',').map(Number);
                this.grid.setNextGrid(tileX, tileY, null);
                xInput.value = '';
                yInput.value = '';
            }
        });
        
        // Assemble next grid buttons
        nextGridButtonsContainer.appendChild(setNextGridButton);
        nextGridButtonsContainer.appendChild(clearNextGridButton);
        nextGridSection.appendChild(nextGridButtonsContainer);
        
        // Assemble current tile section
        currentTileSection.appendChild(currentTileLabel);
        currentTileSection.appendChild(currentTileInput);
        currentTileSection.appendChild(toggleObstacleButton);
        
        // Add sections to control panel
        controlPanel.appendChild(tileGridSection);
        controlPanel.appendChild(currentTileSection);
        controlPanel.appendChild(nextGridSection);
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

    updateNextGridUI() {
        if (!this.selectedTileDisplay || !this.nextGridXInput || !this.nextGridYInput) {
            return;
        }
        
        if (this.grid.selectedTileKey) {
            const [tileX, tileY] = this.grid.selectedTileKey.split(',').map(Number);
            this.selectedTileDisplay.textContent = `Selected Tile: (${tileX}, ${tileY})`;
            
            // Update input fields with current nextGrid value
            const nextGrid = this.grid.getNextGrid(tileX, tileY);
            if (nextGrid) {
                const [nextX, nextY] = nextGrid.split(',').map(Number);
                this.nextGridXInput.value = nextX;
                this.nextGridYInput.value = nextY;
            } else {
                this.nextGridXInput.value = '';
                this.nextGridYInput.value = '';
            }
        } else {
            this.selectedTileDisplay.textContent = 'No tile selected';
            this.nextGridXInput.value = '';
            this.nextGridYInput.value = '';
        }
    }

    setVisibility(visible) {
        this.panel.style.display = visible ? 'block' : 'none';
    }
} 