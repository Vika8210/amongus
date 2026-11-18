import React from 'react';

export default function TopHud({
  score,
  role,
  completedCount,
  totalTasks,
  waveTimeLeft,
  viewMode,
  activeSabotage,
  isNearSabotage,
  isDead,
  onToggleMap,
  onSabotageBannerClick
}) {
  const isImp = String(role || 'CREWMATE').toUpperCase() === 'IMPOSTOR';
  const pct = Math.min(100, (completedCount / Math.max(1, totalTasks)) * 100);
  const secs = Math.max(0, Math.ceil(waveTimeLeft || 0));
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');
  const sabName = activeSabotage ? String(activeSabotage.building || 'SYSTEM').toUpperCase() : '';

  return (
    <div id="topHud">
      <div className="hud-group">
        <div className="hud-pill">
          <span>🏆</span>
          <span>Score: {score || 0}pts</span>
        </div>

        <div className={`role-badge ${isImp ? 'impostor' : 'crewmate'}`}>
          {isImp ? 'IMPOSTOR 🔪' : 'CREWMATE'}
        </div>

        {!isImp && (
          <div className="hud-pill">
            <span>
              Tasks: {completedCount}/{totalTasks || 3}
            </span>
            <div className="tasks-progress-mini">
              <div className="tasks-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span
              style={{
                marginLeft: '4px',
                color: '#7dd3fc',
                fontSize: '11px',
                fontWeight: 800
              }}
              title="Time until 3 fresh random tasks"
            >
              ⏱️ {mm}:{ss}
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
