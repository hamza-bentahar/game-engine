class WorldMap {
    constructor(game) {
        this.game = game;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isVisible = false;
        this.gridSize = 60; // Size of each grid cell in the map
        this.padding = 20;  // Padding around the map
        this.grids = new Map(); // Map to store grid information: key = "x,y", value = { name, type }
        this.currentGridX = 0;
        this.currentGridY = 0;
        
        this.setupCanvas();
    }
    
    setupCanvas() {
        // Set up the canvas for the world map
        this.canvas.id = 'worldMapCanvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '50%';
        this.canvas.style.left = '50%';
        this.canvas.style.transform = 'translate(-50%, -50%)';
        this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        this.canvas.style.border = '2px solid #f1c40f';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.boxShadow = '0 0 20px rgba(241, 196, 15, 0.5)';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.display = 'none';
        
        // Adjust canvas size based on viewport
        this.updateCanvasSize();
        
        // Add to body
        document.body.appendChild(this.canvas);
        
        // Add close button
        this.addCloseButton();
    }
    
    updateCanvasSize() {
        this.canvas.width = Math.min(window.innerWidth * 0.8, 800);
        this.canvas.height = Math.min(window.innerHeight * 0.8, 600);
    }
    
    addCloseButton() {
        const closeButton = document.createElement('div');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '15px';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '24px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.cursor = 'pointer';
        closeButton.style.zIndex = '1001';
        closeButton.style.display = 'none';
        closeButton.id = 'worldMapCloseButton';
        
        closeButton.addEventListener('click', () => {
            this.hide();
        });
        
        document.body.appendChild(closeButton);
        this.closeButton = closeButton;
    }
    
    // Add a grid to the world map
    addGrid(x, y, name, type = 'normal') {
        this.grids.set(`${x},${y}`, { name, type });
    }
    
    // Set the current grid of the player
    setCurrentGrid(x, y) {
        this.currentGridX = x;
        this.currentGridY = y;
    }
    
    // Toggle visibility of the world map
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    // Show the world map
    show() {
        this.isVisible = true;
        this.canvas.style.display = 'block';
        this.closeButton.style.display = 'block';
        this.render();
    }
    
    // Hide the world map
    hide() {
        this.isVisible = false;
        this.canvas.style.display = 'none';
        this.closeButton.style.display = 'none';
    }
    
    // Calculate the center position for rendering
    calculateCenter() {
        // Find min and max coordinates
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        if (this.grids.size === 0) {
            // If no grids, use current grid only
            minX = maxX = this.currentGridX || 0;
            minY = maxY = this.currentGridY || 0;
        } else {
            // Find boundaries from all grids
            for (const [key] of this.grids) {
                const [x, y] = key.split(',').map(Number);
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
            
            // Ensure current grid is included in boundaries
            if (this.currentGridX !== undefined && this.currentGridY !== undefined) {
                minX = Math.min(minX, this.currentGridX);
                minY = Math.min(minY, this.currentGridY);
                maxX = Math.max(maxX, this.currentGridX);
                maxY = Math.max(maxY, this.currentGridY);
            }
        }
        
        // Calculate dimensions
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        
        // Calculate center coordinates
        const centerX = this.canvas.width / 2 - (width * this.gridSize / 2);
        const centerY = this.canvas.height / 2 - (height * this.gridSize / 2);
        
        return { minX, minY, maxX, maxY, centerX, centerY };
    }
    
    // Render the world map
    render() {
        if (!this.isVisible) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate center for rendering
        const { minX, minY, centerX, centerY } = this.calculateCenter();
        
        // Draw title
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('World Map', this.canvas.width / 2, 30);
        
        // Draw grid coordinates
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw all grids
        if (this.grids.size > 0) {
            for (const [key, gridInfo] of this.grids) {
                const [x, y] = key.split(',').map(Number);
                
                // Calculate position on canvas
                const posX = centerX + (x - minX) * this.gridSize;
                const posY = centerY + (y - minY) * this.gridSize;
                
                // Draw grid cell
                this.ctx.fillStyle = this.getGridColor(gridInfo.type);
                this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
                
                // Draw grid border
                this.ctx.strokeStyle = '#34495e';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
                
                // Add grid name
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(gridInfo.name, posX + this.gridSize / 2, posY + this.gridSize / 2);
            }
        }
        
        // Always draw current grid (even if not added to the map yet)
        if (this.currentGridX !== undefined && this.currentGridY !== undefined) {
            const posX = centerX + (this.currentGridX - minX) * this.gridSize;
            const posY = centerY + (this.currentGridY - minY) * this.gridSize;
            
            // Draw current grid indicator
            this.ctx.strokeStyle = '#f1c40f'; // Yellow highlight
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
            
            // Add player indicator
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.beginPath();
            this.ctx.arc(posX + this.gridSize / 2, posY + this.gridSize / 2, 10, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add "YOU ARE HERE" label
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText("YOU ARE HERE", posX + this.gridSize / 2, posY + this.gridSize + 15);
        }
        
        // Draw instructions
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#bdc3c7';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Press 'M' to close the map", this.canvas.width / 2, this.canvas.height - 20);
    }
    
    // Get color for different grid types
    getGridColor(type) {
        switch (type) {
            case 'town':
                return '#27ae60'; // Green for towns
            case 'dungeon':
                return '#c0392b'; // Red for dungeons
            case 'special':
                return '#8e44ad'; // Purple for special areas
            default:
                return '#2980b9'; // Blue for normal areas
        }
    }
    
    // Scan all grids in the game to create a map
    scanGrids() {
        // This would be implemented when we have information about all available grids
        // For now, we'll manually add grids in the game.js
    }
}

export { WorldMap }; 