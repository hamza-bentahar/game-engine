class Tile {
    constructor(x, y, tileType = 'default', isObstacle = false) {
        this.x = x;
        this.y = y;
        this.tileType = tileType;
        this.isObstacle = isObstacle;
        this.heightOffset = 0;
        this.isHovered = false;
    }

    // Convert tile coordinates to screen coordinates
    toScreen(startX, startY, tileWidth, tileHeight) {
        return {
            x: startX + (this.x - this.y) * tileWidth / 2,
            y: startY + (this.x + this.y) * tileHeight / 2
        };
    }

    // Draw the tile
    draw(ctx, startX, startY, tileWidth, tileHeight, sprites, useSprites, debugMode = false) {
        const { x: screenX, y: screenY } = this.toScreen(startX, startY, tileWidth, tileHeight);
        
        if (useSprites && sprites.isLoaded) {
            const tileSprite = sprites.tiles[this.tileType];
            if (!tileSprite) return;

            const drawX = screenX - tileWidth / 2;
            const drawY = screenY - tileHeight - this.heightOffset;
            
            ctx.drawImage(
                sprites.sheet,
                tileSprite.x,
                tileSprite.y,
                sprites.tileWidth,
                sprites.tileHeight,
                drawX,
                drawY,
                tileWidth,
                tileHeight * 2
            );
        } else {
            // Draw geometric shape
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - this.heightOffset);
            ctx.lineTo(screenX + tileWidth / 2, screenY + tileHeight / 2 - this.heightOffset);
            ctx.lineTo(screenX, screenY + tileHeight - this.heightOffset);
            ctx.lineTo(screenX - tileWidth / 2, screenY + tileHeight / 2 - this.heightOffset);
            ctx.closePath();
            
            // Fill tile with hover effect
            let fillColor = this.isObstacle ? '#c0392b' : '#3498db';
            let strokeColor = this.isObstacle ? '#922b21' : '#2980b9';
            
            if (this.isHovered) {
                // Lighten the colors for hover effect
                fillColor = this.isObstacle ? '#e74c3c' : '#5dade2';
                strokeColor = this.isObstacle ? '#c0392b' : '#3498db';
                
                // Add glow effect
                ctx.shadowColor = this.isObstacle ? 'rgba(231, 76, 60, 0.5)' : 'rgba(93, 173, 226, 0.5)';
                ctx.shadowBlur = 10;
            }
            
            ctx.fillStyle = fillColor;
            ctx.fill();
            
            // Draw outline
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = this.isHovered ? 2 : 1;
            ctx.stroke();
            
            // Reset shadow effects
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
        }

        if (debugMode) {
            // Add coordinates text
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${this.x},${this.y}`, screenX, screenY + tileHeight / 2 - this.heightOffset);
        }
    }

    // Set tile type
    setTileType(tileType) {
        this.tileType = tileType;
    }

    // Toggle obstacle state
    toggleObstacle() {
        this.isObstacle = !this.isObstacle;
        return this.isObstacle;
    }

    // Set height offset
    setHeightOffset(offset) {
        this.heightOffset = offset;
    }

    // Set hover state
    setHovered(hovered) {
        this.isHovered = hovered;
    }

    // Get string key for storage
    getKey() {
        return `${this.x},${this.y}`;
    }
}

export { Tile };