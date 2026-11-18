import React from 'react';

const PHASE_CLASS = {
  LOBBY: 'phase-lobby',
  PLAYING: 'phase-playing',
  VOTING: 'phase-voting',
  ENDED: 'phase-ended'
};

export default function AdminHeader({
  isOnline,
  wsStatusText,
  phase,
  lobbyCode,
  qrVersion,
  onOpenQr,
  onLogout
}) {
  const qrSrc = lobbyCode
    ? `/qr?code=${encodeURIComponent(lobbyCode)}&v=${qrVersion}`
    : `/qr?v=${qrVersion}`;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <header>
      <div className="brand-section">
        <div className="brand-icon">🎮</div>
        <div className="brand-title">
          <h1>
            AMONG US: THE SKELD — ADMIN <span className="tag-badge">REACT</span>
          </h1>
          <p>Multi-Lobby Game Orchestrator &amp; Live Telemetry</p>
        </div>
      </div>

      <div className="header-center">
        <div className="status-pill">
          <span className={`dot ${isOnline ? 'dot-online' : 'dot-offline'}`} />
          <span style={{ color: isOnline ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {wsStatusText}
          </span>
        </div>

        <div className="status-pill">
          <span>PHASE:</span>
          <span className={`phase-badge ${PHASE_CLASS[phase] || 'phase-lobby'}`}>
            {phase || 'LOBBY'}
          </span>
        </div>
      </div>

      <div className="header-actions">
        <div
          className="qr-header-card"
          onClick={onOpenQr}
          title="Click to enlarge join QR code"
        >
          <img className="qr-thumb" src={qrSrc} alt="QR" />
          <div className="qr-meta">
            <div className="qr-title">Scan to Join</div>
            <div className="qr-sub">
              {lobbyCode ? `Code: ${lobbyCode}` : window.location.host}
            </div>
          </div>
        </div>

        <button className="header-btn" onClick={toggleFullscreen}>
          ⛶ Fullscreen
        </button>
        <button className="header-btn" onClick={onLogout}>
          🔒 Lock
        </button>
      </div>
    </header>
  );
}
