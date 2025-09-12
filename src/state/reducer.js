import { ACTIONS } from './actions.js';
import { sortCombatants, createCombatant, generateId } from '../lib/sorting.js';

export const initialState = {
  version: 1,
  encounterName: 'New Encounter',
  round: 1,
  activeIndex: 0,
  combatants: [],
  log: []
};

function tickConditions(state) {
  const updatedCombatants = state.combatants.map(combatant => ({
    ...combatant,
    conditions: combatant.conditions
      .map(condition => ({
        ...condition,
        remainingRounds: condition.remainingRounds - 1
      }))
      .filter(condition => condition.remainingRounds > 0)
  }));

  return {
    ...state,
    combatants: updatedCombatants,
    log: [...state.log, {
      ts: Date.now(),
      msg: `Round ${state.round + 1} begins`
    }]
  };
}

function findActiveAfterRemoval(combatants, removedIndex, currentActiveIndex) {
  if (combatants.length === 0) return 0;
  
  if (removedIndex < currentActiveIndex) {
    return currentActiveIndex - 1;
  } else if (removedIndex === currentActiveIndex) {
    return currentActiveIndex >= combatants.length ? 0 : currentActiveIndex;
  }
  
  return currentActiveIndex;
}

export function encounterReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD: {
      const newCombatant = createCombatant(action.payload);
      const newCombatants = sortCombatants([...state.combatants, newCombatant]);
      
      const oldActive = state.combatants[state.activeIndex];
      const newActiveIndex = oldActive 
        ? newCombatants.findIndex(c => c.id === oldActive.id)
        : 0;

      return {
        ...state,
        combatants: newCombatants,
        activeIndex: Math.max(0, newActiveIndex),
        log: [...state.log, {
          ts: Date.now(),
          msg: `Added ${newCombatant.name}`
        }]
      };
    }

    case ACTIONS.UPDATE: {
      const { id, updates } = action.payload;
      const updatedCombatants = state.combatants.map(c => 
        c.id === id ? { ...c, ...updates } : c
      );
      
      const needsResort = updates.hasOwnProperty('init') || updates.hasOwnProperty('dex');
      const finalCombatants = needsResort ? sortCombatants(updatedCombatants) : updatedCombatants;
      
      const oldActive = state.combatants[state.activeIndex];
      const newActiveIndex = oldActive 
        ? finalCombatants.findIndex(c => c.id === oldActive.id)
        : state.activeIndex;

      return {
        ...state,
        combatants: finalCombatants,
        activeIndex: Math.max(0, newActiveIndex)
      };
    }

    case ACTIONS.REMOVE: {
      const removeIndex = state.combatants.findIndex(c => c.id === action.payload);
      if (removeIndex === -1) return state;

      const newCombatants = state.combatants.filter(c => c.id !== action.payload);
      const newActiveIndex = findActiveAfterRemoval(newCombatants, removeIndex, state.activeIndex);

      return {
        ...state,
        combatants: newCombatants,
        activeIndex: newActiveIndex,
        log: [...state.log, {
          ts: Date.now(),
          msg: `Removed ${state.combatants[removeIndex].name}`
        }]
      };
    }

    case ACTIONS.NEXT_TURN: {
      if (state.combatants.length === 0) return state;
      
      const nextIndex = (state.activeIndex + 1) % state.combatants.length;
      const isNewRound = nextIndex === 0;
      
      let newState = {
        ...state,
        activeIndex: nextIndex
      };

      if (isNewRound) {
        newState = {
          ...tickConditions(newState),
          round: state.round + 1
        };
      }

      return newState;
    }

    case ACTIONS.PREV_TURN: {
      if (state.combatants.length === 0) return state;
      
      const prevIndex = state.activeIndex === 0 
        ? state.combatants.length - 1 
        : state.activeIndex - 1;

      return {
        ...state,
        activeIndex: prevIndex
      };
    }

    case ACTIONS.SET_ACTIVE: {
      const index = Math.max(0, Math.min(action.payload, state.combatants.length - 1));
      return {
        ...state,
        activeIndex: index
      };
    }

    case ACTIONS.IMPORT_STATE: {
      const importedState = action.payload;
      return {
        ...initialState,
        ...importedState,
        combatants: sortCombatants(importedState.combatants || []),
        activeIndex: Math.max(0, Math.min(
          importedState.activeIndex || 0, 
          (importedState.combatants || []).length - 1
        ))
      };
    }

    case ACTIONS.CLEAR: {
      return {
        ...initialState,
        encounterName: state.encounterName,
        log: [...state.log, {
          ts: Date.now(),
          msg: 'Encounter cleared'
        }]
      };
    }

    case ACTIONS.ADD_CONDITION: {
      const { combatantId, condition } = action.payload;
      const updatedCombatants = state.combatants.map(c =>
        c.id === combatantId
          ? { ...c, conditions: [...c.conditions, condition] }
          : c
      );

      return {
        ...state,
        combatants: updatedCombatants
      };
    }

    case ACTIONS.REMOVE_CONDITION: {
      const { combatantId, conditionIndex } = action.payload;
      const updatedCombatants = state.combatants.map(c =>
        c.id === combatantId
          ? { 
              ...c, 
              conditions: c.conditions.filter((_, index) => index !== conditionIndex)
            }
          : c
      );

      return {
        ...state,
        combatants: updatedCombatants
      };
    }

    case ACTIONS.HOLD: {
      const updatedCombatants = state.combatants.map(c =>
        c.id === action.payload
          ? { ...c, isHeldAction: true }
          : c
      );

      return {
        ...state,
        combatants: updatedCombatants
      };
    }

    case ACTIONS.USE_HELD: {
      return state;
    }

    case ACTIONS.SET_ENCOUNTER_NAME: {
      return {
        ...state,
        encounterName: action.payload
      };
    }

    case ACTIONS.DUPLICATE: {
      const original = state.combatants.find(c => c.id === action.payload);
      if (!original) return state;

      const duplicate = createCombatant({
        ...original,
        name: `${original.name} (Copy)`
      });

      const newCombatants = sortCombatants([...state.combatants, duplicate]);
      const oldActive = state.combatants[state.activeIndex];
      const newActiveIndex = oldActive 
        ? newCombatants.findIndex(c => c.id === oldActive.id)
        : 0;

      return {
        ...state,
        combatants: newCombatants,
        activeIndex: Math.max(0, newActiveIndex)
      };
    }

    default:
      return state;
  }
}