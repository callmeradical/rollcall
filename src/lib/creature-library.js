// Creature Library Management
// Handles storage and management of predefined creatures and encounters

const CREATURE_LIBRARY_KEY = 'rollcall_creature_library';
const ENCOUNTER_LIBRARY_KEY = 'rollcall_encounter_library';

// Default creatures to seed the library
const DEFAULT_CREATURES = [
  {
    id: 'goblin_basic',
    name: 'Goblin',
    type: 'Monster',
    cr: '1/4',
    ac: 15,
    hp: 7,
    speed: '30 ft',
    stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    savingThrows: [],
    skills: ['Stealth +6'],
    vulnerabilities: [],
    resistances: [],
    immunities: [],
    conditionImmunities: [],
    senses: ['Darkvision 60 ft'],
    languages: ['Common', 'Goblin'],
    abilities: ['Nimble Escape'],
    actions: ['Scimitar', 'Shortbow'],
    reactions: [],
    legendaryActions: [],
    source: 'Monster Manual',
    sourceBook: 'MM',
    tags: ['humanoid', 'goblinoid', 'common'],
    notes: 'Basic goblin warrior'
  },
  {
    id: 'orc_basic',
    name: 'Orc',
    type: 'Monster',
    cr: '1',
    ac: 13,
    hp: 15,
    speed: '30 ft',
    stats: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    savingThrows: [],
    skills: ['Intimidation +2'],
    vulnerabilities: [],
    resistances: [],
    immunities: [],
    conditionImmunities: [],
    senses: ['Darkvision 60 ft'],
    languages: ['Common', 'Orc'],
    abilities: ['Aggressive'],
    actions: ['Greataxe', 'Javelin'],
    reactions: [],
    legendaryActions: [],
    source: 'Monster Manual',
    sourceBook: 'Orc',
    tags: ['humanoid', 'orc', 'common'],
    notes: 'Savage orc warrior'
  },
  {
    id: 'skeleton_basic',
    name: 'Skeleton',
    type: 'Monster',
    cr: '1/4',
    ac: 13,
    hp: 13,
    speed: '30 ft',
    stats: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    savingThrows: [],
    skills: [],
    vulnerabilities: ['Bludgeoning'],
    resistances: [],
    immunities: ['Poison'],
    conditionImmunities: ['Exhaustion', 'Poisoned'],
    senses: ['Darkvision 60 ft'],
    languages: [],
    abilities: [],
    actions: ['Shortsword', 'Shortbow'],
    reactions: [],
    legendaryActions: [],
    source: 'Monster Manual',
    sourceBook: 'MM',
    tags: ['undead', 'common'],
    notes: 'Animated skeleton warrior'
  }
];

