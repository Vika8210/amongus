import React, { useEffect, useRef, useState } from 'react';
import { SKELD_ROOMS, SKELD_HALLWAYS, SKELD_TILE_SIZE } from '../../game/skeldMapData.js';
import { SKELD_STATIONS } from '../../game/taskCatalog.js';
import { CONFIG } from '../../game/config.js';

export default function LiveSkeldMap({ players, sabotages, settings }) {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 400;
    const h = 250;
    const sx = w / CONFIG.MAP_WIDTH;
    const sy = h / CONFIG.MAP_HEIGHT;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, w, h);

    // Tactical grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Hallways
    ctx.fillStyle = '#1e293b';
    SKELD_HALLWAYS.forEach((hw) => {
      ctx.fillRect(
        hw.x * SKELD_TILE_SIZE * sx,
        hw.y * SKELD_TILE_SIZE * sy,
        hw.w * SKELD_TILE_SIZE * sx,
        hw.h * SKELD_TILE_SIZE * sy
      );
    });

    // Rooms
    SKELD_ROOMS.forEach((r) => {
      const rx = r.x * SKELD_TILE_SIZE * sx;
      const ry = r.y * SKELD_TILE_SIZE * sy;
      const rw = r.w * SKELD_TILE_SIZE * sx;
      const rh = r.h * SKELD_TILE_SIZE * sy;

      ctx.strokeStyle = r.accent || 'rgba(79, 195, 247, 0.5)';
      ctx.fillStyle = 'rgba(26, 39, 60, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(rx, ry, rw, rh, 3) : ctx.rect(rx, ry, rw, rh);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.name.toUpperCase(), rx + rw / 2, ry + 9);
    });

    // Task stations
    SKELD_STATIONS.forEach((st) => {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(st.x * sx, st.y * sy, 2.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Active sabotages
    (sabotages || []).forEach((sab) => {
      const room = SKELD_ROOMS.find(
        (r) =>
          (sab.id || '').toLowerCase() === r.id ||
          (sab.location || '').toLowerCase().includes(r.id)
      );
      if (!room) return;
      const cx = (room.x + room.w / 2) * SKELD_TILE_SIZE * sx;
      const cy = (room.y + room.h / 2) * SKELD_TILE_SIZE * sy;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Players
    (players || []).forEach((p) => {
      const px = Math.max(8, Math.min(w - 8, (p.x ?? 1540) * sx));
      const py = Math.max(8, Math.min(h - 8, (p.y ?? 450) * sy));
      const isDead = p.isDead || p.status === 'dead';
      const isImp = (p.role || '').toUpperCase() === 'IMPOSTOR';

      if (isDead) {
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', px, py);
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText(p.name || 'Dead', px, py + 10);
      } else {
        ctx.fillStyle = p.color || '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isImp ? '#ef4444' : '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name || 'P', px, py - 8);
      }
    });
  }, [players, sabotages]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const sx = 400 / CONFIG.MAP_WIDTH;
    const sy = 250 / CONFIG.MAP_HEIGHT;

    const found = (players || []).find((p) => {
      const px = Math.max(8, Math.min(392, (p.x ?? 1540) * sx));
      const py = Math.max(8, Math.min(242, (p.y ?? 452) * sy));
      return Math.hypot(px - mx, py - my) <= 12;
    });

    if (found) {
      setTooltip({ player: found, left: Math.min(260, mx + 12), top: Math.min(175, my + 12) });
    } else {
      setTooltip(null);
    }
  };

  return (
    <div className="card map-card-wrapper">
      <div className="card-header" style={{ width: '100%' }}>
        <div className="card-title">
          <span className="icon">🗺️</span> Live Player Map
        </div>
        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
          THE SKELD (2800 × 1680)
        </span>
      </div>

      <div className="map-canvas-container">
        <canvas
          id="miniMapCanvas"
          ref={canvasRef}
          width={400}
          height={250}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        />

        {tooltip && (
          <div
            id="mapTooltip"
            style={{ display: 'block', left: `${tooltip.left}px`, top: `${tooltip.top}px` }}
          >
            <div style={{ fontWeight: 800, fontSize: '12px', color: '#fff' }}>
              {tooltip.player.name} ({tooltip.player.collegeId || 'No USN'})
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
              <span
                className={`role-badge ${
                  (tooltip.player.role || '').toUpperCase() === 'IMPOSTOR'
                    ? 'role-imp'
                    : 'role-crew'
                }`}
                style={{ fontSize: '9px', padding: '1px 5px' }}
              >
                {(tooltip.player.role || '').toUpperCase() === 'IMPOSTOR'
                  ? 'IMPOSTOR 🔪'
                  : 'CREWMATE'}
              </span>
              <span style={{ color: '#eab308', fontWeight: 700 }}>
                {tooltip.player.score ?? 0} pts
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
              Tasks:{' '}
              {Array.isArray(tooltip.player.tasksCompleted)
                ? tooltip.player.tasksCompleted.length
                : 0}
              /{tooltip.player.tasksAssigned?.length || settings.tasksPerPlayer || 3} |{' '}
              {tooltip.player.isDead ? '💀 Dead' : '🟢 Alive'}
            </div>
          </div>
        )}
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--accent-green)' }} /> Live Player
        </div>
        <div className="legend-item">
          <span>💀</span> Dead Body
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--accent-yellow)' }} /> Task Station
        </div>
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ background: 'var(--accent-red)', boxShadow: '0 0 6px red' }}
          />{' '}
          Sabotage
        </div>
      </div>
    </div>
  );
}
