import React, { useState } from 'react';
import { useEncounter } from '../state/EncounterContext.jsx';

function ConditionBadges({ combatant }) {
  const { actions } = useEncounter();
  const [showEditor, setShowEditor] = useState(false);
  const [newCondition, setNewCondition] = useState({
    name: '',
    remainingRounds: 1
  });

  const handleRemoveCondition = (conditionIndex) => {
    actions.removeCondition(combatant.id, conditionIndex);
  };

  const handleAddCondition = (e) => {
    e.preventDefault();
    if (!newCondition.name.trim()) return;

    actions.addCondition(combatant.id, {
      name: newCondition.name.trim(),
      remainingRounds: Math.max(1, Number(newCondition.remainingRounds) || 1)
    });

    setNewCondition({ name: '', remainingRounds: 1 });
    setShowEditor(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCondition(e);
    } else if (e.key === 'Escape') {
      setShowEditor(false);
      setNewCondition({ name: '', remainingRounds: 1 });
    }
  };

  return (
    <div className="condition-badges">
      <div className="conditions-list">
        {combatant.conditions.map((condition, index) => (
          <div key={index} className="condition-badge">
            <span className="condition-name">{condition.name}</span>
            {condition.remainingRounds && (
              <span className="condition-rounds">({condition.remainingRounds})</span>
            )}
            <button
              className="condition-remove"
              onClick={() => handleRemoveCondition(index)}
              title="Remove condition"
            >
              ×
            </button>
          </div>
        ))}
        
        {showEditor ? (
          <form className="condition-editor" onSubmit={handleAddCondition}>
            <input
              type="text"
              className="condition-input"
              placeholder="Condition name"
              value={newCondition.name}
              onChange={(e) => setNewCondition(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={handleKeyPress}
              maxLength={20}
              autoFocus
            />
            <input
              type="number"
              className="condition-rounds-input"
              placeholder="Rounds"
              value={newCondition.remainingRounds}
              onChange={(e) => setNewCondition(prev => ({ ...prev, remainingRounds: e.target.value }))}
              onKeyDown={handleKeyPress}
              min="1"
              max="99"
            />
            <button type="submit" className="btn-add-condition">+</button>
            <button 
              type="button" 
              className="btn-cancel-condition"
              onClick={() => {
                setShowEditor(false);
                setNewCondition({ name: '', remainingRounds: 1 });
              }}
            >
              ×
            </button>
          </form>
        ) : (
          <button
            className="btn-add-condition-badge"
            onClick={() => setShowEditor(true)}
            title="Add condition"
          >
            + Condition
          </button>
        )}
      </div>
    </div>
  );
}

export default ConditionBadges;