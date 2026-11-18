import React from 'react';
import { SKELD_STATIONS } from '../../game/taskCatalog.js';

export default function RoleRevealScreen({ role, assignedTasks, onDismiss }) {
  const isImp = String(role || 'CREWMATE').toUpperCase() === 'IMPOSTOR';

  return (
    <section id="roleRevealScreen" className="screen space-bg active" onClick={onDismiss}>
      <div className={`role-card ${isImp ? 'impostor' : 'crewmate'}`}>
        <div className="role-icon">{isImp ? '🔪' : '🛡️'}</div>
        <div className="role-title">{isImp ? 'IMPOSTOR' : 'CREWMATE'}</div>

        <div className="role-desc">
          {isImp ? (
            <>
              Sabotage The Skeld systems, blend in with crewmates,
              <br />
              and eliminate everyone without getting caught!
            </>
          ) : (
            <>
              There are Impostors aboard The Skeld!
              <br />
              Complete C coding tasks across the ship or vote them out.
            </>
          )}
        </div>

        {!isImp && (
          <div className="role-tasks-box">
            <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>
              📋 ASSIGNED SHIP TASKS:
            </div>
            {(assignedTasks || []).map((tid) => {
              const st = SKELD_STATIONS.find((s) => s.id === tid) || {
                name: tid,
                taskTitle: 'Complete C Task'
              };
              return (
                <div key={tid} className="role-task-line">
                  <span>•</span>
                  <span>
                    {st.name}: {st.taskTitle}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
