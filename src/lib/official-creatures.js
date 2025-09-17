// Official creature data loading from 5etools processed data
// This module handles loading and caching of official D&D 5e creatures

let cachedIndex = null;
let cachedCreatures = new Map();

// Load the creature index
export async function loadCreatureIndex() {
  if (cachedIndex) return cachedIndex;

  try {
    const response = await fetch('/data/creatures/index.json');
    if (!response.ok) {
      throw new Error(`Failed to load creature index: ${response.status}. Make sure to run 'npm run build:creatures' first.`);
    }
    cachedIndex = await response.json();
    return cachedIndex;
  } catch (error) {
    console.error('Error loading creature index:', error);
    // Return a default empty index for development
    cachedIndex = {
      totalCreatures: 0,
      sources: {},
      files: { bySource: [] },
      lastUpdated: new Date().toISOString(),
      version: 'dev'
    };
    return cachedIndex;
  }
}

// Load creatures from a specific source
export async function loadCreaturesBySource(source) {
  const sourceKey = source.toLowerCase();

  if (cachedCreatures.has(sourceKey)) {
    return cachedCreatures.get(sourceKey);
  }

  try {
    const response = await fetch(`/data/creatures/${sourceKey}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load creatures from ${source}: ${response.status}`);
    }
    const creatures = await response.json();
    cachedCreatures.set(sourceKey, creatures);
    return creatures;
  } catch (error) {
    console.error(`Error loading creatures from ${source}:`, error);
    throw error;
  }
}

// Load all creatures (warning: large file!)
export async function loadAllCreatures() {
  if (cachedCreatures.has('all')) {
    return cachedCreatures.get('all');
  }

  try {
    const response = await fetch('/data/creatures/all-creatures.json');
    if (!response.ok) {
      throw new Error(`Failed to load all creatures: ${response.status}`);
    }
    const creatures = await response.json();
    cachedCreatures.set('all', creatures);
    return creatures;
  } catch (error) {
    console.error('Error loading all creatures:', error);
    throw error;
  }
}

// Load core creatures (just MM and basic sources)
export async function loadCoreCreatures() {
  const coreSourcesKey = 'core';

  if (cachedCreatures.has(coreSourcesKey)) {
    return cachedCreatures.get(coreSourcesKey);
  }

  try {
    // Load from Monster Manual, Player's Handbook, and Volo's Guide
    const coreSources = ['mm', 'phb', 'vgm'];
    const allCreatures = [];

    for (const source of coreSources) {
      try {
        const creatures = await loadCreaturesBySource(source);
        allCreatures.push(...creatures);
      } catch (error) {
        console.warn(`Could not load ${source}:`, error.message);
      }
    }

    // If no creatures were loaded, return empty array
    cachedCreatures.set(coreSourcesKey, allCreatures);
    return allCreatures;
  } catch (error) {
    console.error('Error loading core creatures:', error);
    // Return empty array instead of throwing
    const emptyArray = [];
    cachedCreatures.set(coreSourcesKey, emptyArray);
    return emptyArray;
  }
}

// Search creatures across all loaded data
export function searchOfficialCreatures(creatures, query, filters = {}) {
  const normalizedQuery = query.toLowerCase().trim();

  return creatures.filter(creature => {
    // Text search
    const matchesQuery = !normalizedQuery ||
      creature.name.toLowerCase().includes(normalizedQuery) ||
      creature.type.toLowerCase().includes(normalizedQuery) ||
      creature.source.toLowerCase().includes(normalizedQuery) ||
      creature.sourceBook.toLowerCase().includes(normalizedQuery) ||
      creature.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
      creature.notes.toLowerCase().includes(normalizedQuery);

    // Filter by type
    const matchesType = !filters.type || creature.type === filters.type;

    // Filter by CR
    const matchesCR = !filters.cr || creature.cr === filters.cr;

    // Filter by source
    const matchesSource = !filters.source ||
      creature.source === filters.source ||
      creature.sourceBook === filters.source;

    // Filter by tags
    const matchesTags = !filters.tags || filters.tags.length === 0 ||
      filters.tags.every(tag => creature.tags.includes(tag));

    // Filter by CR range
    const matchesCRRange = !filters.crRange || matchesCRRange(creature.cr, filters.crRange);

    return matchesQuery && matchesType && matchesCR && matchesSource && matchesTags && matchesCRRange;
  });
}

// Helper function to check if CR matches a range
function matchesCRRange(cr, range) {
  const crValue = parseCR(cr);

  switch (range) {
    case 'low': return crValue <= 4;
    case 'medium': return crValue > 4 && crValue <= 10;
    case 'high': return crValue > 10 && crValue <= 16;
    case 'epic': return crValue > 16;
    default: return true;
  }
}

// Parse CR string to numeric value for comparison
function parseCR(cr) {
  if (typeof cr === 'number') return cr;
  if (typeof cr !== 'string') return 0;

  if (cr.includes('/')) {
    const [numerator, denominator] = cr.split('/').map(Number);
    return numerator / denominator;
  }

  return parseFloat(cr) || 0;
}

// Get available sources from the index
export async function getAvailableSources() {
  try {
    const index = await loadCreatureIndex();
    return index.files.bySource.map(source => ({
      key: source.source.toLowerCase(),
      name: source.name,
      source: source.source,
      count: source.count,
      filename: source.filename
    }));
  } catch (error) {
    console.error('Error getting available sources:', error);
    return [];
  }
}

// Get creature statistics
export async function getCreatureStats() {
  try {
    const index = await loadCreatureIndex();
    return {
      totalCreatures: index.totalCreatures,
      sources: Object.keys(index.sources).length,
      lastUpdated: index.lastUpdated,
      version: index.version
    };
  } catch (error) {
    console.error('Error getting creature stats:', error);
    return null;
  }
}

// Preload commonly used creature data
export async function preloadCommonCreatures() {
  try {
    // Load the most commonly used sources
    await Promise.all([
      loadCreaturesBySource('mm'),  // Monster Manual
      loadCreaturesBySource('phb'), // Player's Handbook
    ]);
  } catch (error) {
    console.warn('Could not preload common creatures:', error);
  }
}

// Clear creature cache (useful for development)
export function clearCreatureCache() {
  cachedIndex = null;
  cachedCreatures.clear();
}

// Export utility to merge official creatures with user's custom library
export function mergeWithCustomLibrary(officialCreatures, customCreatures) {
  // Create a map for quick lookups
  const customMap = new Map(customCreatures.map(c => [c.id, c]));

  // Convert official creatures to our library format and avoid duplicates
  const mergedCreatures = [...customCreatures];

  for (const creature of officialCreatures) {
    if (!customMap.has(creature.id)) {
      mergedCreatures.push(creature);
    }
  }

  return mergedCreatures;
}

// Get creature type distribution for filtering UI
export function getCreatureTypeDistribution(creatures) {
  const types = {};
  creatures.forEach(creature => {
    types[creature.type] = (types[creature.type] || 0) + 1;
  });
  return Object.entries(types).map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

// Get CR distribution for filtering UI
export function getCRDistribution(creatures) {
  const crs = {};
  creatures.forEach(creature => {
    crs[creature.cr] = (crs[creature.cr] || 0) + 1;
  });
  return Object.entries(crs).map(([cr, count]) => ({ cr, count }))
    .sort((a, b) => parseCR(a.cr) - parseCR(b.cr));
}

// Get source distribution for filtering UI
export function getSourceDistribution(creatures) {
  const sources = {};
  creatures.forEach(creature => {
    sources[creature.source] = (sources[creature.source] || 0) + 1;
  });
  return Object.entries(sources).map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}