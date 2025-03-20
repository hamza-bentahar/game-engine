import { Tile } from './tile.js';

class IsometricGrid {
    constructor(canvas, nbRows, nbCols) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nbRows = nbRows;
        this.nbCols = nbCols;
        
        // Maintain 2:1 ratio for width:height for isometric tiles
        this.tileWidth = 128;
        this.tileHeight = this.tileWidth / 2;
        
        // Starting position
        this.startX = -1;
        this.startY = -1;
        
        // Add debug state
        this.debugMode = false;
        this.debugInfo = {
            mouseX: 0,
            mouseY: 0,
            hoveredTile: null
        };

        // Add edit mode state
        this.editMode = false;
        this.currentLayout = 'default';
        
        // Add sprite toggle state
        this.useSprites = true;
        
        // Add tiles storage
        this.tiles = new Map();
        console.log(this.tiles);
        
        // Add hovered tile tracking
        this.hoveredTileKey = null;
        
        // Add selected tile for nextGrid editing
        this.selectedTileKey = null;
        
        // Spritesheet configuration
        this.sprites = {
            sheet: null,
            isLoaded: false,
            tileWidth: 32,
            tileHeight: 32,
            tiles: {}
        };

        // Initialize tile positions from the 11x11 grid
        for (let row = 0; row < 11; row++) {
            for (let col = 0; col < 11; col++) {
                const tileIndex = row * 11 + col;
                this.sprites.tiles[`tile${tileIndex}`] = {
                    x: col * this.sprites.tileWidth,
                    y: row * this.sprites.tileHeight,
                    isObstacle: false
                };
            }
        }

        // Tile type configuration
        this.tileTypes = {
            default: 'tile37',
            obstacle: 'tile15'
        };
        
        // Add current selection state
        this.currentTileType = 37;
        
        // Load spritesheet
        this.loadSprites();
        
        // Load saved layout from localStorage
        this.loadLayout('default');
        
