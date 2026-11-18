import React, { useState } from 'react';

export default function PlayerRosterTable({
  players,
  defaultTasksPerPlayer,
  onKickPlayer,
  onClearRoster,
  onExportCsv
}) {
  const [search, setSearch] = useState('');

  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const highestScore = sorted[0]?.score || 0;
  const query = search.trim().toLowerCase();
  const filtered = query
    ? sorted.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(query) ||
          (p.collegeId || p.usn || '').toLowerCase().includes(query)
      )
    : sorted;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon">👥</span> Live Player Roster &amp; Scores
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Filter by name / USN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: '#111726',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '12px',
              color: '#fff',
              outline: 'none'
            }}
          />
          <button className="header-btn" onClick={onExportCsv}>
            📥 Export Scores (CSV)
          </button>
          <button
            className="header-btn"
            style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}
            onClick={onClearRoster}
          >
            🧹 Clear Roster
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="player-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th style={{ width: '50px' }}>Color</th>
              <th>Player Name</th>
              <th>College ID (USN)</th>
              <th>Role</th>
              <th>Score</th>
              <th>Tasks</th>
              <th>Status</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}
                >
                  No players currently in this lobby. Share the Lobby Code or QR code above.
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => {
                const isImp = (p.role || '').toUpperCase() === 'IMPOSTOR';
                const isTop = (p.score || 0) === highestScore && highestScore > 0;
                const tasksDone = Array.isArray(p.tasksCompleted) ? p.tasksCompleted.length : 0;
                const tasksTotal =
                  Array.isArray(p.tasksAssigned) && p.tasksAssigned.length > 0
                    ? p.tasksAssigned.length
                    : defaultTasksPerPlayer || 3;
                const pct = Math.min(100, Math.round((tasksDone / Math.max(1, tasksTotal)) * 100));
                const respawnLeft = p.respawnTimeLeft ?? p.respawnTimer ?? 0;

                return (
                  <tr key={p.id} className={isImp ? 'impostor-row' : ''}>
                    <td
                      style={{
                        fontWeight: 700,
                        color: idx === 0 ? 'var(--accent-yellow)' : 'var(--text-muted)'
                      }}
                    >
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td>
                      <span
                        className="player-dot"
                        style={{ background: p.color || '#38bdf8' }}
                      />
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>
                      {p.name || 'Unnamed'}
                      {isImp && (
                        <span style={{ color: '#ef4444', marginLeft: '4px' }}>🔪</span>
                      )}
                    </td>
                    <td
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: 'var(--accent-cyan)'
                      }}
                    >
                      {p.collegeId || p.usn || '—'}
                    </td>
                    <td>
                      <span className={`role-badge ${isImp ? 'role-imp' : 'role-crew'}`}>
                        {isImp ? 'IMPOSTOR 🔪' : 'CREWMATE'}
                      </span>
                    </td>
                    <td>
                      <span className={`score-val ${isTop ? 'top-scorer' : ''}`}>
                        {p.score ?? 0}
                      </span>
                    </td>
                    <td>
                      {isImp ? (
                        <span style={{ color: '#64748b', fontSize: '11px' }}>—</span>
                      ) : (
                        <div className="task-progress-cell">
                          <span>
                            {tasksDone}/{tasksTotal}
                          </span>
                          <div className="task-mini-bar">
                            <div className="task-mini-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {p.isDead ? (
                        respawnLeft > 0 ? (
                          <span className="status-respawn-badge">
                            Respawning ⏱️ {respawnLeft}s
                          </span>
                        ) : (
                          <span className="status-dead-badge">Dead 💀</span>
                        )
                      ) : (
                        <span className="status-alive-badge">Alive</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-kick"
                        onClick={() => onKickPlayer(p.id, p.name)}
                      >
                        Kick
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
