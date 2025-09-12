import React, { useState, useRef } from 'react';
import { useEncounter } from '../state/EncounterContext.jsx';
import { exportState, validateImportData } from '../lib/storage.js';

function ImportExportModal() {
  const { state, actions } = useEncounter();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('export');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const filename = `${state.encounterName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_encounter.json`;
    exportState(state, filename);
    setShowModal(false);
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        validateImportData(importedData);
        
        actions.importState(importedData);
        setImportSuccess('Encounter imported successfully!');
        setImportError('');
        
        setTimeout(() => {
          setShowModal(false);
          setImportSuccess('');
        }, 2000);
      } catch (error) {
        setImportError(`Import failed: ${error.message}`);
        setImportSuccess('');
      }
    };
    
    reader.onerror = () => {
      setImportError('Failed to read file');
      setImportSuccess('');
    };
    
    reader.readAsText(file);
  };

  const handleImportText = (text) => {
    try {
      const importedData = JSON.parse(text);
      validateImportData(importedData);
      
      actions.importState(importedData);
      setImportSuccess('Encounter imported successfully!');
      setImportError('');
      
      setTimeout(() => {
        setShowModal(false);
        setImportSuccess('');
      }, 2000);
    } catch (error) {
      setImportError(`Import failed: ${error.message}`);
      setImportSuccess('');
    }
  };

  const openModal = () => {
    setShowModal(true);
    setImportError('');
    setImportSuccess('');
    setActiveTab('export');
  };

  const closeModal = () => {
    setShowModal(false);
    setImportError('');
    setImportSuccess('');
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleExport();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        openModal();
        setActiveTab('import');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  return (
    <>
      <button
        className="btn btn-secondary import-export-btn"
        onClick={openModal}
        title="Import/Export encounter data (Cmd/Ctrl+O)"
      >
        📁 Import/Export
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import/Export Encounter</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-tabs">
              <button
                className={`tab ${activeTab === 'export' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('export')}
              >
                Export
              </button>
              <button
                className={`tab ${activeTab === 'import' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('import')}
              >
                Import
              </button>
            </div>

            <div className="modal-content">
              {activeTab === 'export' && (
                <div className="export-tab">
                  <p>Export your current encounter to a JSON file for backup or sharing.</p>
                  
                  <div className="encounter-summary">
                    <h3>Current Encounter</h3>
                    <p><strong>Name:</strong> {state.encounterName}</p>
                    <p><strong>Round:</strong> {state.round}</p>
                    <p><strong>Combatants:</strong> {state.combatants.length}</p>
                  </div>

                  <button 
                    className="btn btn-primary btn-full-width"
                    onClick={handleExport}
                  >
                    📥 Download JSON File
                  </button>

                  <div className="export-preview">
                    <h4>Preview</h4>
                    <textarea
                      className="json-preview"
                      value={JSON.stringify(state, null, 2)}
                      readOnly
                      rows={10}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'import' && (
                <div className="import-tab">
                  <p>Import an encounter from a JSON file or text.</p>
                  
                  {importError && (
                    <div className="alert alert-error">
                      {importError}
                    </div>
                  )}
                  
                  {importSuccess && (
                    <div className="alert alert-success">
                      {importSuccess}
                    </div>
                  )}

                  <div className="import-methods">
                    <div className="import-method">
                      <h4>From File</h4>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportFile}
                        accept=".json"
                        className="file-input"
                      />
                      <button
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📁 Choose File
                      </button>
                    </div>

                    <div className="import-divider">or</div>

                    <div className="import-method">
                      <h4>Paste JSON Text</h4>
                      <textarea
                        className="import-textarea"
                        placeholder="Paste JSON encounter data here..."
                        rows={8}
                        onPaste={(e) => {
                          setTimeout(() => {
                            handleImportText(e.target.value);
                          }, 100);
                        }}
                      />
                    </div>
                  </div>

                  <div className="import-warning">
                    <p><strong>⚠️ Warning:</strong> Importing will replace your current encounter data. Make sure to export your current encounter first if you want to keep it.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImportExportModal;