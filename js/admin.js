document.addEventListener('DOMContentLoaded', () => {
    const adminPanel = {
        elements: {
            showAdminLogin: document.getElementById('showAdminLogin'),
            syncButton: document.getElementById('syncButton'),
            adminLogin: document.getElementById('adminLogin'),
            githubToken: document.getElementById('githubToken'),
            loginButton: document.getElementById('loginButton'),
            cancelLogin: document.getElementById('cancelLogin')
        },

        initialize() {
            this.attachEventListeners();
            this.updateUIState();

            // Start checking for changes periodically if admin
            if (State.isAdmin) {
                setInterval(() => this.checkPendingChanges(), 1000);
            }
        },

        attachEventListeners() {
            this.elements.showAdminLogin.addEventListener('click', () => this.toggleLoginPanel());
            this.elements.loginButton.addEventListener('click', () => this.handleLogin());
            this.elements.cancelLogin.addEventListener('click', () => this.hideLoginPanel());
            this.elements.syncButton.addEventListener('click', () => this.handleSync());
            
            this.elements.githubToken.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        },

        async handleSync() {
            if (!State.isAdmin || !State.hasPendingChanges()) return;

            const syncButton = this.elements.syncButton;
            syncButton.classList.add('syncing');
            
            try {
                const success = await State.saveToGitHub();
                if (success) {
                    syncButton.classList.remove('has-changes');
                }
            } catch (error) {
                console.error('Sync failed:', error);
                alert('Failed to sync changes. Please try again.');
            } finally {
                syncButton.classList.remove('syncing');
            }
        },

        async handleLogin() {
            const token = this.elements.githubToken.value.trim();
            if (!token) return;

            try {
                const success = await State.authenticateAsAdmin(token);
                if (success) {
                    this.hideLoginPanel();
                    this.updateUIState();
                    location.reload();
                } else {
                    alert('Invalid token or insufficient permissions');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        },

        toggleLoginPanel() {
            if (State.isAdmin) {
                if (confirm('Do you want to log out?')) {
                    State.logout();
                    location.reload();
                }
            } else {
                this.elements.adminLogin.classList.toggle('hidden');
            }
        },

        hideLoginPanel() {
            this.elements.adminLogin.classList.add('hidden');
            this.elements.githubToken.value = '';
        },

        checkPendingChanges() {
            if (State.isAdmin) {
                this.elements.syncButton.classList.toggle('has-changes', State.hasPendingChanges());
            }
        },

        updateUIState() {
            const icon = this.elements.showAdminLogin.querySelector('i');
            if (State.isAdmin) {
                icon.classList.remove('fa-lock');
                icon.classList.add('fa-lock-open');
                this.elements.syncButton.classList.remove('hidden');
            } else {
                icon.classList.remove('fa-lock-open');
                icon.classList.add('fa-lock');
                this.elements.syncButton.classList.add('hidden');
            }
        }
    };

    adminPanel.initialize();
});
