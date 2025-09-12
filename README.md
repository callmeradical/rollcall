# Roll Call - D&D Initiative Tracker

A lightweight, offline-capable D&D initiative tracker built with React and designed to run entirely in the browser. Perfect for DMs who need to track combat order, manage conditions, and keep encounters organized.

## Features

- **Initiative Management**: Add combatants with initiative, DEX modifier, HP, AC, and notes
- **Turn Tracking**: Clear visual indicators for current turn and next up
- **Condition Tracking**: Add conditions with duration that automatically decrement each round
- **Offline Capable**: Works entirely in the browser with localStorage persistence
- **Import/Export**: Save and share encounters as JSON files
- **Print Friendly**: Clean print view for table reference
- **Keyboard Shortcuts**: Navigate efficiently with keyboard controls
- **Mobile Friendly**: Responsive design works on tablets and phones

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

This app is configured for GitHub Pages deployment using GitHub Actions. To deploy:

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Set Pages source to "GitHub Actions"
4. Push to the main branch to trigger deployment

## Usage

1. **Add Combatants**: Enter name, initiative, stats, and notes
2. **Roll Initiative**: Use the dice button to roll d20 + DEX modifier
3. **Track Turns**: Use Next/Prev buttons or arrow keys to advance turns
4. **Manage Conditions**: Click on combatants to add/remove conditions
5. **Edit on the Fly**: Click any combatant row to edit their information
6. **Export/Import**: Use Ctrl/Cmd+S to export, Ctrl/Cmd+O to import

## Keyboard Shortcuts

- `←` / `→` - Previous/Next turn
- `Enter` - Add combatant or save edit
- `Escape` - Cancel edit
- `Ctrl/Cmd + S` - Export encounter
- `Ctrl/Cmd + O` - Open import dialog

## Technical Details

- **Framework**: React 18 with Vite
- **Routing**: React Router with HashRouter (GitHub Pages compatible)
- **State Management**: useReducer + Context API
- **Persistence**: localStorage with auto-save
- **Styling**: Pure CSS with responsive design
- **No External Dependencies**: Beyond React ecosystem for minimal bundle size

## Architecture

The app follows the design patterns outlined in the design document:

- **Deterministic Sorting**: Initiative → DEX → creation order
- **Turn Management**: Circular progression with round tracking
- **State Persistence**: Auto-save to localStorage with export/import
- **Component Structure**: Modular components with clear separation of concerns

## Browser Support

Works in all modern browsers that support:
- ES6+ features
- localStorage
- CSS Grid and Flexbox

## License

MIT License - see LICENSE file for details