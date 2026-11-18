/**
 * ============================================================================
 * AMONG US: THE SKELD — Multi-Lobby Multiplayer Game Server
 * SDMCET Tech Event Edition
 *
 * Architecture:
 * - Express: Static files (modular ES6 frontend), Admin Panel, QR generator
 * - WebSocket (ws): Isolated per-lobby real-time game engines
 * - Multi-Lobby Manager: Supports unlimited concurrent lobbies simultaneously,
 *   each with its own players, settings, timers, tasks, sabotages & Skeld map.
 * ============================================================================
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const os = require('os');
const express = require('express');
const WebSocket = require('ws');
const QRCode = require('qrcode');

// ----------------------------------------------------------------------------
// 1. Original The Skeld Spaceship 14 Rooms (Map size: 2800 x 1680 px)
// ----------------------------------------------------------------------------
const BUILDINGS = {
  upper_engine: { x: 400,  y: 160,  w: 360, h: 320, name: 'Upper Engine',   spawnX: 455,  spawnY: 230 },
  reactor:      { x: 80,   y: 560,  w: 320, h: 480, name: 'Reactor',        spawnX: 280,  spawnY: 680 },
  security:     { x: 560,  y: 640,  w: 240, h: 320, name: 'Security',       spawnX: 680,  spawnY: 760 },
  lower_engine: { x: 400,  y: 1120, w: 360, h: 320, name: 'Lower Engine',   spawnX: 455,  spawnY: 1380 },
  medbay:       { x: 840,  y: 400,  w: 320, h: 320, name: 'MedBay',         spawnX: 960,  spawnY: 620 },
  electrical:   { x: 840,  y: 880,  w: 360, h: 320, name: 'Electrical',     spawnX: 930,  spawnY: 990 },
  cafeteria:    { x: 1240, y: 80,   w: 600, h: 520, name: 'Cafeteria',      spawnX: 1540, spawnY: 452 },
  admin:        { x: 1640, y: 760,  w: 360, h: 280, name: 'Admin',          spawnX: 1920, spawnY: 935 },
  storage:      { x: 1280, y: 1080, w: 480, h: 480, name: 'Storage',        spawnX: 1345, spawnY: 1465 },
  weapons:      { x: 2000, y: 160,  w: 360, h: 320, name: 'Weapons',        spawnX: 2160, spawnY: 295 },
  o2:           { x: 1880, y: 520,  w: 240, h: 200, name: 'O2',             spawnX: 1980, spawnY: 610 },
  shields:      { x: 2000, y: 1040, w: 360, h: 360, name: 'Shields',        spawnX: 2150, spawnY: 1220 },
  comms:        { x: 1800, y: 1400, w: 240, h: 200, name: 'Communications', spawnX: 1900, spawnY: 1490 },
  navigation:   { x: 2440, y: 560,  w: 280, h: 400, name: 'Navigation',     spawnX: 2585, spawnY: 760 }
};

const COLORS = [
  '#c51111', '#132ed1', '#117f2d', '#ed54ba',
  '#ef7d0d', '#f5f557', '#3f474e', '#d6e0f0',
  '#6b2fbb', '#38fedc', '#50ef39', '#71491e'
];

const DEFAULT_SETTINGS = {
  maxImpostors: 1,
  impostorsCount: 1,
  killCooldown: 30,
  respawnTime: 45,
  roleRotationInterval: 180,
  roleRotation: 180,
  votingTime: 60,
  votingDuration: 60,
  tasksPerPlayer: 3,
  crewVision: 150,
  crewVisionRadius: 150,
  impVision: 250,
  impostorVision: 250,
  impostorVisionRadius: 250,
  moveSpeed: 3,
  playerSpeed: 3
};

const SETTING_KEY_MAP = {
  maxImpostors: 'maxImpostors',
  impostorsCount: 'maxImpostors',
  killCooldown: 'killCooldown',
  respawnTime: 'respawnTime',
  roleRotation: 'roleRotationInterval',
  roleRotationInterval: 'roleRotationInterval',
  votingTime: 'votingDuration',
  votingDuration: 'votingDuration',
  tasksPerPlayer: 'tasksPerPlayer',
  crewVision: 'crewVisionRadius',
  crewVisionRadius: 'crewVisionRadius',
  impVision: 'impostorVisionRadius',
  impostorVision: 'impostorVisionRadius',
  impostorVisionRadius: 'impostorVisionRadius',
  moveSpeed: 'playerSpeed',
  playerSpeed: 'playerSpeed'
};

// ----------------------------------------------------------------------------
// 2. Multi-Lobby Store & Admin Connections
// ----------------------------------------------------------------------------
const lobbies = new Map();        // code -> LobbyObject
const adminSockets = new Map();   // socketId -> { ws, selectedLobbyCode }
const socketToLobby = new Map();  // playerSocketId -> lobbyCode

function generateLobbyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (lobbies.has(code));
  return code;
}

function createLobby(customCode = '') {
  const clean = String(customCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const code = (clean.length >= 4 && !lobbies.has(clean)) ? clean : generateLobbyCode();

  const lobby = {
    code,
    createdAt: Date.now(),
    phase: 'LOBBY',              // 'LOBBY' | 'PLAYING' | 'VOTING' | 'ENDED'
    players: {},                 // { socketId: PlayerObject }
    settings: { ...DEFAULT_SETTINGS },
    votes: {},
    votingTimer: null,
    votingTimeLeft: 0,
    roleRotationTimer: null,
    roleRotationTimeLeft: 0,
    taskRefreshTimer: null,
    taskRefreshTimeLeft: 120,    // 2 minutes between 3-task waves
    deadBodies: [],
    meeting: null,
    sabotages: {},
    activeSabotage: null,
    sabotageTimeout: null,
    gameLog: [],
    startTime: null
  };

  lobbies.set(code, lobby);
  lobbyLog(lobby, `🏠 Lobby ${code} created.`);
  return lobby;
}

function destroyLobby(code) {
  const lobby = lobbies.get(code);
  if (!lobby) return;

  clearLobbyTimers(lobby);

  // Notify & release all players in this lobby
  Object.values(lobby.players).forEach(p => {
    socketToLobby.delete(p.id);
    if (p.socket && p.socket.readyState === WebSocket.OPEN) {
      p.socket.send(JSON.stringify({
        type: 'LOBBY_CLOSED',
        msg: `Lobby ${code} was closed by the Game Master.`
      }));
    }
  });

  lobbies.delete(code);
  console.log(`[${new Date().toLocaleTimeString()}] 🔒 Lobby ${code} deleted.`);

  // Reassign any admin currently viewing this deleted lobby
  const fallbackCode = lobbies.size > 0 ? lobbies.keys().next().value : null;
  for (const admin of adminSockets.values()) {
    if (admin.selectedLobbyCode === code) {
      admin.selectedLobbyCode = fallbackCode;
    }
  }

  broadcastAllAdmins();
}

function clearLobbyTimers(lobby) {
  if (lobby.votingTimer) { clearInterval(lobby.votingTimer); lobby.votingTimer = null; }
  if (lobby.roleRotationTimer) { clearInterval(lobby.roleRotationTimer); lobby.roleRotationTimer = null; }
  if (lobby.taskRefreshTimer) { clearInterval(lobby.taskRefreshTimer); lobby.taskRefreshTimer = null; }
  if (lobby.sabotageTimeout) { clearTimeout(lobby.sabotageTimeout); lobby.sabotageTimeout = null; }
}

function lobbyLog(lobby, msg) {
  const entry = `[${new Date().toLocaleTimeString()}] [${lobby.code}] ${msg}`;
  console.log(entry);
  lobby.gameLog.push(entry);
  if (lobby.gameLog.length > 100) lobby.gameLog.shift();
}

function pickRandomTasks(count) {
  const roomIds = Object.keys(BUILDINGS);
  const shuffled = [...roomIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getTaskPublicInfo(taskId) {
  const room = BUILDINGS[taskId];
  return {
    id: taskId,
    room: taskId,
    roomName: room ? room.name : taskId,
    points: 10
  };
}

// ----------------------------------------------------------------------------
// 3. Express & WebSocket Server Setup
// ----------------------------------------------------------------------------
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = 'sdmcet2024';

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');
const staticDir = fs.existsSync(path.join(distDir, 'index.html')) ? distDir : publicDir;

app.use(express.static(staticDir, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.get('/admin', (req, res) => {
  const reactEntry = path.join(distDir, 'index.html');
  if (fs.existsSync(reactEntry)) {
    return res.sendFile(reactEntry);
  }
  res.sendFile(path.join(publicDir, 'admin.html'));
});

// QR Code PNG — supports per-lobby ?code=XXXXXX (local or cloud-hosted domain)
app.get('/qr', async (req, res) => {
  try {
    const localIP = getLocalIP();
    const publicUrl = process.env.RENDER_EXTERNAL_URL;
    let base = publicUrl;
    if (!base) {
      const host = req.get('host') || `${localIP}:${PORT}`;
      const proto = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      base = `${proto}://${host}`;
    }
    const code = String(req.query.code || '').trim().toUpperCase();
    const activeCode = (code && lobbies.has(code))
      ? code
      : (lobbies.size > 0 ? lobbies.keys().next().value : '');
    const joinUrl = activeCode
      ? `${base}/?code=${activeCode}`
      : `${base}`;
    const qrBuffer = await QRCode.toBuffer(joinUrl, {
      type: 'png',
      width: 320,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });
    res.type('png').send(qrBuffer);
  } catch (err) {
    res.status(500).send('Error generating QR code');
  }
});

app.get('/api/lobbies', (req, res) => {
  res.json({ lobbies: getLobbiesSummary() });
});

app.get('/state', (req, res) => {
  const code = String(req.query.code || '').trim().toUpperCase();
  const lobby = lobbies.get(code) || (lobbies.size > 0 ? lobbies.values().next().value : null);
  res.json(lobby ? serializeState(lobby, null, true) : { phase: 'LOBBY', lobbies: [], players: {} });
});

// ----------------------------------------------------------------------------
// 4. Serialization & Scoped Broadcast Helpers
// ----------------------------------------------------------------------------
function getLobbiesSummary() {
  return Array.from(lobbies.values()).map(l => {
    const players = Object.values(l.players);
    return {
      code: l.code,
      phase: l.phase,
      playerCount: players.length,
      impostorCount: players.filter(p => p.role === 'impostor').length,
      hasSabotage: !!l.activeSabotage,
      createdAt: l.createdAt
    };
  });
}

function serializePlayer(lobby, p, recipientId = null, isAdmin = false) {
  const canSeeRole = lobby.phase === 'ENDED' || isAdmin || p.id === recipientId;
  return {
    id: p.id,
    name: p.name,
    collegeId: p.collegeId,
    color: p.color,
    x: p.x,
    y: p.y,
    role: canSeeRole ? p.role : 'unknown',
    isDead: p.isDead,
    inVent: !!p.inVent,
    isRespawning: p.isRespawning,
    respawnTimeLeft: p.respawnTimeLeft,
    respawnTimer: p.respawnTimeLeft,
    score: p.score,
    tasksAssigned: p.tasksAssigned,
    tasksCompleted: p.tasksCompleted,
    tasksTotal: p.tasksAssigned.length,
    killCooldownLeft: (isAdmin || p.id === recipientId) ? p.killCooldownLeft : 0,
    isAdmin: false
  };
}

function serializeState(lobby, recipientId = null, isAdmin = false) {
  const playersMap = {};
  for (const [id, p] of Object.entries(lobby.players)) {
    playersMap[id] = serializePlayer(lobby, p, recipientId, isAdmin);
  }
  const crew = Object.values(lobby.players).filter(p => p.role === 'crewmate');
  return {
    lobbyCode: lobby.code,
    phase: lobby.phase,
    players: playersMap,
    impostors: Object.values(lobby.players)
      .filter(p => p.role === 'impostor')
      .map(p => ({ id: p.id, name: p.name, color: p.color })),
    settings: lobby.settings,
    votes: lobby.votes,
    votingTimeLeft: lobby.votingTimeLeft,
    roleRotationTimeLeft: lobby.roleRotationTimeLeft,
    taskRefreshTimeLeft: lobby.taskRefreshTimeLeft,
    deadBodies: lobby.deadBodies,
    meeting: lobby.meeting,
    sabotages: lobby.sabotages,
    activeSabotage: lobby.activeSabotage || null,
    gameLog: lobby.gameLog.slice(-50),
    startTime: lobby.startTime,
    timer: lobby.startTime && lobby.phase === 'PLAYING'
      ? Math.max(0, Math.floor((Date.now() - lobby.startTime) / 1000))
      : 0,
    totalTasksAssigned: crew.reduce((a, p) => a + p.tasksAssigned.length, 0),
    totalTasksCompleted: crew.reduce((a, p) => a + p.tasksCompleted.length, 0)
  };
}

function sendToPlayer(lobby, playerId, data) {
  const p = lobby.players[playerId];
  if (p && p.socket && p.socket.readyState === WebSocket.OPEN) {
    p.socket.send(JSON.stringify(data));
  }
}

function broadcastToLobby(lobby, data, excludeId = null) {
  const raw = JSON.stringify(data);
  Object.values(lobby.players).forEach(p => {
    if (p.id !== excludeId && p.socket && p.socket.readyState === WebSocket.OPEN) {
      p.socket.send(raw);
    }
  });
}

function broadcastNotification(lobby, msg, color = '#38bdf8') {
  broadcastToLobby(lobby, { type: 'NOTIFICATION', msg, color });
}

function broadcastGameState(lobby) {
  Object.values(lobby.players).forEach(p => {
    if (p.socket && p.socket.readyState === WebSocket.OPEN) {
      p.socket.send(JSON.stringify({
        type: 'GAME_STATE',
        state: serializeState(lobby, p.id, false)
      }));
    }
  });
}

function sendAdminSnapshot(adminEntry) {
  if (!adminEntry.ws || adminEntry.ws.readyState !== WebSocket.OPEN) return;

  // Ensure selectedLobbyCode points to an existing lobby if available
  if (adminEntry.selectedLobbyCode && !lobbies.has(adminEntry.selectedLobbyCode)) {
    adminEntry.selectedLobbyCode = lobbies.size > 0 ? lobbies.keys().next().value : null;
  }
  if (!adminEntry.selectedLobbyCode && lobbies.size > 0) {
    adminEntry.selectedLobbyCode = lobbies.keys().next().value;
  }

  const selectedLobby = adminEntry.selectedLobbyCode ? lobbies.get(adminEntry.selectedLobbyCode) : null;
  const adminPlayers = {};
  if (selectedLobby) {
    for (const [id, p] of Object.entries(selectedLobby.players)) {
      adminPlayers[id] = serializePlayer(selectedLobby, p, null, true);
    }
  }

  adminEntry.ws.send(JSON.stringify({
    type: 'ADMIN_STATE',
    lobbies: getLobbiesSummary(),
    selectedLobbyCode: adminEntry.selectedLobbyCode,
    settings: selectedLobby ? selectedLobby.settings : { ...DEFAULT_SETTINGS },
    players: adminPlayers,
    gameState: selectedLobby ? serializeState(selectedLobby, null, true) : null
  }));
}

function broadcastAllAdmins(onlyLobbyCode = null) {
  for (const admin of adminSockets.values()) {
    // Always push summary updates; full snapshot for matching lobby
    sendAdminSnapshot(admin);
  }
}

// ----------------------------------------------------------------------------
// 5. Per-Lobby Background Tick Loops
// ----------------------------------------------------------------------------

// ~15 Hz (66ms) Position & Timer Update Loop across all active playing lobbies
setInterval(() => {
  for (const lobby of lobbies.values()) {
    if (lobby.phase !== 'PLAYING') continue;

    const positions = {};
    for (const [id, p] of Object.entries(lobby.players)) {
      positions[id] = {
        id: p.id,
        x: p.x,
        y: p.y,
        isDead: p.isDead,
        inVent: !!p.inVent,
        isRespawning: p.isRespawning
      };
    }

    const msg = JSON.stringify({
      type: 'PLAYER_UPDATE',
      lobbyCode: lobby.code,
      taskRefreshTimeLeft: lobby.taskRefreshTimeLeft,
      players: positions
    });

    Object.values(lobby.players).forEach(p => {
      if (p.socket && p.socket.readyState === WebSocket.OPEN && p.socket.bufferedAmount < 65536) {
        p.socket.send(msg);
      }
    });

    // Also stream live positions to any Admin currently viewing THIS lobby
    for (const admin of adminSockets.values()) {
      if (admin.selectedLobbyCode === lobby.code && admin.ws.readyState === WebSocket.OPEN && admin.ws.bufferedAmount < 65536) {
        admin.ws.send(msg);
      }
    }
  }
}, 66);

// 1-Second Tick Loop: Kill cooldowns & Respawn countdowns per lobby
setInterval(() => {
  for (const lobby of lobbies.values()) {
    if (lobby.phase !== 'PLAYING') continue;
    let stateNeedsSync = false;

    for (const p of Object.values(lobby.players)) {
      if (p.role === 'impostor' && p.killCooldownLeft > 0) {
        p.killCooldownLeft = Math.max(0, p.killCooldownLeft - 1);
      }

      if (p.isRespawning && p.respawnTimeLeft > 0) {
        p.respawnTimeLeft = Math.max(0, p.respawnTimeLeft - 1);
        if (p.respawnTimeLeft === 0) {
          p.isDead = false;
          p.isRespawning = false;
          p.x = BUILDINGS.cafeteria.spawnX;
          p.y = BUILDINGS.cafeteria.spawnY;
          lobby.deadBodies = lobby.deadBodies.filter(b => b.victimId !== p.id);
          broadcastToLobby(lobby, { type: 'PLAYER_RESPAWN', playerId: p.id, x: p.x, y: p.y });
          broadcastNotification(lobby, `${p.name} respawned in Cafeteria!`, '#22c55e');
          lobbyLog(lobby, `${p.name} respawned in Cafeteria.`);
          stateNeedsSync = true;
        }
      }
    }

    if (stateNeedsSync) {
      broadcastGameState(lobby);
      broadcastAllAdmins(lobby.code);
    }
  }
}, 1000);

// ----------------------------------------------------------------------------
// 6. Per-Lobby Game Engine Operations
// ----------------------------------------------------------------------------

function startTaskRefreshTimer(lobby) {
  if (lobby.taskRefreshTimer) clearInterval(lobby.taskRefreshTimer);
  lobby.taskRefreshTimeLeft = 120; // 2 minutes

  lobby.taskRefreshTimer = setInterval(() => {
    if (lobby.phase !== 'PLAYING') return;
    lobby.taskRefreshTimeLeft--;
    if (lobby.taskRefreshTimeLeft <= 0) {
      lobby.taskRefreshTimeLeft = 120;
      assignFreshTasksToCrew(lobby);
    }
  }, 1000);
}

function assignFreshTasksToCrew(lobby) {
  const count = lobby.settings.tasksPerPlayer || 3;
  Object.values(lobby.players).forEach(p => {
    if (p.role === 'crewmate') {
      p.tasksAssigned = pickRandomTasks(count);
      p.tasksCompleted = [];
      sendToPlayer(lobby, p.id, {
        type: 'NEW_TASKS',
        tasks: p.tasksAssigned.map(tId => getTaskPublicInfo(tId))
      });
    } else {
      p.tasksAssigned = [];
      p.tasksCompleted = [];
    }
  });
  lobbyLog(lobby, `📋 2-Minute Task Wave: Assigned ${count} new random tasks to all Crewmates.`);
  broadcastNotification(lobby, `📋 New Task Wave! All Crewmates received ${count} fresh random tasks!`, '#38bdf8');
  broadcastGameState(lobby);
  broadcastAllAdmins(lobby.code);
}

function startRoleRotationTimer(lobby) {
  if (lobby.roleRotationTimer) clearInterval(lobby.roleRotationTimer);
  lobby.roleRotationTimeLeft = lobby.settings.roleRotationInterval || 180;

  lobby.roleRotationTimer = setInterval(() => {
    if (lobby.phase !== 'PLAYING') return;
    lobby.roleRotationTimeLeft--;
    if (lobby.roleRotationTimeLeft <= 0) {
      lobby.roleRotationTimeLeft = lobby.settings.roleRotationInterval || 180;
      rotateRoles(lobby);
    }
  }, 1000);
}

function rotateRoles(lobby) {
  const targetCount = lobby.settings.maxImpostors || lobby.settings.impostorsCount || 1;
  const allPlayers = Object.values(lobby.players);
  if (allPlayers.length <= 1) {
    lobbyLog(lobby, 'Role rotation skipped: not enough players.');
    return;
  }

  const currentImpostors = allPlayers.filter(p => p.role === 'impostor');

  // Reset current impostors to crewmates with 3 random tasks
  currentImpostors.forEach(imp => {
    imp.role = 'crewmate';
    imp.inVent = false;
    imp.tasksAssigned = pickRandomTasks(lobby.settings.tasksPerPlayer || 3);
    imp.tasksCompleted = [];
    sendToPlayer(lobby, imp.id, {
      type: 'ROLE_ASSIGN',
      role: 'crewmate',
      tasks: imp.tasksAssigned.map(tId => getTaskPublicInfo(tId))
    });
  });

  let eligible = allPlayers.filter(p => p.role === 'crewmate' && !p.isDead && !p.isRespawning);
  if (eligible.length === 0) eligible = allPlayers;

  const numToAssign = Math.min(targetCount, Math.max(1, allPlayers.length - 1));
  const newImpostors = [...eligible].sort(() => 0.5 - Math.random()).slice(0, numToAssign);

  newImpostors.forEach(newImp => {
    newImp.role = 'impostor';
    newImp.inVent = false;
    newImp.tasksAssigned = [];
    newImp.tasksCompleted = [];
    newImp.killCooldownLeft = lobby.settings.killCooldown || 30;
    newImp.lastKillTime = Date.now();
    sendToPlayer(lobby, newImp.id, {
      type: 'ROLE_ASSIGN',
      role: 'impostor',
      tasks: []
    });
  });

  // Clear ALL dead bodies on role switch!
  lobby.deadBodies = [];
  broadcastToLobby(lobby, { type: 'CLEAR_BODIES' });
  broadcastToLobby(lobby, { type: 'ROLE_ROTATION' });

  lobbyLog(lobby, `🔄 Role rotation executed (bodies cleared). New Impostors: [${newImpostors.map(p => p.name).join(', ')}]`);
  broadcastNotification(lobby, '⚡ Roles have rotated! All bodies cleared.', '#f97316');
  broadcastGameState(lobby);
  broadcastAllAdmins(lobby.code);
}

function checkWinCondition(lobby) {
  if (lobby.phase !== 'PLAYING' && lobby.phase !== 'VOTING') return;
  const players = Object.values(lobby.players);
  if (players.length === 0) return;

  const crew = players.filter(p => p.role === 'crewmate');
  const aliveCrew = crew.filter(p => !p.isDead && !p.isRespawning);
  const aliveImpostors = players.filter(p => p.role === 'impostor' && !p.isDead && !p.isRespawning);

  if (crew.length > 0 && aliveCrew.length === 0 && !crew.some(p => p.isRespawning)) {
    endGame(lobby, 'impostor', 'All crewmates have been eliminated!');
    return;
  }

  const deadCrew = crew.filter(p => p.isDead || p.isRespawning);
  if (players.length >= 4 && deadCrew.length > 0 && aliveImpostors.length >= aliveCrew.length && !crew.some(p => p.isRespawning)) {
    endGame(lobby, 'impostor', 'Impostors have taken over The Skeld!');
  }
}

function endGame(lobby, winner, reason = '') {
  lobby.phase = 'ENDED';
  clearLobbyTimers(lobby);

  const leaderboard = Object.values(lobby.players)
    .map(p => ({
      id: p.id,
      name: p.name,
      collegeId: p.collegeId,
      role: p.role,
      color: p.color,
      score: p.score,
      tasksCompleted: p.tasksCompleted.length
    }))
    .sort((a, b) => b.score - a.score);

  lobbyLog(lobby, `🏆 GAME ENDED — Winner: ${winner.toUpperCase()} (${reason})`);
  broadcastToLobby(lobby, { type: 'GAME_END', winner, reason, leaderboard });
  broadcastGameState(lobby);
  broadcastAllAdmins(lobby.code);
}

function startGame(lobby) {
  const activePlayers = Object.values(lobby.players);
  if (activePlayers.length === 0) {
    lobbyLog(lobby, 'Cannot start game: No players in lobby.');
    return;
  }

  activePlayers.forEach(p => {
    p.isDead = false;
    p.inVent = false;
    p.isRespawning = false;
    p.respawnTimeLeft = 0;
    p.score = 0;
    p.role = 'crewmate';
    p.tasksCompleted = [];
    p.killCooldownLeft = lobby.settings.killCooldown || 30;
    p.lastKillTime = Date.now();
  });

  const wanted = Math.floor(Number(lobby.settings.maxImpostors || lobby.settings.impostorsCount)) || 1;
  const numImpostors = Math.max(1, Math.min(wanted, Math.max(1, activePlayers.length - 1)));
  const shuffled = [...activePlayers].sort(() => 0.5 - Math.random());
  for (let i = 0; i < numImpostors; i++) {
    shuffled[i].role = 'impostor';
  }

  activePlayers.forEach((p, index) => {
    p.tasksAssigned = p.role === 'crewmate' ? pickRandomTasks(lobby.settings.tasksPerPlayer || 3) : [];
    const angle = (index / Math.max(1, activePlayers.length)) * Math.PI * 2;
    p.x = Math.round(1540 + Math.cos(angle) * 112);
    p.y = Math.round(340 + Math.sin(angle) * 112);
  });

  clearLobbyTimers(lobby);
  lobby.phase = 'PLAYING';
  lobby.startTime = Date.now();
  lobby.sabotages = {};
  lobby.activeSabotage = null;
  lobby.deadBodies = [];
  lobby.votes = {};
  lobby.meeting = null;

  activePlayers.forEach(p => {
    sendToPlayer(lobby, p.id, {
      type: 'ROLE_ASSIGN',
      role: p.role,
      tasks: p.role === 'crewmate' ? p.tasksAssigned.map(tId => getTaskPublicInfo(tId)) : []
    });
  });

  startRoleRotationTimer(lobby);
  startTaskRefreshTimer(lobby);

  const impNames = activePlayers.filter(p => p.role === 'impostor').map(p => p.name).join(', ');
  const crewNames = activePlayers.filter(p => p.role === 'crewmate').map(p => p.name).join(', ');
  lobbyLog(lobby, `▶ Game started (${activePlayers.length} players). Impostors(${numImpostors}): [${impNames}] | Crew: [${crewNames}]`);
  broadcastNotification(lobby, 'Game Started! Complete 3 tasks within 20s each. New tasks every 2 min!', '#22c55e');

  broadcastGameState(lobby);
  broadcastAllAdmins(lobby.code);
}

function resetGame(lobby) {
  clearLobbyTimers(lobby);
  lobby.phase = 'LOBBY';
  lobby.votes = {};
  lobby.votingTimeLeft = 0;
  lobby.roleRotationTimeLeft = 0;
  lobby.taskRefreshTimeLeft = 120;
  lobby.meeting = null;
  lobby.sabotages = {};
  lobby.activeSabotage = null;
  lobby.deadBodies = [];
  lobby.startTime = null;

  for (const [id, p] of Object.entries(lobby.players)) {
    if (!p.socket || p.socket.readyState !== WebSocket.OPEN) {
      delete lobby.players[id];
      socketToLobby.delete(id);
      continue;
    }
    p.role = 'crewmate';
    p.isDead = false;
    p.inVent = false;
    p.isRespawning = false;
    p.respawnTimeLeft = 0;
    p.score = 0;
    p.tasksAssigned = [];
    p.tasksCompleted = [];
    p.killCooldownLeft = 0;
    p.x = BUILDINGS.cafeteria.spawnX;
    p.y = BUILDINGS.cafeteria.spawnY;
  }

  lobbyLog(lobby, '⟳ Game reset to LOBBY by Admin.');
  broadcastNotification(lobby, 'The game has been reset to Lobby.', '#3b82f6');
  broadcastGameState(lobby);
  broadcastAllAdmins(lobby.code);
}

function startVoting(lobby, callerName, reason) {
  if (lobby.phase !== 'PLAYING') return;
  lobby.phase = 'VOTING';
  lobby.votes = {};
  lobby.votingTimeLeft = lobby.settings.votingDuration || lobby.settings.votingTime || 60;
  lobby.meeting = { callerName, reason };

  Object.values(lobby.players).forEach(p => { p.inVent = false; });

  lobbyLog(lobby, `🚨 Meeting called by ${callerName} (${reason}).`);

  const votePlayers = {};
  for (const [id, p] of Object.entries(lobby.players)) {
    votePlayers[id] = { id: p.id, name: p.name, color: p.color, isDead: p.isDead, isRespawning: p.isRespawning };
  }

  broadcastToLobby(lobby, {
    type: 'VOTE_START',
    callerName,
    reason,
    timeLeft: lobby.votingTimeLeft,
    players: votePlayers
  });

  if (lobby.votingTimer) clearInterval(lobby.votingTimer);
  lobby.votingTimer = setInterval(() => {
    lobby.votingTimeLeft--;
    broadcastToLobby(lobby, {
      type: 'VOTE_UPDATE',
      votes: lobby.votes,
      timeLeft: lobby.votingTimeLeft
    });
    if (lobby.votingTimeLeft <= 0) {
      resolveVoting(lobby);
    }
  }, 1000);

  broadcastGameState(lobby);
  broadcastAllAdmins(lobby.code);
}

function resolveVoting(lobby) {
  if (lobby.votingTimer) { clearInterval(lobby.votingTimer); lobby.votingTimer = null; }
  if (lobby.phase !== 'VOTING') return;

  const tally = {};
  for (const targetId of Object.values(lobby.votes)) {
    tally[targetId] = (tally[targetId] || 0) + 1;
  }

  let maxVotes = 0;
  let ejectedId = null;
  let isTie = false;

  for (const [targetId, count] of Object.entries(tally)) {
    if (count > maxVotes) {
      maxVotes = count;
      ejectedId = targetId;
      isTie = false;
    } else if (count === maxVotes && count > 0) {
      isTie = true;
    }
  }

  let ejectedName = null;
  let wasImpostor = false;

  if (!isTie && ejectedId && ejectedId !== 'skip' && maxVotes > 0) {
    const target = lobby.players[ejectedId];
    if (target) {
      ejectedName = target.name;
      if (target.role === 'impostor') {
        wasImpostor = true;
        for (const [voterId, votedFor] of Object.entries(lobby.votes)) {
          if (votedFor === target.id && lobby.players[voterId]) {
            lobby.players[voterId].score += 20;
          }
        }
        target.role = 'crewmate';
        target.tasksAssigned = pickRandomTasks(lobby.settings.tasksPerPlayer || 3);
        target.tasksCompleted = [];
        sendToPlayer(lobby, target.id, {
          type: 'ROLE_ASSIGN',
          role: 'crewmate',
          tasks: target.tasksAssigned.map(tId => getTaskPublicInfo(tId))
        });

        const aliveCrew = Object.values(lobby.players).filter(p => p.role === 'crewmate' && !p.isDead && p.id !== target.id);
        if (aliveCrew.length > 0) {
          const newImp = aliveCrew[Math.floor(Math.random() * aliveCrew.length)];
          newImp.role = 'impostor';
          newImp.tasksAssigned = [];
          newImp.tasksCompleted = [];
          newImp.killCooldownLeft = lobby.settings.killCooldown || 30;
          sendToPlayer(lobby, newImp.id, { type: 'ROLE_ASSIGN', role: 'impostor', tasks: [] });
        }
        lobbyLog(lobby, `✅ Impostor ${target.name} ejected!`);
        broadcastNotification(lobby, `🎉 ${target.name} was an IMPOSTOR! (+20 pts to voters)`, '#22c55e');
      } else {
        target.isDead = true;
        target.isRespawning = true;
        target.respawnTimeLeft = lobby.settings.respawnTime || 45;
        lobbyLog(lobby, `❌ Innocent ${target.name} was ejected.`);
        broadcastNotification(lobby, `❌ ${target.name} was NOT the Impostor.`, '#ef4444');
      }
    }
  } else {
    lobbyLog(lobby, 'Voting skipped or tied — no one ejected.');
  }

  lobby.phase = 'PLAYING';
  lobby.meeting = null;
  lobby.votes = {};
  lobby.deadBodies = [];
  broadcastToLobby(lobby, { type: 'CLEAR_BODIES' });
  broadcastToLobby(lobby, { type: 'VOTE_RESULT', ejectedId: ejectedName ? ejectedId : null, ejectedName, wasImpostor, tally });

  checkWinCondition(lobby);
  broadcastGameState(lobby);
  broadcastAllAdmins(lobby.code);
}

// ----------------------------------------------------------------------------
// 7. WebSocket Connection & Message Handler
// ----------------------------------------------------------------------------
wss.on('connection', (ws) => {
  const socketId = 'p_' + Math.random().toString(36).substring(2, 9);

  ws.on('message', (rawMessage) => {
    let msg;
    try { msg = JSON.parse(rawMessage); } catch (e) { return; }
    handleMessage(ws, socketId, msg);
  });

  ws.on('close', () => {
    if (adminSockets.has(socketId)) {
      adminSockets.delete(socketId);
      return;
    }

    const code = socketToLobby.get(socketId);
    socketToLobby.delete(socketId);
    if (!code) return;

    const lobby = lobbies.get(code);
    if (!lobby || !lobby.players[socketId]) return;

    const disconnected = lobby.players[socketId];
    delete lobby.players[socketId];
    delete lobby.votes[socketId];
    lobbyLog(lobby, `${disconnected.name} disconnected.`);

    if (lobby.phase === 'PLAYING') checkWinCondition(lobby);
    broadcastGameState(lobby);
    broadcastAllAdmins(code);
  });
});

function handleMessage(ws, socketId, msg) {
  const { type } = msg;

  if (type === 'PING') {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'PING_ACK' }));
    return;
  }

  // ── 1. JOIN (Admin OR Player with Lobby Code) ──────────────────────────
  if (type === 'JOIN') {
    const { name, collegeId, usn, adminKey, lobbyCode } = msg;
    const isAdmin = adminKey === ADMIN_KEY;

    // A. Admin Connection
    if (isAdmin) {
      const firstCode = lobbies.size > 0 ? lobbies.keys().next().value : null;
      const adminEntry = { ws, selectedLobbyCode: firstCode };
      adminSockets.set(socketId, adminEntry);

      console.log(`[${new Date().toLocaleTimeString()}] Admin connected (${socketId}). Active lobbies: ${lobbies.size}`);
      ws.send(JSON.stringify({ type: 'WELCOME', playerId: socketId, isAdmin: true }));
      sendAdminSnapshot(adminEntry);
      return;
    }

    // B. Player Connection — Must match an active Lobby Code!
    const enteredCode = String(lobbyCode || '').trim().toUpperCase();
    if (lobbies.size === 0) {
      ws.send(JSON.stringify({
        type: 'JOIN_ERROR',
        msg: 'No active lobbies yet! Ask the Admin to create a lobby first.'
      }));
      return;
    }

    const lobby = lobbies.get(enteredCode);
    if (!lobby) {
      ws.send(JSON.stringify({
        type: 'JOIN_ERROR',
        msg: `Lobby "${enteredCode || 'EMPTY'}" not found! Check the 6-character code from Admin.`
      }));
      return;
    }

    const resolvedName = (name && name.trim()) ? name.trim() : `Crew_${socketId.slice(-4)}`;
    const resolvedCollegeId = (collegeId && collegeId.trim()) || (usn && usn.trim()) || 'CREW';

    // If reconnecting with the same name inside the SAME lobby, preserve progress during active games!
    let prevSession = null;
    for (const [oldId, oldP] of Object.entries(lobby.players)) {
      if (oldId !== socketId && oldP.name.toLowerCase() === resolvedName.toLowerCase()) {
        if (lobby.phase === 'PLAYING' || lobby.phase === 'VOTING') {
          prevSession = { ...oldP };
        }
        try { if (oldP.socket && oldP.socket.readyState === WebSocket.OPEN) oldP.socket.close(); } catch (e) {}
        delete lobby.players[oldId];
        delete lobby.votes[oldId];
        socketToLobby.delete(oldId);
      }
    }

    const usedColors = Object.values(lobby.players).map(p => p.color);
    let assignedColor = (prevSession && prevSession.color)
      ? prevSession.color
      : (msg.color && !usedColors.includes(msg.color)
        ? msg.color
        : (COLORS.find(c => !usedColors.includes(c)) || COLORS[Math.floor(Math.random() * COLORS.length)]));

    const player = {
      id: socketId,
      name: resolvedName,
      collegeId: resolvedCollegeId,
      color: assignedColor,
      x: prevSession ? prevSession.x : (BUILDINGS.cafeteria.spawnX + Math.round((Math.random() - 0.5) * 120)),
      y: prevSession ? prevSession.y : (BUILDINGS.cafeteria.spawnY + Math.round((Math.random() - 0.5) * 40)),
      role: prevSession ? prevSession.role : 'crewmate',
      isDead: prevSession ? prevSession.isDead : false,
      inVent: false,
      isRespawning: prevSession ? prevSession.isRespawning : false,
      respawnTimeLeft: prevSession ? prevSession.respawnTimeLeft : 0,
      score: prevSession ? prevSession.score : 0,
      tasksAssigned: prevSession
        ? prevSession.tasksAssigned
        : (lobby.phase === 'PLAYING' ? pickRandomTasks(lobby.settings.tasksPerPlayer || 3) : []),
      tasksCompleted: prevSession ? prevSession.tasksCompleted : [],
      killCooldownLeft: prevSession ? prevSession.killCooldownLeft : 0,
      lastKillTime: prevSession ? prevSession.lastKillTime : 0,
      isAdmin: false,
      socket: ws
    };

    lobby.players[socketId] = player;
    socketToLobby.set(socketId, lobby.code);
    lobbyLog(lobby, `${player.name} (${player.collegeId}) joined.`);

    ws.send(JSON.stringify({
      type: 'WELCOME',
      playerId: socketId,
      color: player.color,
      isAdmin: false,
      lobbyCode: lobby.code
    }));

    if (lobby.phase === 'PLAYING') {
      sendToPlayer(lobby, socketId, {
        type: 'ROLE_ASSIGN',
        role: player.role,
        tasks: player.tasksAssigned.map(tId => getTaskPublicInfo(tId))
      });
    }

    broadcastGameState(lobby);
    broadcastAllAdmins(lobby.code);
    return;
  }

  // ── 2. ADMIN COMMANDS (Multi-Lobby Orchestration) ──────────────────────
  if (type === 'ADMIN_CMD') {
    const adminEntry = adminSockets.get(socketId);
    if (!adminEntry && msg.adminKey !== ADMIN_KEY) return;

    const { cmd, value, key, playerId } = msg;

    if (cmd === 'create_lobby') {
      const created = createLobby(msg.code);
      if (adminEntry) {
        adminEntry.selectedLobbyCode = created.code;
        if (adminEntry.ws && adminEntry.ws.readyState === WebSocket.OPEN) {
          adminEntry.ws.send(JSON.stringify({
            type: 'LOBBY_CREATED',
            lobbyCode: created.code
          }));
        }
      }
      broadcastAllAdmins();
      return;
    }

    if (cmd === 'select_lobby') {
      const targetCode = String(msg.lobbyCode || '').trim().toUpperCase();
      if (adminEntry && lobbies.has(targetCode)) {
        adminEntry.selectedLobbyCode = targetCode;
        sendAdminSnapshot(adminEntry);
      }
      return;
    }

    if (cmd === 'delete_lobby' || cmd === 'close_lobby') {
      const targetCode = String(msg.lobbyCode || adminEntry?.selectedLobbyCode || '').trim().toUpperCase();
      if (targetCode && lobbies.has(targetCode)) {
        destroyLobby(targetCode);
      }
      return;
    }

    if (cmd === 'get_state') {
      if (adminEntry) sendAdminSnapshot(adminEntry);
      return;
    }

    // All remaining commands operate on the selected lobby
    const targetCode = String(msg.lobbyCode || adminEntry?.selectedLobbyCode || '').trim().toUpperCase();
    const lobby = lobbies.get(targetCode);
    if (!lobby) return;

    switch (cmd) {
      case 'start':
        startGame(lobby);
        break;
      case 'reset':
        resetGame(lobby);
        break;
      case 'setting': {
        const canonicalKey = SETTING_KEY_MAP[key] || key;
        const num = parseFloat(value);
        if (Number.isFinite(num)) {
          const finalVal = canonicalKey === 'maxImpostors' ? Math.max(1, Math.floor(num)) : num;
          lobby.settings[canonicalKey] = finalVal;
          lobby.settings[key] = finalVal;
          if (canonicalKey === 'maxImpostors') lobby.settings.impostorsCount = finalVal;
          if (canonicalKey === 'roleRotationInterval') lobby.settings.roleRotation = finalVal;
          if (canonicalKey === 'votingDuration') lobby.settings.votingTime = finalVal;
          if (canonicalKey === 'crewVisionRadius') lobby.settings.crewVision = finalVal;
          if (canonicalKey === 'impostorVisionRadius') {
            lobby.settings.impVision = finalVal;
            lobby.settings.impostorVision = finalVal;
          }
          if (canonicalKey === 'playerSpeed') lobby.settings.moveSpeed = finalVal;

          lobbyLog(lobby, `Setting updated: ${key} = ${finalVal}`);
          broadcastGameState(lobby);
          broadcastAllAdmins(lobby.code);
        }
        break;
      }
      case 'broadcast': {
        const bText = String(value || msg.message || msg.text || '').trim();
        if (bText) {
          lobbyLog(lobby, `📢 Admin Broadcast: "${bText}"`);
          broadcastNotification(lobby, `📢 ADMIN: ${bText}`, '#f59e0b');
        }
        break;
      }
      case 'clear_players': {
        Object.values(lobby.players).forEach(p => {
          socketToLobby.delete(p.id);
          if (p.socket && p.socket.readyState === WebSocket.OPEN) {
            p.socket.send(JSON.stringify({
              type: 'LOBBY_CLOSED',
              msg: `Lobby ${lobby.code} roster was cleared by Admin.`
            }));
          }
        });
        lobby.players = {};
        lobby.votes = {};
        lobby.deadBodies = [];
        resetGame(lobby);
        lobbyLog(lobby, '🧹 All players cleared from lobby by Admin.');
        break;
      }
      case 'kick':
        if (playerId && lobby.players[playerId]) {
          const kicked = lobby.players[playerId];
          lobbyLog(lobby, `Player ${kicked.name} kicked by Admin.`);
          sendToPlayer(lobby, playerId, {
            type: 'LOBBY_CLOSED',
            msg: 'You have been kicked by the event admin.'
          });
          if (kicked.socket && kicked.socket.readyState === WebSocket.OPEN) kicked.socket.close();
          delete lobby.players[playerId];
          delete lobby.votes[playerId];
          socketToLobby.delete(playerId);
          broadcastGameState(lobby);
          broadcastAllAdmins(lobby.code);
        }
        break;
      case 'force_vote':
        startVoting(lobby, 'Game Master', 'Admin Forced Meeting');
        break;
      case 'force_rotation':
        rotateRoles(lobby);
        break;
      case 'add_time':
        if (lobby.phase === 'VOTING') {
          lobby.votingTimeLeft += 30;
          broadcastNotification(lobby, 'Admin added +30s to Voting Timer.', '#8b5cf6');
          broadcastToLobby(lobby, { type: 'VOTE_UPDATE', votes: lobby.votes, timeLeft: lobby.votingTimeLeft });
        } else if (lobby.phase === 'PLAYING') {
          lobby.roleRotationTimeLeft += 30;
          broadcastNotification(lobby, 'Admin added +30s to Role Rotation Timer.', '#8b5cf6');
        }
        broadcastAllAdmins(lobby.code);
        break;
      case 'clear_sabotage':
        lobby.activeSabotage = null;
        lobby.sabotages = {};
        if (lobby.sabotageTimeout) { clearTimeout(lobby.sabotageTimeout); lobby.sabotageTimeout = null; }
        lobbyLog(lobby, 'Admin cleared active sabotages.');
        broadcastToLobby(lobby, { type: 'SABOTAGE_ALERT', active: false, buildingId: null, building: null });
        broadcastGameState(lobby);
        broadcastAllAdmins(lobby.code);
        break;
      default:
        break;
    }
    return;
  }

  // ── 3. PLAYER GAMEPLAY MESSAGES (Scoped strictly to player's Lobby!) ───
  const lobbyCode = socketToLobby.get(socketId);
  const lobby = lobbyCode ? lobbies.get(lobbyCode) : null;
  if (!lobby) return;

  const player = lobby.players[socketId];
  if (!player) return;

  if (type === 'MOVE') {
    if (lobby.phase !== 'PLAYING') return;
    if (player.isDead && !player.isRespawning) return;
    if (typeof msg.x === 'number' && typeof msg.y === 'number') {
      player.x = Math.max(40, Math.min(2760, msg.x));
      player.y = Math.max(40, Math.min(1640, msg.y));
    }
    return;
  }

  if (type === 'VENT') {
    if (lobby.phase !== 'PLAYING') return;
    if (player.role !== 'impostor' || player.isDead || player.isRespawning) return;
    player.inVent = !!msg.inVent;
    if (typeof msg.x === 'number' && typeof msg.y === 'number') {
      player.x = Math.max(40, Math.min(2760, msg.x));
      player.y = Math.max(40, Math.min(1640, msg.y));
    }
    lobbyLog(lobby, `🕳️ Impostor ${player.name} ${player.inVent ? 'vented' : 'exited vent'} at (${Math.round(player.x)}, ${Math.round(player.y)}).`);
    broadcastGameState(lobby);
    broadcastAllAdmins(lobby.code);
    return;
  }

  if (type === 'TASK_COMPLETE') {
    if (lobby.phase !== 'PLAYING' || player.isDead || player.role === 'impostor') return;
    const { taskId } = msg;
    const roomObj = BUILDINGS[taskId];
    if (!roomObj || player.tasksCompleted.includes(taskId)) return;

    const pts = (typeof msg.points === 'number' && msg.points > 0) ? msg.points : 10;
    player.tasksCompleted.push(taskId);
    player.score += pts;
    lobbyLog(lobby, `✅ ${player.name} solved task at ${roomObj.name}. (+${pts} pts, Total: ${player.score})`);

    sendToPlayer(lobby, player.id, { type: 'TASK_RESULT', taskId, correct: true, points: pts });
    broadcastToLobby(lobby, { type: 'POINTS_UPDATE', playerId: player.id, points: player.score, reason: `Completed Task (${roomObj.name})` });
    broadcastGameState(lobby);
    broadcastAllAdmins(lobby.code);
    return;
  }

  if (type === 'SABOTAGE') {
    if (lobby.phase !== 'PLAYING') return;

    // Repair Sabotage — MUST be physically at the sabotaged room/console!
    if (msg.action === 'fix' || msg.fix) {
      if (player.isDead || player.isRespawning || !lobby.activeSabotage) return;
      const sabId = lobby.activeSabotage.buildingId;
      const buildingName = lobby.activeSabotage.building || 'Ship Systems';
      const sabRoom = BUILDINGS[sabId];

      if (sabRoom) {
        const distToConsole = Math.hypot(player.x - sabRoom.spawnX, player.y - sabRoom.spawnY);
        const insideRoomArea =
          player.x >= sabRoom.x - 60 &&
          player.x <= sabRoom.x + sabRoom.w + 60 &&
          player.y >= sabRoom.y - 60 &&
          player.y <= sabRoom.y + sabRoom.h + 60;

        if (distToConsole > 220 && !insideRoomArea) {
          sendToPlayer(lobby, player.id, {
            type: 'NOTIFICATION',
            msg: `🏃 You must walk to ${buildingName} to fix the sabotage!`,
            color: '#f97316'
          });
          broadcastGameState(lobby);
          return;
        }
      }

      lobby.activeSabotage = null;
      lobby.sabotages = {};
      if (lobby.sabotageTimeout) { clearTimeout(lobby.sabotageTimeout); lobby.sabotageTimeout = null; }

      player.score += 20;
      lobbyLog(lobby, `🔧 ${player.name} repaired sabotage at ${buildingName}! (+20 pts)`);

      broadcastToLobby(lobby, { type: 'SABOTAGE_ALERT', active: false, buildingId: null, building: null, repairedBy: player.name });
      broadcastToLobby(lobby, { type: 'POINTS_UPDATE', playerId: player.id, points: player.score, reason: 'Repaired Sabotage' });
      broadcastNotification(lobby, `🔧 Sabotage at ${buildingName} repaired by ${player.name}! (+20 pts)`, '#22c55e');
      broadcastGameState(lobby);
      broadcastAllAdmins(lobby.code);
      return;
    }

    // Trigger Sabotage (Impostor only)
    if (player.role !== 'impostor' || player.isDead || player.isRespawning) return;
    const buildingId = msg.buildingId || msg.taskId || 'reactor';
    const buildingName = msg.building || msg.roomName || (BUILDINGS[buildingId]?.name || 'Reactor');

    lobby.activeSabotage = { buildingId, building: buildingName, triggeredBy: player.name, startedAt: Date.now() };
    lobby.sabotages[buildingId] = true;
    player.score += 10;

    lobbyLog(lobby, `⚡ Impostor ${player.name} sabotaged ${buildingName}! (+10 pts)`);
    broadcastToLobby(lobby, { type: 'SABOTAGE_ALERT', active: true, buildingId, building: buildingName, roomName: buildingName });
    broadcastToLobby(lobby, { type: 'POINTS_UPDATE', playerId: player.id, points: player.score, reason: 'Sabotage Activated' });
    broadcastNotification(lobby, `⚠️ CRITICAL: Sabotage triggered at ${buildingName}!`, '#ef4444');

    if (lobby.sabotageTimeout) clearTimeout(lobby.sabotageTimeout);
    lobby.sabotageTimeout = setTimeout(() => {
      if (lobby.activeSabotage) {
        const name = lobby.activeSabotage.building;
        lobby.activeSabotage = null;
        lobby.sabotages = {};
        lobbyLog(lobby, `Sabotage at ${name} auto-cleared after 60s.`);
        broadcastToLobby(lobby, { type: 'SABOTAGE_ALERT', active: false, buildingId: null, building: null });
        broadcastGameState(lobby);
        broadcastAllAdmins(lobby.code);
      }
    }, 60000);

    broadcastGameState(lobby);
    broadcastAllAdmins(lobby.code);
    return;
  }

  if (type === 'KILL') {
    if (lobby.phase !== 'PLAYING') return;
    if (player.role !== 'impostor' || player.isDead || player.isRespawning || player.killCooldownLeft > 0) return;

    const target = lobby.players[msg.targetId];
    if (!target || target.isDead || target.isRespawning || target.role !== 'crewmate') return;

    const dist = Math.hypot(player.x - target.x, player.y - target.y);
    if (dist > 140) return;

    target.isDead = true;
    target.score = Math.max(0, target.score - 5);
    target.isRespawning = true;
    target.respawnTimeLeft = lobby.settings.respawnTime || 45;

    player.score += 15;
    player.killCooldownLeft = lobby.settings.killCooldown || 30;
    player.lastKillTime = Date.now();

    lobby.deadBodies.push({
      id: `body_${target.id}_${Date.now()}`,
      victimId: target.id,
      victimName: target.name,
      color: target.color,
      x: target.x,
      y: target.y
    });

    lobbyLog(lobby, `🔪 Impostor ${player.name} killed ${target.name}.`);
    broadcastToLobby(lobby, {
      type: 'PLAYER_DIED',
      playerId: target.id,
      victimId: target.id,
      victimName: target.name,
      killerId: player.id,
      killerName: player.name,
      x: target.x,
      y: target.y,
      color: target.color
    });
    broadcastToLobby(lobby, { type: 'POINTS_UPDATE', playerId: player.id, points: player.score, reason: 'Eliminated Crewmate' });
    checkWinCondition(lobby);
    broadcastGameState(lobby);
    broadcastAllAdmins(lobby.code);
    return;
  }

  if (type === 'CALL_VOTE') {
    if (lobby.phase !== 'PLAYING' || player.isDead || player.isRespawning) return;
    startVoting(lobby, player.name, msg.reason || 'Emergency Meeting');
    return;
  }

  if (type === 'CAST_VOTE') {
    if (lobby.phase !== 'VOTING' || player.isDead || player.isRespawning) return;
    const { targetId } = msg;
    if (targetId !== 'skip' && !lobby.players[targetId]) return;

    lobby.votes[player.id] = targetId;
    broadcastToLobby(lobby, { type: 'VOTE_UPDATE', votes: lobby.votes, timeLeft: lobby.votingTimeLeft });

    const eligibleVoters = Object.values(lobby.players).filter(p => !p.isDead && !p.isRespawning);
    if (Object.keys(lobby.votes).length >= eligibleVoters.length && eligibleVoters.length > 0) {
      resolveVoting(lobby);
    }
  }
}

// ----------------------------------------------------------------------------
// 8. Start Server
// ----------------------------------------------------------------------------
server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  const publicUrl = process.env.RENDER_EXTERNAL_URL || `http://${localIP}:${PORT}`;
  console.log(`\n======================================================`);
  console.log(`🚀 Among Us: The Skeld — Multi-Lobby Server Running!`);
  console.log(`📱 Players join at: ${publicUrl}`);
  console.log(`⚙️  Admin panel at: ${publicUrl}/admin`);
  console.log(`📷 QR code at: ${publicUrl}/qr`);
  console.log(`======================================================\n`);
});
