export class WorldMap {
    constructor(game) {
        this.game = game;
        this.grid = game.grid;
        this.isVisible = false;
        this.createMapOverlay();
        this.setupKeyboardShortcut();
    }

    createMapOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'world-map-overlay';
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.overlay.style.display = 'none';
        this.overlay.style.zIndex = '1000';
        this.overlay.style.color = 'white';
        this.overlay.style.fontFamily = 'Arial, sans-serif';

        // Create map container
        this.mapContainer = document.createElement('div');
        this.mapContainer.style.position = 'absolute';
        this.mapContainer.style.top = '50%';
        this.mapContainer.style.left = '50%';
        this.mapContainer.style.transform = 'translate(-50%, -50%)';
        this.mapContainer.style.padding = '20px';
        this.mapContainer.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
        this.mapContainer.style.borderRadius = '10px';

        // Add title
        const title = document.createElement('h2');
        title.textContent = 'World Map';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        this.mapContainer.appendChild(title);

        // Add map content container
        this.mapContent = document.createElement('div');
        this.mapContent.style.position = 'relative';
        this.mapContent.style.width = '400px';
        this.mapContent.style.height = '400px';
        this.mapContent.style.border = '2px solid #666';
        this.mapContent.style.backgroundColor = '#222';
        this.mapContainer.appendChild(this.mapContent);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close (M)';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = '#444';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => this.hide();
        this.mapContainer.appendChild(closeButton);

        this.overlay.appendChild(this.mapContainer);
        document.body.appendChild(this.overlay);
    }

    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'm') {
                if (this.isVisible) {
                    this.hide();
                } else {
                    this.show();
                }
            }
        });
    }

    show() {
        this.isVisible = true;
        this.overlay.style.display = 'block';
        this.updateMap();
    }

    hide() {
        this.isVisible = false;
        this.overlay.style.display = 'none';
    }

    updateMap() {
        this.mapContent.innerHTML = '';
        const layouts = this.grid.getLayouts();
        const gridPositions = new Map();

        // Get all grid positions from localStorage
        layouts.forEach(layoutName => {
            const [x, y] = layoutName.split(',').map(Number);
            gridPositions.set(layoutName, { x, y });
        });

        // Calculate grid boundaries
        let minX = -10, maxX = 10;  // Allow for 20x20 grid centered at 0,0
        let minY = -10, maxY = 10;

        // Calculate scale to fit in map
        const mapWidth = 400;
        const mapHeight = 400;
        const gridWidth = maxX - minX + 1;
        const gridHeight = maxY - minY + 1;
        const scaleX = mapWidth / gridWidth;
        const scaleY = mapHeight / gridHeight;
        const scale = Math.min(scaleX, scaleY) * 0.8; // 0.8 to leave some margin

        // Calculate center position
        const centerX = mapWidth / 2;
        const centerY = mapHeight / 2;

        // Draw grids and connections
        gridPositions.forEach((pos, layoutName) => {
            // Create grid node
            const node = document.createElement('div');
            node.style.position = 'absolute';
            node.style.width = '40px';
            node.style.height = '40px';
            node.style.backgroundColor = layoutName === this.grid.currentLayout ? '#4CAF50' : '#666';
            node.style.border = '2px solid #888';
            node.style.borderRadius = '5px';
            node.style.display = 'flex';
            node.style.alignItems = 'center';
            node.style.justifyContent = 'center';
            node.style.fontSize = '12px';
            node.style.textAlign = 'center';
            node.style.cursor = 'pointer';
            node.style.transition = 'background-color 0.3s';
            node.textContent = layoutName;

            // Position the node relative to center
            // Multiply by scale and add center position
            const x = centerX + (pos.x * 50); // 50px spacing between nodes
            const y = centerY + (pos.y * 50);
            
            node.style.left = `${x - 20}px`; // -20 to center the 40px wide node
            node.style.top = `${y - 20}px`;

            // Add hover effect
            node.onmouseover = () => {
                if (layoutName !== this.grid.currentLayout) {
                    node.style.backgroundColor = '#888';
                }
            };
            node.onmouseout = () => {
                if (layoutName !== this.grid.currentLayout) {
                    node.style.backgroundColor = '#666';
                }
            };

            // Draw connection lines to adjacent grids
            const adjacentPositions = [
                {x: pos.x + 1, y: pos.y}, // right
                {x: pos.x - 1, y: pos.y}, // left
                {x: pos.x, y: pos.y + 1}, // down
                {x: pos.x, y: pos.y - 1}  // up
            ];

            adjacentPositions.forEach(adjPos => {
                const adjLayoutName = `${adjPos.x},${adjPos.y}`;
                if (gridPositions.has(adjLayoutName)) {
                    const line = document.createElement('div');
                    line.style.position = 'absolute';
                    line.style.backgroundColor = '#888';
                    line.style.width = '2px';
                    line.style.height = '50px';
                    line.style.left = `${x}px`;
                    line.style.top = `${y}px`;
                    line.style.transformOrigin = 'top';
                    
                    // Calculate angle based on direction
                    const dx = adjPos.x - pos.x;
                    const dy = adjPos.y - pos.y;
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    line.style.transform = `rotate(${angle}deg)`;
                    
                    this.mapContent.appendChild(line);
                }
            });

            this.mapContent.appendChild(node);
        });
    }
} 