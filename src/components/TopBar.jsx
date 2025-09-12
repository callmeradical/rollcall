import React, { useState } from 'react';
import { useEncounter } from '../state/EncounterContext.jsx';

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