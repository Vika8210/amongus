/**
 * Skeld Renderer — Realistic 2.5D Original Among Us "The Skeld" Graphics Engine
 * Pre-bakes static ship hull, floors, 2.5D walls, and room props once,
 * then renders live animations, vision fog, sabotage alerts & crewmates at 60 FPS.
 */
import { CONFIG } from './config.js';
import {
  SKELD_ROOMS,
  SKELD_OBSTACLES,
  SKELD_VENTS,
  SKELD_STARS,
  SKELD_TILE_SIZE,
  skeldGrid,
  skeldRoomAtCell
} from './skeldMapData.js';
import { drawCrewmate, drawDeadBody } from './characterRenderer.js';

let cachedStaticShip = null;

function fillStrokeRoundRect(c, x, y, w, h, r, fill, stroke, lw = 2) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}

function buildStaticSkeldCanvas() {
  if (cachedStaticShip) return cachedStaticShip;

  const off = document.createElement('canvas');
  off.width = CONFIG.MAP_WIDTH;
  off.height = CONFIG.MAP_HEIGHT;
  const c = off.getContext('2d');
  const T = SKELD_TILE_SIZE;

  // 1. Outer Metallic Spaceship Hull Backing
  for (let gy = 0; gy < CONFIG.MAP_ROWS; gy++) {
    for (let gx = 0; gx < CONFIG.MAP_COLS; gx++) {
      if (skeldGrid[gy][gx] !== 0) continue;
      let near = false;
      for (let dy = -1; dy <= 1 && !near; dy++) {
        for (let dx = -1; dx <= 1 && !near; dx++) {
          const nx = gx + dx, ny = gy + dy;
          if (nx >= 0 && nx < CONFIG.MAP_COLS && ny >= 0 && ny < CONFIG.MAP_ROWS && skeldGrid[ny][nx] === 1) {
            near = true;
          }
        }
      }
      if (near) {
        c.fillStyle = '#1e2530';
        c.fillRect(gx * T - 4, gy * T - 4, T + 8, T + 8);
      }
    }
  }

  // 2. Per-Room Metallic Deck & Tiled Floors
  for (let gy = 0; gy < CONFIG.MAP_ROWS; gy++) {
    for (let gx = 0; gx < CONFIG.MAP_COLS; gx++) {
      if (skeldGrid[gy][gx] !== 1) continue;
      const room = skeldRoomAtCell.get(`${gx},${gy}`);
      const pair = room ? room.floor : ['#7c8696', '#747e8e'];
      const px = gx * T, py = gy * T;
      c.fillStyle = (gx + gy) % 2 === 0 ? pair[0] : pair[1];
      c.fillRect(px, py, T, T);
      c.strokeStyle = 'rgba(15, 23, 42, 0.14)';
      c.lineWidth = 1;
      c.strokeRect(px + 0.5, py + 0.5, T - 1, T - 1);
    }
  }

  // 3. Soft Overhead Room Lighting
  SKELD_ROOMS.forEach(r => {
    const rx = r.x * T, ry = r.y * T, rw = r.w * T, rh = r.h * T;
    const grad = c.createRadialGradient(rx + rw / 2, ry + rh / 2, 20, rx + rw / 2, ry + rh / 2, Math.max(rw, rh) * 0.65);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
    grad.addColorStop(1, 'rgba(10, 15, 28, 0.18)');
    c.fillStyle = grad;
    c.fillRect(rx, ry, rw, rh);
  });

  // 4. 2.5D Among Us Steel Walls
  const FACE_H = 22, CAP_T = 10;
  for (let gy = 0; gy < CONFIG.MAP_ROWS; gy++) {
    for (let gx = 0; gx < CONFIG.MAP_COLS; gx++) {
      if (skeldGrid[gy][gx] !== 1) continue;
      const px = gx * T, py = gy * T;
      const up    = gy === 0 || skeldGrid[gy - 1][gx] === 0;
      const down  = gy === CONFIG.MAP_ROWS - 1 || skeldGrid[gy + 1][gx] === 0;
      const left  = gx === 0 || skeldGrid[gy][gx - 1] === 0;
      const right = gx === CONFIG.MAP_COLS - 1 || skeldGrid[gy][gx + 1] === 0;

      if (up) {
        const wGrad = c.createLinearGradient(0, py, 0, py + FACE_H);
        wGrad.addColorStop(0, '#626f82');
        wGrad.addColorStop(0.75, '#4b5566');
        wGrad.addColorStop(1, '#363f4d');
        c.fillStyle = wGrad;
        c.fillRect(px, py, T, FACE_H);
        c.fillStyle = '#252d3a'; c.fillRect(px, py, T, 6);
        c.fillStyle = '#090c12'; c.fillRect(px, py, T, 2); c.fillRect(px, py + FACE_H - 2, T, 2);
        c.fillStyle = 'rgba(0, 0, 0, 0.22)'; c.fillRect(px, py + FACE_H, T, 6);
      }
      if (down) {
        c.fillStyle = '#262e3b'; c.fillRect(px, py + T - CAP_T, T, CAP_T);
        c.fillStyle = '#090c12'; c.fillRect(px, py + T - CAP_T, T, 2); c.fillRect(px, py + T - 2, T, 2);
      }
      if (left) {
        c.fillStyle = '#2b3442'; c.fillRect(px, py, CAP_T, T);
        c.fillStyle = '#090c12'; c.fillRect(px, py, 2, T); c.fillRect(px + CAP_T - 2, py, 2, T);
      }
      if (right) {
        c.fillStyle = '#2b3442'; c.fillRect(px + T - CAP_T, py, CAP_T, T);
        c.fillStyle = '#090c12'; c.fillRect(px + T - CAP_T, py, 2, T); c.fillRect(px + T - 2, py, 2, T);
      }
    }
  }

  drawRoomProps(c, T);
  drawObstacles(c);

  // Vents
  SKELD_VENTS.forEach(v => {
    fillStrokeRoundRect(c, v.x - 20, v.y - 14, 40, 28, 4, '#475569', '#0f172a', 2.5);
    c.fillStyle = '#1e293b';
    for (let s = -12; s <= 12; s += 6) c.fillRect(v.x + s - 1.5, v.y - 9, 3, 18);
    c.fillStyle = '#cbd5e1';
    [[-15, -9], [15, -9], [-15, 9], [15, 9]].forEach(([bx, by]) => {
      c.beginPath(); c.arc(v.x + bx, v.y + by, 1.8, 0, Math.PI * 2); c.fill();
    });
  });

  // Room Labels
  SKELD_ROOMS.forEach(r => {
    const cx = (r.x + r.w / 2) * T, ty = r.y * T + 38;
    c.save();
    c.font = '900 14px "Segoe UI", system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = 'rgba(9, 13, 22, 0.72)';
    c.fillText(r.name.toUpperCase(), cx + 1.5, ty + 1.5);
    c.fillStyle = 'rgba(248, 250, 252, 0.85)';
    c.fillText(r.name.toUpperCase(), cx, ty);
    c.restore();
  });

  cachedStaticShip = off;
  return off;
}

