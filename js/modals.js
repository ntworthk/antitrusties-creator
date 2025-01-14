// Modal functionality
const Modals = {
    initialize() {
        this.initializeButtons();
        this.initializeCloseButtons();
        this.initializeSubmitHandlers();
    },

    initializeButtons() {
        document.querySelectorAll('[data-modal-target]').forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-modal-target');
                this.showModal(modalId);
            });
        });
    },

    initializeCloseButtons() {
        document.querySelectorAll('.close-button').forEach(button => {
            button.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Close on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    },

    initializeSubmitHandlers() {
        // Add person handler
        document.getElementById('add-person-button').addEventListener('click', () => {
            const input = document.getElementById('person-name-input');
            const name = input.value.trim();
            
            if (name) {
                const person = State.addPerson(name);
                UI.renderPeople();
                this.hideAllModals();
                input.value = '';
            }
        });

        // Add prediction handler
        document.getElementById('add-prediction-button').addEventListener('click', () => {
            const input = document.getElementById('prediction-text-input');
            const text = input.value.trim();
            
            if (text) {
                const prediction = State.addPrediction(text);
                UI.renderPredictions();
                this.hideAllModals();
                input.value = '';
            }
        });

        // Enter key handlers
        document.getElementById('person-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('add-person-button').click();
            }
        });

        document.getElementById('prediction-text-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('add-prediction-button').click();
            }
        });
    },

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            const input = modal.querySelector('input');
            if (input) {
                input.focus();
            }
        }
    },

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
            const input = modal.querySelector('input');
            if (input) {
                input.value = '';
            }
        });
    }
};