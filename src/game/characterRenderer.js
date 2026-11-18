/**
 * Authentic Among Us Crewmate, Ghost & Dead Body 2D Sprite Renderer
 */
function shadeColor(hex, factor = 0.65) {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return '#1e293b';
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

export function drawCrewmate(ctx, player, isMe, time) {
  const px = player.x;
  const isDead = !!player.isDead;
  const isMoving = Math.abs(player.vx || 0) > 0.05 || Math.abs(player.vy || 0) > 0.05;
  const facing = (player.facing ?? 1) >= 0 ? 1 : -1;
  const baseColor = player.color || '#c51111';
  const shadowColor = shadeColor(baseColor, 0.64);

  let py = player.y;
  const walkSwing = isMoving && !isDead ? Math.sin(time * 16) * 5.5 : 0;
  const walkBob = isMoving && !isDead ? Math.abs(Math.sin(time * 16)) * 2.5 : 0;

  ctx.save();
  if (isDead) {
    ctx.globalAlpha = 0.58;
    py += Math.sin(time * 4) * 5;
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
  ctx.beginPath();
  ctx.ellipse(px, player.y + 20, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isMe && !isDead) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(px, player.y + 20, 22 + Math.sin(time * 4) * 1.5, 9, 0, 0, Math.PI * 2);
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
  ctx.roundRect(-21, -10, 10, 22, 5);
  ctx.fill();
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.roundRect(-20, -9, 8, 12, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-21, -10, 10, 22, 5);
  ctx.stroke();

  // Legs or Ghost Tail
  if (!isDead) {
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.roundRect(-11 + walkSwing * 0.6, 8, 9, 13, 4);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(2 - walkSwing * 0.6, 8, 9, 13, 4);
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
  ctx.roundRect(-14, -20, 28, 33, [14, 14, 9, 9]);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-14, -20, 28, 33, [14, 14, 9, 9]);
  ctx.clip();
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.ellipse(2, -7, 17, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(-14, -20, 28, 33, [14, 14, 9, 9]);
  ctx.stroke();

  // Glossy Visor
  ctx.fillStyle = '#4e91b5';
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(-1, -13, 18, 12, 6);
  ctx.fill();
  ctx.fillStyle = '#9be2f7';
  ctx.beginPath();
  ctx.roundRect(1, -12, 14, 8, 4);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(9, -9.5, 4.5, 2, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-1, -13, 18, 12, 6);
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
  ctx.roundRect(px - tw / 2 - 7, tagY - 11, tw + 14, 18, 5);
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
  const { x, y } = body;
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
  ctx.roundRect(x - 14, y - 2, 28, 16, [4, 4, 9, 9]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = baseColor;
  ctx.fillRect(x - 11, y, 22, 6);

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#090c12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 3.5, y - 16, 7, 15, 2);
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