function drawRoomProps(c, T) {
  // Cafeteria counters & table ring
  {
    const rx = 31 * T, ry = 2 * T;
    fillStrokeRoundRect(c, rx + 70, ry + 26, 220, 34, 4, '#5a6678', '#0f172a', 2);
    fillStrokeRoundRect(c, rx + 310, ry + 26, 220, 34, 4, '#5a6678', '#0f172a', 2);
    c.strokeStyle = 'rgba(30, 41, 59, 0.25)';
    c.lineWidth = 4;
    c.beginPath(); c.arc(1540, 340, 108, 0, Math.PI * 2); c.stroke();
  }
  // MedBay beds & analyzer
  {
    const rx = 21 * T, ry = 10 * T;
    for (let i = 0; i < 4; i++) {
      const bx = rx + 26 + i * 70, by = ry + 34;
      fillStrokeRoundRect(c, bx, by, 52, 92, 6, '#e2e8f0', '#334155', 2);
      fillStrokeRoundRect(c, bx + 8, by + 6, 36, 18, 4, '#ffffff', '#94a3b8', 1.2);
      fillStrokeRoundRect(c, bx + 4, by + 32, 44, 54, 4, '#5eead4', '#0f766e', 1.5);
    }
    fillStrokeRoundRect(c, rx + 195, ry + 235, 105, 58, 5, '#cbd5e1', '#1e293b', 2);
    for (let v = 0; v < 5; v++) {
      c.fillStyle = ['#38bdf8', '#22c55e', '#facc15', '#ef4444', '#a855f7'][v];
      c.fillRect(rx + 206 + v * 17, ry + 248, 10, 26);
    }
  }
  // Reactor stripes & consoles
  {
    const rx = 2 * T, ry = 14 * T;
    for (let i = 0; i < 10; i++) {
      c.fillStyle = i % 2 === 0 ? '#eab308' : '#1e293b';
      c.fillRect(rx + 18, ry + 55 + i * 36, 16, 36);
    }
    fillStrokeRoundRect(c, rx + 210, ry + 60, 75, 42, 4, '#334155', '#0f172a', 2);
    fillStrokeRoundRect(c, rx + 210, ry + 375, 75, 42, 4, '#334155', '#0f172a', 2);
  }
  // Security CCTV desk
  {
    const rx = 14 * T, ry = 16 * T;
    fillStrokeRoundRect(c, rx + 26, ry + 34, 185, 62, 6, '#334155', '#0f172a', 2.5);
    for (let i = 0; i < 4; i++) {
      fillStrokeRoundRect(c, rx + 36 + i * 43, ry + 42, 36, 34, 3, '#0f172a', '#38bdf8', 1.5);
      c.fillStyle = 'rgba(56, 189, 248, 0.35)';
      c.fillRect(rx + 40 + i * 43, ry + 46, 28, 26);
    }
  }
  // Electrical breaker cabinets
  {
    const rx = 21 * T, ry = 22 * T;
    for (let i = 0; i < 4; i++) {
      fillStrokeRoundRect(c, rx + 26 + i * 76, ry + 28, 62, 44, 4, '#374151', '#0f172a', 2);
      c.fillStyle = i % 2 === 0 ? '#22c55e' : '#ef4444';
      c.beginPath(); c.arc(rx + 40 + i * 76, ry + 44, 4, 0, Math.PI * 2); c.fill();
    }
  }
  // Storage fuel & chute
  {
    const rx = 32 * T, ry = 27 * T;
    for (let i = 0; i < 3; i++) {
      fillStrokeRoundRect(c, rx + 30 + i * 36, ry + 340, 26, 38, 4, '#dc2626', '#0f172a', 2);
    }
    fillStrokeRoundRect(c, rx + 355, ry + 410, 90, 48, 5, '#475569', '#0f172a', 2.5);
  }
  // Admin swipe desk
  {
    const rx = 41 * T, ry = 19 * T;
    fillStrokeRoundRect(c, rx + 265, ry + 195, 76, 52, 5, '#785a3c', '#0f172a', 2);
  }
  // Weapons & Navigation viewports
  {
    const rx = 50 * T, ry = 4 * T;
    fillStrokeRoundRect(c, rx + 300, ry + 55, 42, 210, 8, '#020617', '#38bdf8', 2.5);
  }
  {
    const rx = 61 * T, ry = 14 * T;
    fillStrokeRoundRect(c, rx + 215, ry + 45, 48, 310, 14, '#020617', '#38bdf8', 3);
    fillStrokeRoundRect(c, rx + 150, ry + 145, 58, 110, 6, '#334155', '#0f172a', 2);
  }
  // O2 canisters & tree
  {
    const rx = 47 * T, ry = 13 * T;
    for (let i = 0; i < 2; i++) fillStrokeRoundRect(c, rx + 24 + i * 44, ry + 34, 34, 86, 12, '#0d9488', '#0f172a', 2);
    fillStrokeRoundRect(c, rx + 135, ry + 115, 72, 48, 6, '#57534e', '#0f172a', 2);
    c.fillStyle = '#15803d'; c.beginPath(); c.arc(rx + 171, ry + 112, 24, 0, Math.PI * 2); c.fill();
  }
  // Shields hexes
  {
    const rx = 50 * T, ry = 26 * T;
    [[250, 135], [295, 160], [250, 185], [205, 160], [295, 210], [250, 235], [205, 210]].forEach(([dx, dy]) => {
      c.fillStyle = 'rgba(56, 189, 248, 0.35)';
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 2;
      c.beginPath();
      for (let v = 0; v < 6; v++) {
        const a = v * Math.PI / 3;
        const vx = rx + dx + Math.cos(a) * 20, vy = ry + dy + Math.sin(a) * 20;
        v === 0 ? c.moveTo(vx, vy) : c.lineTo(vx, vy);
      }
      c.closePath(); c.fill(); c.stroke();
    });
  }
  // Comms console
  {
    const rx = 45 * T, ry = 35 * T;
    fillStrokeRoundRect(c, rx + 28, ry + 32, 180, 56, 5, '#334155', '#0f172a', 2);
    fillStrokeRoundRect(c, rx + 40, ry + 40, 88, 36, 3, '#052e16', '#22c55e', 1.5);
  }
}

