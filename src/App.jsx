import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { EncounterProvider, useEncounter } from './state/EncounterContext.jsx';
import { loadCreatureLibrary } from './lib/creature-library.js';
import TopBar from './components/TopBar.jsx';
import AddCombatantForm from './components/AddCombatantForm.jsx';
import CombatList from './components/CombatList.jsx';
import ImportExportModal from './components/ImportExportModal.jsx';
import DiceRoller from './components/DiceRoller.jsx';
import LibraryModal from './components/LibraryModal.jsx';
import StatBlockPanel from './components/StatBlockPanel.jsx';

function EncounterTracker() {
  const [isAddFormExpanded, setIsAddFormExpanded] = React.useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
  const [statBlockVisible, setStatBlockVisible] = React.useState(false);
  const [selectedCreature, setSelectedCreature] = React.useState(null);
  const [selectedCombatant, setSelectedCombatant] = React.useState(null);
  const { actions } = useEncounter();

  const handleAddFromLibrary = (combatant) => {
    actions.addCombatant(combatant);
  };

  const handleViewStatBlock = (creature, combatant = null) => {
    setSelectedCreature(creature);
    setSelectedCombatant(combatant);
    setStatBlockVisible(true);
  };

  const handleCombatantStatBlock = (combatant) => {
    // Try to find the creature in the library if we have a creature ID
    if (combatant.creatureId) {
      const library = loadCreatureLibrary();
      const creature = library.find(c => c.id === combatant.creatureId);
      if (creature) {
        handleViewStatBlock(creature, combatant);
        return;
      }
    }

    // If no creature found, create a basic stat block from combatant data
    const basicCreature = {
      id: `temp_${combatant.id}`,
      name: combatant.name,
      type: combatant.type,
      cr: '?',
      ac: combatant.ac,
      hp: combatant.hp,
      speed: '30 ft',
      stats: {
        str: 10,
        dex: combatant.dex * 2 + 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10
      },
      savingThrows: [],
      skills: [],
      vulnerabilities: [],
      resistances: [],
      immunities: [],
      conditionImmunities: [],
      senses: [],
      languages: [],
      abilities: [],
      actions: [],
      reactions: [],
      legendaryActions: [],
      source: 'Combat Session',
      tags: ['session-creature'],
      notes: combatant.notes || 'Basic stat block generated from combat data'
    };

    handleViewStatBlock(basicCreature, combatant);
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

      <div className={`app-layout ${statBlockVisible ? 'split-layout' : ''}`}>
        <main className="main-content">
          <CombatList onViewStatBlock={handleCombatantStatBlock} />
        </main>

        <StatBlockPanel
          creature={selectedCreature}
          combatant={selectedCombatant}
          isVisible={statBlockVisible}
          onClose={() => setStatBlockVisible(false)}
        />
      </div>

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
        onViewStatBlock={handleViewStatBlock}
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