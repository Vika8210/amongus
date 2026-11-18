import React, { useEffect, useRef, useState } from 'react';

const LOG_CLASS = {
  task: 'log-task',
  kill: 'log-kill',
  rotation: 'log-rotation',
  vote: 'log-vote',
  sabotage: 'log-sabotage',
  info: 'log-info'
};

export default function EventLogPanel({ logs, onClear }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon">📜</span> Game Event Log
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />{' '}
            Auto-scroll
          </label>
          <button
            className="header-btn"
            style={{ padding: '3px 8px', fontSize: '11px' }}
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>

      <div ref={containerRef} className="log-container">
        {logs.map((entry) => (
          <div key={entry.id} className={`log-entry ${LOG_CLASS[entry.type] || 'log-info'}`}>
            <span className="log-time">[{entry.time}]</span>
            <span>{entry.text}</span>
          </div>
        ))}
      </div>

      <div className="log-controls-bar">
        <span>Showing {logs.length} events (Max 100)</span>
        <span style={{ color: '#64748b' }}>
          ✅ Tasks | 💀 Kills | 🔄 Roles | 🗳️ Votes | 🔴 Sabotages
        </span>
      </div>
    </div>
  );
}
