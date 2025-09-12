export function sortCombatants(combatants) {
  return [...combatants].sort((a, b) =>
    (b.init - a.init) || 
    (b.dex - a.dex) || 
    (a.id.localeCompare(b.id))
  );
}

export function generateId() {
  return `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createCombatant({
  name = '',
  type = 'PC',
  init = 0,
  dex = 0,
  hp = 0,
  ac = 10,
  notes = '',
  tags = [],
  conditions = [],
  hidden = false,
  isHeldAction = false
} = {}) {
  return {
    id: generateId(),
    name,
    type,
    init: Number(init),
    dex: Number(dex),
    hp: Number(hp),
    ac: Number(ac),
    notes,
    tags: Array.isArray(tags) ? tags : [],
    conditions: Array.isArray(conditions) ? conditions : [],
    hidden,
    isHeldAction
  };
}