import React from 'react';
import { CONFIG } from '../../game/config.js';

export default function LobbyScreen({ lobbyCode, myId, myPlayer, otherPlayers, onColorChange }) {
  const roster = [myPlayer, ...otherPlayers];
  const otherTakenColors = otherPlayers.map((p) => (p.color || '').toLowerCase());
  const myColor = (myPlayer?.color || '').toLowerCase();
  const availableCount = CONFIG.SUIT_COLORS.filter(
    (h) => !otherTakenColors.includes(h.toLowerCase())
  ).length;

  return (
    <section id="lobbyScreen" className="screen space-bg active">
      <div className="lobby-card">
        <div className="lobby-header">
          <div>
            <div className="lobby-title">🚀 Skeld Dropship</div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '3px 10px',
                borderRadius: '99px',
                background: 'rgba(56, 189, 248, 0.16)',
                border: '1px solid #38bdf8',
                color: '#7dd3fc',
                fontSize: '12px',
                fontWeight: 900,
                letterSpacing: '2px'
              }}
            >
              LOBBY CODE: {lobbyCode || '------'}
            </div>
          </div>
          <div className="lobby-count">{roster.length} Crew Online</div>
        </div>

        <div className="lobby-roster">
          {roster.map((p) => (
            <div key={p.id || p.name} className="lobby-player-item">
              <span
                className="lobby-player-dot"
                style={{ background: p.color || '#38bdf8' }}
              />
              <span className="lobby-player-name">
                {p.name || 'Crewmate'}
                {p.id === myId ? ' (You)' : ''}
              </span>
              <span className="lobby-player-usn">{p.collegeId || p.usn || ''}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            margin: '14px 0',
            padding: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.5px' }}>
              🎨 Customize Your Suit Color:
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
              {availableCount}/15 Available
            </span>
          </div>
          <div className="color-picker-grid">
            {CONFIG.SUIT_COLORS.map((hex) => {
              const isTaken = otherTakenColors.includes(hex.toLowerCase());
              const isMyColor = myColor === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  className={`color-swatch ${isMyColor ? 'selected' : ''} ${isTaken ? 'taken' : ''}`}
                  style={{ background: hex }}
                  disabled={isTaken || isMyColor}
                  onClick={() => !isTaken && onColorChange?.(hex)}
                  title={
                    isTaken
                      ? 'Color taken by another crewmate'
                      : isMyColor
                      ? 'Your current color'
                      : `Switch to ${hex}`
                  }
                  aria-label={`Select color ${hex}`}
                />
              );
            })}
          </div>
        </div>

        <div className="lobby-waiting-banner">
          ⏳ Waiting for Game Master to launch the mission on The Skeld...
        </div>
      </div>
    </section>
  );
}
