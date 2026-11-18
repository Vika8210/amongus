/**
 * Skeld Collision Engine — Smooth doorway corner-sliding & auto-unstuck
 */
import { CONFIG } from './config.js';
import { skeldGrid, SKELD_OBSTACLES, SKELD_TILE_SIZE } from './skeldMapData.js';

const COLLISION_RADIUS = 12;

export function isWalkable(px, py) {
  const r = COLLISION_RADIUS;
  const corners = [
    [px - r, py - r],
    [px + r, py - r],
    [px - r, py + r],
    [px + r, py + r]
  ];

  for (const [cx, cy] of corners) {
    const gx = Math.floor(cx / SKELD_TILE_SIZE);
    const gy = Math.floor(cy / SKELD_TILE_SIZE);
    if (
      gx < 0 || gx >= CONFIG.MAP_COLS ||
      gy < 0 || gy >= CONFIG.MAP_ROWS ||
      skeldGrid[gy][gx] !== 1
    ) {
      return false;
    }
  }

  for (const obs of SKELD_OBSTACLES) {
    if (obs.type === 'circle') {
      if (Math.hypot(px - obs.x, py - obs.y) < obs.radius + r) return false;
    } else if (
      px + r > obs.x &&
      px - r < obs.x + obs.w &&
      py + r > obs.y &&
      py - r < obs.y + obs.h
    ) {
      return false;
    }
  }
  return true;
}

export function findNearestWalkable(x, y) {
  if (isWalkable(x, y)) return { x, y };
  for (let radius = 6; radius <= 120; radius += 6) {
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const tx = x + Math.cos(ang) * radius;
      const ty = y + Math.sin(ang) * radius;
      if (isWalkable(tx, ty)) return { x: tx, y: ty };
    }
  }
  return { x: 1540, y: 452 };
}

export function movePlayerWithCollision(player, dx, dy, speed) {
  const stepX = dx * speed;
  const stepY = dy * speed;
  const nextX = player.x + stepX;
  const nextY = player.y + stepY;

  if (player.isDead) {
    player.x = Math.max(40, Math.min(CONFIG.MAP_WIDTH - 40, nextX));
    player.y = Math.max(40, Math.min(CONFIG.MAP_HEIGHT - 40, nextY));
    return;
  }

  if (!isWalkable(player.x, player.y)) {
    const safe = findNearestWalkable(player.x, player.y);
    player.x = safe.x;
    player.y = safe.y;
  }

  let movedX = false;
  let movedY = false;

  if (Math.abs(stepX) > 0.001) {
    if (isWalkable(nextX, player.y)) {
      player.x = nextX;
      movedX = true;
    } else if (Math.abs(dy) < 0.45) {
      const nudge = Math.min(4, speed * 0.6);
      if (isWalkable(nextX, player.y - nudge)) {
        player.y -= nudge;
        player.x = nextX;
        movedX = true;
      } else if (isWalkable(nextX, player.y + nudge)) {
        player.y += nudge;
        player.x = nextX;
        movedX = true;
      }
    }
  }

  if (Math.abs(stepY) > 0.001) {
    if (isWalkable(player.x, nextY)) {
      player.y = nextY;
      movedY = true;
    } else if (Math.abs(dx) < 0.45) {
      const nudge = Math.min(4, speed * 0.6);
      if (isWalkable(player.x - nudge, nextY)) {
        player.x -= nudge;
        player.y = nextY;
        movedY = true;
      } else if (isWalkable(player.x + nudge, nextY)) {
        player.x += nudge;
        player.y = nextY;
        movedY = true;
      }
    }
  }

  if (!movedX && !movedY && (Math.abs(stepX) > 1 || Math.abs(stepY) > 1)) {
    const halfX = player.x + stepX * 0.4;
    const halfY = player.y + stepY * 0.4;
    if (isWalkable(halfX, player.y)) player.x = halfX;
    if (isWalkable(player.x, halfY)) player.y = halfY;
  }
}
