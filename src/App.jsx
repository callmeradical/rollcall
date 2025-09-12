import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { EncounterProvider } from './state/EncounterContext.jsx';
import TopBar from './components/TopBar.jsx';
import AddCombatantForm from './components/AddCombatantForm.jsx';
import CombatList from './components/CombatList.jsx';
import ImportExportModal from './components/ImportExportModal.jsx';
import DiceRoller from './components/DiceRoller.jsx';

function EncounterTracker() {
  const [isAddFormExpanded, setIsAddFormExpanded] = React.useState(false);

  return (
    <div className="app">
      <main className="main-content">
        <CombatList />
      </main>
      <AddCombatantForm 
        isExpanded={isAddFormExpanded} 
        setIsExpanded={setIsAddFormExpanded} 
      />
      <TopBar />
      <ImportExportModal />
      <DiceRoller isHidden={isAddFormExpanded} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <EncounterProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<EncounterTracker />} />
          </Routes>
        </div>
      </EncounterProvider>
    </Router>
  );
}

export default App;