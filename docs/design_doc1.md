Initiative Tracker (React/JS) — Quick Design Doc

1. Goal

A lightweight, offline-capable D&D initiative tracker built with React (JavaScript) that runs entirely in the browser and can be deployed as a static site on GitHub Pages.

2. Users & Scenarios
   • DM on laptop/tablet, tracking combat order for PCs, NPCs, and monsters.
   • Key flows: add combatants, roll/enter initiatives, sort, mark turns, apply conditions, track HP/notes, next/prev turn, round counter, quick edit, export/import state.

3. Requirements

Functional
• Add/edit/remove Combatants (name, type: PC/NPC/Monster, initiative, Dex mod, HP, AC, notes, tags).
• Tie-breakers: higher initiative wins; if tie → higher Dex; if tie → coin-flip or stable order.
• Turn controls: next/prev, ready/held, skip, end of round increments round counter.
• Conditions with duration (e.g., “Stunned (1 rnd)”) auto-decrement on round advance.
• Bulk actions: add many via textarea/CSV; clear encounter; duplicate encounter.
• Persistence: autosave to localStorage; manual Export/Import as JSON.
• Quick roll tools (d20, advantage/disadvantage) optional but handy.
• Keyboard shortcuts: N(new), Enter(add/save), J/K(next/prev), R(roll), ⌘/Ctrl+S(export).
• Print view: clean print of current tracker for table reference.

Non-Functional
• Static (no server). Works offline (PWA optional).
• Mobile-friendly, minimal dependencies.
• A11y: focus management, ARIA roles, color-contrast ≥ 4.5:1.
• State determinism: predictable sorting & advancement.

4. Tech Choices
   • Build: Vite + React (JavaScript).
   • Routing: HashRouter (avoids 404 on GitHub Pages).
   • Styling: Tailwind or minimal CSS modules (keep bundle small).
   • State: useReducer + context (simple, testable), persisted to localStorage.
   • Drag-and-drop (optional): @dnd-kit/core for manual reordering.

5. Data Model (JSON)

{
"version": 1,
"encounterName": "Streets of Londra",
"round": 1,
"activeIndex": 0,
"combatants": [
{
"id": "c_01",
"name": "Kaien",
"type": "NPC",
"init": 18,
"dex": 3,
"hp": 52,
"ac": 16,
"notes": "Lightning burst at bloodied",
"tags": ["elite","boss"],
"conditions": [{"name":"Bless","remainingRounds":5}],
"hidden": false,
"isHeldAction": false
}
],
"log": [
{"ts": 1690000000, "msg": "Round 1 begins"}
]
}

6. Core Logic

Sorting rule (stable, pure): 1. Desc by init → 2) desc by dex → 3) stable order by id (creation time).

Turn advance:
• activeIndex = (activeIndex + 1) % combatants.length
• If wraps to 0 → round++ and decrement remainingRounds on all conditions; remove expired.

Held/Ready:
• Flag isHeldAction; pressing “Use Held” inserts combatant after current and clears flag.

Ties (exact):
• Deterministically keep prior order (stable sort). Offer an “coin-flip” button to break ties if desired.

7. UI / Interaction
   • Top bar: Encounter name, Round counter, controls (Prev / Next / New / Clear / Import / Export / Print).
   • Add Panel: quick fields (Name, Init, Dex, HP, AC, Type) + “Add”.
   • List (single column):
   • Each row: turn indicator ▸, name, type chip, HP/AC, init/dex, small notes icon, badges for conditions.
   • Inline edit (click to edit); kebab menu for remove/duplicate/hold/hidden.
   • Drawer/Modal: full details & conditions editor.
   • Footer: dice roller (d20, adv/dis), log toggle.

(Optional) Minimal wire layout:

[Encounter • Round 3] [Prev] [Next] [New] [Import] [Export] [Print]
[ Add Combatant: Name | Init | Dex | HP | AC | Type [Add] ]

> ▸ Kaien [NPC] HP 52 AC 16 INIT 18 (DEX +3) [notes] [..]
> ▫ Conditions: Bless(5)

Aoshi [PC] HP 31 AC 14 INIT 17 (DEX +2) [notes] [..]
...

