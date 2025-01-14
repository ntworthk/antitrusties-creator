const State = {
    predictions: [],
    userName: '',
    userPicks: new Map(), // id -> points
    maxPoints: 10,

    async initialize() {
        try {
            const response = await fetch(
                `https://raw.githubusercontent.com/ntworthk/antitrusties-data/main/data/predictions.json`
            );
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            this.predictions = data.predictions.map(p => ({
                id: p.id,
                text: p.text,
                status: p.status
            })) || [];
        } catch (error) {
            console.error('Error loading predictions:', error);
            this.predictions = [];
        }
    },

    getPointsUsed() {
        return Array.from(this.userPicks.values()).reduce((sum, points) => sum + points, 0);
    },

    getPointsAvailable() {
        return this.maxPoints - this.getPointsUsed();
    },

    setPoints(predictionId, points) {
        const currentTotal = this.getPointsUsed();
        const currentPoints = this.userPicks.get(predictionId) || 0;
        const newTotal = currentTotal - currentPoints + points;
        
        if (newTotal <= this.maxPoints) {
            this.userPicks.set(predictionId, points);
            return true;
        }
        return false;
    },

    exportPicks() {
        if (!this.userName) {
            alert('Please enter your name first');
            return;
        }

        const pointsAvailable = this.getPointsAvailable();
        if (pointsAvailable > 0 && !confirm(`You still have ${pointsAvailable} points available. Are you sure you want to export now?`)) {
            return;
        }

        const picks = Array.from(this.userPicks.entries())
            .filter(([_, points]) => points > 0)
            .map(([id, points]) => {
                const prediction = this.predictions.find(p => p.id === id);
                return {
                    id,
                    text: prediction.text,
                    points
                };
            });

        const data = {
            name: this.userName,
            timestamp: new Date().toISOString(),
            picks
        };

        const jsonString = JSON.stringify(data);
        const base64Data = btoa(jsonString);
        
        const blob = new Blob([base64Data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `antitrusties-picks-${this.userName.toLowerCase().replace(/\s+/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};