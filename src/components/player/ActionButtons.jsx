import React from 'react';
import { SKELD_VENTS } from '../../game/skeldMapData.js';

export default function ActionButtons({
  role,
  isDead,
  inVent,
  activeVent,
  nearVent,
  nearStation,
  nearSabotage,
  nearBody,
  killCooldown,
  onVote,
  onReport,
  onToggleVent,
  onTravelVent,
  onExitVent,
  onKill,
  onSabotage,
  onTaskOrFix
}) {
  const isImp = String(role || 'CREWMATE').toUpperCase() === 'IMPOSTOR';
  const linkedVents = inVent && activeVent
    ? (activeVent.links || [])
        .map((id) => SKELD_VENTS.find((v) => v.id === id))
        .filter(Boolean)
    : [];

  return (
    <>
      {/* Impostor Vent Destination Travel Bar */}
      {isImp && inVent && activeVent && (
        <div className="vent-nav-bar open">
          {linkedVents.map((dest) => (
            <button
              key={dest.id}
              className="vent-dest-btn"
              onClick={() => onTravelVent(dest)}
            >
              ➡️ {dest.room}
            </button>
          ))}
          <button className="vent-exit-btn" onClick={onExitVent}>
            🚪 Exit ({activeVent.room})
          </button>
        </div>
      )}

      {/* Bottom-Right Action Buttons */}
      <div id="actionHud">
        <div className="action-row">
          <button className="btn-action btn-vote" onClick={onVote}>
            <span className="icon">🚨</span>
            <span>VOTE</span>
          </button>

          {nearBody && !isDead && (
            <button
              className="btn-action btn-report"
              style={{ display: 'flex' }}
              onClick={onReport}
            >
              <span className="icon">📢</span>
              <span>REPORT</span>
            </button>
          )}

          {isImp && (
            <>
              <button
                className={`btn-action btn-vent ${
                  inVent ? 'in-vent' : nearVent ? 'available' : ''
                }`}
                style={{ display: 'flex' }}
                disabled={!inVent && !nearVent}
                onClick={onToggleVent}
              >
                <span className="icon">{inVent ? '🚪' : '🕳️'}</span>
                <span>{inVent ? 'EXIT' : 'VENT'}</span>
              </button>

              <button
                className="btn-action btn-kill"
                style={{ display: 'flex' }}
                disabled={killCooldown > 0 || isDead || inVent}
                onClick={onKill}
              >
                <span className="icon">🔪</span>
                <span>KILL</span>
                {killCooldown > 0 && (
                  <div className="cooldown-overlay" style={{ display: 'flex' }}>
                    {Math.ceil(killCooldown)}s
                  </div>
                )}
              </button>

              <button
                className="btn-action btn-sabotage"
                style={{ display: 'flex' }}
                disabled={isDead}
                onClick={onSabotage}
              >
                <span className="icon">⚡</span>
                <span>SABOTAGE</span>
              </button>
            </>
          )}

          {!isImp && (
            <button
              className={`btn-action btn-task ${
                nearStation ? (nearSabotage ? 'available sabotage-mode' : 'available') : ''
              }`}
              disabled={!nearStation}
              onClick={onTaskOrFix}
            >
              <span className="icon">{nearSabotage ? '🔧' : '⚙️'}</span>
              <span>{nearSabotage ? 'FIX' : 'TASK'}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
