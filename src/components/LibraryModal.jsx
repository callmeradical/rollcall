import React, { useState, useEffect } from 'react';
import {
  loadCreatureLibrary,
  loadEncounterLibrary,
  addCreatureToLibrary,
  updateCreatureInLibrary,
  removeCreatureFromLibrary,
  searchCreatures,
  creatureToCombatant,
  getCreatureModifier,
  exportCreatureLibrary,
  exportEncounterLibrary,
  importCreatureLibrary,
  importEncounterLibrary
} from '../lib/creature-library.js';
import {
  loadCoreCreatures,
  loadAllCreatures,
  loadCreaturesBySource,
  getAvailableSources,
  searchOfficialCreatures,
  mergeWithCustomLibrary,
  preloadCommonCreatures
} from '../lib/official-creatures.js';
import StatBlockModal from './StatBlockModal.jsx';

export default function LibraryModal({ isOpen, onClose, onAddCombatant, onViewStatBlock }) {
  const [activeTab, setActiveTab] = useState('creatures');
  const [creatureFilter, setCreatureFilter] = useState('all'); // 'all', 'official', 'custom'
  const [allCreatures, setAllCreatures] = useState([]);
  const [customCreatures, setCustomCreatures] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [editingCreature, setEditingCreature] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableSources, setAvailableSources] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadLibraryData();
    }
  }, [isOpen]);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      // Always load custom creatures and encounters
      const customCrs = loadCreatureLibrary();
      setCustomCreatures(customCrs);
      setEncounters(loadEncounterLibrary());

      // Try to load official creatures
      try {
        const [officialCrs, sources] = await Promise.all([
          loadCoreCreatures(), // Start with core creatures for performance
          getAvailableSources()
        ]);

        // Merge official and custom creatures
        const mergedCreatures = mergeWithCustomLibrary(officialCrs, customCrs);
        setAllCreatures(mergedCreatures);
        setAvailableSources(sources);
      } catch (officialError) {
        console.warn('Could not load official creatures, using custom only:', officialError);
        // Fallback to custom creatures only
        setAllCreatures(customCrs);
        setAvailableSources([]);
      }
    } catch (error) {
      console.error('Error loading library data:', error);
      // Fallback to custom creatures only
      const customCrs = loadCreatureLibrary();
      setCustomCreatures(customCrs);
      setAllCreatures(customCrs);
    } finally {
      setLoading(false);
    }
  };

  // Filter creatures based on current filter setting
  const currentCreatures = (() => {
    switch (creatureFilter) {
      case 'official':
        return allCreatures.filter(c => c.sourceBook && c.sourceBook !== 'Custom');
      case 'custom':
        return allCreatures.filter(c => !c.sourceBook || c.sourceBook === 'Custom');
      default:
        return allCreatures;
    }
  })();

  const filteredCreatures = searchOfficialCreatures(currentCreatures, searchQuery, filters);

  const handleAddCreature = (creatureData) => {
    const newCreature = addCreatureToLibrary(creatureData);
    const updatedCustom = loadCreatureLibrary();
    setCustomCreatures(updatedCustom);
    loadLibraryData();
    setShowAddForm(false);
  };

  const handleUpdateCreature = (id, updates) => {
    updateCreatureInLibrary(id, updates);
    const updatedCustom = loadCreatureLibrary();
    setCustomCreatures(updatedCustom);
    loadLibraryData();
    setEditingCreature(null);
  };

  const handleDeleteCreature = (id) => {
    if (confirm('Are you sure you want to delete this creature?')) {
      removeCreatureFromLibrary(id);
      const updatedCustom = loadCreatureLibrary();
      setCustomCreatures(updatedCustom);
      loadLibraryData();
    }
  };

  const handleCreatureFilterChange = (filter) => {
    setCreatureFilter(filter);
    setSearchQuery('');
    setFilters({});
  };

  const rollInitiative = (dexMod = 0) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    return roll + dexMod;
  };

  const handleAddToEncounter = (creature, quantity = 1, rollInit = false) => {
    for (let i = 0; i < quantity; i++) {
      const combatant = creatureToCombatant(creature, {
        name: quantity > 1 ? `${creature.name} ${i + 1}` : creature.name
      });

      if (rollInit) {
        const dexMod = getCreatureModifier(creature.stats.dex);
        combatant.init = rollInitiative(dexMod);
      }

      onAddCombatant(combatant);
    }
  };

  const handleViewStatBlock = (creature) => {
    if (onViewStatBlock) {
      onViewStatBlock(creature);
    }
  };

  const handleImportFile = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (type === 'creatures') {
          importCreatureLibrary(data, true);
          setCreatures(loadCreatureLibrary());
        } else if (type === 'encounters') {
          importEncounterLibrary(data, true);
          setEncounters(loadEncounterLibrary());
        }
      } catch (error) {
        alert('Failed to import file: ' + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal library-modal">
        <div className="modal-header">
          <h2>Creature & Encounter Library</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'creatures' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('creatures')}
          >
            Creatures
          </button>
          <button
            className={`tab ${activeTab === 'encounters' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('encounters')}
          >
            Encounters
          </button>
        </div>

        <div className="modal-content library-content">
          {activeTab === 'creatures' && (
            <CreatureTab
              creatureFilter={creatureFilter}
              onCreatureFilterChange={handleCreatureFilterChange}
              creatures={filteredCreatures}
              allCreatures={allCreatures}
              customCreatures={customCreatures}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              onAddToEncounter={handleAddToEncounter}
              onEdit={setEditingCreature}
              onDelete={handleDeleteCreature}
              onAdd={() => setShowAddForm(true)}
              onExport={exportCreatureLibrary}
              onImport={(e) => handleImportFile(e, 'creatures')}
              loading={loading}
              availableSources={availableSources}
              onLoadSource={loadCreaturesBySource}
              rollInitiative={rollInitiative}
              onViewStatBlock={handleViewStatBlock}
            />
          )}

          {activeTab === 'encounters' && (
            <EncounterTab
              encounters={encounters}
              creatures={allCreatures}
              onLoadEncounter={(encounter) => {
                // Load encounter into current session
                encounter.creatures.forEach(({ creatureId, count }) => {
                  const creature = allCreatures.find(c => c.id === creatureId);
                  if (creature) {
                    handleAddToEncounter(creature, count);
                  }
                });
                onClose();
              }}
              onExport={exportEncounterLibrary}
              onImport={(e) => handleImportFile(e, 'encounters')}
            />
          )}
        </div>

        {showAddForm && (
          <CreatureForm
            onSave={handleAddCreature}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {editingCreature && (
          <CreatureForm
            creature={editingCreature}
            onSave={(data) => handleUpdateCreature(editingCreature.id, data)}
            onCancel={() => setEditingCreature(null)}
          />
        )}

      </div>
    </div>
  );
}

function CreatureTab({
  creatureFilter,
  onCreatureFilterChange,
  creatures,
  allCreatures,
  customCreatures,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onAddToEncounter,
  onEdit,
  onDelete,
  onAdd,
  onExport,
  onImport,
  loading,
  availableSources,
  onLoadSource,
  rollInitiative,
  onViewStatBlock
}) {
  const [selectedQuantity, setSelectedQuantity] = useState({});

  const uniqueTypes = [...new Set(creatures.map(c => c.type))];
  const uniqueCRs = [...new Set(creatures.map(c => c.cr))].sort();
  const uniqueSources = [...new Set(creatures.map(c => c.source))];

  const officialCount = allCreatures.filter(c => c.sourceBook && c.sourceBook !== 'Custom').length;
  const customCount = allCreatures.filter(c => !c.sourceBook || c.sourceBook === 'Custom').length;

  return (
    <div className="creature-tab">
      <div className="creature-tab-layout">
        <div className="creature-sidebar">
          <h3>Filter Creatures</h3>
          <div className="creature-filter-buttons">
            <button
              className={`filter-btn ${creatureFilter === 'all' ? 'active' : ''}`}
              onClick={() => onCreatureFilterChange('all')}
            >
              All ({allCreatures.length})
            </button>
            <button
              className={`filter-btn official ${creatureFilter === 'official' ? 'active' : ''}`}
              onClick={() => onCreatureFilterChange('official')}
            >
              <span className="official-icon">⚡</span>
              Official ({officialCount})
            </button>
            <button
              className={`filter-btn custom ${creatureFilter === 'custom' ? 'active' : ''}`}
              onClick={() => onCreatureFilterChange('custom')}
            >
              <span className="custom-icon">✎</span>
              Custom ({customCount})
            </button>
          </div>
        </div>

        <div className="creature-main-content">

      <div className="library-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search creatures..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="library-search"
          />
        </div>

        <div className="filter-bar">
          <select
            value={filters.type || ''}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value || undefined })}
            className="filter-select"
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.cr || ''}
            onChange={(e) => onFiltersChange({ ...filters, cr: e.target.value || undefined })}
            className="filter-select"
          >
            <option value="">All CRs</option>
            {uniqueCRs.map(cr => (
              <option key={cr} value={cr}>CR {cr}</option>
            ))}
          </select>

          <select
            value={filters.source || ''}
            onChange={(e) => onFiltersChange({ ...filters, source: e.target.value || undefined })}
            className="filter-select"
          >
            <option value="">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div className="library-actions">
          {creatureFilter === 'custom' && (
            <>
              <button className="btn btn-primary" onClick={onAdd}>
                Add Creature
              </button>
              <button className="btn btn-secondary" onClick={onExport}>
                Export Library
              </button>
              <label className="btn btn-secondary">
                Import Library
                <input
                  type="file"
                  accept=".json"
                  onChange={onImport}
                  style={{ display: 'none' }}
                />
              </label>
            </>
          )}
          {creatureFilter === 'official' && availableSources.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onLoadSource(e.target.value).then(newCreatures => {
                    // Handle loading additional sources
                    console.log(`Loaded ${newCreatures.length} creatures from ${e.target.value}`);
                  });
                }
              }}
              className="filter-select"
            >
              <option value="">Load Additional Sources...</option>
              {availableSources.map(source => (
                <option key={source.key} value={source.key}>
                  {source.name} ({source.count} creatures)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="creature-list">
        {loading ? (
          <div className="library-empty">
            <p>Loading creatures...</p>
          </div>
        ) : creatures.length === 0 ? (
          <div className="library-empty">
            <p>No creatures found</p>
            {creatureFilter === 'custom' ? (
              <p>Add some creatures to your library to get started</p>
            ) : (
              <p>Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          creatures.map(creature => (
            <CreatureCard
              key={creature.id}
              creature={creature}
              quantity={selectedQuantity[creature.id] || 1}
              onQuantityChange={(qty) =>
                setSelectedQuantity({ ...selectedQuantity, [creature.id]: qty })
              }
              onAddToEncounter={() =>
                onAddToEncounter(creature, selectedQuantity[creature.id] || 1)
              }
              onAddWithInitiative={() =>
                onAddToEncounter(creature, selectedQuantity[creature.id] || 1, true)
              }
              onEdit={!creature.sourceBook || creature.sourceBook === 'Custom' ? () => onEdit(creature) : null}
              onDelete={!creature.sourceBook || creature.sourceBook === 'Custom' ? () => onDelete(creature.id) : null}
              rollInitiative={rollInitiative}
              onViewStatBlock={() => onViewStatBlock(creature)}
            />
          ))
        )}
      </div>
        </div>
      </div>
    </div>
  );
}

function CreatureCard({ creature, quantity, onQuantityChange, onAddToEncounter, onAddWithInitiative, onEdit, onDelete, rollInitiative, onViewStatBlock }) {
  const dexMod = getCreatureModifier(creature.stats.dex);
  const isOfficialCreature = creature.sourceBook && creature.sourceBook !== 'Custom';

  return (
    <div className={`creature-card ${isOfficialCreature ? 'official' : 'custom'}`}>
      <div className="creature-header">
        <div className="creature-title">
          <button
            className="creature-name-button"
            onClick={onViewStatBlock}
            title="Click to view detailed stat block"
          >
            {creature.name}
          </button>
          <div className="creature-details">
            <span className={`type-chip type-chip--${creature.type.toLowerCase()}`}>
              {creature.type}
            </span>
            <span className="cr-badge">CR {creature.cr}</span>
          </div>
        </div>

        <div className="creature-actions">
          <div className="quantity-control">
            <label>Qty:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
              className="quantity-input"
            />
          </div>
          <div className="add-buttons">
            <button className="btn btn-primary btn-small" onClick={onAddToEncounter}>
              Add to Encounter
            </button>
            <button
              className="btn btn-secondary btn-small"
              onClick={onAddWithInitiative}
              title="Add with rolled initiative"
            >
              Add + Roll Init
            </button>
          </div>
          <div className="creature-card-actions">
            {onEdit && (
              <button className="btn btn-secondary btn-small" onClick={onEdit}>
                Edit
              </button>
            )}
            {onDelete && (
              <button className="btn btn-secondary btn-small menu-item-danger" onClick={onDelete}>
                Delete
              </button>
            )}
          </div>
          {isOfficialCreature ? (
            <span className="official-badge">Official</span>
          ) : (
            <span className="custom-badge">Custom</span>
          )}
        </div>
      </div>

      <div className="creature-stats">
        <div className="stat-row">
          <span><strong>AC:</strong> {creature.ac}</span>
          <span><strong>HP:</strong> {creature.hp}</span>
          <span><strong>Speed:</strong> {creature.speed}</span>
          <span><strong>Init Bonus:</strong> {dexMod >= 0 ? '+' : ''}{dexMod}</span>
        </div>

        <div className="ability-scores">
          <div className="ability">
            <div className="ability-score">{creature.stats.str}</div>
            <div className="ability-name">STR</div>
          </div>
          <div className="ability">
            <div className="ability-score">{creature.stats.dex}</div>
            <div className="ability-name">DEX</div>
          </div>
          <div className="ability">
            <div className="ability-score">{creature.stats.con}</div>
            <div className="ability-name">CON</div>
          </div>
          <div className="ability">
            <div className="ability-score">{creature.stats.int}</div>
            <div className="ability-name">INT</div>
          </div>
          <div className="ability">
            <div className="ability-score">{creature.stats.wis}</div>
            <div className="ability-name">WIS</div>
          </div>
          <div className="ability">
            <div className="ability-score">{creature.stats.cha}</div>
            <div className="ability-name">CHA</div>
          </div>
        </div>

        {creature.notes && (
          <div className="creature-notes">
            <p>{creature.notes}</p>
          </div>
        )}

        {creature.tags.length > 0 && (
          <div className="creature-tags">
            {creature.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EncounterTab({ encounters, creatures, onLoadEncounter, onExport, onImport }) {
  return (
    <div className="encounter-tab">
      <div className="library-controls">
        <div className="library-actions">
          <button className="btn btn-secondary" onClick={onExport}>
            Export Encounters
          </button>
          <label className="btn btn-secondary">
            Import Encounters
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="encounter-list">
        {encounters.length === 0 ? (
          <div className="library-empty">
            <p>No saved encounters</p>
            <p>Save encounters from the main screen to build your library</p>
          </div>
        ) : (
          encounters.map(encounter => (
            <EncounterCard
              key={encounter.id}
              encounter={encounter}
              creatures={creatures}
              onLoad={() => onLoadEncounter(encounter)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EncounterCard({ encounter, creatures, onLoad }) {
  return (
    <div className="encounter-card">
      <div className="encounter-header">
        <h3>{encounter.name}</h3>
        <button className="btn btn-primary" onClick={onLoad}>
          Load Encounter
        </button>
      </div>

      {encounter.description && (
        <p className="encounter-description">{encounter.description}</p>
      )}

      <div className="encounter-creatures">
        {encounter.creatures.map(({ creatureId, count }, index) => {
          const creature = creatures.find(c => c.id === creatureId);
          return creature ? (
            <div key={index} className="encounter-creature">
              <span>{count}x {creature.name}</span>
              <span className="cr-badge">CR {creature.cr}</span>
            </div>
          ) : (
            <div key={index} className="encounter-creature missing">
              <span>{count}x Unknown Creature</span>
            </div>
          );
        })}
      </div>

      {encounter.tags.length > 0 && (
        <div className="encounter-tags">
          {encounter.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function CreatureForm({ creature, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    creature || {
      name: '',
      type: 'Monster',
      cr: '1',
      ac: 10,
      hp: 10,
      speed: '30 ft',
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
      source: 'Custom',
      tags: [],
      notes: ''
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="modal-overlay">
      <div className="modal creature-form-modal">
        <div className="modal-header">
          <h2>{creature ? 'Edit Creature' : 'Add Creature'}</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit} className="creature-form">
            <div className="form-row">
              <div className="form-group form-group-wide">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="Monster">Monster</option>
                  <option value="NPC">NPC</option>
                  <option value="PC">PC</option>
                </select>
              </div>
              <div className="form-group">
                <label>CR</label>
                <input
                  type="text"
                  value={formData.cr}
                  onChange={(e) => handleChange('cr', e.target.value)}
                  placeholder="1/4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>AC</label>
                <input
                  type="number"
                  value={formData.ac}
                  onChange={(e) => handleChange('ac', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>HP</label>
                <input
                  type="number"
                  value={formData.hp}
                  onChange={(e) => handleChange('hp', Number(e.target.value))}
                />
              </div>
              <div className="form-group form-group-wide">
                <label>Speed</label>
                <input
                  type="text"
                  value={formData.speed}
                  onChange={(e) => handleChange('speed', e.target.value)}
                  placeholder="30 ft"
                />
              </div>
            </div>

            <div className="form-row ability-row">
              <div className="form-group">
                <label>STR</label>
                <input
                  type="number"
                  value={formData.str}
                  onChange={(e) => handleChange('str', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>DEX</label>
                <input
                  type="number"
                  value={formData.dex}
                  onChange={(e) => handleChange('dex', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>CON</label>
                <input
                  type="number"
                  value={formData.con}
                  onChange={(e) => handleChange('con', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>INT</label>
                <input
                  type="number"
                  value={formData.int}
                  onChange={(e) => handleChange('int', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>WIS</label>
                <input
                  type="number"
                  value={formData.wis}
                  onChange={(e) => handleChange('wis', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>CHA</label>
                <input
                  type="number"
                  value={formData.cha}
                  onChange={(e) => handleChange('cha', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group-wide">
                <label>Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  placeholder="Monster Manual"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group-wide">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows="3"
                  placeholder="Special abilities, tactics, etc."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {creature ? 'Update' : 'Add'} Creature
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}