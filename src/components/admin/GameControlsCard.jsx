import React, { useState } from 'react';

const PHASE_CLASS = {
  LOBBY: 'phase-lobby',
  PLAYING: 'phase-playing',
  VOTING: 'phase-voting',
  ENDED: 'phase-ended'
};

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function GameControlsCard({
  lobbyCode,
  phase,
  playerCount,
  elapsedSeconds,
  rotationCountdown,
  impostors,
  onCreateLobby,
  onDeleteLobby,
  onStart,
  onReset,
  onForceVote,
  onForceRotation,
  onAddTime,
  onBroadcast,
  onLog
}) {
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [copiedType, setCopiedType] = useState(null);

  const handleCopyCode = () => {
    if (!lobbyCode) return;
    navigator.clipboard?.writeText(lobbyCode).catch(() => {});
    onLog(`📋 Copied Lobby Code: ${lobbyCode}`, 'info');
    setCopiedType('code');
    setTimeout(() => setCopiedType(null), 1500);
  };

  const handleCopyLink = () => {
    if (!lobbyCode) return;
    const url = `${window.location.origin}/?code=${encodeURIComponent(lobbyCode)}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    onLog(`🔗 Copied Join Link: ${url}`, 'info');
    setCopiedType('link');
    setTimeout(() => setCopiedType(null), 1500);
  };

  const sendBroadcast = () => {
    const text = broadcastMsg.trim();
    if (!text) return;
    onBroadcast(text);
    setBroadcastMsg('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon">⚡</span> Game Controls &amp; Live Status
        </div>
        <div className="tag-badge">{playerCount} Players Online</div>
      </div>

      <div className="game-status-strip">
        <div className="status-box">
          <div className="status-box-label">Current Phase</div>
          <div className="status-box-val">
            <span className={`phase-badge ${PHASE_CLASS[phase] || 'phase-lobby'}`}>
              {phase || 'LOBBY'}
            </span>
          </div>
        </div>

        <div className="status-box">
          <div className="status-box-label">Online Players</div>
          <div className="status-box-val">{playerCount}</div>
        </div>

        <div className="status-box">
          <div className="status-box-label">Game Timer</div>
          <div className="status-box-val">{fmtTime(elapsedSeconds)}</div>
        </div>

        <div className="status-box">
          <div className="status-box-label">Role Rotation In</div>
          <div className="status-box-val" style={{ color: 'var(--accent-purple)' }}>
            {fmtTime(rotationCountdown)}
          </div>
        </div>
      </div>

      {/* Selected Lobby Code Bar */}
      <div
        style={{
          marginBottom: '14px',
          background: 'rgba(14, 165, 233, 0.10)',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#7dd3fc',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            🏠 Selected Lobby Join Code
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 900,
              letterSpacing: '5px',
              color: lobbyCode ? '#38bdf8' : '#facc15',
              fontFamily: 'monospace',
              marginTop: '2px'
            }}
          >
            {lobbyCode || 'NO LOBBY'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn-ctl btn-start"
            style={{ padding: '8px 14px', fontSize: '12px' }}
            onClick={() => onCreateLobby('')}
          >
            ➕ NEW LOBBY
          </button>

          {lobbyCode && (
            <>
              <button
                className="btn-ctl btn-vote"
                style={{ padding: '8px 14px', fontSize: '12px' }}
                onClick={handleCopyCode}
              >
                {copiedType === 'code' ? '✅ COPIED!' : '📋 COPY CODE'}
              </button>
              <button
                className="btn-ctl btn-time"
                style={{ padding: '8px 14px', fontSize: '12px' }}
                onClick={handleCopyLink}
              >
                {copiedType === 'link' ? '✅ LINK COPIED!' : '🔗 COPY LINK'}
              </button>
              <button
                className="btn-ctl btn-danger"
                style={{ padding: '8px 14px', fontSize: '12px' }}
                onClick={() => onDeleteLobby(lobbyCode)}
              >
                🗑️ DELETE
              </button>
            </>
          )}
        </div>
      </div>

      {/* Impostors Strip */}
      <div
        style={{
          marginBottom: '16px',
          background: 'rgba(15,20,32,0.4)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}
        >
          Current Impostors (Classified):
        </div>
        <div className="imp-list-container">
          {impostors.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              None active (Crew-only or Lobby)
            </span>
          ) : (
            impostors.map((name) => (
              <div key={name} className="imp-pill">
                <span>🔪</span>
                <span>{name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="btn-group">
        <button
          className="btn-ctl btn-start"
          style={{ opacity: phase === 'PLAYING' ? 0.75 : 1 }}
          onClick={onStart}
        >
          {phase === 'PLAYING' ? '● GAME ACTIVE' : '▶ START GAME'}
        </button>
        <button className="btn-ctl btn-reset" onClick={onReset}>
          ⟳ RESET GAME
        </button>
        <button className="btn-ctl btn-vote" onClick={onForceVote}>
          🗳️ FORCE VOTE
        </button>
        <button className="btn-ctl btn-rotate" onClick={onForceRotation}>
          🔄 ROTATE ROLE
        </button>
        <button className="btn-ctl btn-time" onClick={onAddTime}>
          +30s Timer
        </button>
      </div>

      {/* Broadcast Bar */}
      <div className="broadcast-bar">
        <input
          type="text"
          className="broadcast-input"
          placeholder="📢 Broadcast message to all player screens in this lobby..."
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendBroadcast()}
        />
        <button className="btn-broadcast" onClick={sendBroadcast}>
          📢 Send Broadcast
        </button>
      </div>
    </div>
  );
}
