import React, { useState } from 'react';
import { useEncounter } from '../state/EncounterContext.jsx';

function AddCombatantForm({ isExpanded, setIsExpanded }) {
  const { actions } = useEncounter();
  const [activeTab, setActiveTab] = useState('single');
  const [formData, setFormData] = useState({
    name: '',
    type: 'PC',
    init: '',
    dex: '',
    hp: '',
    ac: '',
    notes: ''
  });
  const [partyData, setPartyData] = useState('');

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

  const handlePartySubmit = (e) => {
    e.preventDefault();
    
    if (!partyData.trim()) {
      return;
    }

    const lines = partyData
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    lines.forEach(line => {
      // Parse line format: "Name HP:## AC:## DEX:##" or just "Name"
      const parts = line.split(/\s+/);
      const name = parts[0];
      
      let hp = Number(formData.hp) || 0;
      let ac = Number(formData.ac) || 10;
      let dex = Number(formData.dex) || 0;

      // Parse HP:value, AC:value, DEX:value from the line
      parts.slice(1).forEach(part => {
        if (part.toUpperCase().startsWith('HP:')) {
          hp = Number(part.substring(3)) || hp;
        } else if (part.toUpperCase().startsWith('AC:')) {
          ac = Number(part.substring(3)) || ac;
        } else if (part.toUpperCase().startsWith('DEX:')) {
          dex = Number(part.substring(4)) || dex;
        }
      });

      const roll = Math.floor(Math.random() * 20) + 1;
      const initiative = roll + dex;

      actions.addCombatant({
        name: name,
        type: formData.type,
        init: initiative,
        dex: dex,
        hp: hp,
        ac: ac,
        notes: formData.notes.trim(),
        tags: [],
        conditions: []
      });
    });

    setPartyData('');
  };

  return (
    <div className="add-combatant-container">
      <div className="add-combatant-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="add-combatant-title">
          {isExpanded ? '⬇' : '⬆'} Add Combatant
        </span>
      </div>
      
      {isExpanded && (
        <div className="add-combatant-form">
          <div className="add-tabs">
            <button
              type="button"
              className={`tab-button ${activeTab === 'single' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('single')}
            >
              Single
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'party' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('party')}
            >
              Quick Party
            </button>
          </div>

          {activeTab === 'single' && (
            <form onSubmit={handleSubmit}>
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

          {activeTab === 'party' && (
            <form onSubmit={handlePartySubmit}>
              <div className="party-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="party-type">Type</label>
                    <select
                      id="party-type"
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                    >
                      <option value="PC">PC</option>
                      <option value="NPC">NPC</option>
                      <option value="Monster">Monster</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="party-dex">Dex Mod</label>
                    <input
                      id="party-dex"
                      type="number"
                      value={formData.dex}
                      onChange={(e) => handleChange('dex', e.target.value)}
                      placeholder="0"
                      min="-5"
                      max="10"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="party-hp">HP</label>
                    <input
                      id="party-hp"
                      type="number"
                      value={formData.hp}
                      onChange={(e) => handleChange('hp', e.target.value)}
                      placeholder="0"
                      min="0"
                      max="999"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="party-ac">AC</label>
                    <input
                      id="party-ac"
                      type="number"
                      value={formData.ac}
                      onChange={(e) => handleChange('ac', e.target.value)}
                      placeholder="10"
                      min="1"
                      max="30"
                    />
                  </div>
                </div>

                <div className="form-group form-group-wide">
                  <label htmlFor="party-data">Party Members (one per line)</label>
                  <textarea
                    id="party-data"
                    className="party-names-input"
                    value={partyData}
                    onChange={(e) => setPartyData(e.target.value)}
                    placeholder="Enter party member data, one per line:&#10;Aragorn HP:85 AC:18 DEX:2&#10;Legolas HP:65 AC:17 DEX:4&#10;Gimli HP:90 AC:19 DEX:0&#10;Gandalf HP:45 AC:15 DEX:1&#10;&#10;Or just names (uses default stats):&#10;Goblin1&#10;Goblin2"
                    rows="8"
                  />
                </div>

                <div className="form-group form-group-wide">
                  <label htmlFor="party-notes">Notes (applied to all)</label>
                  <input
                    id="party-notes"
                    type="text"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Notes applied to all party members"
                    maxLength={100}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!partyData.trim()}
                >
                  Add Party
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default AddCombatantForm;