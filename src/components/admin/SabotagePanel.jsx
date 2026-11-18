import React from 'react';

export default function SabotagePanel({ sabotages, onClearSabotage }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon">⚡</span> Active Sabotages
        </div>
        <span
          className="tag-badge"
          style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
        >
          {sabotages.length} Active
        </span>
      </div>

      <div className="sabotage-container">
        {sabotages.length === 0 ? (
          <div className="no-sabotages-box">
            ✅ All Skeld systems nominal — No active sabotages
          </div>
        ) : (
          sabotages.map((sab) => (
            <div key={sab.id || sab.location} className="sabotage-item">
              <div className="sabotage-info">
                <span className="sabotage-alert-dot" />
                <div>
                  <div className="sabotage-text">
                    ● {sab.location || 'Skeld Zone'} — {sab.name || 'System Sabotaged'}
                  </div>
                  <div className="sabotage-time">
                    {sab.remainingTime ?? 60}s remaining
                  </div>
                </div>
              </div>
              <button
                className="btn-clear-sabotage"
                onClick={() => onClearSabotage(sab.id || sab.location)}
              >
                Resolve / Clear Early
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
