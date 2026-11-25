import React from 'react';

function fmtTimer(secs) {
  const s = Math.max(0, Math.ceil(secs || 0));
  const mm = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function TopHud({
  score,
  role,
  completedCount,
  totalTasks,
  matchTimeLeft,
  waveTimeLeft,
  viewMode,
  activeSabotage,
  isNearSabotage,
  isDead,
  onToggleMap,
  onSabotageBannerClick
}) {
  const isImp = String(role || 'CREWMATE').toUpperCase() === 'IMPOSTOR';
  const pct = Math.min(100, (completedCount / Math.max(1, totalTasks || 25)) * 100);
  const matchStr = fmtTimer(matchTimeLeft);
  const waveStr = fmtTimer(waveTimeLeft);
  const sabName = activeSabotage ? String(activeSabotage.building || 'SYSTEM').toUpperCase() : '';

  return (
    <div id="topHud">
      <div className="hud-group">
        <div className="hud-pill">
          <span>🏆</span>
          <span>Score: {typeof score === 'number' ? score : (score || 0)}pts</span>
        </div>

        <div className={`role-badge ${isImp ? 'impostor' : 'crewmate'}`}>
          {isImp ? 'IMPOSTOR 🔪' : 'CREWMATE'}
        </div>

        {/* Global Match Clock */}
        <div className="hud-pill" title="Match Countdown Timer">
          <span style={{ color: '#38bdf8', fontWeight: 800 }}>⏱️ {matchStr}</span>
        </div>

        {/* Crewmate Tasks & Wave Timer */}
        {!isImp && (
          <div className="hud-pill">
            <span>
              Tasks: {completedCount}/{totalTasks || 25}
            </span>
            <div className="tasks-progress-mini">
              <div className="tasks-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span
              style={{
                marginLeft: '6px',
                color: '#facc15',
                fontSize: '11px',
                fontWeight: 700
              }}
              title="Next 2-Minute Task Wave"
            >
              🌊 Wave: {waveStr}
            </span>
          </div>
        )}

        <button
          className={`btn-hud-toggle ${viewMode === 'camera' ? 'active-map' : ''}`}
          onClick={onToggleMap}
        >
          <span>{viewMode === 'camera' ? '🗺️ VIEW MAP' : '🚀 CLOSE MAP'}</span>
        </button>
      </div>

      {activeSabotage && (
        <div
          id="sabotageAlertBanner"
          style={{ display: 'flex' }}
          onClick={onSabotageBannerClick}
        >
          {isNearSabotage && !isDead ? (
            <>
              <span>⚠️ AT {sabName} — TAP CONSOLE TO FIX</span>
              <button
                className="banner-repair-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSabotageBannerClick();
                }}
              >
                🔧 FIX HERE
              </button>
            </>
          ) : (
            <span>🚨 SABOTAGE: {sabName} — GO THERE TO FIX</span>
          )}
        </div>
      )}
    </div>
  );
}
