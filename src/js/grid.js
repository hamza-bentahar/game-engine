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
        
        // Add hovered tile tracking
        this.hoveredTileKey = null;
        
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
                    y: row * this.sprites.tileHeight
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
            tile = new Tile(x, y, this.tileTypes.default);
            this.tiles.set(tile.getKey(), tile);
        }
        
        tile.setHeightOffset(heightOffset);
        tile.draw(this.ctx, this.startX, this.startY, this.tileWidth, this.tileHeight, this.sprites, this.useSprites, this.debugMode);
    }

    drawTilePattern(nbRows, nbCols, startX, startY, heightOffset = 0) {
        // Loop through rows
        for (let row = 0; row < nbRows + 1; row++) {
            // Calculate starting position for this row
            let rowStartX = startX + row;
            let rowStartY = startY + row;
            
            // Draw tiles in each row
            for (let tile = 0; tile <= nbCols; tile++) {
                let x = rowStartX + tile;
                let y = rowStartY - tile;
                this.drawTile(x, y, heightOffset);
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
        
        // Show calculated grid coordinates
        if (this.hoveredTile) {
            this.ctx.fillText(`Grid: (${this.hoveredTile.x}, ${this.hoveredTile.y})`, mouseX + 15, mouseY + 15);
        }
    }
    
    // Draw the entire grid
    render() {
        // Clear the area where the grid will be drawn
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const totalRows = 23;
        const maxColumns = 23;
        const midPoint = Math.ceil(totalRows / 2);
    
        // First half - expanding diamond with column limit
        for (let i = 1; i <= midPoint; i++) {
            // Calculate the width for this row (before applying limit)
            const width = Math.min(i, Math.floor(maxColumns / 2));
            
            for (let j = -width; j <= width; j++) {
                // Create tile if it doesn't exist
                const key = `${i},${j}`;
                if (!this.tiles.has(key)) {
                    this.tiles.set(key, new Tile(i, j, this.tileTypes.default));
                }
                this.drawTile(i, j);
            }
        }
    
        // Second half - contracting diamond (only if there are more than midPoint rows)
        if (totalRows > midPoint) {
            const remainingRows = totalRows - midPoint;
            for (let i = remainingRows; i >= 1; i--) {
                // For the second half rows (midPoint+1 to totalRows)
                const rowNum = totalRows - i + 1;
                
                // Calculate the width for this row (before applying limit)
                const width = Math.min(i, Math.floor(maxColumns / 2));
                
                for (let j = -width; j <= width; j++) {
                    // Create tile if it doesn't exist
                    const key = `${rowNum},${j}`;
                    if (!this.tiles.has(key)) {
                        this.tiles.set(key, new Tile(rowNum, j, this.tileTypes.default));
                    }
                    this.drawTile(rowNum, j);
                }
            }
        }
        
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
        } else {
            this.hoveredTileKey = null;
        }
    }

    // Toggle debug mode
    toggleDebug() {
        this.debugMode = !this.debugMode;
    }

    // Toggle edit mode
    toggleEditMode() {
        this.editMode = !this.editMode;
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
            isObstacle: tile.isObstacle
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
            tilesData.forEach(({key, tileType, isObstacle}) => {
                const [x, y] = key.split(',').map(Number);
                this.tiles.set(key, new Tile(x, y, tileType, isObstacle));
            });
        }
        
        this.currentLayout = name;
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
            tile = new Tile(x, y, this.tileTypes.obstacle, true);
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
            tile = new Tile(x, y, this.tileTypes.obstacle, true);
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
            tile = new Tile(x, y, `tile${tileIndex}`, isObstacle);
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
}

export { IsometricGrid };