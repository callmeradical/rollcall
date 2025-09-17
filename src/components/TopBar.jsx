import React, { useState } from 'react';
import { useEncounter } from '../state/EncounterContext.jsx';
import { addEncounterToLibrary, loadCreatureLibrary } from '../lib/creature-library.js';

function TopBar() {
  const { state, actions } = useEncounter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(state.encounterName);

  const handleNameEdit = () => {
    if (isEditingName) {
      actions.setEncounterName(tempName);
    } else {
      setTempName(state.encounterName);
    }
    setIsEditingName(!isEditingName);
  };

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      actions.setEncounterName(tempName);
      setIsEditingName(false);
    } else if (e.key === 'Escape') {
      setTempName(state.encounterName);
      setIsEditingName(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveEncounter = () => {
    if (state.combatants.length === 0) {
      alert('Cannot save empty encounter');
      return;
    }

    // Get creature library to map combatants back to creatures
    const creatureLibrary = loadCreatureLibrary();

    // Build creatures array for the encounter
    const encounterCreatures = [];
    const creatureGroups = {};

    state.combatants.forEach(combatant => {
      const baseCreatureId = combatant.creatureId;

      if (baseCreatureId) {
        // This combatant came from the library
        if (creatureGroups[baseCreatureId]) {
          creatureGroups[baseCreatureId]++;
        } else {
          creatureGroups[baseCreatureId] = 1;
        }
      } else {
        // This is a custom combatant, add as individual entry
        encounterCreatures.push({
          creatureId: `custom_${combatant.id}`,
          count: 1,
          notes: `${combatant.name} (${combatant.type}, AC ${combatant.ac}, HP ${combatant.hp})`
        });
      }
    });

    // Add grouped creatures to encounter
    Object.entries(creatureGroups).forEach(([creatureId, count]) => {
      encounterCreatures.push({
        creatureId,
        count,
        notes: ''
      });
    });

    const encounterData = {
      name: state.encounterName,
      description: `Encounter from Round ${state.round}`,
      creatures: encounterCreatures,
      environment: '',
      difficulty: 'medium',
      tags: ['saved-encounter'],
      notes: `Saved on ${new Date().toLocaleString()}`,
      source: 'Current Session'
    };

    try {
      addEncounterToLibrary(encounterData);
      alert(`Encounter "${state.encounterName}" saved to library!`);
    } catch (error) {
      alert('Failed to save encounter: ' + error.message);
    }
  };

  const canGoPrev = state.combatants.length > 0;
  const canGoNext = state.combatants.length > 0;

  return (
    <header className="top-bar">
      <div className="encounter-info">
        {isEditingName ? (
          <input
            type="text"
            className="encounter-name-input"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameEdit}
            onKeyDown={handleNameKeyPress}
            autoFocus
            maxLength={50}
          />
        ) : (
          <button 
            className="encounter-name"
            onClick={handleNameEdit}
            title="Click to edit encounter name"
          >
            {state.encounterName}
          </button>
        )}
        <span className="round-counter">Round {state.round}</span>
      </div>
      
      <div className="turn-controls">
        <button
          className="btn btn-secondary"
          onClick={actions.prevTurn}
          disabled={!canGoPrev}
          title="Previous turn (keyboard shortcut: ←)"
        >
          ← Prev
        </button>
        
        <button
          className="btn btn-primary"
          onClick={actions.nextTurn}
          disabled={!canGoNext}
          title="Next turn (keyboard shortcut: →)"
        >
          Next →
        </button>
      </div>

      <div className="action-controls">
        <button
          className="btn btn-primary"
          onClick={handleSaveEncounter}
          title="Save encounter to library"
          disabled={state.combatants.length === 0}
        >
          Save
        </button>

        <button
          className="btn btn-secondary"
          onClick={actions.clearEncounter}
          title="Clear all combatants"
        >
          Clear
        </button>

        <button
          className="btn btn-secondary"
          onClick={handlePrint}
          title="Print encounter"
        >
          Print
        </button>
      </div>
    </header>
  );
}

export default TopBar;