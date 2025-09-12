import React, { useState } from 'react';
import { useEncounter } from '../state/EncounterContext.jsx';
import ConditionBadges from './ConditionBadges.jsx';

function CombatRow({ combatant, index, isActive, isNext }) {
  const { actions } = useEncounter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: combatant.name,
    hp: combatant.hp,
    ac: combatant.ac,
    notes: combatant.notes
  });
  const [showMenu, setShowMenu] = useState(false);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.action-menu')) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const handleEdit = () => {
    if (isEditing) {
      actions.updateCombatant(combatant.id, {
        name: editData.name.trim() || combatant.name,
        hp: Number(editData.hp) || 0,
        ac: Number(editData.ac) || 10,
        notes: editData.notes.trim()
      });
    } else {
      setEditData({
        name: combatant.name,
        hp: combatant.hp,
        ac: combatant.ac,
        notes: combatant.notes
      });
    }
    setIsEditing(!isEditing);
    setShowMenu(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditData({
        name: combatant.name,
        hp: combatant.hp,
        ac: combatant.ac,
        notes: combatant.notes
      });
      setIsEditing(false);
    }
  };

  const handleRemove = () => {
    actions.removeCombatant(combatant.id);
    setShowMenu(false);
  };

  const handleDuplicate = () => {
    actions.duplicateCombatant(combatant.id);
    setShowMenu(false);
  };

  const handleHold = () => {
    actions.holdAction(combatant.id);
    setShowMenu(false);
  };

  const handleSetActive = () => {
    actions.setActive(index);
    setShowMenu(false);
  };

  const rowClass = [
    'combat-row',
    isActive && 'combat-row--active',
    isNext && 'combat-row--next',
    combatant.hidden && 'combat-row--hidden',
    combatant.isHeldAction && 'combat-row--held'
  ].filter(Boolean).join(' ');

  const typeClass = `type-chip type-chip--${combatant.type.toLowerCase()}`;

  return (
    <div className={rowClass} role="listitem">
      <div className="combat-row-main" onClick={() => !isEditing && setIsEditing(true)}>
        <div className="turn-indicator">
          {isActive ? '▶' : isNext ? '▷' : '•'}
        </div>

        <div className="combatant-info">
          {isEditing ? (
            <input
              type="text"
              className="edit-input edit-name"
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              onBlur={handleEdit}
              onKeyDown={handleKeyPress}
              autoFocus
              maxLength={30}
            />
          ) : (
            <span className="combatant-name">{combatant.name}</span>
          )}
          
          <div className="combatant-chips">
            <span className={typeClass}>{combatant.type}</span>
            
            {!isEditing && (
              <div className="action-menu">
                <button
                  className="action-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  title="Actions"
                >
                  ⋯
                </button>
                
                {showMenu && (
                  <div className="menu-dropdown">
                    <button onClick={handleSetActive}>Set Active</button>
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={handleDuplicate}>Duplicate</button>
                    <button onClick={handleHold}>
                      {combatant.isHeldAction ? 'Release Hold' : 'Hold Action'}
                    </button>
                    <button onClick={handleRemove} className="menu-item-danger">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="combat-stats">
          <div className="stat-group">
            <span className="stat-label">HP</span>
            {isEditing ? (
              <input
                type="number"
                className="edit-input edit-hp"
                value={editData.hp}
                onChange={(e) => setEditData(prev => ({ ...prev, hp: e.target.value }))}
                onKeyDown={handleKeyPress}
                min="0"
                max="999"
              />
            ) : (
              <span className="stat-value">{combatant.hp}</span>
            )}
          </div>

          <div className="stat-group">
            <span className="stat-label">AC</span>
            {isEditing ? (
              <input
                type="number"
                className="edit-input edit-ac"
                value={editData.ac}
                onChange={(e) => setEditData(prev => ({ ...prev, ac: e.target.value }))}
                onKeyDown={handleKeyPress}
                min="1"
                max="30"
              />
            ) : (
              <span className="stat-value">{combatant.ac}</span>
            )}
          </div>

          <div className="stat-group">
            <span className="stat-label">INIT</span>
            <span className="stat-value">
              {combatant.init} 
              {combatant.dex !== 0 && (
                <span className="dex-mod">({combatant.dex > 0 ? '+' : ''}{combatant.dex})</span>
              )}
            </span>
          </div>
        </div>

        {combatant.notes && (
          <div className="combatant-notes">
            {isEditing ? (
              <input
                type="text"
                className="edit-input edit-notes"
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                onKeyDown={handleKeyPress}
                placeholder="Notes"
                maxLength={100}
              />
            ) : (
              <span className="notes-text">📝 {combatant.notes}</span>
            )}
          </div>
        )}
      </div>

      {combatant.conditions.length > 0 && (
        <ConditionBadges combatant={combatant} />
      )}

      {isEditing && (
        <div className="combat-row-actions">
          <button 
            className="btn btn-small btn-primary"
            onClick={handleEdit}
          >
            Save
          </button>
        </div>
      )}

      {combatant.isHeldAction && (
        <div className="held-indicator">
          ⏸ Held Action
        </div>
      )}
    </div>
  );
}

export default CombatRow;