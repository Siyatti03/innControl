# innControl Hotel Management System

innControl is a premium, simplified hotel management system built natively with HTML, CSS, and Javascript. This system was designed for an HCI (Human-Computer Interaction) class project, focusing on core usability principles rather than overly complex features.

## HCI Characteristics Applied
1. **Visibility & Feedback:**
   - Real-time status badges on room cards dynamically reflect state (Available, Occupied, etc.).
   - Clear progress bars and numerical counters on the Dashboard give immediate cognitive understanding of hotel capacity.
2. **Clear Affordances:**
   - All interactive elements employ subtle hover micro-animations (e.g. elevating cards) and are styled consistently so users understand they are clickable.
   - Distinct drop-downs provide an obvious way to change a room's state.
3. **Consistency:**
   - Unified color system aligned to status states (Green for Available, Blue for Occupied, Yellow for Reserved, Purple for Cleaning).
   - "Inter" typography ensures a highly legible interface across various devices.
4. **Error Prevention & Simplicity:**
   - "Reserve" button only appears on available rooms.
   - Complex data grid views were avoided in favor of legible semantic cards, reducing cognitive load for first-time users.

## Project Structure
- `index.html`: The markup orchestrating the unified Dashboard, Room Management, and Guest panels.
- `style.css`: The foundational CSS defining colors, layouts, and animations. Cleanly structured using CSS variables.
- `app.js`: Logic to handle simple view navigation and to auto-populate the mock data.

## Getting Started Locally
You can double click `index.html` to open it in your browser directly. Alternatively, if you have python running:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`.

## Pushing to GitHub
To share this repository with your group:

1. Create a new repository on your GitHub account (do not initialize with a README on GitHub).
2. Open your terminal to the `/Users/sivia/.gemini/antigravity/scratch/innControl` directory.
3. Run the following commands:
```bash
git add .
git commit -m "Initial commit of innControl UI"
git branch -M main
git remote add origin https://github.com/Siyatti03/innControl.git
git push -u origin main
```
