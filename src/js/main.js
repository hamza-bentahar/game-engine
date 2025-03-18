import { IsometricGame } from './game.js';

class CharacterSelection {
    constructor() {
        this.selectedCharacter = null;
        this.characterName = '';
        this.characterOptions = document.querySelectorAll('.character-option');
        this.startButton = document.getElementById('startGame');
        this.characterSelection = document.getElementById('characterSelection');
        this.gameCanvas = document.getElementById('gameCanvas');
        
        this.init();
    }

    init() {
        // Create name input section
        const nameSection = document.createElement('div');
        nameSection.className = 'name-section';
        nameSection.style.marginBottom = '20px';
        nameSection.style.textAlign = 'center';

        const nameLabel = document.createElement('label');
        nameLabel.htmlFor = 'characterName';
        nameLabel.textContent = 'Character Name:';
        nameLabel.style.display = 'block';
        nameLabel.style.marginBottom = '5px';
        nameLabel.style.color = '#333';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'characterName';
        nameInput.placeholder = 'Enter your character\'s name';
        nameInput.maxLength = 20;
        nameInput.style.padding = '8px';
        nameInput.style.fontSize = '16px';
        nameInput.style.borderRadius = '4px';
        nameInput.style.border = '1px solid #ccc';
        nameInput.style.width = '200px';
        nameInput.style.textAlign = 'center';

        // Add input event listener
        nameInput.addEventListener('input', (e) => {
            this.characterName = e.target.value.trim();
            this.updateStartButton();
        });

        nameSection.appendChild(nameLabel);
        nameSection.appendChild(nameInput);

        // Insert name section before the character grid
        const characterGrid = document.querySelector('.character-grid');
        this.characterSelection.insertBefore(nameSection, characterGrid);

        this.characterOptions.forEach(option => {
            option.addEventListener('click', () => this.selectCharacter(option));
        });

        this.startButton.addEventListener('click', () => this.startGame());
        
        // Initially disable start button
        this.startButton.classList.remove('active');
        this.startButton.disabled = true;
    }

    selectCharacter(option) {
        // Remove selected class from all options
        this.characterOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Store selected character
        this.selectedCharacter = option.dataset.character;
        
        // Update start button state
        this.updateStartButton();
    }

    updateStartButton() {
        const isValid = this.selectedCharacter && this.characterName.length >= 2;
        this.startButton.classList.toggle('active', isValid);
        this.startButton.disabled = !isValid;
    }

    startGame() {
        if (!this.selectedCharacter || !this.characterName) {
            alert('Please select a character and enter a name (minimum 2 characters)');
            return;
        }

        // Hide character selection and show game canvas
        this.characterSelection.style.display = 'none';
        this.gameCanvas.style.display = 'block';

        // Initialize game with selected character and name
        const game = new IsometricGame(this.selectedCharacter, this.characterName);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            game.resize();
        });
    }
}

// Initialize character selection
new CharacterSelection();