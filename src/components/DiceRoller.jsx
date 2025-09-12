import React, { useState } from 'react';

const DICE_TYPES = [
  { name: 'd4', sides: 4 },
  { name: 'd6', sides: 6 },
  { name: 'd8', sides: 8 },
  { name: 'd10', sides: 10 },
  { name: 'd12', sides: 12 },
  { name: 'd20', sides: 20 },
  { name: 'd100', sides: 100 }
];

function DiceRoller({ isHidden = false }) {
  const [showModal, setShowModal] = useState(false);
  const [rolls, setRolls] = useState([]);
  const [selectedDice, setSelectedDice] = useState('d20');

  const rollDice = (diceType) => {
    const dice = DICE_TYPES.find(d => d.name === diceType);
    const result = Math.floor(Math.random() * dice.sides) + 1;
    const newRoll = {
      id: Date.now(),
      dice: diceType,
      result,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setRolls(prev => [newRoll, ...prev.slice(0, 9)]); // Keep last 10 rolls
    return result;
  };

  const rollWithAdvantage = () => {
    const dice = DICE_TYPES.find(d => d.name === selectedDice);
    const roll1 = Math.floor(Math.random() * dice.sides) + 1;
    const roll2 = Math.floor(Math.random() * dice.sides) + 1;
    const result = Math.max(roll1, roll2);
    
    const newRoll = {
      id: Date.now(),
      dice: `${selectedDice} (Adv)`,
      result: `${result} (${roll1}, ${roll2})`,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setRolls(prev => [newRoll, ...prev.slice(0, 9)]);
  };

  const rollWithDisadvantage = () => {
    const dice = DICE_TYPES.find(d => d.name === selectedDice);
    const roll1 = Math.floor(Math.random() * dice.sides) + 1;
    const roll2 = Math.floor(Math.random() * dice.sides) + 1;
    const result = Math.min(roll1, roll2);
    
    const newRoll = {
      id: Date.now(),
      dice: `${selectedDice} (Dis)`,
      result: `${result} (${roll1}, ${roll2})`,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setRolls(prev => [newRoll, ...prev.slice(0, 9)]);
  };

  const clearRolls = () => {
    setRolls([]);
  };

  return (
    <>
      <button
        className={`dice-roller-fab ${isHidden ? 'dice-roller-fab--hidden' : ''}`}
        onClick={() => setShowModal(!showModal)}
        title="Dice Roller"
      >
        ⬢
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal dice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎲 Dice Roller</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="dice-content">
              <div className="dice-section">
                <h3>Quick Roll</h3>
                <div className="dice-grid">
                  {DICE_TYPES.map(dice => (
                    <button
                      key={dice.name}
                      className="dice-button"
                      onClick={() => rollDice(dice.name)}
                    >
                      {dice.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="dice-section">
                <h3>Advantage/Disadvantage</h3>
                <div className="advantage-controls">
                  <select
                    value={selectedDice}
                    onChange={(e) => setSelectedDice(e.target.value)}
                    className="dice-select"
                  >
                    {DICE_TYPES.map(dice => (
                      <option key={dice.name} value={dice.name}>{dice.name}</option>
                    ))}
                  </select>
                  <button className="btn btn-primary" onClick={rollWithAdvantage}>
                    Advantage
                  </button>
                  <button className="btn btn-secondary" onClick={rollWithDisadvantage}>
                    Disadvantage
                  </button>
                </div>
              </div>

              <div className="dice-section">
                <div className="rolls-header">
                  <h3>Recent Rolls</h3>
                  {rolls.length > 0 && (
                    <button className="btn btn-small" onClick={clearRolls}>
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="rolls-list">
                  {rolls.length === 0 ? (
                    <p className="no-rolls">No rolls yet</p>
                  ) : (
                    rolls.map(roll => (
                      <div key={roll.id} className="roll-result">
                        <span className="roll-dice">{roll.dice}</span>
                        <span className="roll-value">{roll.result}</span>
                        <span className="roll-time">{roll.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DiceRoller;