        // Create sprite toggle button
        this.createSpriteToggle();
    }
    
    // Load sprite images
    loadSprites() {
        // Create and load the spritesheet
        this.sprites.sheet = new Image();
        this.sprites.sheet.onload = () => {
            this.sprites.isLoaded = true;
        };
        this.sprites.sheet.src = 'assets/tileset.png'; // Your 32x32 spritesheet
    }
    
    // Convert isometric coordinates to screen coordinates
    toScreen(x, y) {
        return {
            x: this.startX + (x - y) * this.tileWidth / 2,
            y: this.startY + (x + y) * this.tileHeight / 2
        };
    }
    
    // Draw a single isometric tile
    drawTile(x, y, heightOffset = 0) {
        let tile = this.tiles.get(`${x},${y}`);
        if (!tile) {
            tile = new Tile(x, y, this.tileTypes.default, false, null);
            this.tiles.set(`${x},${y}`, tile);
        }
        
        tile.setHeightOffset(heightOffset);
        tile.draw(this.ctx, this.startX, this.startY, this.tileWidth, this.tileHeight, this.sprites, this.useSprites, this.debugMode);
    }

    drawTilePattern(totalRows, maxColumns, heightOffset = 0) {
        const midPoint = Math.ceil(totalRows / 2);
    
        // First half - expanding diamond with column limit
        for (let i = 0; i <= midPoint; i++) {
            // Calculate the width for this row (before applying limit)
            const width = Math.min(i, Math.floor(maxColumns / 2));
            
            for (let j = -width; j <= width; j++) {
                // Create tile if it doesn't exist
                const key = `${i},${j}`;
                if (!this.tiles.has(key)) {
                    this.tiles.set(key, new Tile(i, j, this.tileTypes.default, false, null));
                }
                this.drawTile(i, j);
            }
        }
    
        // Second half - contracting diamond (only if there are more than midPoint rows)
        if (totalRows > midPoint) {
            const remainingRows = totalRows - midPoint;
            for (let i = remainingRows; i >= 0; i--) {
                // For the second half rows (midPoint+1 to totalRows)
                const rowNum = totalRows - i + 1;
                
                // Calculate the width for this row (before applying limit)
                const width = Math.min(i, Math.floor(maxColumns / 2));
                
                for (let j = -width; j <= width; j++) {
                    // Create tile if it doesn't exist
                    const key = `${rowNum},${j}`;
                    if (!this.tiles.has(key)) {
                        this.tiles.set(key, new Tile(rowNum, j, this.tileTypes.default, false, null));
                    }
                    this.drawTile(rowNum, j);
                }
            }
        }
    }
    
    // Draw debug information
    drawDebug() {
        const { mouseX, mouseY } = this.debugInfo;
        
        // Draw crosshair at mouse position
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 1;
        
        // Horizontal line
        this.ctx.moveTo(mouseX - 10, mouseY);
        this.ctx.lineTo(mouseX + 10, mouseY);
        
        // Vertical line
        this.ctx.moveTo(mouseX, mouseY - 10);
        this.ctx.lineTo(mouseX, mouseY + 10);
        this.ctx.stroke();
        
        // Draw coordinates text
        this.ctx.font = '12px monospace';
        this.ctx.fillStyle = 'red';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        // Show screen coordinates
        this.ctx.fillText(`Screen: (${Math.round(mouseX)}, ${Math.round(mouseY)})`, mouseX + 15, mouseY);
        
        // Show calculated grid coordinates and nextGrid if available
        if (this.hoveredTile) {
            this.ctx.fillText(`Grid: (${this.hoveredTile.x}, ${this.hoveredTile.y})`, mouseX + 15, mouseY + 15);
            
            // Show nextGrid value if it exists
            const nextGrid = this.getNextGrid(this.hoveredTile.x, this.hoveredTile.y);
            if (nextGrid) {
                this.ctx.fillText(`Next Grid: ${nextGrid}`, mouseX + 15, mouseY + 30);
            }
        }
    }
    
    // Draw the entire grid
    render() {
        // Clear the area where the grid will be drawn
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawTilePattern(this.nbRows, this.nbCols);
        
        // Draw debug visualization if debug mode is on
        if (this.debugMode) {
            this.drawDebug();
        }

        // Draw edit mode UI if edit mode is on
        this.drawEditModeUI();
    }
    
    // Update grid properties (for resizing, etc.)
    updateDimensions() {
        const maxTileWidth = this.canvas.width / this.nbCols;
        const maxTileHeight = this.canvas.height / this.nbRows;
        
        this.tileWidth = Math.min(maxTileWidth, maxTileHeight * 2);
        this.tileHeight = this.tileWidth / 2;
    }

    // Add method to convert screen coordinates to grid coordinates
    toGrid(screenX, screenY) {
        // Adjust coordinates relative to grid start position
        // Subtract half tile height to account for the tile's center point
        const relX = screenX - this.startX;
        const relY = screenY - this.startY - this.tileHeight / 2;

        // Convert to isometric coordinates
        const x = (relX / (this.tileWidth / 2) + relY / (this.tileHeight / 2)) / 2;
        const y = (relY / (this.tileHeight / 2) - relX / (this.tileWidth / 2)) / 2;

        return {
            x: Math.round(x),
            y: Math.round(y)
        };
    }

    // Update hover state
    updateHover(screenX, screenY) {
        this.debugInfo.mouseX = screenX;
        this.debugInfo.mouseY = screenY;
        
        // Update previous hovered tile
        if (this.hoveredTileKey) {
            const prevTile = this.tiles.get(this.hoveredTileKey);
            if (prevTile) {
                prevTile.setHovered(false);
            }
        }
        
        // Get new hovered tile
        const gridPos = this.toGrid(screenX, screenY);
        this.hoveredTile = gridPos;
        
        // Update new hovered tile
        const newTileKey = `${gridPos.x},${gridPos.y}`;
        const newTile = this.tiles.get(newTileKey);
        if (newTile) {
            newTile.setHovered(true);
            this.hoveredTileKey = newTileKey;
            
            // Show visual indicator for nextGrid if available
            const nextGrid = this.getNextGrid(gridPos.x, gridPos.y);
            if (nextGrid) {
                // Display a small arrow or indicator for tiles with nextGrid
                const indicatorElement = document.getElementById('nextgrid-indicator');
                if (!indicatorElement) {
                    const newIndicator = document.createElement('div');
                    newIndicator.id = 'nextgrid-indicator';
                    newIndicator.style.position = 'absolute';
                    newIndicator.style.fontSize = '12px';
                    newIndicator.style.color = 'yellow';
                    newIndicator.style.textShadow = '0 0 3px black';
                    newIndicator.style.pointerEvents = 'none';
                    newIndicator.style.zIndex = '9999';
                    document.body.appendChild(newIndicator);
                }
                
                const indicator = document.getElementById('nextgrid-indicator');
                // Get the screen coordinates of the tile
                const tilePos = this.toScreen(gridPos.x, gridPos.y);
                indicator.style.left = `${tilePos.x}px`;
                indicator.style.top = `${tilePos.y - 20}px`; // Position above the tile
                indicator.textContent = `→ ${nextGrid}`;
                indicator.style.display = 'block';
            } else {
                // Hide the indicator if no nextGrid
                const indicator = document.getElementById('nextgrid-indicator');
                if (indicator) {
                    indicator.style.display = 'none';
                }
            }
            
            if (this.hoveredTile.isRight) {
                console.log('hovered right tile');
                // Display a big arrow pointing to the right at the tile position
                const arrowElement = document.createElement('div');
                arrowElement.textContent = '➡️';
                arrowElement.style.position = 'absolute';
                
                // Get the screen coordinates of the tile
                const tilePos = this.toScreen(gridPos.x, gridPos.y);
                arrowElement.style.left = `${tilePos.x}px`;
                arrowElement.style.top = `${tilePos.y - 40}px`; // Position slightly above the tile
                
                arrowElement.style.fontSize = '40px';
                arrowElement.style.color = 'white';
                arrowElement.style.textShadow = '0 0 10px black';
                arrowElement.style.zIndex = '9999';
                arrowElement.style.pointerEvents = 'none'; // Make it non-interactive
                
                // Remove any existing arrows first
                const existingArrow = document.getElementById('direction-arrow');
                if (existingArrow) {
                    existingArrow.remove();
                }
                
                arrowElement.id = 'direction-arrow';
                document.body.appendChild(arrowElement);
            } else {
                const existingArrow = document.getElementById('direction-arrow');
                if (existingArrow) {
                    existingArrow.remove();
                }
            }
        } else {
            this.hoveredTileKey = null;
            
            // Hide the nextGrid indicator
            const indicator = document.getElementById('nextgrid-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }

    // Toggle debug mode
    toggleDebug() {
        this.debugMode = !this.debugMode;
    }

    // Toggle edit mode
    toggleEditMode() {
        this.editMode = !this.editMode;
        
        // Reset selected tile when exiting edit mode
        if (!this.editMode) {
            this.selectedTileKey = null;
            
            // Hide the selected tile indicator
            const indicator = document.getElementById('selected-tile-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
        
        return this.editMode;
    }

    // Get list of available layouts
    getLayouts() {
        const layouts = localStorage.getItem('isometricGridLayouts');
        return layouts ? JSON.parse(layouts) : ['default'];
    }

    // Save current layout
    saveLayout(name) {
        const layoutKey = `isometricGridLayout_${name}`;
        const tilesData = Array.from(this.tiles.entries()).map(([key, tile]) => ({
            key,
            tileType: tile.tileType,
            isObstacle: tile.isObstacle,
            nextGrid: tile.nextGrid
        }));
        localStorage.setItem(layoutKey, JSON.stringify(tilesData));

        const layouts = this.getLayouts();
        if (!layouts.includes(name)) {
            layouts.push(name);
            localStorage.setItem('isometricGridLayouts', JSON.stringify(layouts));
        }

        this.currentLayout = name;
    }

    // Load a specific layout
    loadLayout(name) {
        const layoutKey = `isometricGridLayout_${name}`;
        const savedTiles = localStorage.getItem(layoutKey);
        this.tiles.clear();
        
        if (savedTiles) {
            const tilesData = JSON.parse(savedTiles);
            tilesData.forEach(({key, tileType, isObstacle, nextGrid}) => {
                const [x, y] = key.split(',').map(Number);
                this.tiles.set(key, new Tile(x, y, tileType, isObstacle, nextGrid));
            });
        } else {
            // If the layout doesn't exist, create a new empty layout
            console.log(`Creating new layout: ${name}`);
            this.createEmptyLayout(name);
        }
        
        this.currentLayout = name;
    }

    // Create a new empty layout
    createEmptyLayout(name) {
        // Create a basic grid pattern
        const totalRows = 11;
        const maxColumns = 11;
        
        // Create a diamond pattern of tiles
        for (let i = 0; i <= totalRows; i++) {
            const width = Math.min(i, Math.floor(maxColumns / 2));
            
            for (let j = -width; j <= width; j++) {
                const key = `${i},${j}`;
                this.tiles.set(key, new Tile(i, j, this.tileTypes.default, false, null));
            }
        }
        
        // Save the new layout
        this.saveLayout(name);
    }

    // Delete a layout
    deleteLayout(name) {
        if (name === 'default') return false; // Prevent deleting default layout
        
        // Remove layout from storage
        const layoutKey = `isometricGridLayout_${name}`;
        localStorage.removeItem(layoutKey);

        // Update layouts list
        const layouts = this.getLayouts();
        const index = layouts.indexOf(name);
        if (index > -1) {
            layouts.splice(index, 1);
            localStorage.setItem('isometricGridLayouts', JSON.stringify(layouts));
        }

        // If current layout was deleted, switch to default
        if (this.currentLayout === name) {
            this.loadLayout('default');
        }

        return true;
    }

    // Save obstacles to current layout
    saveObstacles() {
        this.saveLayout(this.currentLayout);
    }

    // Draw edit mode UI
    drawEditModeUI() {
        if (!this.editMode) return;

        const padding = 10;
        const fontSize = 14;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(padding, padding, 200, 30);
        
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Current Layout: ${this.currentLayout}`, padding + 5, padding + 15);
    }

    addObstacle(x, y) {
        const key = `${x},${y}`;
        let tile = this.tiles.get(key);
        if (!tile) {
            tile = new Tile(x, y, this.tileTypes.obstacle, true, null);
        } else {
            tile.setTileType(this.tileTypes.obstacle);
            tile.isObstacle = true;
        }
        this.tiles.set(key, tile);
        this.saveObstacles();
    }
    
    removeObstacle(x, y) {
        const key = `${x},${y}`;
        let tile = this.tiles.get(key);
        if (tile) {
            tile.setTileType(this.tileTypes.default);
            tile.isObstacle = false;
            this.tiles.set(key, tile);
            this.saveObstacles();
        }
    }
    
    hasObstacle(x, y) {
        const tile = this.tiles.get(`${x},${y}`);
        return tile ? tile.isObstacle : false;
    }
    
    toggleObstacle(x, y) {
        const key = `${x},${y}`;
        let tile = this.tiles.get(key);
        if (!tile) {
            tile = new Tile(x, y, this.tileTypes.obstacle, true, null);
        } else {
            tile.isObstacle = !tile.isObstacle;
            tile.setTileType(tile.isObstacle ? this.tileTypes.obstacle : this.tileTypes.default);
        }
        this.tiles.set(key, tile);
        this.saveObstacles();
        return tile.isObstacle;
    }

    // Set tile type for a specific position
    setTileAtPosition(x, y, tileIndex, isObstacle = false) {
        const key = `${x},${y}`;
        let tile = this.tiles.get(key);
        if (!tile) {
            tile = new Tile(x, y, `tile${tileIndex}`, isObstacle, null);
        } else {
            tile.setTileType(`tile${tileIndex}`);
            tile.isObstacle = isObstacle;
        }
        this.tiles.set(key, tile);
        this.saveObstacles();
    }

    // Get tile type for a specific position
    getTileAtPosition(x, y) {
        const tile = this.tiles.get(`${x},${y}`);
        return tile ? tile.tileType : this.tileTypes.default;
    }

    // Create sprite toggle button
    createSpriteToggle() {
        const button = document.createElement('button');
        button.textContent = 'Toggle Sprites';
        button.style.position = 'absolute';
        button.style.right = '20px';
        button.style.bottom = '20px';
        button.style.padding = '10px';
        button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        
        button.addEventListener('click', () => {
            this.useSprites = !this.useSprites;
            button.textContent = this.useSprites ? 'Show Simple Tiles' : 'Show Sprites';
        });
        
        document.body.appendChild(button);
    }

    // Set the nextGrid property for a specific position
    setNextGrid(x, y, nextGridValue) {
        const key = `${x},${y}`;
        let tile = this.tiles.get(key);
        if (!tile) {
            tile = new Tile(x, y, this.tileTypes.default, false, nextGridValue);
        } else {
            tile.nextGrid = nextGridValue;
        }
        this.tiles.set(key, tile);
        this.saveObstacles();
    }

    // Get the nextGrid property for a specific position
    getNextGrid(x, y) {
        const tile = this.tiles.get(`${x},${y}`);
        return tile ? tile.nextGrid : null;
    }

    // Set tile type for default or obstacle
    setTileType(tileTypeKey, tileIndex) {
        if (tileTypeKey === 'default' || tileTypeKey === 'obstacle') {
            this.tileTypes[tileTypeKey] = `tile${tileIndex}`;
        }
    }
}

export { IsometricGrid };