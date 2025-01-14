# Competition Predictions Tracker

## Purpose
A web application for tracking annual competition economics predictions for a team of four economists. The app allows:
- Adding predictions to a pool of "Available Picks"
- Adding team members
- Assigning predictions to team members via drag and drop
- Tracking prediction outcomes (correct/incorrect) throughout the year
- Adding notes/evidence to predictions
- Persistence of all data in localStorage

## File Structure

```
├── index.html           # Main HTML structure
├── styles/
│   ├── main.css        # Base styles and layout
│   ├── components.css  # Styles for cards, buttons, dropzones
│   └── modals.css     # Modal dialog styles
└── js/
    ├── state.js       # State management and persistence
    ├── drag-drop.js   # Drag and drop functionality
    ├── ui.js          # DOM updates and rendering
    ├── modals.js      # Modal dialog functionality
    └── main.js        # Application initialization
```

## Key Features
- Clean, simple interface
- Drag and drop prediction assignment
- Simple status toggling (pending/correct/incorrect)
- Modal dialogs for adding predictions and people
- Responsive design
- No backend required (uses localStorage)
- Easy deployment to GitHub Pages

## Dependencies
- Font Awesome (icons)
- Interact.js (drag and drop)

## Hosting
This application is designed to be hosted on GitHub Pages. To deploy:
1. Create a new GitHub repository
2. Push all files to the repository
3. Enable GitHub Pages in the repository settings
4. Site will be available at `https://<username>.github.io/<repository-name>`

Note: Since the app uses localStorage for data persistence, each user's data will be stored in their own browser. This means the data won't be shared between users or devices.