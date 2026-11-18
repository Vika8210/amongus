import React from 'react';

function fmtMinSec(val) {
  const m = Math.floor(val / 60);
  const s = val % 60;
  return s === 0 ? `${m}min` : `${m}m ${s}s`;
}

export default function SettingsPanel({ settings, onChangeSetting }) {
  const impCount = settings.impostorsCount ?? settings.maxImpostors ?? 1;
  const tasksPer = settings.tasksPerPlayer ?? 3;
  const killCd = settings.killCooldown ?? 30;
  const respawn = settings.respawnTime ?? 45;
  const roleRot = settings.roleRotation ?? settings.roleRotationInterval ?? 180;
  const voteTime = settings.votingTime ?? settings.votingDuration ?? 60;
  const crewVis = settings.crewVision ?? settings.crewVisionRadius ?? 150;
  const impVis = settings.impostorVision ?? settings.impostorVisionRadius ?? 250;
  const speed = settings.moveSpeed ?? settings.playerSpeed ?? 3;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon">⚙️</span> Game Settings (Real-time Synced)
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Applies immediately to the selected lobby
        </span>
      </div>

      <div className="settings-grid">
        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">🔪 Impostors Count</span>
            <span className="setting-val-badge">{impCount}</span>
          </div>
          <select
            className="setting-select"
            value={impCount}
            onChange={(e) => onChangeSetting('impostorsCount', parseInt(e.target.value, 10))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Impostor' : 'Impostors'}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">📋 Tasks Per Player</span>
            <span className="setting-val-badge">{tasksPer}</span>
          </div>
          <select
            className="setting-select"
            value={tasksPer}
            onChange={(e) => onChangeSetting('tasksPerPlayer', parseInt(e.target.value, 10))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Task' : 'Tasks'}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">⏳ Kill Cooldown</span>
            <span className="setting-val-badge">{killCd}s</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="setting-slider"
              min={10}
              max={120}
              step={5}
              value={killCd}
              onChange={(e) => onChangeSetting('killCooldown', parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-range-labels">
            <span>10s</span>
            <span>120s</span>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">⚰️ Respawn Time</span>
            <span className="setting-val-badge">{respawn}s</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="setting-slider"
              min={20}
              max={120}
              step={5}
              value={respawn}
              onChange={(e) => onChangeSetting('respawnTime', parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-range-labels">
            <span>20s</span>
            <span>120s</span>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">🔄 Role Rotation</span>
            <span className="setting-val-badge">{fmtMinSec(roleRot)}</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="setting-slider"
              min={60}
              max={600}
              step={30}
              value={roleRot}
              onChange={(e) => onChangeSetting('roleRotation', parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-range-labels">
            <span>1min</span>
            <span>10min</span>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">🗳️ Voting Time</span>
            <span className="setting-val-badge">{voteTime}s</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="setting-slider"
              min={30}
              max={120}
              step={5}
              value={voteTime}
              onChange={(e) => onChangeSetting('votingTime', parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-range-labels">
            <span>30s</span>
            <span>120s</span>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">👁️ Crew Vision</span>
            <span className="setting-val-badge">{crewVis}px</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="setting-slider"
              min={80}
              max={400}
              step={10}
              value={crewVis}
              onChange={(e) => onChangeSetting('crewVision', parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-range-labels">
            <span>80px</span>
            <span>400px</span>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">🔴 Impostor Vision</span>
            <span className="setting-val-badge">{impVis}px</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="setting-slider"
              min={80}
              max={500}
              step={10}
              value={impVis}
              onChange={(e) => onChangeSetting('impostorVision', parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-range-labels">
            <span>80px</span>
            <span>500px</span>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">🏃 Move Speed</span>
            <span className="setting-val-badge">{speed}</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="setting-slider"
              min={1}
              max={8}
              step={0.5}
              value={speed}
              onChange={(e) => onChangeSetting('moveSpeed', parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-range-labels">
            <span>1 (Slow)</span>
            <span>8 (Fast)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
