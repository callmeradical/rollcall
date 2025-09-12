# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a D&D initiative tracker built with React (JavaScript) and Vite. It's designed to be a lightweight, offline-capable web application that runs entirely in the browser and can be deployed as a static site on GitHub Pages.

## Project Structure (Planned)

The project follows this structure as outlined in the design document:

```
src/
  main.jsx                 # Entry point
  App.jsx                  # Main app component with HashRouter
  styles.css               # Global styles
  lib/
    sorting.js             # Combatant sorting utilities
    storage.js             # LocalStorage persistence
  state/
    EncounterContext.jsx   # React context provider
    reducer.js             # State reducer logic
    actions.js             # Action definitions
  components/
    TopBar.jsx             # Round counter and controls
    AddCombatantForm.jsx   # Form for adding combatants
    CombatList.jsx         # List of combatants
    CombatRow.jsx          # Individual combatant row
    ConditionBadges.jsx    # Status conditions display
    ImportExportModal.jsx  # JSON import/export
    DicePanel.jsx          # Dice rolling utilities
    LogPanel.jsx           # Combat log
    PrintView.jsx          # Print-friendly view
  hooks/
    useLocalStorage.js     # LocalStorage hook
```

## Development Commands

Based on the design document, the project uses standard Vite commands:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture Principles

### State Management
- Uses React's useReducer + Context pattern for state management
- All state persisted to localStorage with autosave
- Deterministic sorting: initiative desc → dex desc → stable order by ID

### Key Data Model
```javascript
{
  "version": 1,
  "encounterName": "Combat Encounter",
  "round": 1,
  "activeIndex": 0,
  "combatants": [{
    "id": "c_01",
    "name": "Character Name",
    "type": "PC|NPC|Monster",
    "init": 18,
    "dex": 3,
    "hp": 52,
    "ac": 16,
    "notes": "Special abilities",
    "tags": ["elite", "boss"],
    "conditions": [{"name": "Bless", "remainingRounds": 5}],
    "hidden": false,
    "isHeldAction": false
  }]
}
```

### Turn Management
- Turn advancement: `activeIndex = (activeIndex + 1) % combatants.length`
- Round progression: when activeIndex wraps to 0, increment round and tick down condition durations
- Held actions: flag `isHeldAction` and allow insertion after current turn

### Routing and Deployment
- Uses HashRouter to avoid 404s on GitHub Pages
- Vite config must set `base: '/<repo-name>/'` for GitHub Pages deployment
- Designed to work offline as a PWA (optional)

## Testing Strategy
- Unit tests for reducer and sorting logic (Jest + @testing-library/react)
- Snapshot tests for print view
- Optional e2e smoke tests with Playwright

## Accessibility Requirements
- Roving tab index on combatant list
- ARIA live regions for turn announcements
- Color contrast ≥ 4.5:1
- Keyboard shortcuts: N(new), Enter(add/save), J/K(next/prev), R(roll), Cmd/Ctrl+S(export)

## GitHub Pages Deployment
Requires GitHub Actions workflow with:
- Node.js setup and npm ci
- Vite build process
- Pages artifact upload and deployment
- Repository settings: Pages → Source: GitHub Actions