const State = {
    predictions: [],
    userName: '',
    userPicks: new Map(),
    maxPoints: 10,
 
    async initialize() {
        try {
            const response = await fetch('https://cardioid.co.nz/api/predictions');
            if (!response.ok) throw new Error('Failed to fetch predictions');
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
 
    async exportPicks() {
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
        
        try {
            const response = await fetch('https://cardioid.co.nz/api/submit_pick', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `pick_base64=${encodeURIComponent(base64Data)}`
            });
 
            const result = await response.json();
            
            if (result.status === 'success') {
                alert('Your picks have been successfully submitted!');
            } else {
                alert(`Error submitting picks: ${result.message}`);
            }
        } catch (error) {
            alert('Failed to submit picks. Please try again later.');
            console.error('Error:', error);
        }
    }
 };