/**
 * Authentic Among Us Crewmate, Ghost & Dead Body 2D Sprite Renderer
 * Features rock-solid cross-browser rounded rect rendering that never crashes.
 */

// Universal safe roundRect helper that works in 100% of browsers & mobile WebViews without recursion
export function drawRoundRect(ctx, x, y, w, h, r = 0) {
  let tl = 0, tr = 0, br = 0, bl = 0;
  if (typeof r === 'number') {
    tl = tr = br = bl = Math.max(0, r);
  } else if (Array.isArray(r)) {
    if (r.length === 1) tl = tr = br = bl = Math.max(0, r[0]);
    else if (r.length === 2) { tl = br = Math.max(0, r[0]); tr = bl = Math.max(0, r[1]); }
    else if (r.length === 4) { [tl, tr, br, bl] = r.map(v => Math.max(0, v)); }
  }

  const maxR = Math.min(Math.abs(w) / 2, Math.abs(h) / 2);
  tl = Math.min(tl, maxR);
  tr = Math.min(tr, maxR);
  br = Math.min(br, maxR);
  bl = Math.min(bl, maxR);

  if (tl === 0 && tr === 0 && br === 0 && bl === 0) {
    ctx.rect(x, y, w, h);
    return;
  }

  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

// Global prototype polyfill for safety
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    drawRoundRect(this, x, y, w, h, r);
  };
}

function shadeColor(hex, factor = 0.65) {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return '#1e293b';
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

export function drawCrewmate(ctx, player, isMe, time) {
  const px = Number.isFinite(player.x) ? player.x : 1540;
  const isDead = !!player.isDead;
  const isMoving = Math.abs(player.vx || 0) > 0.05 || Math.abs(player.vy || 0) > 0.05;
  const facing = (player.facing ?? 1) >= 0 ? 1 : -1;
  const baseColor = player.color || '#c51111';
  const shadowColor = shadeColor(baseColor, 0.64);

  let py = Number.isFinite(player.y) ? player.y : 340;
  const walkSwing = isMoving && !isDead ? Math.sin(time * 16) * 5.5 : 0;
  const walkBob = isMoving && !isDead ? Math.abs(Math.sin(time * 16)) * 2.5 : 0;

  ctx.save();
  if (isDead) {
    ctx.globalAlpha = 0.58;
    py += Math.sin(time * 4) * 5;
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
  ctx.beginPath();
  ctx.ellipse(px, py + 20, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isMe && !isDead) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(px, py + 20, 22 + Math.sin(time * 4) * 1.5, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(px, py - walkBob);
  ctx.scale(facing, 1);

  const outline = '#090c12';

  // Backpack
  ctx.fillStyle = shadowColor;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  drawRoundRect(ctx, -21, -10, 10, 22, 5);
  ctx.fill();
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  drawRoundRect(ctx, -20, -9, 8, 12, 4);
  ctx.fill();
  ctx.beginPath();
  drawRoundRect(ctx, -21, -10, 10, 22, 5);
  ctx.stroke();

  // Legs or Ghost Tail
  if (!isDead) {
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    drawRoundRect(ctx, -11 + walkSwing * 0.6, 8, 9, 13, 4);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    drawRoundRect(ctx, 2 - walkSwing * 0.6, 8, 9, 13, 4);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.moveTo(-13, 8);
    ctx.quadraticCurveTo(-8, 22, -2, 14);
    ctx.quadraticCurveTo(4, 24, 13, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Torso (Two-tone cel-shaded)
  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  drawRoundRect(ctx, -14, -20, 28, 33, [14, 14, 9, 9]);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  drawRoundRect(ctx, -14, -20, 28, 33, [14, 14, 9, 9]);
  ctx.clip();
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.ellipse(2, -7, 17, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  drawRoundRect(ctx, -14, -20, 28, 33, [14, 14, 9, 9]);
  ctx.stroke();

  // Glossy Visor
  ctx.fillStyle = '#4e91b5';
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  drawRoundRect(ctx, -1, -13, 18, 12, 6);
  ctx.fill();
  ctx.fillStyle = '#9be2f7';
  ctx.beginPath();
  drawRoundRect(ctx, 1, -12, 14, 8, 4);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(9, -9.5, 4.5, 2, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  drawRoundRect(ctx, -1, -13, 18, 12, 6);
  ctx.stroke();

  if (isDead) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, -27, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Nameplate
  const tagText = isMe ? `${player.name} (You)` : (player.name || 'Crewmate');
  ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
  const tw = ctx.measureText(tagText).width;
  const tagY = py - walkBob - 36;

  ctx.fillStyle = 'rgba(10, 14, 24, 0.86)';
  ctx.beginPath();
  drawRoundRect(ctx, px - tw / 2 - 7, tagY - 11, tw + 14, 18, 5);
  ctx.fill();
  ctx.strokeStyle = isMe ? '#38bdf8' : 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = isMe ? '#7dd3fc' : '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagText, px, tagY - 2);
  ctx.restore();
}

export function drawDeadBody(ctx, body) {
  const x = Number.isFinite(body.x) ? body.x : 1540;
  const y = Number.isFinite(body.y) ? body.y : 340;
  const baseColor = body.color || '#c51111';
  const shadowColor = shadeColor(baseColor, 0.62);

  ctx.save();
  ctx.fillStyle = 'rgba(153, 27, 27, 0.72)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 10, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = shadowColor;
  ctx.strokeStyle = '#090c12';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  drawRoundRect(ctx, x - 14, y - 2, 28, 16, [4, 4, 9, 9]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = baseColor;
  ctx.fillRect(x - 11, y, 22, 6);

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#090c12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  drawRoundRect(ctx, x - 3.5, y - 16, 7, 15, 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - 4, y - 16, 4, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 16, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.fillStyle = '#fca5a5';
  ctx.textAlign = 'center';
  ctx.fillText(`💀 ${body.victimName || 'Crewmate'}`, x, y + 26);
  ctx.restore();
}