// Creature data structure
export function createCreature({
  id = null,
  name = '',
  type = 'Monster',
  cr = '1',
  ac = 10,
  hp = 10,
  speed = '30 ft',
  str = 10, dex = 10, con = 10, int = 10, wis = 10, cha = 10,
  savingThrows = [],
  skills = [],
  vulnerabilities = [],
  resistances = [],
  immunities = [],
  conditionImmunities = [],
  senses = [],
  languages = [],
  abilities = [],
  actions = [],
  reactions = [],
  legendaryActions = [],
  source = 'Custom',
  tags = [],
  notes = '',
  customFields = {}
} = {}) {
  return {
    id: id || `creature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    cr,
    ac: Number(ac),
    hp: Number(hp),
    speed,
    stats: { str: Number(str), dex: Number(dex), con: Number(con), int: Number(int), wis: Number(wis), cha: Number(cha) },
    savingThrows: Array.isArray(savingThrows) ? savingThrows : [],
    skills: Array.isArray(skills) ? skills : [],
    vulnerabilities: Array.isArray(vulnerabilities) ? vulnerabilities : [],
    resistances: Array.isArray(resistances) ? resistances : [],
    immunities: Array.isArray(immunities) ? immunities : [],
    conditionImmunities: Array.isArray(conditionImmunities) ? conditionImmunities : [],
    senses: Array.isArray(senses) ? senses : [],
    languages: Array.isArray(languages) ? languages : [],
    abilities: Array.isArray(abilities) ? abilities : [],
    actions: Array.isArray(actions) ? actions : [],
    reactions: Array.isArray(reactions) ? reactions : [],
    legendaryActions: Array.isArray(legendaryActions) ? legendaryActions : [],
    source,
    tags: Array.isArray(tags) ? tags : [],
    notes,
    customFields: customFields || {},
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Encounter data structure
export function createEncounter({
  id = null,
  name = '',
  description = '',
  creatures = [], // Array of { creatureId, count, notes }
  environment = '',
  difficulty = 'medium',
  tags = [],
  notes = '',
  source = 'Custom'
} = {}) {
  return {
    id: id || `encounter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    creatures: Array.isArray(creatures) ? creatures : [],
    environment,
    difficulty,
    tags: Array.isArray(tags) ? tags : [],
    notes,
    source,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Storage functions for creature library
export function saveCreatureLibrary(creatures) {
  try {
    localStorage.setItem(CREATURE_LIBRARY_KEY, JSON.stringify(creatures));
    return true;
  } catch (error) {
    console.warn('Failed to save creature library:', error);
    return false;
  }
}

export function loadCreatureLibrary() {
  try {
    const saved = localStorage.getItem(CREATURE_LIBRARY_KEY);
    if (saved) {
      return JSON.parse(saved);
    } else {
      // Initialize with default creatures
      saveCreatureLibrary(DEFAULT_CREATURES);
      return DEFAULT_CREATURES;
    }
  } catch (error) {
    console.warn('Failed to load creature library:', error);
    return DEFAULT_CREATURES;
  }
}

export function addCreatureToLibrary(creature) {
  const library = loadCreatureLibrary();
  const newCreature = createCreature(creature);
  const updatedLibrary = [...library, newCreature];
  saveCreatureLibrary(updatedLibrary);
  return newCreature;
}

export function updateCreatureInLibrary(id, updates) {
  const library = loadCreatureLibrary();
  const updatedLibrary = library.map(creature =>
    creature.id === id
      ? { ...creature, ...updates, updatedAt: Date.now() }
      : creature
  );
  saveCreatureLibrary(updatedLibrary);
  return updatedLibrary.find(c => c.id === id);
}

export function removeCreatureFromLibrary(id) {
  const library = loadCreatureLibrary();
  const updatedLibrary = library.filter(creature => creature.id !== id);
  saveCreatureLibrary(updatedLibrary);
  return true;
}

// Storage functions for encounter library
export function saveEncounterLibrary(encounters) {
  try {
    localStorage.setItem(ENCOUNTER_LIBRARY_KEY, JSON.stringify(encounters));
    return true;
  } catch (error) {
    console.warn('Failed to save encounter library:', error);
    return false;
  }
}

export function loadEncounterLibrary() {
  try {
    const saved = localStorage.getItem(ENCOUNTER_LIBRARY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Failed to load encounter library:', error);
    return [];
  }
}

export function addEncounterToLibrary(encounter) {
  const library = loadEncounterLibrary();
  const newEncounter = createEncounter(encounter);
  const updatedLibrary = [...library, newEncounter];
  saveEncounterLibrary(updatedLibrary);
  return newEncounter;
}

export function updateEncounterInLibrary(id, updates) {
  const library = loadEncounterLibrary();
  const updatedLibrary = library.map(encounter =>
    encounter.id === id
      ? { ...encounter, ...updates, updatedAt: Date.now() }
      : encounter
  );
  saveEncounterLibrary(updatedLibrary);
  return updatedLibrary.find(e => e.id === id);
}

export function removeEncounterFromLibrary(id) {
  const library = loadEncounterLibrary();
  const updatedLibrary = library.filter(encounter => encounter.id !== id);
  saveEncounterLibrary(updatedLibrary);
  return true;
}

// Utility functions
export function searchCreatures(creatures, query, filters = {}) {
  const normalizedQuery = query.toLowerCase().trim();

  return creatures.filter(creature => {
    // Text search
    const matchesQuery = !normalizedQuery ||
      creature.name.toLowerCase().includes(normalizedQuery) ||
      creature.type.toLowerCase().includes(normalizedQuery) ||
      creature.source.toLowerCase().includes(normalizedQuery) ||
      creature.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
      creature.notes.toLowerCase().includes(normalizedQuery);

    // Filter by type
    const matchesType = !filters.type || creature.type === filters.type;

    // Filter by CR
    const matchesCR = !filters.cr || creature.cr === filters.cr;

    // Filter by source
    const matchesSource = !filters.source || creature.source === filters.source;

    // Filter by tags
    const matchesTags = !filters.tags || filters.tags.length === 0 ||
      filters.tags.every(tag => creature.tags.includes(tag));

    return matchesQuery && matchesType && matchesCR && matchesSource && matchesTags;
  });
}

export function getCreatureModifier(score) {
  return Math.floor((score - 10) / 2);
}

export function calculateInitiativeBonus(creature) {
  return getCreatureModifier(creature.stats.dex);
}

// Convert creature to combatant format
export function creatureToCombatant(creature, overrides = {}) {
  const dexMod = getCreatureModifier(creature.stats.dex);

  return {
    name: overrides.name || creature.name,
    type: creature.type,
    init: overrides.init !== undefined ? Number(overrides.init) : 0,
    dex: dexMod,
    hp: overrides.hp !== undefined ? Number(overrides.hp) : creature.hp,
    ac: creature.ac,
    notes: overrides.notes || creature.notes,
    tags: [...creature.tags, ...(overrides.tags || [])],
    conditions: overrides.conditions || [],
    hidden: overrides.hidden || false,
    isHeldAction: false,
    // Store reference to original creature
    creatureId: creature.id
  };
}

// Export/Import functions
export function exportCreatureLibrary() {
  const library = loadCreatureLibrary();
  const dataStr = JSON.stringify(library, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', 'creature-library.json');
  linkElement.click();
}

export function exportEncounterLibrary() {
  const library = loadEncounterLibrary();
  const dataStr = JSON.stringify(library, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', 'encounter-library.json');
  linkElement.click();
}

export function importCreatureLibrary(data, merge = false) {
  if (!Array.isArray(data)) {
    throw new Error('Invalid creature library format');
  }

  const existing = merge ? loadCreatureLibrary() : [];
  const imported = data.map(creature => createCreature(creature));

  // Remove duplicates by ID
  const combined = [...existing];
  imported.forEach(creature => {
    const existingIndex = combined.findIndex(c => c.id === creature.id);
    if (existingIndex >= 0) {
      combined[existingIndex] = creature;
    } else {
      combined.push(creature);
    }
  });

  saveCreatureLibrary(combined);
  return combined;
}

export function importEncounterLibrary(data, merge = false) {
  if (!Array.isArray(data)) {
    throw new Error('Invalid encounter library format');
  }

  const existing = merge ? loadEncounterLibrary() : [];
  const imported = data.map(encounter => createEncounter(encounter));

  // Remove duplicates by ID
  const combined = [...existing];
  imported.forEach(encounter => {
    const existingIndex = combined.findIndex(e => e.id === encounter.id);
    if (existingIndex >= 0) {
      combined[existingIndex] = encounter;
    } else {
      combined.push(encounter);
    }
  });

  saveEncounterLibrary(combined);
  return combined;
}