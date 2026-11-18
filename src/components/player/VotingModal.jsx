import React, { useState, useEffect } from 'react';

export default function VotingModal({ meeting, myId, isDead, onCastVote }) {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setSelectedTarget(null);
    setHasVoted(false);
  }, [meeting?.openedAt]);

  if (!meeting) return null;

  const players = Array.isArray(meeting.players)
    ? meeting.players
    : Object.values(meeting.players || {});

  const handleVote = (targetId) => {
    if (hasVoted || isDead) return;
    setHasVoted(true);
    onCastVote(targetId);
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ color: '#f97316' }}>
              🚨 EMERGENCY MEETING
            </div>
            <div className="modal-subtitle" style={{ color: '#fdba74' }}>
              🚨 {meeting.reason || 'Emergency Meeting'} — Called by{' '}
              {meeting.callerName || 'Crewmate'}
            </div>
          </div>
        </div>

        <div className="voting-timer-bar">
          <span>⏳ VOTING TIME REMAINING</span>
          <span>{Math.max(0, Math.ceil(meeting.timeLeft ?? 0))}s</span>
        </div>

        <div className="voting-roster-grid">
          {players.map((p) => (
            <button
              key={p.id}
              className={`vote-player-card ${p.isDead ? 'dead' : ''} ${
                selectedTarget === p.id ? 'selected' : ''
              }`}
              disabled={!!p.isDead || !!isDead || hasVoted}
              onClick={() => setSelectedTarget(p.id)}
            >
              <span
                className="vote-avatar"
                style={{ background: p.color || '#38bdf8' }}
              />
              <span>
                {p.name || 'Crewmate'}
                {p.id === myId ? ' (You)' : ''}
                {p.isDead ? ' 💀' : ''}
              </span>
            </button>
          ))}
        </div>

        <div className="vote-actions">
          <button
            className="btn-secondary"
            disabled={hasVoted || isDead}
            onClick={() => handleVote('skip')}
          >
            ⏭️ SKIP VOTE
          </button>
          <button
            className="btn-danger"
            disabled={!selectedTarget || hasVoted || isDead}
            onClick={() => selectedTarget && handleVote(selectedTarget)}
          >
            🗳️ CONFIRM VOTE
          </button>
        </div>
      </div>
    </div>
  );
}
