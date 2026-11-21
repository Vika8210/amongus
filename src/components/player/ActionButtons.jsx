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
  nearEmergencyTable,
  canKillTarget,
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
          {/* Emergency Meeting button — ONLY available when near the Cafeteria emergency table */}
          {nearEmergencyTable && !isDead && !inVent && (
            <button
              className="btn-action btn-vote available"
              style={{ display: 'flex' }}
              onClick={onVote}
              title="Call Emergency Meeting [E]"
            >
              <span className="icon">🚨</span>
              <span>MEETING [E]</span>
            </button>
          )}

          {/* Report Dead Body — ONLY available when standing near a dead body */}
          {nearBody && !isDead && (
            <button
              className="btn-action btn-report available"
              style={{ display: 'flex' }}
              onClick={onReport}
              title="Report Dead Body [R]"
            >
              <span className="icon">📢</span>
              <span>REPORT [R]</span>
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
                title="Vent [V]"
              >
                <span className="icon">{inVent ? '🚪' : '🕳️'}</span>
                <span>{inVent ? 'EXIT [V]' : 'VENT [V]'}</span>
              </button>

              <button
                className={`btn-action btn-kill ${canKillTarget ? 'available' : ''}`}
                style={{ display: 'flex' }}
                disabled={killCooldown > 0 || isDead || inVent}
                onClick={onKill}
                title="Eliminate Crewmate [Q]"
              >
                <span className="icon">🔪</span>
                <span>KILL [Q]</span>
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
                title="Open Sabotage Map"
              >
                <span className="icon">⚡</span>
                <span>SABOTAGE</span>
              </button>

              {nearSabotage && (
                <button
                  className="btn-action btn-task available sabotage-mode"
                  style={{ display: 'flex' }}
                  onClick={onTaskOrFix}
                  title="Fix Sabotage [E] (0 pts)"
                >
                  <span className="icon">🔧</span>
                  <span>FIX [E]</span>
                </button>
              )}
            </>
          )}

          {!isImp && (
            <button
              className={`btn-action btn-task ${
                nearStation ? (nearSabotage ? 'available sabotage-mode' : 'available') : ''
              }`}
              disabled={!nearStation}
              onClick={onTaskOrFix}
              title={nearSabotage ? 'Fix Sabotage [E]' : 'Complete Task [E]'}
            >
              <span className="icon">{nearSabotage ? '🔧' : '⚙️'}</span>
              <span>{nearSabotage ? 'FIX [E]' : 'TASK [E]'}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
