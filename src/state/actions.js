export const ACTIONS = {
  ADD: 'ADD',
  UPDATE: 'UPDATE', 
  REMOVE: 'REMOVE',
  NEXT_TURN: 'NEXT_TURN',
  PREV_TURN: 'PREV_TURN',
  SET_ACTIVE: 'SET_ACTIVE',
  IMPORT_STATE: 'IMPORT_STATE',
  CLEAR: 'CLEAR',
  ADD_CONDITION: 'ADD_CONDITION',
  REMOVE_CONDITION: 'REMOVE_CONDITION',
  TICK_CONDITIONS: 'TICK_CONDITIONS',
  HOLD: 'HOLD',
  USE_HELD: 'USE_HELD',
  SET_ENCOUNTER_NAME: 'SET_ENCOUNTER_NAME',
  DUPLICATE: 'DUPLICATE'
}

export const createActions = (dispatch) => ({
  addCombatant: (combatant) => dispatch({ type: ACTIONS.ADD, payload: combatant }),
  updateCombatant: (id, updates) => dispatch({ type: ACTIONS.UPDATE, payload: { id, updates } }),
  removeCombatant: (id) => dispatch({ type: ACTIONS.REMOVE, payload: id }),
  nextTurn: () => dispatch({ type: ACTIONS.NEXT_TURN }),
  prevTurn: () => dispatch({ type: ACTIONS.PREV_TURN }),
  setActive: (index) => dispatch({ type: ACTIONS.SET_ACTIVE, payload: index }),
  importState: (state) => dispatch({ type: ACTIONS.IMPORT_STATE, payload: state }),
  clearEncounter: () => dispatch({ type: ACTIONS.CLEAR }),
  addCondition: (combatantId, condition) => dispatch({ 
    type: ACTIONS.ADD_CONDITION, 
    payload: { combatantId, condition } 
  }),
  removeCondition: (combatantId, conditionIndex) => dispatch({ 
    type: ACTIONS.REMOVE_CONDITION, 
    payload: { combatantId, conditionIndex } 
  }),
  holdAction: (id) => dispatch({ type: ACTIONS.HOLD, payload: id }),
  useHeldAction: (id) => dispatch({ type: ACTIONS.USE_HELD, payload: id }),
  setEncounterName: (name) => dispatch({ type: ACTIONS.SET_ENCOUNTER_NAME, payload: name }),
  duplicateCombatant: (id) => dispatch({ type: ACTIONS.DUPLICATE, payload: id })
})