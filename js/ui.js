// UI updates and DOM manipulation
const UI = {
    templates: {
        person: null,
        prediction: null
    },

    initialize() {
        this.templates.person = document.getElementById('person-template');
        this.templates.prediction = document.getElementById('prediction-template');
        this.render();
        
        // Add loading indicator styles
        const style = document.createElement('style');
        style.textContent = `
            .loading {
                position: relative;
            }
            .loading:after {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .loading:before {
                content: 'Loading...';
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    },

    async render() {
        // Show loading state during render
        document.body.classList.add('loading');
        
        try {
            await this.renderPeople();
            await this.renderPredictions();
            
            // Update UI based on admin status
            this.updateAdminUI();
        } finally {
            document.body.classList.remove('loading');
        }
    },

    async renderPeople() {
        const grid = document.querySelector('.persons-grid');
        grid.innerHTML = '';
        
        State.people.forEach(person => {
            const container = this.createPersonContainer(person);
            grid.appendChild(container);
            const dropzone = container.querySelector('.dropzone');
            DragDrop.reinitializeForElement(container.querySelector('.dropzone'));
        });
    },

    async renderPredictions() {
        // Clear all prediction cards
        document.querySelectorAll('.dropzone').forEach(zone => {
            zone.innerHTML = '';
        });

        // Render predictions in their containers
        State.predictions.forEach(prediction => {
            const card = this.createPredictionCard(prediction);
            const container = prediction.container === 'available-picks' ?
                document.getElementById('available-picks') :
                document.querySelector(`[data-person-id="${prediction.container}"]`);
            
            if (container) {
                container.appendChild(card);
                DragDrop.reinitializeForElement(card);
            }
        });
    },

    createPersonContainer(person) {
        const template = this.templates.person.content.cloneNode(true);
        const container = template.querySelector('.person-container');
        const nameElement = template.querySelector('.person-name');
        const dropzone = template.querySelector('.person-predictions');
        
        container.id = `person-${person.id}`;
        nameElement.textContent = person.name;
        dropzone.setAttribute('data-person-id', person.id);
        
        return container;
    },

    createPredictionCard(prediction) {
        const template = this.templates.prediction.content.cloneNode(true);
        const card = template.querySelector('.prediction-card');
        const text = template.querySelector('.prediction-text');
        const notes = template.querySelector('.notes-input');
        const status = template.querySelector('.status-indicator');
        
        card.setAttribute('data-id', prediction.id);
        text.textContent = prediction.text;
        notes.value = prediction.notes;
        status.className = `status-indicator ${prediction.status}`;
        
        if (prediction.status !== 'pending') {
            const icon = document.createElement('i');
            icon.className = `fas fa-${prediction.status === 'correct' ? 'check' : 'times'}`;
            status.appendChild(icon);
        }

        // Only add interactive elements if user is admin
        if (State.isAdmin) {
            // Event listeners
            status.addEventListener('click', async () => {
                const updated = await State.updatePredictionStatus(prediction.id);
                if (updated) {
                    status.className = `status-indicator ${updated.status}`;
                    status.innerHTML = '';
                    if (updated.status !== 'pending') {
                        const icon = document.createElement('i');
                        icon.className = `fas fa-${updated.status === 'correct' ? 'check' : 'times'}`;
                        status.appendChild(icon);
                    }
                }
            });

            notes.addEventListener('change', async (e) => {
                await State.updatePredictionNotes(prediction.id, e.target.value);
            });
        } else {
            // Make elements read-only for non-admin users
            status.style.cursor = 'default';
            notes.readOnly = true;
            card.classList.add('read-only');
        }

        return card;
    },

    updateAdminUI() {
        // Update UI elements based on admin status
        document.body.classList.toggle('admin-mode', State.isAdmin);
        
        // Update drag-drop functionality
        if (!State.isAdmin) {
            document.querySelectorAll('.prediction-card').forEach(card => {
                card.classList.add('no-drag');
            });
        }
        
        // Show/hide admin-only buttons
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = State.isAdmin ? '' : 'none';
        });
    }
};