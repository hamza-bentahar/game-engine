class CombatUI {
    constructor() {
        this.createMainContainer();
        this.createTimerDisplay();
        this.createPhaseDisplay();
        this.createMonsterStats();
        this.createActionButtons();
    }

    createMainContainer() {
        this.combatUI = document.createElement('div');
        this.combatUI.id = 'combat-ui';
        this.combatUI.style.position = 'absolute';
        this.combatUI.style.right = '20px';
        this.combatUI.style.top = '20px';
        this.combatUI.style.backgroundColor = 'rgba(44, 62, 80, 0.9)';
        this.combatUI.style.padding = '15px';
        this.combatUI.style.borderRadius = '5px';
        this.combatUI.style.color = '#ecf0f1';
        this.combatUI.style.fontFamily = 'Arial, sans-serif';
        this.combatUI.style.display = 'none';
        this.combatUI.style.minWidth = '300px';
        document.body.appendChild(this.combatUI);
    }

    createTimerDisplay() {
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.id = 'combat-timer';
        this.timerDisplay.style.fontSize = '24px';
        this.timerDisplay.style.marginBottom = '15px';
        this.timerDisplay.style.textAlign = 'center';
        this.combatUI.appendChild(this.timerDisplay);
    }

    createPhaseDisplay() {
        this.phaseDisplay = document.createElement('div');
        this.phaseDisplay.id = 'combat-phase';
        this.phaseDisplay.style.fontSize = '18px';
        this.phaseDisplay.style.marginBottom = '15px';
        this.phaseDisplay.style.textAlign = 'center';
        this.combatUI.appendChild(this.phaseDisplay);
    }

    createMonsterStats() {
        this.monsterStats = document.createElement('div');
        this.monsterStats.style.marginBottom = '15px';
        this.monsterStats.style.padding = '10px';
        this.monsterStats.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        this.monsterStats.style.borderRadius = '3px';
        this.combatUI.appendChild(this.monsterStats);

        this.monsterName = document.createElement('div');
        this.monsterName.style.fontSize = '16px';
        this.monsterName.style.fontWeight = 'bold';
        this.monsterName.style.marginBottom = '10px';
        this.monsterStats.appendChild(this.monsterName);

        this.monsterHP = this.createStatBar('#e74c3c', 'HP');
        this.monsterAP = this.createStatBar('#3498db', 'AP');
        this.monsterMP = this.createStatBar('#2ecc71', 'MP');
        this.monsterStats.appendChild(this.monsterHP.container);
        this.monsterStats.appendChild(this.monsterAP.container);
        this.monsterStats.appendChild(this.monsterMP.container);
    }

    createActionButtons() {
        this.actionButtons = document.createElement('div');
        this.actionButtons.style.display = 'flex';
        this.actionButtons.style.flexDirection = 'column';
        this.actionButtons.style.gap = '10px';
        this.combatUI.appendChild(this.actionButtons);

        this.mainButton = this.createButton('Ready');
        this.mainButton.style.display = 'none';
        this.actionButtons.appendChild(this.mainButton);

        this.attackButton = this.createButton('Attack (6 AP)');
        this.attackButton.style.display = 'none';
        this.actionButtons.appendChild(this.attackButton);
    }

    createButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.padding = '10px 20px';
        button.style.fontSize = '16px';
        button.style.backgroundColor = '#3498db';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.2s';
        
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#2980b9';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#3498db';
        });
        
        return button;
    }

    createStatBar(color, label) {
        const container = document.createElement('div');
        container.style.marginBottom = '8px';
        
        const labelDiv = document.createElement('div');
        labelDiv.style.fontSize = '14px';
        labelDiv.style.marginBottom = '4px';
        labelDiv.textContent = label;
        container.appendChild(labelDiv);
        
        const barContainer = document.createElement('div');
        barContainer.style.width = '100%';
        barContainer.style.height = '12px';
        barContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        barContainer.style.borderRadius = '6px';
        barContainer.style.overflow = 'hidden';
        container.appendChild(barContainer);
        
        const bar = document.createElement('div');
        bar.style.width = '100%';
        bar.style.height = '100%';
        bar.style.backgroundColor = color;
        bar.style.transition = 'width 0.3s ease';
        barContainer.appendChild(bar);
        
        const value = document.createElement('div');
        value.style.fontSize = '12px';
        value.style.textAlign = 'right';
        value.style.marginTop = '2px';
        container.appendChild(value);
        
        return {
            container,
            bar,
            value
        };
    }

    show() {
        this.combatUI.style.display = 'block';
    }

    hide() {
        this.combatUI.style.display = 'none';
    }

    updatePhaseDisplay(phase) {
        let phaseText = '';
        switch (phase) {
            case 'preparation':
                phaseText = 'Preparation Phase - Choose starting position';
                break;
            case 'playerTurn':
                phaseText = 'Your Turn';
                break;
            case 'monsterTurn':
                phaseText = "Monster's Turn";
                break;
        }
        this.phaseDisplay.textContent = phaseText;
    }

    updateMonsterStats(monster) {
        if (!monster) return;

        // Update monster name
        this.monsterName.textContent = `${monster.monsterType.charAt(0).toUpperCase() + monster.monsterType.slice(1)}`;

        // Update HP bar
        const hpPercent = (monster.health / monster.maxHealth) * 100;
        this.monsterHP.bar.style.width = `${hpPercent}%`;
        this.monsterHP.value.textContent = `${monster.health}/${monster.maxHealth}`;

        // Update AP bar
        const apPercent = (monster.currentAP / monster.maxAP) * 100;
        this.monsterAP.bar.style.width = `${apPercent}%`;
        this.monsterAP.value.textContent = `${monster.currentAP}/${monster.maxAP}`;

        // Update MP bar
        const mpPercent = (monster.currentMP / monster.maxMP) * 100;
        this.monsterMP.bar.style.width = `${mpPercent}%`;
        this.monsterMP.value.textContent = `${monster.currentMP}/${monster.maxMP}`;
    }

    updateTimer(remainingTime) {
        this.timerDisplay.textContent = `Time: ${Math.ceil(remainingTime / 1000)}s`;
    }

    setTimerExpired() {
        this.timerDisplay.textContent = "Time's up!";
    }
}

export { CombatUI }; 