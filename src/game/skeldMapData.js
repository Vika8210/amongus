/**
 * Exact 14-Room Original Among Us "The Skeld" Layout
 * Grid: 70 cols × 42 rows @ 40px/tile = 2800 × 1680 px
 */
import { CONFIG } from './config.js';

export const SKELD_TILE_SIZE = CONFIG.TILE_SIZE;

export const SKELD_ROOMS = [
  { id: 'upper_engine', name: 'Upper Engine',   x: 10, y: 4,  w: 9,  h: 8,  floor: ['#838d9b', '#798391'], accent: '#38bdf8' },
  { id: 'reactor',      name: 'Reactor',        x: 2,  y: 14, w: 8,  h: 12, floor: ['#6e7887', '#656f7e'], accent: '#6366f1' },
  { id: 'security',     name: 'Security',       x: 14, y: 16, w: 6,  h: 8,  floor: ['#7d8794', '#747e8b'], accent: '#f43f5e' },
  { id: 'lower_engine', name: 'Lower Engine',   x: 10, y: 28, w: 9,  h: 8,  floor: ['#838d9b', '#798391'], accent: '#38bdf8' },
  { id: 'medbay',       name: 'MedBay',         x: 21, y: 10, w: 8,  h: 8,  floor: ['#c7ded7', '#bbd4cc'], accent: '#06b6d4' },
  { id: 'electrical',   name: 'Electrical',     x: 21, y: 22, w: 9,  h: 8,  floor: ['#707885', '#676f7c'], accent: '#a855f7' },
  { id: 'cafeteria',    name: 'Cafeteria',      x: 31, y: 2,  w: 15, h: 13, floor: ['#9ea9b8', '#949fae'], accent: '#38bdf8' },
  { id: 'admin',        name: 'Admin',          x: 41, y: 19, w: 9,  h: 7,  floor: ['#8c99ad', '#828fa3'], accent: '#eab308' },
  { id: 'storage',      name: 'Storage',        x: 32, y: 27, w: 12, h: 12, floor: ['#9e9587', '#938a7c'], accent: '#f97316' },
  { id: 'weapons',      name: 'Weapons',        x: 50, y: 4,  w: 9,  h: 8,  floor: ['#808b9a', '#768190'], accent: '#ef4444' },
  { id: 'o2',           name: 'O2',             x: 47, y: 13, w: 6,  h: 5,  floor: ['#95aba0', '#8ba196'], accent: '#22c55e' },
  { id: 'shields',      name: 'Shields',        x: 50, y: 26, w: 9,  h: 9,  floor: ['#748091', '#6b7788'], accent: '#10b981' },
  { id: 'comms',        name: 'Communications', x: 45, y: 35, w: 6,  h: 5,  floor: ['#7b8594', '#727c8b'], accent: '#14b8a6' },
  { id: 'navigation',   name: 'Navigation',     x: 61, y: 14, w: 7,  h: 10, floor: ['#7a879b', '#717e92'], accent: '#3b82f6' }
];

export const SKELD_HALLWAYS = [
  { id: 'hall_ue_caf',   x: 19, y: 6,  w: 12, h: 3 },
  { id: 'door_medbay',   x: 24, y: 8,  w: 3,  h: 2 },
  { id: 'hall_west',     x: 11, y: 12, w: 3,  h: 16 },
  { id: 'door_reactor',  x: 10, y: 19, w: 2,  h: 3 },
  { id: 'door_security', x: 13, y: 19, w: 2,  h: 3 },
  { id: 'hall_le_stor',  x: 19, y: 32, w: 13, h: 3 },
  { id: 'door_elec',     x: 24, y: 30, w: 3,  h: 2 },
  { id: 'hall_center',   x: 36, y: 15, w: 3,  h: 12 },
  { id: 'door_admin',    x: 39, y: 21, w: 2,  h: 3 },
  { id: 'hall_caf_weap', x: 46, y: 6,  w: 4,  h: 3 },
  { id: 'hall_east',     x: 54, y: 12, w: 3,  h: 14 },
  { id: 'door_o2',       x: 53, y: 14, w: 2,  h: 3 },
  { id: 'hall_nav',      x: 57, y: 17, w: 4,  h: 3 },
  { id: 'hall_stor_sh',  x: 44, y: 30, w: 6,  h: 3 },
  { id: 'door_comms',    x: 47, y: 33, w: 2,  h: 2 }
];

