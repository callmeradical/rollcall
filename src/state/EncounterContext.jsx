import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { encounterReducer, initialState } from './reducer.js';
import { createActions } from './actions.js';
import { loadFromStorage } from '../lib/storage.js';
import { useAutoSave } from '../hooks/useLocalStorage.js';

const EncounterContext = createContext();

export function EncounterProvider({ children }) {
  const [state, dispatch] = useReducer(encounterReducer, initialState, (initial) => {
    const saved = loadFromStorage();
    return saved ? { ...initial, ...saved } : initial;
  });

  const actions = createActions(dispatch);
  
  useAutoSave(state);

  const value = {
    state,
    actions,
    dispatch
  };

  return (
    <EncounterContext.Provider value={value}>
      {children}
    </EncounterContext.Provider>
  );
}

export function useEncounter() {
  const context = useContext(EncounterContext);
  if (!context) {
    throw new Error('useEncounter must be used within an EncounterProvider');
  }
  return context;
}