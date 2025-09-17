import React, { useState } from 'react';
import { loadCreatureLibrary, getCreatureModifier } from '../lib/creature-library.js';

export default function StatBlockPanel({ creature, combatant, isVisible, onClose }) {
  const [activeTab, setActiveTab] = useState('stats');

  if (!isVisible) return null;

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

  // Roll a d20 with modifier
  const rollD20WithModifier = (modifier) => {
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const total = d20Roll + modifier;
    return `${total} (d20: ${d20Roll} + ${modifier})`;
  };

  // Parse 5etools formatting and make dice clickable
  const parseAndRenderText = (text) => {
    if (!text) return '—';

    // Replace 5etools formatting
    let parsed = text
      .replace(/\{@damage ([^}]+)\}/g, '$1')
      .replace(/\{@dice ([^}]+)\}/g, '$1')
      .replace(/\{@hit ([^}]+)\}/g, '+$1')
      .replace(/\{@atk ([^}]+)\}/g, (match, p1) => {
        return p1 === 'mw' ? 'Melee Weapon Attack:' :
               p1 === 'rw' ? 'Ranged Weapon Attack:' :
               p1 === 'ms' ? 'Melee Spell Attack:' :
               p1 === 'rs' ? 'Ranged Spell Attack:' : p1;
      })
      .replace(/\{@h\}/g, 'Hit:')
      .replace(/\{@item ([^}|]+)(\|[^}]*)?\}/g, '$1');

    // Split by both dice expressions and modifiers, make them clickable
    return parsed.split(/(\d+d\d+(?:[+-]\d+)?|[+-]\d+(?:\s+to\s+hit)?)/g).map((part, index) => {
      const isDice = /\d+d\d+(?:[+-]\d+)?/.test(part);
      const isAttackBonus = /[+-]\d+\s+to\s+hit/.test(part);
      const isModifier = /^[+-]\d+$/.test(part?.trim());

      if (isDice) {
        return (
          <button
            key={index}
            className="dice-link"
            onClick={() => {
              const result = rollDice(part);
              // Create popup effect
              const popup = document.createElement('div');
              popup.className = 'dice-result-popup';
              popup.textContent = `🎲 ${result}`;
              popup.style.cssText = `
                position: fixed;
                right: 20px;
                top: 50%;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 10000;
                pointer-events: none;
                animation: slideInOut 3s ease-in-out;
              `;
              document.body.appendChild(popup);
              setTimeout(() => {
                if (popup.parentNode) {
                  popup.parentNode.removeChild(popup);
                }
              }, 3000);
            }}
            title={`Click to roll ${part}`}
          >
            {part}
          </button>
        );
      } else if (isAttackBonus) {
        // Extract just the modifier part for attack bonuses like "+3 to hit"
        const modifierMatch = part.match(/([+-]\d+)/);
        if (modifierMatch) {
          const modifierText = modifierMatch[1];
          const modifier = parseInt(modifierText);

          return (
            <button
              key={index}
              className="dice-link modifier-link"
              onClick={() => {
                const result = rollD20WithModifier(modifier);
                // Create popup effect
                const popup = document.createElement('div');
                popup.className = 'dice-result-popup';
                popup.textContent = `🎲 ${result}`;
                popup.style.cssText = `
                  position: fixed;
                  right: 20px;
                  top: 50%;
                  background: #333;
                  color: white;
                  padding: 8px 12px;
                  border-radius: 4px;
                  font-size: 14px;
                  z-index: 10000;
                  pointer-events: none;
                  animation: slideInOut 3s ease-in-out;
                `;
                document.body.appendChild(popup);
                setTimeout(() => {
                  if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                  }
                }, 3000);
              }}
              title={`Click to roll d20${modifierText} (attack roll)`}
            >
              {part}
            </button>
          );
        }
        return part;
      } else if (isModifier) {
        const modifier = parseInt(part);

        return (
          <button
            key={index}
            className="dice-link modifier-link"
            onClick={() => {
              const result = rollD20WithModifier(modifier);
              // Create popup effect
              const popup = document.createElement('div');
              popup.className = 'dice-result-popup';
              popup.textContent = `🎲 ${result}`;
              popup.style.cssText = `
                position: fixed;
                right: 20px;
                top: 50%;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 10000;
                pointer-events: none;
                animation: slideInOut 3s ease-in-out;
              `;
              document.body.appendChild(popup);
              setTimeout(() => {
                if (popup.parentNode) {
                  popup.parentNode.removeChild(popup);
                }
              }, 3000);
            }}
            title={`Click to roll d20${part} (check/save)`}
          >
            {part}
          </button>
        );
      } else {
        return part;
      }
    });
  };

  return (
    <div className="stat-block-panel">
      <div className="stat-block-panel-header">
        <h3>📜 {creature?.name || 'No Creature Selected'}</h3>
        <button className="panel-close" onClick={onClose} title="Close stat block">✕</button>
      </div>

      {creature && (
        <>
          <div className="stat-block-panel-tabs">
            <button
              className={`tab ${activeTab === 'stats' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Stats
            </button>
            <button
              className={`tab ${activeTab === 'combat' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('combat')}
            >
              Actions
            </button>
            {combatant && (
              <button
                className={`tab ${activeTab === 'current' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('current')}
              >
                Current
              </button>
            )}
          </div>

          <div className="stat-block-panel-content">
            {activeTab === 'stats' && (
              <div className="panel-stats">
                <div className="creature-basics">
                  <div className="basic-stat">
                    <strong>AC:</strong> {creature.ac}
                  </div>
                  <div className="basic-stat">
                    <strong>HP:</strong> {creature.hp}
                  </div>
                  <div className="basic-stat">
                    <strong>Speed:</strong> {creature.speed}
                  </div>
                  <div className="basic-stat">
                    <strong>CR:</strong> {creature.cr} ({crToXp(creature.cr)} XP)
                  </div>
                </div>

                <div className="ability-scores-compact">
                  <div className="ability-compact">
                    <div className="ability-name">STR</div>
                    <div className="ability-value">{creature.stats.str} ({formatModifier(creature.stats.str)})</div>
                  </div>
                  <div className="ability-compact">
                    <div className="ability-name">DEX</div>
                    <div className="ability-value">{creature.stats.dex} ({formatModifier(creature.stats.dex)})</div>
                  </div>
                  <div className="ability-compact">
                    <div className="ability-name">CON</div>
                    <div className="ability-value">{creature.stats.con} ({formatModifier(creature.stats.con)})</div>
                  </div>
                  <div className="ability-compact">
                    <div className="ability-name">INT</div>
                    <div className="ability-value">{creature.stats.int} ({formatModifier(creature.stats.int)})</div>
                  </div>
                  <div className="ability-compact">
                    <div className="ability-name">WIS</div>
                    <div className="ability-value">{creature.stats.wis} ({formatModifier(creature.stats.wis)})</div>
                  </div>
                  <div className="ability-compact">
                    <div className="ability-name">CHA</div>
                    <div className="ability-value">{creature.stats.cha} ({formatModifier(creature.stats.cha)})</div>
                  </div>
                </div>

                {(creature.savingThrows?.length > 0 || creature.skills?.length > 0) && (
                  <div className="creature-details">
                    {creature.savingThrows?.length > 0 && (
                      <div className="detail-row">
                        <strong>Saves:</strong> {formatList(creature.savingThrows)}
                      </div>
                    )}
                    {creature.skills?.length > 0 && (
                      <div className="detail-row">
                        <strong>Skills:</strong> {formatList(creature.skills)}
                      </div>
                    )}
                  </div>
                )}

                {creature.abilities && creature.abilities.length > 0 ? (
                  <div className="traits-section">
                    <h4>Traits</h4>
                    {creature.abilities.map((ability, index) => (
                      <div key={index} className="trait-compact">
                        <strong>{typeof ability === 'string' ? ability.split(':')[0] || ability.split('.')[0] : ability.name || `Trait ${index + 1}`}:</strong>{' '}
                        <span className="trait-text">
                          {typeof ability === 'string' ?
                            parseAndRenderText(ability.split(/[:.](.+)/)[1] || ability) :
                            parseAndRenderText(ability.description || 'See source material.')
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-traits">
                    <h4>Traits</h4>
                    <p className="data-note">No special traits listed. This creature may have standard racial or type abilities.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'combat' && (
              <div className="panel-combat">
                {creature.actions && creature.actions.length > 0 && (
                  <div className="actions-section">
                    <h4>Actions</h4>
                    {creature.actions.map((action, index) => (
                      <div key={index} className="action-compact">
                        <strong>{typeof action === 'string' ? action.split(':')[0] || action.split('.')[0] : action.name || `Action ${index + 1}`}:</strong>{' '}
                        <span className="action-text">
                          {typeof action === 'string' ?
                            parseAndRenderText(action.split(/[:.](.+)/)[1] || action) :
                            parseAndRenderText(action.description || action.damage || 'See source material.')
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {creature.reactions && creature.reactions.length > 0 && (
                  <div className="reactions-section">
                    <h4>Reactions</h4>
                    {creature.reactions.map((reaction, index) => (
                      <div key={index} className="reaction-compact">
                        <strong>{typeof reaction === 'string' ? reaction.split(':')[0] || reaction.split('.')[0] : reaction.name || `Reaction ${index + 1}`}:</strong>{' '}
                        <span className="reaction-text">
                          {typeof reaction === 'string' ?
                            parseAndRenderText(reaction.split(/[:.](.+)/)[1] || reaction) :
                            parseAndRenderText(reaction.description || 'See source material.')
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {creature.legendaryActions && creature.legendaryActions.length > 0 && (
                  <div className="legendary-section">
                    <h4>Legendary Actions</h4>
                    <p className="legendary-intro-compact">
                      Can take 3 legendary actions per turn.
                    </p>
                    {creature.legendaryActions.map((action, index) => (
                      <div key={index} className="legendary-compact">
                        <strong>{typeof action === 'string' ? action.split(':')[0] || action.split('.')[0] : action.name || `Legendary ${index + 1}`}:</strong>{' '}
                        <span className="legendary-text">
                          {typeof action === 'string' ?
                            parseAndRenderText(action.split(/[:.](.+)/)[1] || action) :
                            parseAndRenderText(action.description || 'See source material.')
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {(!creature.actions || creature.actions.length === 0) &&
                 (!creature.reactions || creature.reactions.length === 0) &&
                 (!creature.legendaryActions || creature.legendaryActions.length === 0) && (
                  <div className="no-actions">
                    <p>No combat actions available.</p>
                    <p className="data-note">This creature may use standard attacks or have abilities defined in the source material.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'current' && combatant && (
              <div className="panel-current">
                <div className="current-stats-compact">
                  <div className="current-stat-row">
                    <strong>Current HP:</strong> {combatant.hp}
                  </div>
                  <div className="current-stat-row">
                    <strong>AC:</strong> {combatant.ac}
                  </div>
                  <div className="current-stat-row">
                    <strong>Initiative:</strong> {combatant.init}
                    {combatant.dex !== 0 && (
                      <span className="dex-mod"> ({combatant.dex > 0 ? '+' : ''}{combatant.dex})</span>
                    )}
                  </div>
                  {combatant.notes && (
                    <div className="current-stat-row">
                      <strong>Notes:</strong> {combatant.notes}
                    </div>
                  )}
                </div>

                {combatant.conditions && combatant.conditions.length > 0 && (
                  <div className="current-conditions-compact">
                    <h5>Active Conditions</h5>
                    {combatant.conditions.map((condition, index) => (
                      <div key={index} className="condition-compact">
                        <strong>{condition.name}</strong>
                        {condition.remainingRounds && (
                          <span className="rounds"> ({condition.remainingRounds} rounds)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {combatant.isHeldAction && (
                  <div className="held-action-notice-compact">
                    <strong>⏸ Held Action Active</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideInOut {
          0% { opacity: 0; transform: translateX(20px); }
          20% { opacity: 1; transform: translateX(0); }
          80% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
}