8. Component Map
   • App (HashRouter, layout)
   • EncounterProvider (context + reducer + persistence)
   • TopBar (round, controls)
   • AddCombatantForm
   • CombatList
   • CombatRow (inline edit, actions)
   • TurnIndicator
   • ConditionBadges / ConditionEditor
   • DicePanel (optional)
   • ImportExportModal
   • LogPanel (collapsible)
   • PrintView (CSS media print)

9. State & Reducer (sketch)

// actions: ADD, UPDATE, REMOVE, NEXT_TURN, PREV_TURN, NEW_ROUND, SET_ACTIVE,
// IMPORT_STATE, CLEAR, ADD_CONDITION, TICK_CONDITIONS, HOLD, USE_HELD
function reducer(state, action) {
switch (action.type) {
case 'ADD': { /_ push, re-sort, keep active _/ break; }
case 'NEXT_TURN': {
const len = state.combatants.length || 1;
const next = (state.activeIndex + 1) % len;
const wrap = next === 0;
let s = { ...state, activeIndex: next };
if (wrap) { s.round += 1; s = tickConditions(s); }
return s;
}
// ...others
}
}

Sorting utility

export function sortCombatants(list) {
return [...list].sort((a,b) =>
(b.init - a.init) || (b.dex - a.dex) || (a.id.localeCompare(b.id))
);
}

10. Persistence
    • Autosave to localStorage on state change (debounced).
    • Export: download JSON file.
    • Import: accept JSON; validate version; reindex IDs; re-sort.

11. Accessibility
    • Roving tab index on list; visible focus outlines.
    • aria-live="polite" updates for “Next turn”, “Round X”.
    • Buttons labeled and keyboard-operable; avoid color-only status indicators.

12. Testing
    • Unit tests for reducer & sorting (Jest + @testing-library/react for interactions).
    • Snapshot test for print view.
    • Quick e2e smoke (Playwright/GH Actions) optional.

13. Performance
    • Virtualize list only if >200 combatants (unlikely).
    • Memoize rows; keep state updates granular.

14. Project Structure

initiative-tracker/
index.html
vite.config.js
package.json
src/
main.jsx
App.jsx
styles.css
lib/
sorting.js
storage.js
state/
EncounterContext.jsx
reducer.js
actions.js
components/
TopBar.jsx
AddCombatantForm.jsx
CombatList.jsx
CombatRow.jsx
ConditionBadges.jsx
ImportExportModal.jsx
DicePanel.jsx
LogPanel.jsx
PrintView.jsx
hooks/
useLocalStorage.js
public/
icons/\* (PWA optional)

15. Deployment (GitHub Pages)

Vite setup (IMPORTANT: set base to repo name for Pages):

// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
base: '/<your-repo-name>/', // e.g., '/initiative-tracker/'
plugins: [react()]
})

Package scripts

{
"scripts": {
"dev": "vite",
"build": "vite build",
"preview": "vite preview"
}
}

Workflow (.github/workflows/deploy.yml)

name: Deploy to GitHub Pages
on:
push:
branches: [ main ]
permissions:
contents: read
pages: write
id-token: write
jobs:
build:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - uses: actions/setup-node@v4
with: { node-version: 20 } - run: npm ci - run: npm run build - uses: actions/upload-pages-artifact@v3
with: { path: dist }
deploy:
needs: build
runs-on: ubuntu-latest
steps: - uses: actions/deploy-pages@v4

Repository settings
• Settings → Pages → “Source: GitHub Actions”.
• Use HashRouter to avoid SPA route 404s on Pages.

(Optional PWA): add service worker for offline; cache index.html, JS, CSS, and exported JSON.

16. Risks & Mitigations
    • SPA routing on Pages → use HashRouter.
    • LocalStorage limits (~5–10MB) → acceptable; enable export/import.
    • Tie handling disputes → expose deterministic sort + optional coin flip.

17. Roadmap (nice-to-haves)
    • Multiple encounters; library of monsters; SRD import.
    • Condition presets and concentration tracking.
    • Share read-only URL (state in URL via compressed base64).
    • PWA install banner & offline mode.
    • Theming and big-screen “table mode”.

⸻

If you want, I can spit out a starter repo (Vite scaffold + the reducer, components stubs, and the GH Actions workflow) so you can push and deploy immediately.
