import React, { useState } from 'react';

const PHASE_CLASS = {
  LOBBY: 'phase-lobby',
  PLAYING: 'phase-playing',
  VOTING: 'phase-voting',
  ENDED: 'phase-ended'
};

export default function MultiLobbyBar({
  lobbies,
  selectedLobbyCode,
  onCreateLobby,
  onSelectLobby,
  onDeleteLobby
}) {
  const [customCode, setCustomCode] = useState('');

  const handleCreate = () => {
    const clean = customCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    onCreateLobby(clean);
    setCustomCode('');
  };

  return (
    <div className="multi-lobby-card">
      <div className="multi-lobby-top">
        <div className="card-title">
          <span className="icon">🏢</span> Multi-Lobby Manager
          <span className="tag-badge" style={{ marginLeft: '6px' }}>
            {lobbies.length} Active {lobbies.length === 1 ? 'Lobby' : 'Lobbies'}
          </span>
        </div>

        <div className="multi-lobby-actions">
          <input
            type="text"
            className="custom-code-input"
            maxLength={8}
            placeholder="Custom code (opt)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            className="btn-ctl btn-start"
            style={{ padding: '8px 16px', fontSize: '12px' }}
            onClick={handleCreate}
          >
            ➕ CREATE NEW LOBBY
          </button>
        </div>
      </div>

      <div className="lobby-tabs-list">
        {lobbies.length === 0 ? (
          <div className="no-lobbies-hint">
            No active lobbies yet. Click <strong>➕ CREATE NEW LOBBY</strong> to spin up one or
            more simultaneous rooms!
          </div>
        ) : (
          lobbies.map((l) => {
            const isActive = l.code === selectedLobbyCode;
            const pClass = PHASE_CLASS[(l.phase || 'LOBBY').toUpperCase()] || 'phase-lobby';
            return (
              <div
                key={l.code}
                className={`lobby-tab ${isActive ? 'active' : ''}`}
                onClick={() => onSelectLobby(l.code)}
                title={`Switch dashboard to Lobby ${l.code}`}
              >
                <span>🏠</span>
                <span className="lobby-tab-code">{l.code}</span>
                <span className={`lobby-tab-pill ${pClass}`}>{l.phase || 'LOBBY'}</span>
                <span className="lobby-tab-count">{l.playerCount ?? 0} 👥</span>
                {l.hasSabotage && (
                  <span className="lobby-tab-sab" title="Active Sabotage!">
                    ⚡
                  </span>
                )}
                <button
                  className="lobby-tab-del"
                  title={`Delete Lobby ${l.code}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLobby(l.code);
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
