import React from 'react';
import { SABOTAGE_TARGETS } from '../../game/taskCatalog.js';

export default function SabotageModal({ open, onClose, onTriggerSabotage, activeSabotage, sabotageCooldown = 0 }) {
  if (!open) return null;

  const isBlocked = Boolean(activeSabotage || sabotageCooldown > 0);

  return (
    <div className="modal-overlay open">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ color: '#f87171' }}>
              ⚡ SABOTAGE THE SKELD
            </div>
            <div className="modal-subtitle" style={{ color: '#fca5a5' }}>
              Select a ship system to cripple (30s cooldown between sabotages)
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        {activeSabotage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '10px 14px',
            margin: '0 0 14px 0',
            color: '#fca5a5',
            fontSize: '12px',
            fontWeight: 700
          }}>
            ⚠️ Active sabotage at {activeSabotage.building || 'Ship'}! Only 1 sabotage can be active at a time.
          </div>
        )}

        {sabotageCooldown > 0 && !activeSabotage && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid #eab308',
            borderRadius: '8px',
            padding: '10px 14px',
            margin: '0 0 14px 0',
            color: '#fef08a',
            fontSize: '12px',
            fontWeight: 700
          }}>
            ⏳ Sabotage cooldown active: {Math.ceil(sabotageCooldown)}s remaining.
          </div>
        )}

        <div className="sabotage-option-grid">
          {SABOTAGE_TARGETS.map((target) => (
            <button
              key={target.id}
              className="btn-sabotage-target"
              disabled={isBlocked}
              style={isBlocked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              onClick={() => {
                if (isBlocked) return;
                onTriggerSabotage(target);
                onClose();
              }}
            >
              {target.icon} {target.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
