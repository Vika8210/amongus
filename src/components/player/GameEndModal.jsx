import React from 'react';

export default function GameEndModal({ gameEnd, onBackToLobby }) {
  if (!gameEnd) return null;

  const isImpWin = String(gameEnd.winner || 'crew').toLowerCase().includes('imp');
  const board = Array.isArray(gameEnd.leaderboard) ? gameEnd.leaderboard : [];

  return (
    <div className="modal-overlay open">
      <div className="modal-card">
        <div className={`game-end-banner ${isImpWin ? 'impostor-win' : ''}`}>
          <h2 style={{ fontSize: '26px', fontWeight: 900 }}>
            {isImpWin ? '🔪 IMPOSTORS WIN!' : '🛡️ CREWMATES WIN!'}
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '4px' }}>
            {gameEnd.reason || 'Match finished.'}
          </p>
        </div>

        <div className="leaderboard-list">
          {board.map((entry, idx) => (
            <div key={entry.id || idx} className="leaderboard-row">
              <span>
                #{idx + 1} {entry.name} ({String(entry.role || '').toUpperCase()})
              </span>
              <span style={{ color: '#facc15' }}>{entry.score || 0} pts</span>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onBackToLobby}>
          RETURN TO DROPSHIP LOBBY
        </button>
      </div>
    </div>
  );
}
