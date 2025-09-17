import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { EncounterProvider, useEncounter } from './state/EncounterContext.jsx';
import TopBar from './components/TopBar.jsx';
import AddCombatantForm from './components/AddCombatantForm.jsx';
import CombatList from './components/CombatList.jsx';
import ImportExportModal from './components/ImportExportModal.jsx';
import DiceRoller from './components/DiceRoller.jsx';
import LibraryModal from './components/LibraryModal.jsx';

function EncounterTracker() {
  const [isAddFormExpanded, setIsAddFormExpanded] = React.useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
  const { actions } = useEncounter();

  const handleAddFromLibrary = (combatant) => {
    actions.addCombatant(combatant);
  };

  return (
    <div className="app">
      <button
        className="btn library-btn"
        onClick={() => setIsLibraryOpen(true)}
        title="Open Creature Library"
      >
        📚 Library
      </button>

      <main className="main-content">
        <CombatList />
      </main>
      <AddCombatantForm
        isExpanded={isAddFormExpanded}
        setIsExpanded={setIsAddFormExpanded}
      />
      <TopBar />
      <ImportExportModal />
      <DiceRoller isHidden={isAddFormExpanded} />
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAddCombatant={handleAddFromLibrary}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <EncounterProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<EncounterTracker />} />
          </Routes>
        </div>
      </EncounterProvider>
    </Router>
  );
}

export default App;