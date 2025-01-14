// Main application initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state
    document.body.classList.add('loading');
    
    try {
        // Initialize state first and wait for it
        await State.initialize();
        
        // Then initialize other modules
        UI.initialize();
        DragDrop.initialize();
        Modals.initialize();
        
        // Register state change listener
        State.onDataChange = () => {
            UI.render();
        };
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Failed to load data. Please refresh the page.');
    } finally {
        // Hide loading state
        document.body.classList.remove('loading');
    }
});
