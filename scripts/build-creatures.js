#!/usr/bin/env node

/**
 * Build script to process 5etools creature data into optimized static assets
 * This script reads the 5etools bestiary files and converts them to our format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FIVETOOLS_PATH = path.join(PROJECT_ROOT, '5etools');
const BESTIARY_PATH = path.join(FIVETOOLS_PATH, 'data', 'bestiary');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public', 'data', 'creatures');

// Source book mappings
const SOURCE_BOOKS = {
  'MM': 'Monster Manual',
  'VGM': "Volo's Guide to Monsters",
  'MTF': "Mordenkainen's Tome of Foes",
  'MPMM': "Mordenkainen's Monsters of the Multiverse",
  'FTD': "Fizban's Treasury of Dragons",
  'BGG': "Bigby's Glory of Giants",
  'BMT': "The Book of Many Things",
  'PHB': "Player's Handbook",
  'DMG': "Dungeon Master's Guide",
  'TCE': "Tasha's Cauldron of Everything",
  'XGE': "Xanathar's Guide to Everything",
  'CoS': 'Curse of Strahd',
  'HotDQ': 'Hoard of the Dragon Queen',
  'PotA': 'Princes of the Apocalypse',
  'OotA': 'Out of the Abyss',
  'SKT': 'Storm King\'s Thunder',
  'ToA': 'Tomb of Annihilation',
  'WDH': 'Waterdeep: Dragon Heist',
  'WDMM': 'Waterdeep: Dungeon of the Mad Mage',
  'GoS': 'Ghosts of Saltmarsh',
  'BGDiA': 'Baldur\'s Gate: Descent into Avernus',
  'EGW': 'Explorer\'s Guide to Wildemount',
  'MOT': 'Mythic Odysseys of Theros',
  'IDRotF': 'Icewind Dale: Rime of the Frostmaiden',
  'TCRoN': 'The Call of the Netherdeep',
  'SCC': 'Strixhaven: A Curriculum of Chaos',
  'AAG': 'Astral Adventurer\'s Guide',
  'JTtRC': 'Journeys through the Radiant Citadel',
  'DSotDQ': 'Dragonlance: Shadow of the Dragon Queen',
  'GotSF': 'Glory of the Giants',
  'BMT': 'The Book of Many Things'
};

// Resolve _copy references and apply modifications
function resolveCopy(creature, creatureIndex) {
  if (!creature._copy) return creature;

  const copyRef = creature._copy;
  const sourceCreature = creatureIndex[`${copyRef.source}_${copyRef.name}`];

  if (!sourceCreature) {
    console.warn(`Warning: Could not find copy reference "${copyRef.name}" from "${copyRef.source}"`);
    return creature;
  }

  // Deep clone the source creature
  const resolved = JSON.parse(JSON.stringify(sourceCreature));

  // Override with any direct properties from the copying creature
  Object.keys(creature).forEach(key => {
    if (key !== '_copy') {
      resolved[key] = creature[key];
    }
  });

  // Apply modifications if they exist
  if (copyRef._mod) {
    return applyModifications(resolved, copyRef._mod);
  }

  return resolved;
}

// Apply _mod transformations to a creature
function applyModifications(creature, mods) {
  let modifiedCreature = creature;

  // Handle text replacements (*)
  if (mods['*']) {
    const globalMod = mods['*'];
    if (globalMod.mode === 'replaceTxt') {
      const regex = new RegExp(globalMod.replace, 'g');
      modifiedCreature = replaceInObject(modifiedCreature, regex, globalMod.with);
    }
  }

  // Handle trait modifications
  if (mods.trait) {
    if (Array.isArray(mods.trait)) {
      mods.trait.forEach(traitMod => {
        if (traitMod.mode === 'appendArr') {
          if (!modifiedCreature.trait) modifiedCreature.trait = [];
          modifiedCreature.trait.push(...traitMod.items);
        }
      });
    }
  }

  return modifiedCreature;
}

// Recursively replace text in object properties
function replaceInObject(obj, regex, replacement) {
  if (typeof obj === 'string') {
    return obj.replace(regex, replacement);
  } else if (Array.isArray(obj)) {
    return obj.map(item => replaceInObject(item, regex, replacement));
  } else if (obj && typeof obj === 'object') {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      newObj[key] = replaceInObject(obj[key], regex, replacement);
    });
    return newObj;
  }
  return obj;
}

// Convert 5etools creature to our format
function convertCreature(fiveToolsCreature) {
  const creature = {
    id: `5etools_${fiveToolsCreature.source}_${fiveToolsCreature.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name: fiveToolsCreature.name,
    type: 'Monster', // We'll extract this from the type field
    cr: formatCR(fiveToolsCreature.cr),
    ac: formatAC(fiveToolsCreature.ac),
    hp: formatHP(fiveToolsCreature.hp),
    speed: formatSpeed(fiveToolsCreature.speed),
    stats: {
      str: fiveToolsCreature.str || 10,
      dex: fiveToolsCreature.dex || 10,
      con: fiveToolsCreature.con || 10,
      int: fiveToolsCreature.int || 10,
      wis: fiveToolsCreature.wis || 10,
      cha: fiveToolsCreature.cha || 10
    },
    savingThrows: formatSavingThrows(fiveToolsCreature.save),
    skills: formatSkills(fiveToolsCreature.skill),
    vulnerabilities: formatDamageTypes(fiveToolsCreature.vulnerable),
    resistances: formatDamageTypes(fiveToolsCreature.resist),
    immunities: formatDamageTypes(fiveToolsCreature.immune),
    conditionImmunities: formatConditionImmunities(fiveToolsCreature.conditionImmune),
    senses: formatSenses(fiveToolsCreature.senses, fiveToolsCreature.passive),
    languages: formatLanguages(fiveToolsCreature.languages),
    abilities: formatTraits(fiveToolsCreature.trait),
    actions: formatActions(fiveToolsCreature.action),
    reactions: formatActions(fiveToolsCreature.reaction),
    legendaryActions: formatActions(fiveToolsCreature.legendary),
    source: SOURCE_BOOKS[fiveToolsCreature.source] || fiveToolsCreature.source,
    sourceBook: fiveToolsCreature.source,
    page: fiveToolsCreature.page,
    tags: extractTags(fiveToolsCreature),
    notes: '',
    customFields: {
      originalData: fiveToolsCreature,
      size: formatSize(fiveToolsCreature.size),
      alignment: formatAlignment(fiveToolsCreature.alignment),
      environment: fiveToolsCreature.environment || []
    }
  };

  // Extract type information
  if (fiveToolsCreature.type) {
    if (typeof fiveToolsCreature.type === 'string') {
      creature.type = capitalizeFirst(fiveToolsCreature.type);
    } else if (fiveToolsCreature.type.type) {
      creature.type = capitalizeFirst(fiveToolsCreature.type.type);
      if (fiveToolsCreature.type.tags) {
        creature.tags.push(...fiveToolsCreature.type.tags);
      }
    }
  }

  return creature;
}

// Helper functions for formatting
function formatAC(ac) {
  if (!ac) return 10;
  if (typeof ac === 'number') return ac;
  if (Array.isArray(ac)) {
    // Handle array of AC objects like [{"ac": 15, "from": ["Natural Armor"]}]
    const acEntry = ac[0];
    if (typeof acEntry === 'number') return acEntry;
    if (typeof acEntry === 'object' && acEntry.ac) return acEntry.ac;
    return 10;
  }
  if (typeof ac === 'object' && ac.ac) return ac.ac;
  return parseInt(ac) || 10;
}

function formatCR(cr) {
  if (!cr) return '0';
  if (typeof cr === 'string' || typeof cr === 'number') return String(cr);
  if (typeof cr === 'object') {
    // Handle objects like {"cr": "1/2", "lair": "1"}
    if (cr.cr !== undefined) return String(cr.cr);
    if (cr.lair !== undefined) return String(cr.lair);
  }
  return '0';
}

function formatHP(hp) {
  if (!hp) return 1;
  if (typeof hp === 'number') return hp;
  if (typeof hp === 'object') {
    // Handle objects like {"average": 22, "formula": "4d8 + 4"}
    if (hp.average !== undefined) return hp.average;
    if (hp.formula !== undefined) {
      // Try to extract number from formula like "4d8 + 4"
      const match = hp.formula.match(/(\d+)d\d+\s*[+]\s*(\d+)/);
      if (match) {
        const dice = parseInt(match[1]);
        const bonus = parseInt(match[2]);
        return Math.floor(dice * 4.5) + bonus; // Rough average
      }
    }
  }
  return parseInt(hp) || 1;
}

function formatSpeed(speed) {
  if (!speed) return '30 ft';
  if (typeof speed === 'number') return `${speed} ft`;

  const parts = [];
  if (speed.walk) parts.push(`${speed.walk} ft`);
  if (speed.fly) parts.push(`fly ${speed.fly} ft`);
  if (speed.swim) parts.push(`swim ${speed.swim} ft`);
  if (speed.climb) parts.push(`climb ${speed.climb} ft`);
  if (speed.burrow) parts.push(`burrow ${speed.burrow} ft`);

  return parts.join(', ') || '30 ft';
}

function formatSavingThrows(saves) {
  if (!saves) return [];
  return Object.entries(saves).map(([ability, bonus]) =>
    `${ability.toUpperCase()} ${bonus}`
  );
}

function formatSkills(skills) {
  if (!skills) return [];
  return Object.entries(skills).map(([skill, bonus]) =>
    `${capitalizeFirst(skill)} ${bonus}`
  );
}

function formatDamageTypes(damageTypes) {
  if (!damageTypes) return [];
  return damageTypes.map(type => {
    if (typeof type === 'string') return type;
    if (type.resist || type.immune || type.vulnerable) {
      return Object.keys(type)[0];
    }
    return String(type);
  }).filter(Boolean);
}

function formatConditionImmunities(conditions) {
  if (!conditions) return [];
  return conditions.map(condition => {
    if (typeof condition === 'string') return capitalizeFirst(condition);
    return String(condition);
  }).filter(Boolean);
}

function formatSenses(senses, passive) {
  const result = [];
  if (senses) {
    Object.entries(senses).forEach(([sense, distance]) => {
      if (sense === 'passive') return; // Skip passive, we handle it separately
      result.push(`${capitalizeFirst(sense)} ${distance} ft`);
    });
  }
  if (passive && typeof passive === 'number') {
    result.push(`Passive Perception ${passive}`);
  }
  return result;
}

function formatLanguages(languages) {
  if (!languages) return [];
  return languages.map(lang => {
    if (typeof lang === 'string') return lang;
    return String(lang);
  }).filter(Boolean);
}

function formatTraits(traits) {
  if (!traits) return [];
  return traits.map(trait => `${trait.name}: ${formatEntries(trait.entries)}`);
}

function formatActions(actions) {
  if (!actions) return [];
  return actions.map(action => `${action.name}: ${formatEntries(action.entries)}`);
}

function formatEntries(entries) {
  if (!entries) return '';
  if (Array.isArray(entries)) {
    return entries.map(entry => {
      if (typeof entry === 'string') return entry;
      return String(entry);
    }).join(' ');
  }
  return String(entries);
}

function formatSize(size) {
  if (!size) return 'Medium';
  if (Array.isArray(size)) return size[0];
  const sizeMap = {
    'T': 'Tiny',
    'S': 'Small',
    'M': 'Medium',
    'L': 'Large',
    'H': 'Huge',
    'G': 'Gargantuan'
  };
  return sizeMap[size] || size;
}

function formatAlignment(alignment) {
  if (!alignment) return 'Unaligned';
  if (Array.isArray(alignment)) {
    return alignment.map(a => {
      const alignmentMap = {
        'L': 'Lawful',
        'N': 'Neutral',
        'C': 'Chaotic',
        'G': 'Good',
        'E': 'Evil'
      };
      return alignmentMap[a] || a;
    }).join(' ');
  }
  return String(alignment);
}

function extractTags(creature) {
  const tags = [];

  // Add type tags
  if (creature.type?.tags) {
    tags.push(...creature.type.tags);
  }

  // Add environment tags
  if (creature.environment) {
    tags.push(...creature.environment);
  }

  // Add CR-based tags
  const cr = creature.cr;
  if (typeof cr === 'string') {
    if (cr.includes('/')) {
      tags.push('low-cr');
    } else {
      const crNum = parseInt(cr);
      if (crNum <= 4) tags.push('low-cr');
      else if (crNum <= 10) tags.push('mid-cr');
      else if (crNum <= 16) tags.push('high-cr');
      else tags.push('epic-cr');
    }
  }

  // Add source tag
  tags.push(`source-${creature.source.toLowerCase()}`);

  return [...new Set(tags)]; // Remove duplicates
}

function capitalizeFirst(str) {
  if (!str || typeof str !== 'string') return String(str || '');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Main processing function
async function processCreatures() {
  console.log('🎲 Processing 5etools creature data...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }

  // Process each bestiary file
  const bestiaryFiles = fs.readdirSync(BESTIARY_PATH)
    .filter(file => file.startsWith('bestiary-') && file.endsWith('.json') && !file.startsWith('fluff-'));

  console.log(`Found ${bestiaryFiles.length} bestiary files`);

  // First pass: Load all creatures into an index for copy resolution
  console.log('🔍 First pass: Loading all creatures for copy resolution...');
  const creatureIndex = {};
  const allRawCreatures = [];

  for (const filename of bestiaryFiles) {
    const filePath = path.join(BESTIARY_PATH, filename);
    const source = filename.replace('bestiary-', '').replace('.json', '').toUpperCase();

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const creatures = data.monster || [];

      creatures.forEach(creature => {
        const key = `${creature.source}_${creature.name}`;
        creatureIndex[key] = creature;
        allRawCreatures.push(creature);
      });

    } catch (error) {
      console.error(`Error loading ${filename}:`, error.message);
    }
  }

  console.log(`📚 Loaded ${Object.keys(creatureIndex).length} creatures into index`);

  // Second pass: Resolve copies and convert
  console.log('🔧 Second pass: Resolving copies and converting...');
  const allCreatures = [];
  const sourceStats = {};

  for (const filename of bestiaryFiles) {
    const filePath = path.join(BESTIARY_PATH, filename);
    const source = filename.replace('bestiary-', '').replace('.json', '').toUpperCase();

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const creatures = data.monster || [];

      console.log(`Processing ${creatures.length} creatures from ${source}...`);

      // Resolve copies first, then convert
      const resolvedCreatures = creatures.map(creature => resolveCopy(creature, creatureIndex));
      const convertedCreatures = resolvedCreatures.map(convertCreature);

      allCreatures.push(...convertedCreatures);
      sourceStats[source] = creatures.length;

      // Save individual source file
      const outputFilename = `${source.toLowerCase()}.json`;
      const outputPath = path.join(OUTPUT_PATH, outputFilename);
      fs.writeFileSync(outputPath, JSON.stringify(convertedCreatures, null, 2));

    } catch (error) {
      console.error(`Error processing ${filename}:`, error.message);
    }
  }

  console.log(`\n📊 Processing complete:`);
  console.log(`- Total creatures: ${allCreatures.length}`);
  console.log(`- Sources processed: ${Object.keys(sourceStats).length}`);

  // Save combined file
  const combinedPath = path.join(OUTPUT_PATH, 'all-creatures.json');
  fs.writeFileSync(combinedPath, JSON.stringify(allCreatures, null, 2));

  // Save index file with metadata
  const index = {
    totalCreatures: allCreatures.length,
    sources: sourceStats,
    lastUpdated: new Date().toISOString(),
    version: '2.7.4',
    files: {
      all: 'all-creatures.json',
      bySource: Object.keys(sourceStats).map(source => ({
        source,
        filename: `${source.toLowerCase()}.json`,
        count: sourceStats[source],
        name: SOURCE_BOOKS[source] || source
      }))
    }
  };

  const indexPath = path.join(OUTPUT_PATH, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  console.log(`\n✅ Build complete! Files saved to: ${OUTPUT_PATH}`);
  console.log(`- Combined file: all-creatures.json (${(fs.statSync(combinedPath).size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`- Index file: index.json`);
  console.log(`- Individual source files: ${Object.keys(sourceStats).length} files`);
}

// Run the build process
if (import.meta.url === `file://${process.argv[1]}`) {
  processCreatures().catch(console.error);
}

export { processCreatures };