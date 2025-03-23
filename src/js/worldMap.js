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
            const layoutKey = `isometricGridLayout_${layoutName}`;
            const savedTiles = localStorage.getItem(layoutKey);
            if (savedTiles) {
                const tilesData = JSON.parse(savedTiles);
                tilesData.forEach(tile => {
                    if (tile.nextGrid) {
                        const [fromX, fromY] = tile.key.split(',').map(Number);
                        const [toX, toY] = tile.nextGrid.split(',').map(Number);
                        
                        if (!gridPositions.has(layoutName)) {
                            gridPositions.set(layoutName, { x: fromX, y: fromY });
                        }
                        if (!gridPositions.has(tile.nextGrid)) {
                            gridPositions.set(tile.nextGrid, { x: toX, y: toY });
                        }
                    }
                });
            }
        });

        // Calculate grid boundaries
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        gridPositions.forEach(pos => {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);
        });

        // Add padding
        minX -= 1; maxX += 1; minY -= 1; maxY += 1;

        // Calculate scale
        const mapWidth = 400;
        const mapHeight = 400;
        const scaleX = mapWidth / (maxX - minX);
        const scaleY = mapHeight / (maxY - minY);
        const scale = Math.min(scaleX, scaleY) * 0.8;

        // Draw grids and connections
        gridPositions.forEach((pos, layoutName) => {
            // Create grid node
            const node = document.createElement('div');
            node.style.position = 'absolute';
            node.style.width = '60px';
            node.style.height = '60px';
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

            // Position the node
            const x = (pos.x - minX) * scale + (mapWidth - (maxX - minX) * scale) / 2;
            const y = (pos.y - minY) * scale + (mapHeight - (maxY - minY) * scale) / 2;
            node.style.left = `${x - 30}px`;
            node.style.top = `${y - 30}px`;

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

            this.mapContent.appendChild(node);
        });
    }
} 