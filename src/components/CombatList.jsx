import React from 'react';
import { useEncounter } from '../state/EncounterContext.jsx';
import CombatRow from './CombatRow.jsx';

function CombatList() {
  const { state } = useEncounter();

  if (state.combatants.length === 0) {
    return (
      <div className="combat-list-empty">
        <p>No combatants added yet.</p>
        <p>Add combatants above to start tracking initiative!</p>
      </div>
    );
  }

  return (
    <div className="combat-list" role="list">
      <div className="combat-list-header">
        <span>Initiative Order</span>
        <span className="combatant-count">
          {state.combatants.length} combatant{state.combatants.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {state.combatants.map((combatant, index) => (
        <CombatRow
          key={combatant.id}
          combatant={combatant}
          index={index}
          isActive={index === state.activeIndex}
          isNext={index === (state.activeIndex + 1) % state.combatants.length}
        />
      ))}
      
      <div className="round-indicator">
        <div className="round-status" aria-live="polite">
          Round {state.round} • {state.combatants[state.activeIndex]?.name}'s turn
        </div>
      </div>
    </div>
  );
}

export default CombatList;