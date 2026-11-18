import React from 'react';

export default function LobbyScreen({ lobbyCode, myId, myPlayer, otherPlayers }) {
  const roster = [myPlayer, ...otherPlayers];

  return (
    <section id="lobbyScreen" className="screen space-bg active">
      <div className="lobby-card">
        <div className="lobby-header">
          <div>
            <div className="lobby-title">🚀 Skeld Dropship</div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '3px 10px',
                borderRadius: '99px',
                background: 'rgba(56, 189, 248, 0.16)',
                border: '1px solid #38bdf8',
                color: '#7dd3fc',
                fontSize: '12px',
                fontWeight: 900,
                letterSpacing: '2px'
              }}
            >
              LOBBY CODE: {lobbyCode || '------'}
            </div>
          </div>
          <div className="lobby-count">{roster.length} Crew Online</div>
        </div>

        <div className="lobby-roster">
          {roster.map((p) => (
            <div key={p.id || p.name} className="lobby-player-item">
              <span
                className="lobby-player-dot"
                style={{ background: p.color || '#38bdf8' }}
              />
              <span className="lobby-player-name">
                {p.name || 'Crewmate'}
                {p.id === myId ? ' (You)' : ''}
              </span>
              <span className="lobby-player-usn">{p.collegeId || p.usn || ''}</span>
            </div>
          ))}
        </div>

        <div className="lobby-waiting-banner">
          ⏳ Waiting for Game Master to launch the mission on The Skeld...
        </div>
      </div>
    </section>
  );
}