function drawObstacles(c) {
  SKELD_OBSTACLES.forEach(obs => {
    c.save();
    if (obs.kind === 'emergency_table') {
      c.fillStyle = 'rgba(0, 0, 0, 0.32)';
      c.beginPath(); c.arc(obs.x + 5, obs.y + 8, obs.radius + 2, 0, Math.PI * 2); c.fill();
      const grad = c.createRadialGradient(obs.x - 16, obs.y - 16, 8, obs.x, obs.y, obs.radius);
      grad.addColorStop(0, '#cbd5e1'); grad.addColorStop(0.75, '#94a3b8'); grad.addColorStop(1, '#475569');
      c.fillStyle = grad; c.strokeStyle = '#0f172a'; c.lineWidth = 4;
      c.beginPath(); c.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2); c.fill(); c.stroke();
      fillStrokeRoundRect(c, obs.x - 28, obs.y - 24, 56, 48, 8, '#1e3a8a', '#0f172a', 2.5);
      c.fillStyle = '#ef4444'; c.strokeStyle = '#7f1d1d'; c.lineWidth = 2.5;
      c.beginPath(); c.arc(obs.x, obs.y, 16, 0, Math.PI * 2); c.fill(); c.stroke();
    } else if (obs.kind === 'caf_table') {
      c.fillStyle = 'rgba(0, 0, 0, 0.25)';
      c.beginPath(); c.arc(obs.x + 4, obs.y + 6, obs.radius, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#cbd5e1'; c.strokeStyle = '#1e293b'; c.lineWidth = 3;
      c.beginPath(); c.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2); c.fill(); c.stroke();
    } else if (obs.kind === 'engine') {
      fillStrokeRoundRect(c, obs.x, obs.y, obs.w, obs.h, 12, '#475569', '#0f172a', 3);
      fillStrokeRoundRect(c, obs.x + 14, obs.y + 14, obs.w - 28, obs.h - 28, 8, '#1e293b', '#38bdf8', 2);
    } else if (obs.kind === 'elec_wall') {
      fillStrokeRoundRect(c, obs.x, obs.y, obs.w, obs.h, 3, '#334155', '#090c12', 2.5);
    } else if (obs.kind === 'admin_table') {
      fillStrokeRoundRect(c, obs.x, obs.y, obs.w, obs.h, 8, '#334155', '#0f172a', 3);
      fillStrokeRoundRect(c, obs.x + 10, obs.y + 10, obs.w - 20, obs.h - 20, 4, '#064e3b', '#34d399', 2);
      c.fillStyle = '#6ee7b7'; c.font = 'bold 10px monospace'; c.textAlign = 'center';
      c.fillText('SKELD ADMIN MAP', obs.x + obs.w / 2, obs.y + obs.h / 2 + 4);
    } else if (obs.kind === 'crate') {
      fillStrokeRoundRect(c, obs.x, obs.y, obs.w, obs.h, 5, '#b48a5a', '#1c1917', 3);
    } else if (obs.kind === 'weapons_chair') {
      fillStrokeRoundRect(c, obs.x, obs.y, obs.w, obs.h, 8, '#334155', '#0f172a', 2.5);
      c.fillStyle = '#22c55e'; c.beginPath(); c.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, 14, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  });
}

