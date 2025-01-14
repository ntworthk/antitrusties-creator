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
    },

    render() {
        this.renderPeople();
        this.renderPredictions();
    },

    renderPeople() {
        const grid = document.querySelector('.persons-grid');
        grid.innerHTML = '';
        
        State.people.forEach(person => {
            const container = this.createPersonContainer(person);
            grid.appendChild(container);
            const dropzone = container.querySelector('.dropzone');
            console.log('Reinitializing dropzone for person:', person.name, dropzone);
            DragDrop.reinitializeForElement(container.querySelector('.dropzone'));
        });
    },

    renderPredictions() {
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

        // Event listeners
        status.addEventListener('click', () => {
            const updated = State.updatePredictionStatus(prediction.id);
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

        notes.addEventListener('change', (e) => {
            State.updatePredictionNotes(prediction.id, e.target.value);
        });

        return card;
    }
};