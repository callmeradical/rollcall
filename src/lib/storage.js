const STORAGE_KEY = 'rollcall_encounter';

export function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return null;
  }
}

export function exportState(state, filename = 'encounter.json') {
  const dataStr = JSON.stringify(state, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = filename;
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function validateImportData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }
  
  if (!data.version) {
    throw new Error('Missing version information');
  }
  
  if (!Array.isArray(data.combatants)) {
    throw new Error('Invalid combatants data');
  }
  
  return true;
}