export function isStationSabotaged(station, activeSabotage) {
  if (!activeSabotage || !station) return false;
  const sabId = String(activeSabotage.buildingId || '').toLowerCase();
  const sabName = String(activeSabotage.building || '').toLowerCase();
  return sabId === station.id || (sabName && sabName.includes(station.name.toLowerCase()));
}

export function screenToWorld(screenX, screenY, canvas, state) {
  const w = canvas.width, h = canvas.height;
  let zoom = 1, camX = state.myPlayer.x, camY = state.myPlayer.y;
  if (state.viewMode === 'full') {
    zoom = Math.min(w / CONFIG.MAP_WIDTH, h / CONFIG.MAP_HEIGHT) * 0.96;
    camX = CONFIG.MAP_WIDTH / 2;
    camY = CONFIG.MAP_HEIGHT / 2;
  } else {
    zoom = Math.max(0.72, Math.min(1.08, Math.min(w / 1080, h / 660)));
  }
  return { x: (screenX - w / 2) / zoom + camX, y: (screenY - h / 2) / zoom + camY };
}

function getEffectiveVisionRadius(state) {
  if (state.myPlayer.isDead) return Infinity;
  const isImp = String(state.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
  const basePx = isImp ? (state.settings?.impostorVision || 250) : (state.settings?.crewVision || 150);
  let radius = basePx * 1.45;
  const sabId = String(state.activeSabotage?.buildingId || '').toLowerCase();
  if (!isImp && sabId === 'electrical') radius = Math.max(95, radius * 0.52);
  return radius;
}

export function renderSkeldFrame(ctx, canvas, state) {
  const w = canvas.width, h = canvas.height;
  const now = Date.now();
  const time = performance.now() * 0.003;

  ctx.fillStyle = '#03050a';
  ctx.fillRect(0, 0, w, h);

  const staticShip = buildStaticSkeldCanvas();

  ctx.save();
  let zoom = 1, camX = state.myPlayer.x, camY = state.myPlayer.y;
  if (state.viewMode === 'full') {
    zoom = Math.min(w / CONFIG.MAP_WIDTH, h / CONFIG.MAP_HEIGHT) * 0.96;
    camX = CONFIG.MAP_WIDTH / 2;
    camY = CONFIG.MAP_HEIGHT / 2;
  } else {
    zoom = Math.max(0.72, Math.min(1.08, Math.min(w / 1080, h / 660)));
  }

  ctx.translate(w / 2, h / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-camX, -camY);

  // Stars
  SKELD_STARS.forEach(s => {
    const alpha = Math.max(0.18, s.brightness + Math.sin(now * s.twinkleSpeed) * 0.28);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
  });

  // Pre-baked Skeld Ship
  ctx.drawImage(staticShip, 0, 0);

  // Live Reactor & MedBay effects
  const pulse = 0.5 + 0.5 * Math.sin(now * 0.004);
  const rGrad = ctx.createRadialGradient(165, 800, 6, 165, 800, 62 + pulse * 10);
  rGrad.addColorStop(0, 'rgba(186, 230, 253, 0.9)');
  rGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.45)');
  rGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = rGrad; ctx.beginPath(); ctx.arc(165, 800, 70, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = `rgba(16, 185, 129, ${0.55 + pulse * 0.45})`;
  ctx.fillStyle = `rgba(16, 185, 129, ${0.12 + pulse * 0.14})`;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(960, 620, 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Stations & Sabotage
  drawStationsAndSabotage(ctx, state, time);

  if (state.viewMode === 'full') {
    drawFullMapMarkers(ctx, state, time);
    drawSelfMapPin(ctx, state, time);
  } else {
    const visionRadius = getEffectiveVisionRadius(state);
    const isImp = String(state.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';

    if (isImp && !state.myPlayer.isDead) {
      const vent = state.activeVent || state.currentVentNear;
      if (vent) {
        ctx.save();
        ctx.strokeStyle = state.myPlayer.inVent ? '#facc15' : '#06b6d4';
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.roundRect(vent.x - 25, vent.y - 19, 50, 38, 7); ctx.stroke();
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.fillStyle = state.myPlayer.inVent ? '#fef08a' : '#67e8f9';
        ctx.textAlign = 'center';
        ctx.fillText(state.myPlayer.inVent ? '🕳️ HIDDEN IN VENT' : '🕳️ VENT [V]', vent.x, vent.y - 26 + Math.sin(time * 5) * 2);
        ctx.restore();
      }
    }

    state.deadBodies.forEach(body => {
      if (Math.hypot(body.x - state.myPlayer.x, body.y - state.myPlayer.y) <= visionRadius + 24) {
        drawDeadBody(ctx, body);
      }
    });

    const drawList = [];
    state.players.forEach(p => {
      if (p.inVent) return;
      if (Math.hypot(p.x - state.myPlayer.x, p.y - state.myPlayer.y) <= visionRadius + 24) {
        drawList.push({ data: p, isMe: false, y: p.y });
      }
    });
    if (!state.myPlayer.inVent) drawList.push({ data: state.myPlayer, isMe: true, y: state.myPlayer.y });
    drawList.sort((a, b) => a.y - b.y);
    drawList.forEach(item => drawCrewmate(ctx, item.data, item.isMe, time));

    if (Number.isFinite(visionRadius)) {
      const fogGrad = ctx.createRadialGradient(state.myPlayer.x, state.myPlayer.y, Math.max(20, visionRadius * 0.58), state.myPlayer.x, state.myPlayer.y, visionRadius);
      fogGrad.addColorStop(0, 'rgba(3, 6, 14, 0)');
      fogGrad.addColorStop(0.75, 'rgba(3, 6, 14, 0.55)');
      fogGrad.addColorStop(1, 'rgba(3, 6, 14, 0.94)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(-600, -600, CONFIG.MAP_WIDTH + 1200, CONFIG.MAP_HEIGHT + 1200);
    }

    if (state.activeSabotage) drawSabotageArrow(ctx, state);
  }

  ctx.restore();

  if (state.viewMode === 'camera') {
    drawCornerRadar(ctx, w, h, state, time);
  } else {
    drawFullMapChecklist(ctx, state);
  }
}

function drawStationsAndSabotage(ctx, state, time) {
  const isImp = String(state.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
  state.stations.forEach(st => {
    const isNear = !isImp && state.currentStationNear && state.currentStationNear.id === st.id;
    const isSab = isStationSabotaged(st, state.activeSabotage);
    const hasTask = !isImp && state.assignedTasks.includes(st.id) && !state.myPlayer.completedTasks.includes(st.id);

    ctx.save();
    if (isSab) {
      const roomObj = SKELD_ROOMS.find(r => r.id === st.id);
      if (roomObj) {
        ctx.fillStyle = `rgba(239, 68, 68, ${0.14 + Math.abs(Math.sin(time * 3.5)) * 0.18})`;
        ctx.fillRect(roomObj.x * SKELD_TILE_SIZE, roomObj.y * SKELD_TILE_SIZE, roomObj.w * SKELD_TILE_SIZE, roomObj.h * SKELD_TILE_SIZE);
      }
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(st.x, st.y, 44 + Math.sin(time * 6) * 7, 0, Math.PI * 2); ctx.stroke();
    } else if (isNear) {
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(st.x, st.y, 38 + Math.sin(time * 4) * 4, 0, Math.PI * 2); ctx.stroke();
    }

    fillStrokeRoundRect(ctx, st.x - 18, st.y - 14, 36, 28, 5, isSab ? '#7f1d1d' : '#1e293b', isSab ? '#ef4444' : (isNear ? '#38bdf8' : '#22c55e'), 2.5);
    ctx.fillStyle = isSab ? '#ef4444' : '#22c55e';
    ctx.beginPath(); ctx.arc(st.x, st.y, 6, 0, Math.PI * 2); ctx.fill();

    if (isSab) {
      const bounce = Math.sin(time * 6) * 5;
      const dist = Math.hypot(state.myPlayer.x - st.x, state.myPlayer.y - st.y);
      if (!state.myPlayer.isDead && dist <= CONFIG.SABOTAGE_FIX_RADIUS) {
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.arc(st.x, st.y, 32 + Math.sin(time * 7) * 4, 0, Math.PI * 2); ctx.stroke();
        fillStrokeRoundRect(ctx, st.x - 74, st.y - 52 + bounce, 148, 24, 6, 'rgba(127, 29, 29, 0.92)', '#facc15', 2);
        ctx.fillStyle = '#fef08a'; ctx.font = '900 12px "Segoe UI", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🔧 TAP TO FIX', st.x, st.y - 40 + bounce);
      } else {
        ctx.fillStyle = '#ef4444'; ctx.font = '900 14px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`⚠️ FIX ${st.name.toUpperCase()}`, st.x, st.y - 26 + bounce);
      }
    } else if (hasTask) {
      const bounce = Math.sin(time * 4) * 4;
      ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#090c12'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(st.x, st.y - 28 + bounce, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#090c12'; ctx.font = '900 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', st.x, st.y - 27 + bounce);
    }
    ctx.restore();
  });
}

function drawFullMapMarkers(ctx, state, time) {
  const isImp = String(state.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
  const pulse = Math.sin(time * 5) * 6;
  if (isImp) {
    SKELD_VENTS.forEach(v => {
      ctx.save();
      ctx.fillStyle = 'rgba(6, 182, 212, 0.85)'; ctx.strokeStyle = '#090c12'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(v.x, v.y, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#090c12'; ctx.font = '900 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('V', v.x, v.y + 1);
      ctx.restore();
    });
  }
  state.stations.forEach(st => {
    const isAssigned = !isImp && state.assignedTasks.includes(st.id);
    const isDone = state.myPlayer.completedTasks.includes(st.id);
    const isSab = isStationSabotaged(st, state.activeSabotage);
    if (!isAssigned && !isSab) return;
    ctx.save();
    if (isSab) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.95)'; ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(st.x, st.y, 44 + pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = '900 34px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⚠️', st.x, st.y);
    } else if (!isDone) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.95)'; ctx.strokeStyle = '#090c12'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(st.x, st.y, 38 + pulse * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#090c12'; ctx.font = '900 40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', st.x, st.y + 2);
    } else {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.9)'; ctx.strokeStyle = '#090c12'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(st.x, st.y, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = '900 28px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✓', st.x, st.y + 1);
    }
    ctx.restore();
  });
}

function drawSelfMapPin(ctx, state, time) {
  const { x: px, y: py, color } = state.myPlayer;
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.beginPath(); ctx.arc(px, py, 46 + Math.sin(time * 5) * 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color || '#38bdf8'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(px, py, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.font = '900 26px "Segoe UI", sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  ctx.fillText('YOU', px, py - 38);
  ctx.restore();
}

function drawSabotageArrow(ctx, state) {
  const sabTarget = state.stations.find(s => isStationSabotaged(s, state.activeSabotage));
  if (!sabTarget) return;
  const dx = sabTarget.x - state.myPlayer.x, dy = sabTarget.y - state.myPlayer.y;
  if (Math.hypot(dx, dy) < 150) return;
  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(state.myPlayer.x + Math.cos(angle) * 78, state.myPlayer.y + Math.sin(angle) * 78);
  ctx.rotate(angle);
  ctx.fillStyle = '#ef4444'; ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -11); ctx.lineTo(-5, 0); ctx.lineTo(-10, 11); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawCornerRadar(ctx, w, h, state, time) {
  const rw = Math.min(186, w * 0.28);
  const rh = rw * (CONFIG.MAP_HEIGHT / CONFIG.MAP_WIDTH);
  const rx = 14, ry = 60, sx = rw / CONFIG.MAP_WIDTH, sy = rh / CONFIG.MAP_HEIGHT;

  ctx.save();
  fillStrokeRoundRect(ctx, rx, ry, rw, rh, 8, 'rgba(8, 15, 28, 0.84)', 'rgba(56, 189, 248, 0.48)', 1.5);
  SKELD_ROOMS.forEach(r => {
    ctx.fillStyle = 'rgba(100, 116, 139, 0.65)';
    ctx.fillRect(rx + r.x * SKELD_TILE_SIZE * sx, ry + r.y * SKELD_TILE_SIZE * sy, r.w * SKELD_TILE_SIZE * sx, r.h * SKELD_TILE_SIZE * sy);
  });
  const isImp = String(state.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
  state.stations.forEach(st => {
    if (isStationSabotaged(st, state.activeSabotage)) {
      ctx.fillStyle = Math.sin(time * 8) > 0 ? '#ef4444' : '#facc15';
      ctx.beginPath(); ctx.arc(rx + st.x * sx, ry + st.y * sy, 4.5, 0, Math.PI * 2); ctx.fill();
    } else if (!isImp && state.assignedTasks.includes(st.id) && !state.myPlayer.completedTasks.includes(st.id)) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(rx + st.x * sx, ry + st.y * sy, 2.8, 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(rx + state.myPlayer.x * sx, ry + state.myPlayer.y * sy, 3.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.font = 'bold 8px sans-serif'; ctx.fillStyle = '#7dd3fc'; ctx.textAlign = 'left';
  ctx.fillText('THE SKELD', rx + 6, ry + 11);
  ctx.restore();
}

function drawFullMapChecklist(ctx, state) {
  const isImp = String(state.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
  if (isImp) {
    ctx.save();
    fillStrokeRoundRect(ctx, 16, 64, 210, 52, 10, 'rgba(9, 14, 26, 0.9)', 'rgba(239, 68, 68, 0.55)', 1.5);
    ctx.font = '900 11px "Segoe UI", sans-serif'; ctx.fillStyle = '#fca5a5'; ctx.textAlign = 'left';
    ctx.fillText('🔪 IMPOSTOR SHIP MAP', 28, 86);
    ctx.font = '600 11px "Segoe UI", sans-serif'; ctx.fillStyle = '#cbd5e1';
    ctx.fillText('V = Vents • Hunt Crewmates', 28, 104);
    ctx.restore();
    return;
  }
  const assigned = state.assignedTasks || [];
  const completed = state.myPlayer.completedTasks || [];
  const items = assigned.map(id => {
    const st = state.stations.find(s => s.id === id);
    return { name: st ? st.name : id, done: completed.includes(id) };
  });
  const boxX = 16, boxY = 64, rowH = 22, boxW = 220, boxH = 44 + Math.max(1, items.length) * rowH;
  ctx.save();
  fillStrokeRoundRect(ctx, boxX, boxY, boxW, boxH, 10, 'rgba(9, 14, 26, 0.9)', 'rgba(56, 189, 248, 0.5)', 1.5);
  ctx.font = '900 11px "Segoe UI", sans-serif'; ctx.fillStyle = '#7dd3fc'; ctx.textAlign = 'left';
  ctx.fillText('📋 REMAINING TASKS', boxX + 12, boxY + 22);
  if (items.length === 0) {
    ctx.font = '700 12px "Segoe UI", sans-serif'; ctx.fillStyle = '#94a3b8';
    ctx.fillText('Waiting for next wave...', boxX + 12, boxY + 46);
  } else {
    items.forEach((item, idx) => {
      ctx.font = '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = item.done ? '#4ade80' : '#facc15';
      ctx.fillText(`${item.done ? '✅' : '⭐'} ${item.name}`, boxX + 12, boxY + 46 + idx * rowH);
    });
  }
  ctx.restore();
}
