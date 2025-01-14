// State management
const State = {
    predictions: [],
    people: [],

    initialize() {
        this.loadFromStorage();
    },

    loadFromStorage() {
        try {
            const savedState = localStorage.getItem('predictionState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                this.predictions = parsedState.predictions || [];
                this.people = parsedState.people || [];
            }
        } catch (error) {
            console.error('Error loading state:', error);
            this.predictions = [];
            this.people = [];
        }
    },

    saveToStorage() {
        try {
            localStorage.setItem('predictionState', JSON.stringify({
                predictions: this.predictions,
                people: this.people
            }));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    },

    addPerson(name) {
        const person = {
            id: crypto.randomUUID(),
            name: name
        };
        this.people.push(person);
        this.saveToStorage();
        return person;
    },

    addPrediction(text) {
        const prediction = {
            id: crypto.randomUUID(),
            text: text,
            status: 'pending',
            notes: '',
            container: 'available-picks'
        };
        this.predictions.push(prediction);
        this.saveToStorage();
        return prediction;
    },

    updatePredictionStatus(id) {
        const prediction = this.predictions.find(p => p.id === id);
        if (prediction) {
            prediction.status = prediction.status === 'pending' ? 'correct' :
                              prediction.status === 'correct' ? 'incorrect' : 'pending';
            this.saveToStorage();
        }
        return prediction;
    },

    updatePredictionNotes(id, notes) {
        const prediction = this.predictions.find(p => p.id === id);
        if (prediction) {
            prediction.notes = notes;
            this.saveToStorage();
        }
        return prediction;
    },

    updatePredictionContainer(id, containerId) {
        const prediction = this.predictions.find(p => p.id === id);
        if (prediction) {
            prediction.container = containerId;
            this.saveToStorage();
        }
        return prediction;
    },

    getPredictionsForContainer(containerId) {
        return this.predictions.filter(p => p.container === containerId);
    }
};