// State management with GitHub integration
const State = {
    predictions: [],
    people: [],
    isAdmin: false,
    githubToken: null,
    owner: null,
    repo: null,
    dataPath: 'data/predictions.json',
    _pendingChanges: false,

    async initialize() {
        this.githubToken = localStorage.getItem('githubToken');
        this.isAdmin = !!this.githubToken;
        
        this.owner = 'ntworthk';
        this.repo = 'antitrusties-data';
        
        // Initial load for all users
        await this.loadFromGitHub();
    },

    hasPendingChanges() {
        return this._pendingChanges;
    },

    async loadFromGitHub() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataPath}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            const data = await response.json();
            const content = JSON.parse(atob(data.content));
            
            this.predictions = content.predictions || [];
            this.people = content.people || [];
            this._lastSha = data.sha;
            this._pendingChanges = false;

            if (this.onDataChange) {
                this.onDataChange();
            }
            
            return true;
        } catch (error) {
            console.error('Error loading from GitHub:', error);
            this.predictions = [];
            this.people = [];
            return false;
        }
    },

    async saveToGitHub(retryCount = 0) {
        if (!this.isAdmin) {
            console.error('Only admin can save changes');
            return false;
        }

        try {
            const latestSha = await this.getLatestSha();
            const content = {
                predictions: this.predictions,
                people: this.people
            };

            const encodedContent = btoa(JSON.stringify(content, null, 2));
            
            const response = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataPath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.githubToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Update predictions data',
                        content: encodedContent,
                        sha: latestSha
                    })
                }
            );

            if (!response.ok) {
                if (response.status === 409 && retryCount < 3) {
                    await this.loadFromGitHub();
                    return await this.saveToGitHub(retryCount + 1);
                }
                throw new Error('Failed to save to GitHub');
            }
            
            const updateData = await response.json();
            this._lastSha = updateData.content.sha;
            this._pendingChanges = false;
            return true;
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            return false;
        }
    },

    async getLatestSha() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataPath}`);
            if (!response.ok) throw new Error('Failed to fetch latest SHA');
            const data = await response.json();
            return data.sha;
        } catch (error) {
            console.error('Error fetching latest SHA:', error);
            throw error;
        }
    },

    // Modified methods to mark pending changes
    async addPerson(name) {
        if (!this.isAdmin) return null;
        
        const person = {
            id: crypto.randomUUID(),
            name: name
        };
        this.people.push(person);
        this._pendingChanges = true;
        return person;
    },

    async addPrediction(text) {
        if (!this.isAdmin) return null;
        
        const prediction = {
            id: crypto.randomUUID(),
            text: text,
            status: 'pending',
            notes: '',
            container: 'available-picks'
        };
        this.predictions.push(prediction);
        this._pendingChanges = true;
        return prediction;
    },

    async updatePredictionStatus(id) {
        if (!this.isAdmin) return null;
        
        const prediction = this.predictions.find(p => p.id === id);
        if (prediction) {
            prediction.status = prediction.status === 'pending' ? 'correct' :
                              prediction.status === 'correct' ? 'incorrect' : 'pending';
            this._pendingChanges = true;
        }
        return prediction;
    },

    async updatePredictionNotes(id, notes) {
        if (!this.isAdmin) return null;
        
        const prediction = this.predictions.find(p => p.id === id);
        if (prediction) {
            prediction.notes = notes;
            this._pendingChanges = true;
        }
        return prediction;
    },

    async updatePredictionContainer(id, containerId) {
        if (!this.isAdmin) return null;
        
        const prediction = this.predictions.find(p => p.id === id);
        if (prediction) {
            prediction.container = containerId;
            this._pendingChanges = true;
        }
        return prediction;
    },

    getPredictionsForContainer(containerId) {
        return this.predictions.filter(p => p.container === containerId);
    },

    async authenticateAsAdmin(token) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                if (userData.login === this.owner) {
                    this.githubToken = token;
                    this.isAdmin = true;
                    localStorage.setItem('githubToken', token);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error authenticating:', error);
            return false;
        }
    },

    logout() {
        this.githubToken = null;
        this.isAdmin = false;
        localStorage.removeItem('githubToken');
    }
};