import React from 'react';
import { SABOTAGE_TARGETS } from '../../game/taskCatalog.js';

export default function SabotageModal({ open, onClose, onTriggerSabotage }) {
  if (!open) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ color: '#f87171' }}>
              ⚡ SABOTAGE THE SKELD
            </div>
            <div className="modal-subtitle" style={{ color: '#fca5a5' }}>
              Select a ship system to cripple
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sabotage-option-grid">
          {SABOTAGE_TARGETS.map((target) => (
            <button
              key={target.id}
              className="btn-sabotage-target"
              onClick={() => {
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
