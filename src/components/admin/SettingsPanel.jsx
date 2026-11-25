import React from 'react';

function fmtMinSec(val) {
  const m = Math.floor(val / 60);
  const s = val % 60;
  return s === 0 ? `${m}min` : `${m}m ${s}s`;
}

export default function SettingsPanel({ settings, onChangeSetting }) {
  const impCount = settings.impostorsCount ?? settings.maxImpostors ?? 1;
  const questionSection = settings.questionSection ?? 1;
  const gameDuration = settings.gameDuration ?? 900;
  const tasksPer = settings.tasksPerPlayer ?? 25;
  const killCd = settings.killCooldown ?? 30;
  const sabCd = settings.sabotageCooldown ?? 30;
  const emerCd = settings.emergencyCooldown ?? 30;
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
        {/* Question Section Allocation */}
        <div className="setting-item" style={{ gridColumn: 'span 2', background: 'rgba(56, 189, 248, 0.08)', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
          <div className="setting-header">
            <span className="setting-label" style={{ color: '#38bdf8', fontWeight: 800 }}>
              📚 Question Section Allotment (25 MCQs / 15 Min)
            </span>
            <span className="setting-val-badge" style={{ background: '#0284c7', color: '#fff' }}>
              Section {questionSection}
            </span>
          </div>
          <select
            className="setting-select"
            value={questionSection}
            onChange={(e) => onChangeSetting('questionSection', parseInt(e.target.value, 10))}
            style={{ fontWeight: 700 }}
          >
            <option value={1}>Section 1: Questions 1 to 25 (Loops, Conditions, Break/Continue)</option>
            <option value={2}>Section 2: Questions 26 to 50 (Loop Control, Calculations & Logic)</option>
            <option value={3}>Section 3: Questions 51 to 75 (Nested Loops, Calculations & Patterns)</option>
          </select>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
            Allocates 25 non-repeating C MCQs to this lobby. Each crewmate solves all 25 questions in 15 minutes without any duplicates.
          </div>
        </div>

        {/* Lobby Game Duration (15 Minutes) */}
        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">⏱️ Lobby Game Duration</span>
            <span className="setting-val-badge">{Math.round(gameDuration / 60)} min</span>
          </div>
          <select
            className="setting-select"
            value={gameDuration}
            onChange={(e) => onChangeSetting('gameDuration', parseInt(e.target.value, 10))}
          >
            <option value={600}>10 Minutes (600s)</option>
            <option value={900}>15 Minutes (900s) — Standard</option>
            <option value={1200}>20 Minutes (1200s)</option>
            <option value={1800}>30 Minutes (1800s)</option>
          </select>
        </div>

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
            <span className="setting-label">⚡ Sabotage Cooldown</span>
            <span className="setting-val-badge">{sabCd}s</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="setting-slider"
              min={15}
              max={120}
              step={5}
              value={sabCd}
              onChange={(e) => onChangeSetting('sabotageCooldown', parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-range-labels">
            <span>15s</span>
            <span>120s (Default: 30s)</span>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-header">
            <span className="setting-label">🚨 Emergency Meeting Cooldown</span>
            <span className="setting-val-badge">{emerCd}s</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className="setting-slider"
              min={15}
              max={120}
              step={5}
              value={emerCd}
              onChange={(e) => onChangeSetting('emergencyCooldown', parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-range-labels">
            <span>15s</span>
            <span>120s (Default: 30s)</span>
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
