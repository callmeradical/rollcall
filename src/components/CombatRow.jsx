import React, { useState } from 'react';
import { useEncounter } from '../state/EncounterContext.jsx';
import { loadCreatureLibrary } from '../lib/creature-library.js';
import ConditionBadges from './ConditionBadges.jsx';
import StatBlockModal from './StatBlockModal.jsx';

function CombatRow({ combatant, index, isActive, isNext, onViewStatBlock }) {
  const { actions } = useEncounter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: combatant.name,
    type: combatant.type,
    init: combatant.init,
    dex: combatant.dex,
    hp: combatant.hp,
    ac: combatant.ac,
    notes: combatant.notes
  });
  const [showMenu, setShowMenu] = useState(false);
  const [hpChange, setHpChange] = useState('');

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
        type: editData.type,
        init: Number(editData.init) || 0,
        dex: Number(editData.dex) || 0,
        hp: Number(editData.hp) || 0,
        ac: Number(editData.ac) || 10,
        notes: editData.notes.trim()
      });
    } else {
      setEditData({
        name: combatant.name,
        type: combatant.type,
        init: combatant.init,
        dex: combatant.dex,
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
        type: combatant.type,
        init: combatant.init,
        dex: combatant.dex,
        hp: combatant.hp,
        ac: combatant.ac,
        notes: combatant.notes
      });
      setIsEditing(false);
    }
  };

  const handleEditClick = (e) => {
    // Prevent edit mode from toggling when clicking on input fields
    e.stopPropagation();
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

  const handleHeal = () => {
    const healAmount = Number(hpChange) || 0;
    if (healAmount > 0) {
      const newHp = combatant.hp + healAmount;
      actions.updateCombatant(combatant.id, { hp: newHp });
      setHpChange('');
    }
  };

  const handleDamage = () => {
    const damageAmount = Number(hpChange) || 0;
    if (damageAmount > 0) {
      const newHp = Math.max(0, combatant.hp - damageAmount);
      actions.updateCombatant(combatant.id, { hp: newHp });
      setHpChange('');
    }
  };

  const handleHpChangeKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handleHeal();
      } else {
        handleDamage();
      }
    }
  };

  const handleViewStatBlock = () => {
    if (onViewStatBlock) {
      onViewStatBlock(combatant);
    }
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
      <div className="combat-row-main">
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
              onClick={handleEditClick}
              onKeyDown={handleKeyPress}
              autoFocus
              maxLength={30}
            />
          ) : (
            <button
              className="combatant-name combatant-name-button"
              onClick={handleViewStatBlock}
              title="Click to view stat block"
            >
              {combatant.name}
            </button>
          )}
          
          <div className="combatant-chips">
            {isEditing ? (
              <select
                className="edit-input edit-type"
                value={editData.type}
                onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value }))}
                onClick={handleEditClick}
              >
                <option value="PC">PC</option>
                <option value="NPC">NPC</option>
                <option value="Monster">Monster</option>
              </select>
            ) : (
              <span className={typeClass}>{combatant.type}</span>
            )}
            
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
          <div className="stat-group stat-group-hp">
            <span className="stat-label">HP</span>
            {isEditing ? (
              <input
                type="number"
                className="edit-input edit-hp"
                value={editData.hp}
                onChange={(e) => setEditData(prev => ({ ...prev, hp: e.target.value }))}
                onClick={handleEditClick}
                onKeyDown={handleKeyPress}
                min="0"
                max="999"
              />
            ) : (
              <>
                <span className="stat-value">{combatant.hp}</span>
                <div className="hp-controls">
                  <button 
                    className="hp-btn hp-btn-damage"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDamage();
                    }}
                    title="Apply damage"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="hp-change-input"
                    value={hpChange}
                    onChange={(e) => setHpChange(e.target.value)}
                    onKeyDown={handleHpChangeKeyPress}
                    placeholder="0"
                    min="0"
                    max="999"
                  />
                  <button 
                    className="hp-btn hp-btn-heal"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeal();
                    }}
                    title="Apply healing"
                  >
                    +
                  </button>
                </div>
              </>
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
                onClick={handleEditClick}
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
            {isEditing ? (
              <div className="init-edit-container">
                <input
                  type="number"
                  className="edit-input edit-init"
                  value={editData.init}
                  onChange={(e) => setEditData(prev => ({ ...prev, init: e.target.value }))}
                  onClick={handleEditClick}
                  onKeyDown={handleKeyPress}
                  placeholder="0"
                  min="-10"
                  max="50"
                />
                <input
                  type="number"
                  className="edit-input edit-dex"
                  value={editData.dex}
                  onChange={(e) => setEditData(prev => ({ ...prev, dex: e.target.value }))}
                  onClick={handleEditClick}
                  onKeyDown={handleKeyPress}
                  placeholder="Dex"
                  min="-5"
                  max="10"
                />
              </div>
            ) : (
              <span className="stat-value">
                {combatant.init} 
                {combatant.dex !== 0 && (
                  <span className="dex-mod">({combatant.dex > 0 ? '+' : ''}{combatant.dex})</span>
                )}
              </span>
            )}
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
                onClick={handleEditClick}
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