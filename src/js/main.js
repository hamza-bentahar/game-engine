import { IsometricGame } from './game.js';

// Initialize game when window loads
window.addEventListener('load', () => {
    const game = new IsometricGame();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        game.resize();
    });
});