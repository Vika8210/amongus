import React from 'react';

export default function GameEndModal({ gameEnd, onBackToLobby }) {
  if (!gameEnd) return null;

  const board = Array.isArray(gameEnd.leaderboard) ? gameEnd.leaderboard : [];
  const topPlayer = board.length > 0 ? board[0] : null;
  const topName = gameEnd.topPlayerName || (topPlayer ? topPlayer.name : gameEnd.winner) || 'No One';
  const topScore = gameEnd.topScore ?? (topPlayer ? topPlayer.score : 0);
  const topRole = topPlayer?.role ? ` (${String(topPlayer.role).toUpperCase()})` : '';

  return (
    <div className="modal-overlay open">
      <div className="modal-card">
        <div
          className="game-end-banner"
          style={{
            border: '2px solid #facc15',
            background: 'radial-gradient(circle at 50% 20%, rgba(250, 204, 21, 0.25) 0%, rgba(15, 23, 42, 0.95) 80%)'
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#facc15',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}
          >
            🏆 MATCH FINISHED — HIGHEST POINTS WINNER
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
            👑 WINNER: {topName.toUpperCase()} {topRole}
          </h2>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#facc15' }}>
            {topScore} PTS
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '6px' }}>
            {gameEnd.reason || 'Round finished.'}
          </p>
        </div>

        <div className="leaderboard-list">
          {board.map((entry, idx) => (
            <div key={entry.id || idx} className="leaderboard-row">
              <span>
                {idx === 0 ? '👑 ' : ''}#{idx + 1} {entry.name} ({String(entry.role || '').toUpperCase()})
              </span>
              <span style={{ color: '#facc15', fontWeight: idx === 0 ? 800 : 600 }}>
                {entry.score || 0} pts
              </span>
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
