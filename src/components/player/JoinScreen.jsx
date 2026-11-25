import React, { useState, useEffect } from 'react';
import { CONFIG } from '../../game/config.js';

export default function JoinScreen({ connStatus, joinError, onJoin }) {
  const [lobbyCode, setLobbyCode] = useState('');
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [color, setColor] = useState(CONFIG.SUIT_COLORS[0]);
  const [takenColors, setTakenColors] = useState([]);
  const [localError, setLocalError] = useState('');

  // Auto-fill lobby code from QR URL (?code=XXXXXX)
  useEffect(() => {
    const codeParam = new URLSearchParams(window.location.search).get('code');
    if (codeParam) setLobbyCode(codeParam.trim().toUpperCase());
  }, []);

  // Poll taken colors for the entered lobby code
  useEffect(() => {
    const cleanCode = lobbyCode.trim().toUpperCase();
    if (cleanCode.length < 3) {
      setTakenColors([]);
      return;
    }

    let active = true;
    const fetchTaken = async () => {
      try {
        const res = await fetch(`/api/lobby-colors?code=${cleanCode}`);
        if (!res.ok) return;
        const data = await res.json();
        if (active && data && Array.isArray(data.usedColors)) {
          setTakenColors(data.usedColors.map((c) => (c || '').toLowerCase()));
        }
      } catch (err) {
        // silent fail
      }
    };

    fetchTaken();
    const interval = setInterval(fetchTaken, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [lobbyCode]);

  // If currently selected color becomes taken, auto-switch to first available
  useEffect(() => {
    if (color && takenColors.includes(color.toLowerCase())) {
      const firstAvailable = CONFIG.SUIT_COLORS.find(
        (hex) => !takenColors.includes(hex.toLowerCase())
      );
      if (firstAvailable) {
        setColor(firstAvailable);
      }
    }
  }, [takenColors, color]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCode = lobbyCode.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanUsn = usn.trim().toUpperCase() || 'CREW';

    if (!cleanCode) {
      setLocalError('Please enter the Lobby Code provided by Admin!');
      return;
    }
    if (!cleanName) {
      setLocalError('Please enter your Name to board The Skeld!');
      return;
    }
    if (takenColors.includes(color.toLowerCase())) {
      setLocalError('This spacesuit color is already taken by another player! Please choose an available color.');
      return;
    }

    setLocalError('');
    onJoin({ lobbyCode: cleanCode, name: cleanName, usn: cleanUsn, color });
  };

  const errorText = localError || joinError;
  const availableCount = CONFIG.SUIT_COLORS.filter((h) => !takenColors.includes(h.toLowerCase())).length;

  return (
    <section id="joinScreen" className="screen space-bg active">
      <form className="join-card" onSubmit={handleSubmit}>
        <div className="brand-header">
          <div className="brand-badge">SDMCET TECH EVENT</div>
          <div className="brand-title">AMONG US</div>
          <div className="brand-subtitle">The Skeld • Multiplayer C Coding Arena</div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inputLobbyCode">
            Lobby Code (From Admin)
          </label>
          <input
            id="inputLobbyCode"
            className="form-input"
            type="text"
            maxLength={8}
            placeholder="Enter 6-letter code (e.g. A7K9P2)"
            autoComplete="off"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
            style={{
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontWeight: 900,
              textAlign: 'center',
              fontSize: '18px'
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inputPlayerName">
            Crewmate Name
          </label>
          <input
            id="inputPlayerName"
            className="form-input"
            type="text"
            maxLength={16}
            placeholder="Enter your name..."
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inputPlayerUSN">
            USN / College ID
          </label>
          <input
            id="inputPlayerUSN"
            className="form-input"
            type="text"
            maxLength={14}
            placeholder="e.g. 2SD21CS001"
            autoComplete="off"
            value={usn}
            onChange={(e) => setUsn(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Select Spacesuit Color (15 Available)
            </label>
            {takenColors.length > 0 && (
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                {availableCount}/15 Available
              </span>
            )}
          </div>
          <div className="color-picker-grid">
            {CONFIG.SUIT_COLORS.map((hex) => {
              const isTaken = takenColors.includes(hex.toLowerCase());
              const isSelected = color.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  className={`color-swatch ${isSelected ? 'selected' : ''} ${isTaken ? 'taken' : ''}`}
                  style={{ background: hex }}
                  disabled={isTaken}
                  onClick={() => !isTaken && setColor(hex)}
                  title={isTaken ? 'Color taken by another crewmate' : `Select color ${hex}`}
                  aria-label={`Select color ${hex}`}
                />
              );
            })}
          </div>
        </div>

        {errorText && (
          <div
            style={{
              color: '#fca5a5',
              background: 'rgba(239, 68, 68, 0.16)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '10px',
              textAlign: 'center'
            }}
          >
            ❌ {errorText}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={availableCount === 0 && takenColors.length > 0}>
          {availableCount === 0 && takenColors.length > 0 ? 'LOBBY FULL (15/15 COLORS TAKEN)' : '🚀 JOIN LOBBY'}
        </button>

        <div className="conn-status">{connStatus}</div>
      </form>
    </section>
  );
}
