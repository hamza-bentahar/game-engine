class IsometricGrid {
    constructor(canvas, nbRows, nbCols) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nbRows = nbRows;
        this.nbCols = nbCols;
        
        // Maintain 2:1 ratio for width:height for isometric tiles
        this.tileWidth = 128
        this.tileHeight = this.tileWidth / 2
        
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
        
        // Add available tiles storage
        this.availableTiles = new Set();

        // Add obstacles storage
        this.obstacles = new Set();
        
        // Spritesheet configuration
        this.sprites = {
            sheet: null,
            isLoaded: false,
            tileWidth: 32,  // Width of each tile in the spritesheet
            tileHeight: 32, // Height of each tile in the spritesheet
            // Define all available tile types and their positions in the spritesheet
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
            default: 'tile37',     // Default tile type
            obstacle: 'tile15',     // Default obstacle type
            customTiles: new Map()  // Store custom tile types for specific positions
        };
        
        // Add current selection state
        this.currentTileType = 37;
        this.isPlacingObstacle = false;
        
        // Load spritesheet
        this.loadSprites();
        
        // Load saved obstacles from localStorage
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
        const { x: screenX, y: screenY } = this.toScreen(x, y);
        const isHovered = this.hoveredTile && this.hoveredTile.x === x && this.hoveredTile.y === y;
        
        if (this.sprites.isLoaded && this.useSprites) {
            // Get tile type for this position
            const tileType = this.getTileAtPosition(x, y);
        
            // Calculate sprite drawing position
            const drawX = screenX - this.tileWidth / 2;
            const drawY = screenY - this.tileHeight - heightOffset;
            
            // Draw the sprite from spritesheet
            this.ctx.drawImage(
                this.sprites.sheet,
                tileType.x,                 // Source X in spritesheet
                tileType.y,                 // Source Y in spritesheet
                this.sprites.tileWidth,     // Source width
                this.sprites.tileHeight,    // Source height
                drawX,                      // Destination X
                drawY,                      // Destination Y
                this.tileWidth,             // Fixed destination width
                this.tileHeight * 2         // Fixed destination height
            );
        } else {
            // Draw geometric shape with height offset
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY - heightOffset);
            this.ctx.lineTo(screenX + this.tileWidth / 2, screenY + this.tileHeight / 2 - heightOffset);
            this.ctx.lineTo(screenX, screenY + this.tileHeight - heightOffset);
            this.ctx.lineTo(screenX - this.tileWidth / 2, screenY + this.tileHeight / 2 - heightOffset);
            this.ctx.closePath();
            
            // Fill tile with hover effect
            const isObstacle = this.obstacles.has(`${x},${y}`);
            let fillColor = isObstacle ? '#c0392b' : '#3498db';
            let strokeColor = isObstacle ? '#922b21' : '#2980b9';
            
            if (isHovered) {
                // Lighten the colors for hover effect
                fillColor = isObstacle ? '#e74c3c' : '#5dade2';
                strokeColor = isObstacle ? '#c0392b' : '#3498db';
                
                // Add glow effect
                this.ctx.shadowColor = isObstacle ? 'rgba(231, 76, 60, 0.5)' : 'rgba(93, 173, 226, 0.5)';
                this.ctx.shadowBlur = 10;
            }
            
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
            
            // Draw outline
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = isHovered ? 2 : 1;
            this.ctx.stroke();
            
            // Reset shadow effects
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.lineWidth = 1;
        }

        if (this.debugMode) {
            // Add coordinates text
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`${x},${y}`, screenX, screenY + this.tileHeight / 2 - heightOffset);
        }
        
        this.availableTiles.add(`${x},${y}`);
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
        this.hoveredTile = this.toGrid(screenX, screenY);
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

    // Save current layout with a name
    saveLayout(name) {
        // Save current obstacles under the layout name
        const layoutKey = `isometricGridLayout_${name}`;
        const obstaclesArray = Array.from(this.obstacles);
        localStorage.setItem(layoutKey, JSON.stringify(obstaclesArray));

        // Update layouts list
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
        const savedObstacles = localStorage.getItem(layoutKey);
        if (savedObstacles) {
            const obstaclesArray = JSON.parse(savedObstacles);
            this.obstacles = new Set(obstaclesArray);
        } else {
            this.obstacles = new Set();
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
        this.obstacles.add(`${x},${y}`);
        this.saveObstacles();
    }
    
    removeObstacle(x, y) {
        this.obstacles.delete(`${x},${y}`);
        this.saveObstacles();
    }
    
    hasObstacle(x, y) {
        return this.obstacles.has(`${x},${y}`);
    }
    
    toggleObstacle(x, y) {
        const key = `${x},${y}`;
        if (this.obstacles.has(key)) {
            this.obstacles.delete(key);
            this.saveObstacles();
            return false; // Obstacle removed
        } else {
            this.obstacles.add(key);
            this.saveObstacles();
            return true; // Obstacle added
        }
    }

    // Set tile type for a specific position
    setTileAtPosition(x, y, tileIndex, isObstacle) {
        const key = `${x},${y}`;
        this.tileTypes.customTiles.set(key, {
            tileIndex: `tile${tileIndex}`,
            isObstacle: isObstacle
        });
        
        if (isObstacle) {
            this.obstacles.add(key);
        } else {
            this.obstacles.delete(key);
        }
        
        this.saveObstacles();
    }

    // Get tile type for a specific position
    getTileAtPosition(x, y) {
        const key = `${x},${y}`;
        const customTile = this.tileTypes.customTiles.get(key);
        if (customTile) {
            return this.sprites.tiles[customTile.tileIndex];
        }
        return this.sprites.tiles[this.obstacles.has(key) ? this.tileTypes.obstacle : this.tileTypes.default];
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