import React, { useState } from 'react';
import { getCreatureModifier } from '../lib/creature-library.js';

export default function StatBlockModal({ creature, combatant, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('stats');

  if (!isOpen || !creature) return null;

  const modifier = (score) => {
    const mod = getCreatureModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const formatModifier = (score) => {
    const mod = getCreatureModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const formatList = (items) => {
    if (!items || items.length === 0) return '—';
    return items.join(', ');
  };

  const crToXp = (cr) => {
    const xpTable = {
      '0': '0 or 10', '1/8': '25', '1/4': '50', '1/2': '100',
      '1': '200', '2': '450', '3': '700', '4': '1,100', '5': '1,800',
      '6': '2,300', '7': '2,900', '8': '3,900', '9': '5,000', '10': '5,900',
      '11': '7,200', '12': '8,400', '13': '10,000', '14': '11,500', '15': '13,000',
      '16': '15,000', '17': '18,000', '18': '20,000', '19': '22,000', '20': '25,000',
      '21': '33,000', '22': '41,000', '23': '50,000', '24': '62,000', '25': '75,000',
      '26': '90,000', '27': '105,000', '28': '120,000', '29': '135,000', '30': '155,000'
    };
    return xpTable[cr] || cr;
  };

  const rollDice = (diceExpression) => {
    // Parse dice expressions like "1d8+3" or "2d6"
    const match = diceExpression.match(/(\d+)d(\d+)(?:([+-])(\d+))?/);
    if (!match) return diceExpression;

    const [, numDice, dieSize, operator, modifier] = match;
    const rolls = [];
    let total = 0;

    for (let i = 0; i < parseInt(numDice); i++) {
      const roll = Math.floor(Math.random() * parseInt(dieSize)) + 1;
      rolls.push(roll);
      total += roll;
    }

    if (operator && modifier) {
      const mod = parseInt(modifier);
      total += operator === '+' ? mod : -mod;
    }

    return `${total} (${rolls.join(', ')}${operator ? ` ${operator} ${modifier}` : ''})`;
  };

  const handleDiceClick = (e, diceExpression) => {
    e.preventDefault();
    const result = rollDice(diceExpression);

    // Create a temporary element to show the result
    const resultDiv = document.createElement('div');
    resultDiv.className = 'dice-result-popup';
    resultDiv.textContent = `🎲 ${result}`;
    resultDiv.style.cssText = `
      position: fixed;
      left: ${e.clientX - 50}px;
      top: ${e.clientY - 30}px;
      background: #333;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10000;
      pointer-events: none;
      animation: fadeInOut 2s ease-in-out;
    `;

    document.body.appendChild(resultDiv);
    setTimeout(() => {
      if (resultDiv.parentNode) {
        resultDiv.parentNode.removeChild(resultDiv);
      }
    }, 2000);
  };

  const renderDiceLink = (text) => {
    if (!text) return '—';

    // Match dice expressions and make them clickable
    return text.split(/(\d+d\d+(?:[+-]\d+)?)/g).map((part, index) => {
      const isDice = /\d+d\d+(?:[+-]\d+)?/.test(part);
      return isDice ? (
        <button
          key={index}
          className="dice-link"
          onClick={(e) => handleDiceClick(e, part)}
          title={`Click to roll ${part}`}
        >
          {part}
        </button>
      ) : part;
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal stat-block-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📜 {creature.name} Stat Block</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="stat-block-tabs">
          <button
            className={`tab ${activeTab === 'stats' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Stats & Abilities
          </button>
          <button
            className={`tab ${activeTab === 'combat' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('combat')}
          >
            Combat Actions
          </button>
          {combatant && (
            <button
              className={`tab ${activeTab === 'current' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              Current Status
            </button>
          )}
        </div>

        <div className="modal-content stat-block-content">
          {activeTab === 'stats' && (
            <div className="stat-block-stats">
              <div className="stat-block-header">
                <h3>{creature.name}</h3>
                <p className="creature-type-size">
                  {creature.type}, {creature.cr ? `CR ${creature.cr}` : 'CR —'}
                  {creature.cr && ` (${crToXp(creature.cr)} XP)`}
                </p>
              </div>

              <div className="stat-block-section">
                <div className="stat-row">
                  <strong>Armor Class:</strong> {creature.ac}
                </div>
                <div className="stat-row">
                  <strong>Hit Points:</strong> {creature.hp}
                </div>
                <div className="stat-row">
                  <strong>Speed:</strong> {creature.speed}
                </div>
              </div>

              <div className="stat-block-section ability-scores">
                <div className="ability-score-table">
                  <div className="ability-score">
                    <div className="ability-name">STR</div>
                    <div className="ability-value">{creature.stats.str}</div>
                    <div className="ability-modifier">({formatModifier(creature.stats.str)})</div>
                  </div>
                  <div className="ability-score">
                    <div className="ability-name">DEX</div>
                    <div className="ability-value">{creature.stats.dex}</div>
                    <div className="ability-modifier">({formatModifier(creature.stats.dex)})</div>
                  </div>
                  <div className="ability-score">
                    <div className="ability-name">CON</div>
                    <div className="ability-value">{creature.stats.con}</div>
                    <div className="ability-modifier">({formatModifier(creature.stats.con)})</div>
                  </div>
                  <div className="ability-score">
                    <div className="ability-name">INT</div>
                    <div className="ability-value">{creature.stats.int}</div>
                    <div className="ability-modifier">({formatModifier(creature.stats.int)})</div>
                  </div>
                  <div className="ability-score">
                    <div className="ability-name">WIS</div>
                    <div className="ability-value">{creature.stats.wis}</div>
                    <div className="ability-modifier">({formatModifier(creature.stats.wis)})</div>
                  </div>
                  <div className="ability-score">
                    <div className="ability-name">CHA</div>
                    <div className="ability-value">{creature.stats.cha}</div>
                    <div className="ability-modifier">({formatModifier(creature.stats.cha)})</div>
                  </div>
                </div>
              </div>

              <div className="stat-block-section">
                {creature.savingThrows && creature.savingThrows.length > 0 && (
                  <div className="stat-row">
                    <strong>Saving Throws:</strong> {formatList(creature.savingThrows)}
                  </div>
                )}
                {creature.skills && creature.skills.length > 0 && (
                  <div className="stat-row">
                    <strong>Skills:</strong> {formatList(creature.skills)}
                  </div>
                )}
                {creature.vulnerabilities && creature.vulnerabilities.length > 0 && (
                  <div className="stat-row">
                    <strong>Damage Vulnerabilities:</strong> {formatList(creature.vulnerabilities)}
                  </div>
                )}
                {creature.resistances && creature.resistances.length > 0 && (
                  <div className="stat-row">
                    <strong>Damage Resistances:</strong> {formatList(creature.resistances)}
                  </div>
                )}
                {creature.immunities && creature.immunities.length > 0 && (
                  <div className="stat-row">
                    <strong>Damage Immunities:</strong> {formatList(creature.immunities)}
                  </div>
                )}
                {creature.conditionImmunities && creature.conditionImmunities.length > 0 && (
                  <div className="stat-row">
                    <strong>Condition Immunities:</strong> {formatList(creature.conditionImmunities)}
                  </div>
                )}
                <div className="stat-row">
                  <strong>Senses:</strong> {formatList(creature.senses)}
                </div>
                <div className="stat-row">
                  <strong>Languages:</strong> {formatList(creature.languages)}
                </div>
              </div>

              {creature.abilities && creature.abilities.length > 0 && (
                <div className="stat-block-section">
                  <h4>Traits</h4>
                  {creature.abilities.map((ability, index) => (
                    <div key={index} className="trait">
                      <strong>{typeof ability === 'string' ? ability : ability.name || `Trait ${index + 1}`}.</strong>{' '}
                      {typeof ability === 'string' ?
                        'See source material for details.' :
                        renderDiceLink(ability.description || 'See source material for details.')
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="stat-block-combat">
              {creature.actions && creature.actions.length > 0 && (
                <div className="stat-block-section">
                  <h4>Actions</h4>
                  {creature.actions.map((action, index) => (
                    <div key={index} className="action">
                      <strong>{typeof action === 'string' ? action : action.name || `Action ${index + 1}`}.</strong>{' '}
                      {typeof action === 'string' ?
                        'See source material for details.' :
                        renderDiceLink(action.description || action.damage || 'See source material for details.')
                      }
                    </div>
                  ))}
                </div>
              )}

              {creature.reactions && creature.reactions.length > 0 && (
                <div className="stat-block-section">
                  <h4>Reactions</h4>
                  {creature.reactions.map((reaction, index) => (
                    <div key={index} className="reaction">
                      <strong>{typeof reaction === 'string' ? reaction : reaction.name || `Reaction ${index + 1}`}.</strong>{' '}
                      {typeof reaction === 'string' ?
                        'See source material for details.' :
                        renderDiceLink(reaction.description || 'See source material for details.')
                      }
                    </div>
                  ))}
                </div>
              )}

              {creature.legendaryActions && creature.legendaryActions.length > 0 && (
                <div className="stat-block-section">
                  <h4>Legendary Actions</h4>
                  <p className="legendary-intro">
                    The {creature.name.toLowerCase()} can take 3 legendary actions, choosing from the options below.
                    Only one legendary action option can be used at a time and only at the end of another creature's turn.
                    The {creature.name.toLowerCase()} regains spent legendary actions at the start of its turn.
                  </p>
                  {creature.legendaryActions.map((action, index) => (
                    <div key={index} className="legendary-action">
                      <strong>{typeof action === 'string' ? action : action.name || `Legendary Action ${index + 1}`}.</strong>{' '}
                      {typeof action === 'string' ?
                        'See source material for details.' :
                        renderDiceLink(action.description || 'See source material for details.')
                      }
                    </div>
                  ))}
                </div>
              )}

              {(!creature.actions || creature.actions.length === 0) &&
               (!creature.reactions || creature.reactions.length === 0) &&
               (!creature.legendaryActions || creature.legendaryActions.length === 0) && (
                <div className="stat-block-section">
                  <p className="no-actions">No detailed combat actions available. Refer to source material for complete stat block.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'current' && combatant && (
            <div className="stat-block-current">
              <div className="stat-block-section">
                <h4>Current Combat Status</h4>
                <div className="current-stats">
                  <div className="current-stat">
                    <strong>Current HP:</strong> {combatant.hp}
                  </div>
                  <div className="current-stat">
                    <strong>Armor Class:</strong> {combatant.ac}
                  </div>
                  <div className="current-stat">
                    <strong>Initiative:</strong> {combatant.init}
                    {combatant.dex !== 0 && (
                      <span className="dex-mod">({combatant.dex > 0 ? '+' : ''}{combatant.dex} dex)</span>
                    )}
                  </div>
                  {combatant.notes && (
                    <div className="current-stat">
                      <strong>Notes:</strong> {combatant.notes}
                    </div>
                  )}
                </div>

                {combatant.conditions && combatant.conditions.length > 0 && (
                  <div className="current-conditions">
                    <h5>Active Conditions</h5>
                    {combatant.conditions.map((condition, index) => (
                      <div key={index} className="condition">
                        <strong>{condition.name}</strong>
                        {condition.remainingRounds && (
                          <span className="rounds"> ({condition.remainingRounds} rounds remaining)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {combatant.isHeldAction && (
                  <div className="held-action-notice">
                    <strong>⏸ This creature has a held action</strong>
                  </div>
                )}
              </div>

              <div className="stat-block-section">
                <h5>Quick Reference</h5>
                <div className="quick-ref">
                  <div className="quick-ref-item">
                    <strong>Max HP:</strong> {creature.hp}
                  </div>
                  <div className="quick-ref-item">
                    <strong>Speed:</strong> {creature.speed}
                  </div>
                  <div className="quick-ref-item">
                    <strong>CR:</strong> {creature.cr}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <p className="source-info">
            Source: {creature.source || 'Custom'} | Type: {creature.type}
          </p>
        </div>
      </div>

      <style jsx>{`
        .dice-link {
          background: none;
          border: none;
          color: #0066cc;
          text-decoration: underline;
          cursor: pointer;
          font: inherit;
          padding: 0;
        }
        .dice-link:hover {
          color: #004499;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}