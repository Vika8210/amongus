/**
 * Shared Game Configuration — Skeld Dimensions, Proximity Radii & Suit Colors
 */
export const CONFIG = {
  TILE_SIZE: 40,
  MAP_COLS: 70,
  MAP_ROWS: 42,
  MAP_WIDTH: 2800,
  MAP_HEIGHT: 1680,
  PLAYER_RADIUS: 18,
  PROXIMITY_RADIUS: 115,
  SABOTAGE_FIX_RADIUS: 160,
  BODY_PROXIMITY_RADIUS: 105,
  KILL_RADIUS: 140,
  EMERGENCY_TABLE_POS: { x: 1540, y: 340 },
  EMERGENCY_TABLE_RADIUS: 140,
  JOY_OUTER_R: 60,
  JOY_INNER_R: 25,
  JOY_OFFSET_X: 84,
  JOY_OFFSET_Y: 104,
  MOVE_SPEED: 5.5,
  MOVE_SEND_INTERVAL_MS: 50,
  PING_INTERVAL_MS: 30000,
  ADMIN_KEY: 'hal@#9483',
  SUIT_COLORS: [
    '#c51111', // Red
    '#132ed1', // Blue
    '#117f2d', // Green
    '#ed54ba', // Pink
    '#ef7d0d', // Orange
    '#f5f557', // Yellow
    '#3f474e', // Black
    '#d6e0f0', // White
    '#6b2fbb', // Purple
    '#71491e', // Brown
    '#38fedc', // Cyan
    '#50ef39', // Lime
    '#6b1928', // Maroon
    '#ecc0d3', // Rose
    '#fffebe'  // Banana
  ]
};
