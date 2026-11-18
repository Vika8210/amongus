import React from 'react';

export function QrModal({ open, lobbyCode, qrVersion, onClose }) {
  if (!open) return null;

  const joinUrl = lobbyCode
    ? `${window.location.origin}/?code=${encodeURIComponent(lobbyCode)}`
    : window.location.origin;
  const qrSrc = lobbyCode
    ? `/qr?code=${encodeURIComponent(lobbyCode)}&v=${qrVersion}`
    : `/qr?v=${qrVersion}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(joinUrl).then(() => {
      alert(`Join URL copied: ${joinUrl}`);
    });
  };

  return (
    <div
      className="modal-overlay"
      style={{ display: 'flex' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card">
        <h2>Scan to Join Game</h2>
        <p>Connect your phone to Campus Wi-Fi and scan with your camera</p>

        <img id="qrLargeImage" src={qrSrc} alt="Join Game QR Code" />

        <div className="join-url-pill">
          <span>{joinUrl}</span>
          <button className="header-btn" style={{ padding: '4px 8px' }} onClick={copyLink}>
            Copy Link
          </button>
        </div>

        <div className="modal-btn-row">
          <button className="btn-modal btn-modal-primary" onClick={onClose}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameOverModal({ data, onStartNew, onExportCsv, onClose }) {
  if (!data) return null;

  const isCrewWin = String(data.winner || 'CREW').toUpperCase().includes('CREW');
  const sorted = [...(data.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-card" style={{ maxWidth: '600px' }}>
        <h2 style={{ color: isCrewWin ? '#38bdf8' : '#ef4444' }}>
          {isCrewWin ? '🏆 GAME OVER — CREW WINS!' : '🔪 GAME OVER — IMPOSTORS WIN!'}
        </h2>
        <p>
          {isCrewWin
            ? 'All tasks completed or impostors successfully ejected.'
            : 'The Impostors infiltrated The Skeld and eliminated the crew!'}
        </p>

        <div
          style={{
            maxHeight: '280px',
            overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px'
          }}
        >
          <table className="scoreboard-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Rank</th>
                <th>Player</th>
                <th>College ID</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Final Score</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, idx) => {
                const isImp = (p.role || '').toUpperCase() === 'IMPOSTOR';
                return (
                  <tr key={p.id || idx}>
                    <td style={{ fontWeight: 800, fontSize: '15px' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{p.name || 'Unnamed'}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                      {p.collegeId || p.usn || '—'}
                    </td>
                    <td>
                      <span className={`role-badge ${isImp ? 'role-imp' : 'role-crew'}`}>
                        {isImp ? 'IMPOSTOR 🔪' : 'CREWMATE'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#fff' }}>
                      {p.score ?? 0} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-btn-row" style={{ marginTop: '20px' }}>
          <button
            className="btn-modal btn-modal-success"
            onClick={() => {
              onStartNew();
              onClose();
            }}
          >
            ▶ Start New Game
          </button>
          <button className="btn-modal btn-modal-primary" onClick={onExportCsv}>
            📥 Export Scores (CSV)
          </button>
          <button className="btn-modal btn-modal-secondary" onClick={onClose}>
            Close &amp; Inspect Board
          </button>
        </div>
      </div>
    </div>
  );
}