export const SKELD_OBSTACLES = [
  { type: 'circle', x: 1540, y: 340, radius: 68, kind: 'emergency_table' },
  { type: 'circle', x: 1365, y: 215, radius: 42, kind: 'caf_table' },
  { type: 'circle', x: 1715, y: 215, radius: 42, kind: 'caf_table' },
  { type: 'circle', x: 1365, y: 475, radius: 42, kind: 'caf_table' },
  { type: 'circle', x: 1715, y: 475, radius: 42, kind: 'caf_table' },
  { type: 'rect', x: 515,  y: 270,  w: 120, h: 100, kind: 'engine' },
  { type: 'rect', x: 515,  y: 1230, w: 120, h: 100, kind: 'engine' },
  { type: 'rect', x: 960,  y: 1035, w: 120, h: 28,  kind: 'elec_wall' },
  { type: 'rect', x: 1052, y: 1035, w: 28,  h: 110, kind: 'elec_wall' },
  { type: 'rect', x: 1740, y: 855,  w: 145, h: 78,  kind: 'admin_table' },
  { type: 'rect', x: 1405, y: 1235, w: 92,  h: 80,  kind: 'crate' },
  { type: 'rect', x: 1560, y: 1365, w: 96,  h: 82,  kind: 'crate' },
  { type: 'rect', x: 2210, y: 255,  w: 80,  h: 75,  kind: 'weapons_chair' }
];

export const SKELD_VENTS = [
  { id: 'vent_caf',   room: 'Cafeteria',  x: 1785, y: 155,  links: ['vent_admin', 'vent_shld'] },
  { id: 'vent_admin', room: 'Admin',      x: 1690, y: 985,  links: ['vent_caf', 'vent_shld'] },
  { id: 'vent_shld',  room: 'Shields',    x: 2060, y: 1335, links: ['vent_caf', 'vent_admin', 'vent_nav2'] },
  { id: 'vent_elec',  room: 'Electrical', x: 890,  y: 970,  links: ['vent_med', 'vent_sec'] },
  { id: 'vent_med',   room: 'MedBay',     x: 890,  y: 660,  links: ['vent_elec', 'vent_sec'] },
  { id: 'vent_sec',   room: 'Security',   x: 610,  y: 905,  links: ['vent_elec', 'vent_med', 'vent_reac1'] },
  { id: 'vent_reac1', room: 'Reactor (N)',x: 335,  y: 620,  links: ['vent_reac2', 'vent_sec'] },
  { id: 'vent_reac2', room: 'Reactor (S)',x: 335,  y: 980,  links: ['vent_reac1', 'vent_sec'] },
  { id: 'vent_weap',  room: 'Weapons',    x: 2055, y: 215,  links: ['vent_nav1'] },
  { id: 'vent_nav1',  room: 'Nav (N)',    x: 2495, y: 625,  links: ['vent_weap', 'vent_nav2'] },
  { id: 'vent_nav2',  room: 'Nav (S)',    x: 2495, y: 895,  links: ['vent_nav1', 'vent_shld'] }
];

export const SKELD_STARS = Array.from({ length: 280 }, (_, idx) => ({
  x: (idx * 397) % CONFIG.MAP_WIDTH,
  y: (idx * 613) % CONFIG.MAP_HEIGHT,
  size: idx % 3 === 0 ? 2.1 : 1.1,
  brightness: 0.35 + ((idx * 29) % 50) / 100,
  twinkleSpeed: 0.0012 + (idx % 7) * 0.0005
}));

export const skeldGrid = Array.from({ length: CONFIG.MAP_ROWS }, () =>
  Array(CONFIG.MAP_COLS).fill(0)
);
export const skeldRoomAtCell = new Map();

function markRect(x, y, w, h, roomObj) {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      if (row >= 0 && row < CONFIG.MAP_ROWS && col >= 0 && col < CONFIG.MAP_COLS) {
        skeldGrid[row][col] = 1;
        if (roomObj) skeldRoomAtCell.set(`${col},${row}`, roomObj);
      }
    }
  }
}

SKELD_HALLWAYS.forEach(hw => markRect(hw.x, hw.y, hw.w, hw.h, null));
SKELD_ROOMS.forEach(room => markRect(room.x, room.y, room.w, room.h, room));
