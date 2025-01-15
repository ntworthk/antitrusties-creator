const UI = {
    initialize() {
        this.renderHeader();
        this.renderPredictions();
        this.attachEventListeners();
    },

    renderHeader() {
        const header = document.createElement('div');
        header.className = 'header-controls';
        header.innerHTML = `
            <div class="name-input">
                <input type="text" id="userName" placeholder="Enter your name" class="form-input">
            </div>
            <div class="points-display">
                Points Available: <span id="pointsAvailable">${State.getPointsAvailable()}</span>
            </div>
            <button id="exportButton" class="btn">Export Picks</button>
        `;
        document.querySelector('.container').insertBefore(header, document.getElementById('available-section'));
    },

    renderPredictions() {
        const container = document.getElementById('available-picks');
        container.innerHTML = '';

        State.predictions.forEach(prediction => {
            const card = this.createPredictionCard(prediction);
            container.appendChild(card);
        });
    },

    createPredictionCard(prediction) {
        const card = document.createElement('div');
        card.className = 'prediction-card';
        card.setAttribute('data-id', prediction.id);

        const currentPoints = State.userPicks.get(prediction.id) || 0;
        const isRisky = State.riskyPickId === prediction.id;

        card.innerHTML = `
            <div class="prediction-content">
                <p class="prediction-text">${prediction.text}</p>
                <div class="points-control">
                    <input type="range" 
                           class="points-slider" 
                           min="0" 
                           max="3" 
                           step="1" 
                           value="${currentPoints}"
                           data-id="${prediction.id}">
                    <span class="points-value">${currentPoints}</span>
                    <div class="risky-btn-container">
                        ${currentPoints > 0 ? `
                            <button class="btn risky-btn ${isRisky ? 'active' : ''}" 
                                    data-id="${prediction.id}"
                                    title="Increase the risk - make this pick worth double but negative if you get it wrong">
                                ${isRisky ? 'Risky ✓' : 'Make Risky'}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        return card;
    },

    attachEventListeners() {
        window.addEventListener('scroll', () => {
            const headerControls = document.querySelector('.header-controls');
            if (window.scrollY > 100) {
                headerControls.classList.add('scrolled');
            } else {
                headerControls.classList.remove('scrolled');
            }
        });

        document.addEventListener('input', e => {
            if (e.target.classList.contains('points-slider')) {
                const points = parseInt(e.target.value);
                const id = e.target.dataset.id;
                
                if (State.setPoints(id, points)) {
                    e.target.nextElementSibling.textContent = points;
                    document.getElementById('pointsAvailable').textContent = State.getPointsAvailable();
                    const percentage = (points / 3) * 100;
                    e.target.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--border) ${percentage}%)`;
                } else {
                    e.target.value = State.userPicks.get(id) || 0;
                    e.target.nextElementSibling.textContent = e.target.value;
                    const percentage = (e.target.value / 3) * 100;
                    e.target.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--border) ${percentage}%)`;
                }
            }
        });

        document.addEventListener('click', e => {
            if (e.target.classList.contains('risky-btn')) {
                const id = e.target.dataset.id;
                State.setRiskyPick(id);
                this.renderPredictions();
            }
        });

        document.getElementById('userName').addEventListener('change', e => {
            State.userName = e.target.value.trim();
        });

        document.getElementById('exportButton').addEventListener('click', () => {
            State.exportPicks();
        });
    },

    updatePointsDisplay() {
        document.getElementById('pointsAvailable').textContent = State.getPointsAvailable();
    }
};