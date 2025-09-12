import React, { useState } from 'react';
import { useEncounter } from '../state/EncounterContext.jsx';

function AddCombatantForm({ isExpanded, setIsExpanded }) {
  const { actions } = useEncounter();
  const [formData, setFormData] = useState({
    name: '',
    type: 'PC',
    init: '',
    dex: '',
    hp: '',
    ac: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    // Auto-roll initiative if not provided
    let initiative = Number(formData.init) || 0;
    if (!formData.init || formData.init === '') {
      const roll = Math.floor(Math.random() * 20) + 1;
      const dexMod = Number(formData.dex) || 0;
      initiative = roll + dexMod;
    }

    actions.addCombatant({
      name: formData.name.trim(),
      type: formData.type,
      init: initiative,
      dex: Number(formData.dex) || 0,
      hp: Number(formData.hp) || 0,
      ac: Number(formData.ac) || 10,
      notes: formData.notes.trim(),
      tags: [],
      conditions: []
    });

    setFormData({
      name: '',
      type: formData.type,
      init: '',
      dex: '',
      hp: '',
      ac: '',
      notes: ''
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const rollInitiative = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const dexMod = Number(formData.dex) || 0;
    const total = roll + dexMod;
    
    setFormData(prev => ({ ...prev, init: total.toString() }));
  };

  return (
    <div className="add-combatant-container">
      <div className="add-combatant-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="add-combatant-title">
          {isExpanded ? '⬇' : '⬆'} Add Combatant
        </span>
      </div>
      
      {isExpanded && (
        <form className="add-combatant-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Character name"
                maxLength={30}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="PC">PC</option>
                <option value="NPC">NPC</option>
                <option value="Monster">Monster</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="init">Initiative</label>
              <div className="input-with-button">
                <input
                  id="init"
                  type="number"
                  value={formData.init}
                  onChange={(e) => handleChange('init', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0"
                  min="-10"
                  max="50"
                />
                <button
                  type="button"
                  className="btn-roll"
                  onClick={rollInitiative}
                  title="Roll initiative (d20 + dex)"
                >
                  🎲
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dex">Dex Mod</label>
              <input
                id="dex"
                type="number"
                value={formData.dex}
                onChange={(e) => handleChange('dex', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                min="-5"
                max="10"
              />
            </div>

            <div className="form-group">
              <label htmlFor="hp">HP</label>
              <input
                id="hp"
                type="number"
                value={formData.hp}
                onChange={(e) => handleChange('hp', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                min="0"
                max="999"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ac">AC</label>
              <input
                id="ac"
                type="number"
                value={formData.ac}
                onChange={(e) => handleChange('ac', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="10"
                min="1"
                max="30"
              />
            </div>

            <div className="form-group form-group-wide">
              <label htmlFor="notes">Notes</label>
              <input
                id="notes"
                type="text"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Special abilities, conditions, etc."
                maxLength={100}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!formData.name.trim()}
            >
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AddCombatantForm;