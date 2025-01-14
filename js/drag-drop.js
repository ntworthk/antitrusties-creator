// Drag and drop functionality
const DragDrop = {
    initialize() {
        this.initializeDraggable();
        this.initializeDropzones();
    },

initializeDraggable() {
    interact('.prediction-card').draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'body',
                endOnly: true
            })
        ],
        autoScroll: true,
        listeners: {
            start: (event) => {
                const element = event.target;
                element.classList.add('dragging');
                // Create a clone for the visual feedback
                const rect = element.getBoundingClientRect();
                element.style.position = 'fixed';
                element.style.top = rect.top + 'px';
                element.style.left = rect.left + 'px';
                element.style.width = rect.width + 'px';
                element.style.zIndex = '1000';
            },
            move: (event) => {
                const target = event.target;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            end: (event) => {
                const element = event.target;
                element.classList.remove('dragging');
                element.style.position = '';
                element.style.top = '';
                element.style.left = '';
                element.style.width = '';
                element.style.zIndex = '';
                element.style.transform = '';
                element.removeAttribute('data-x');
                element.removeAttribute('data-y');
            }
        }
    });
},

initializeDropzones() {
    const dropzones = document.querySelectorAll('.dropzone');

    interact('.dropzone').dropzone({
        accept: '.prediction-card',
        overlap: 0.5, // Reduced from 0.75 to make it easier to drop
        ondropactivate: (event) => {
            event.target.classList.add('drop-active');
        },
        ondragenter: (event) => {
            event.target.classList.add('drop-target');
            event.relatedTarget.classList.add('can-drop');
        },
        ondragleave: (event) => {
            event.target.classList.remove('drop-target');
            event.relatedTarget.classList.remove('can-drop');
        },
        ondrop: this.handleDrop,
        ondropdeactivate: (event) => {
            event.target.classList.remove('drop-active');
            event.target.classList.remove('drop-target');
            event.relatedTarget.classList.remove('can-drop');
        }
    });
},

    handleDragStart(event) {
        const element = event.target;
        element.classList.add('dragging');
        const rect = element.getBoundingClientRect();
        element.style.position = 'fixed';
        element.style.top = rect.top + 'px';
        element.style.left = rect.left + 'px';
        element.style.width = '300px';
        element.style.zIndex = '1000';
    },

    handleDragMove(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    },

    handleDragEnd(event) {
        const element = event.target;
        element.classList.remove('dragging');
        element.style.position = '';
        element.style.top = '';
        element.style.left = '';
        element.style.width = '';
        element.style.zIndex = '';
        element.style.transform = '';
        element.removeAttribute('data-x');
        element.removeAttribute('data-y');
    },

    handleDropActivate(event) {
        event.target.classList.add('drop-active');
    },

    handleDragEnter(event) {
        event.target.classList.add('drop-target');
    },

    handleDragLeave(event) {
        event.target.classList.remove('drop-target');
    },

    handleDrop(event) {
    
    const predictionCard = event.relatedTarget;
    const dropzone = event.target;
    
    const predictionId = predictionCard.getAttribute('data-id');
    const containerId = dropzone.hasAttribute('data-person-id') ? 
        dropzone.getAttribute('data-person-id') : 
        'available-picks';
    
    // Update state
    State.updatePredictionContainer(predictionId, containerId);

    // Reset card position
    predictionCard.style.transform = 'translate(0px, 0px)';
    predictionCard.setAttribute('data-x', 0);
    predictionCard.setAttribute('data-y', 0);

    // Move card to new container
    dropzone.appendChild(predictionCard);
},

    handleDropDeactivate(event) {
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
    },

    reinitializeForElement(element) {
        if (element.classList.contains('prediction-card')) {
            this.initializeDraggable(element);
        }
        if (element.classList.contains('dropzone')) {
            this.initializeDropzones(element);
        }
    }
};