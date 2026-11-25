import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/player.css';
import { CONFIG } from '../game/config.js';
import { SKELD_STATIONS, getNextQuestionForStation, getRemainingStationsForPlayer } from '../game/taskCatalog.js';
import { getWsUrl } from '../game/wsUrl.js';
import { isStationSabotaged } from '../game/skeldRenderer.js';

import JoinScreen from '../components/player/JoinScreen.jsx';
import LobbyScreen from '../components/player/LobbyScreen.jsx';
import RoleRevealScreen from '../components/player/RoleRevealScreen.jsx';
import GameCanvas from '../components/player/GameCanvas.jsx';
import TopHud from '../components/player/TopHud.jsx';
import ActionButtons from '../components/player/ActionButtons.jsx';
import TaskModal from '../components/player/TaskModal.jsx';
import SabotageModal from '../components/player/SabotageModal.jsx';
import VotingModal from '../components/player/VotingModal.jsx';
import GameEndModal from '../components/player/GameEndModal.jsx';
import ToastContainer from '../components/player/ToastContainer.jsx';

export default function PlayerApp() {
  // High-frequency mutable engine ref for 60 FPS Canvas loop (zero React lag!)
  const engineRef = useRef({
    screen: 'JOIN',
    phase: 'LOBBY',
    lobbyCode: '',
    myId: null,
    myPlayer: {
      id: null,
      name: 'Crewmate',
      usn: 'CREW',
      color: CONFIG.SUIT_COLORS[0],
      role: 'CREWMATE',
      x: 1540,
      y: 450,
      vx: 0,
      vy: 0,
      facing: 1,
      isDead: false,
      inVent: false,
      score: 0,
      completedTasks: []
    },
    players: new Map(),
    deadBodies: [],
    assignedTasks: [],
    stations: [...SKELD_STATIONS],
    activeSabotage: null,
    viewMode: 'camera',
    currentStationNear: null,
    currentVentNear: null,
    activeVent: null,
    deadBodyNear: null,
    killCooldown: 0,
    killCooldownMax: 15,
    sabotageCooldown: 30,
    emergencyCooldown: 30,
    ventTimeLeft: 15,
    taskRefreshTimeLeft: 120,
    gameTimeLeft: 900,
    gameDuration: 900,
    settings: { crewVision: 150, impostorVision: 250, moveSpeed: 3, tasksPerPlayer: 25, questionSection: 1, gameDuration: 900, sabotageCooldown: 30, emergencyCooldown: 30 },
    resetInput: null
  });

  // React UI state (only updates when UI elements actually change)
  const [screen, setScreen] = useState('JOIN');
  const [connStatus, setConnStatus] = useState('Connecting to Skeld Server...');
  const [joinError, setJoinError] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [myId, setMyId] = useState(null);
  const [mySnapshot, setMySnapshot] = useState({ ...engineRef.current.myPlayer });
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [activeSabotage, setActiveSabotage] = useState(null);
  const [viewMode, setViewMode] = useState('camera');
  const [activeVent, setActiveVent] = useState(null);

  const [hudProx, setHudProx] = useState({
    nearStation: null,
    nearSabotage: false,
    nearVent: null,
    nearBody: null,
    nearEmergencyTable: false,
    canKillTarget: false,
    killCooldown: 0,
    sabotageCooldown: 30,
    emergencyCooldown: 30,
    ventTimeLeft: 15,
    waveTimeLeft: 120,
    gameTimeLeft: 900
  });

  // Modals
  const [taskModalState, setTaskModalState] = useState(null); // { station, isSabotage }
  const [sabotageModalOpen, setSabotageModalOpen] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [gameEnd, setGameEnd] = useState(null);
  const [toasts, setToasts] = useState([]);

  const wsRef = useRef(null);
  const revealTimerRef = useRef(null);
  const isModalOpenRef = useRef(false);

  useEffect(() => {
    isModalOpenRef.current = !!(taskModalState || sabotageModalOpen || meeting || gameEnd);
    if (isModalOpenRef.current) engineRef.current.resetInput?.();
  }, [taskModalState, sabotageModalOpen, meeting, gameEnd]);

  const showToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const sendWs = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const switchScreen = useCallback((nextScreen) => {
    engineRef.current.screen = nextScreen;
    engineRef.current.resetInput?.();
    setScreen(nextScreen);
  }, []);

  const syncUiSnapshot = useCallback(() => {
    const e = engineRef.current;
    setMySnapshot({ ...e.myPlayer, completedTasks: [...e.myPlayer.completedTasks] });
    setAssignedTasks([...e.assignedTasks]);
    setActiveSabotage(e.activeSabotage ? { ...e.activeSabotage } : null);
    setOtherPlayers(Array.from(e.players.values()));
  }, []);

  const showRoleReveal = useCallback(
    (role, tasks = []) => {
      const e = engineRef.current;
      const upRole = String(role || 'CREWMATE').toUpperCase();
      e.myPlayer.role = upRole;

      if (upRole === 'IMPOSTOR') {
        e.assignedTasks = [];
        e.myPlayer.completedTasks = [];
        e.killCooldown = e.killCooldownMax || 15;
        e.sabotageCooldown = e.settings.sabotageCooldown || 30;
      } else if (Array.isArray(tasks) && tasks.length > 0) {
        e.assignedTasks = tasks.map((t) => (typeof t === 'string' ? t : t.room || t.id));
        e.myPlayer.completedTasks = [];
      } else if (e.assignedTasks.length === 0) {
        const shuffled = [...SKELD_STATIONS].sort(() => 0.5 - Math.random());
        e.assignedTasks = shuffled.slice(0, 3).map((s) => s.id);
      }
      e.emergencyCooldown = e.settings.emergencyCooldown || 30;

      syncUiSnapshot();
      switchScreen('REVEAL');

      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      revealTimerRef.current = setTimeout(() => {
        revealTimerRef.current = null;
        if (engineRef.current.screen === 'REVEAL') {
          switchScreen('PLAYING');
        }
      }, 3000);
    },
    [switchScreen, syncUiSnapshot]
  );

  const exitVentIfNeeded = useCallback((isTimeout = false) => {
    const e = engineRef.current;
    if (!e.myPlayer.inVent) return;
    const prevVent = e.activeVent;
    e.myPlayer.inVent = false;
    e.activeVent = null;
    e.ventTimeLeft = 15;
    setActiveVent(null);
    sendWs({
      type: 'VENT',
      inVent: false,
      x: Math.round(e.myPlayer.x),
      y: Math.round(e.myPlayer.y)
    });
    if (isTimeout) {
      showToast(`⏱️ Vent limit expired (15s)! Automatically exited ${prevVent ? prevVent.room : ''} vent.`, 'warning');
    } else if (prevVent) {
      showToast(`🚪 Exited ${prevVent.room} Vent`, 'info');
    }
    syncUiSnapshot();
  }, [sendWs, showToast, syncUiSnapshot]);

  const handleAutoExitVent = useCallback(() => {
    exitVentIfNeeded(true);
  }, [exitVentIfNeeded]);

  // WebSocket Connection & Message Router
  useEffect(() => {
    let reconnectTimer = null;
    let pingTimer = null;
    let closedByUnmount = false;

    const syncPlayersMap = (rawPlayers) => {
      if (!rawPlayers) return;
      const e = engineRef.current;
      const list = Array.isArray(rawPlayers) ? rawPlayers : Object.values(rawPlayers);
      const activeIds = new Set();

      list.forEach((p) => {
        if (!p || p.isAdmin) return;
        if (p.id === e.myId) {
          if (p.role) e.myPlayer.role = String(p.role).toUpperCase();
          const isImp = e.myPlayer.role === 'IMPOSTOR';
          if (typeof p.score === 'number') e.myPlayer.score = p.score;
          if (typeof p.isDead === 'boolean') e.myPlayer.isDead = p.isDead;
          if (p.color) e.myPlayer.color = p.color;
          if (isImp) {
            e.assignedTasks = [];
            e.myPlayer.completedTasks = [];
          } else {
            if (Array.isArray(p.tasksAssigned)) e.assignedTasks = [...p.tasksAssigned];
            if (Array.isArray(p.tasksCompleted)) e.myPlayer.completedTasks = [...p.tasksCompleted];
          }
          if (e.screen !== 'PLAYING' && typeof p.x === 'number' && typeof p.y === 'number') {
            e.myPlayer.x = p.x;
            e.myPlayer.y = p.y;
          }
          return;
        }

        activeIds.add(p.id);
        const prev = e.players.get(p.id);
        const dx = prev ? p.x - prev.x : 0;
        const facing = Math.abs(dx) > 0.5 ? (dx > 0 ? 1 : -1) : prev?.facing ?? 1;
        e.players.set(p.id, {
          ...prev,
          ...p,
          vx: dx,
          vy: prev ? p.y - prev.y : 0,
          facing
        });
      });

      for (const id of e.players.keys()) {
        if (!activeIds.has(id)) e.players.delete(id);
      }
    };

    const connect = () => {
      if (closedByUnmount) return;
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setConnStatus('🟢 Connected to Skeld Server');
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'PING' }));
        }, CONFIG.PING_INTERVAL_MS);

        const e = engineRef.current;
        if (e.screen !== 'JOIN' && e.myPlayer.name && e.lobbyCode) {
          ws.send(
            JSON.stringify({
              type: 'JOIN',
              name: e.myPlayer.name,
              collegeId: e.myPlayer.usn,
              color: e.myPlayer.color,
              lobbyCode: e.lobbyCode
            })
          );
        }
      };

      ws.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        const e = engineRef.current;

        switch (msg.type) {
          case 'WELCOME':
            if (msg.playerId) {
              e.myId = msg.playerId;
              e.myPlayer.id = msg.playerId;
              setMyId(msg.playerId);
            }
            if (msg.color) e.myPlayer.color = msg.color;
            if (msg.lobbyCode) {
              e.lobbyCode = msg.lobbyCode;
              setLobbyCode(msg.lobbyCode);
            }
            setJoinError('');
            if (e.screen === 'JOIN') switchScreen('LOBBY');
            syncUiSnapshot();
            break;

          case 'JOIN_ERROR':
            setJoinError(msg.msg || 'Invalid Lobby Code!');
            showToast(msg.msg || 'Invalid Lobby Code!', 'danger');
            break;

          case 'LOBBY_CLOSED':
            exitVentIfNeeded();
            setTaskModalState(null);
            setSabotageModalOpen(false);
            setMeeting(null);
            setGameEnd(null);
            e.lobbyCode = '';
            e.players.clear();
            e.deadBodies = [];
            e.activeSabotage = null;
            e.assignedTasks = [];
            e.myPlayer.isDead = false;
            e.myPlayer.inVent = false;
            e.myPlayer.completedTasks = [];
            setLobbyCode('');
            switchScreen('JOIN');
            setJoinError(msg.msg || 'Lobby was closed by Admin.');
            showToast(msg.msg || 'Lobby was closed by Admin.', 'danger');
            syncUiSnapshot();
            break;

          case 'CLEAR_BODIES':
            e.deadBodies = [];
            e.deadBodyNear = null;
            break;

          case 'GAME_STATE': {
            const st = msg.state || msg;
            if (!st) break;
            if (st.phase) e.phase = String(st.phase).toUpperCase();
            if (st.settings) {
              if (st.settings.killCooldown) e.killCooldownMax = st.settings.killCooldown;
              if (typeof st.settings.crewVision === 'number') e.settings.crewVision = st.settings.crewVision;
              if (typeof st.settings.impostorVision === 'number') e.settings.impostorVision = st.settings.impostorVision;
              if (typeof st.settings.moveSpeed === 'number') e.settings.moveSpeed = st.settings.moveSpeed;
              if (typeof st.settings.playerSpeed === 'number') e.settings.playerSpeed = st.settings.playerSpeed;
              if (typeof st.settings.tasksPerPlayer === 'number') e.settings.tasksPerPlayer = st.settings.tasksPerPlayer;
              if (st.settings.questionSection) e.settings.questionSection = st.settings.questionSection;
              if (st.settings.gameDuration) e.settings.gameDuration = st.settings.gameDuration;
            }
            if (typeof st.gameTimeLeft === 'number') e.gameTimeLeft = st.gameTimeLeft;
            if (typeof st.taskRefreshTimeLeft === 'number') e.taskRefreshTimeLeft = st.taskRefreshTimeLeft;
            if (typeof st.emergencyCooldownLeft === 'number') e.emergencyCooldown = st.emergencyCooldownLeft;
            if (typeof st.sabotageCooldownLeft === 'number') e.sabotageCooldown = st.sabotageCooldownLeft;
            if (Array.isArray(st.deadBodies)) e.deadBodies = [...st.deadBodies];
            syncPlayersMap(st.players);
            if (st.activeSabotage !== undefined) e.activeSabotage = st.activeSabotage;

            if (st.phase === 'LOBBY' && e.screen !== 'JOIN') {
              exitVentIfNeeded();
              setTaskModalState(null);
              setSabotageModalOpen(false);
              setMeeting(null);
              setGameEnd(null);
              e.deadBodies = [];
              e.myPlayer.isDead = false;
              e.myPlayer.inVent = false;
              e.myPlayer.completedTasks = [];
              switchScreen('LOBBY');
            } else if (st.phase === 'PLAYING' && e.screen === 'LOBBY') {
              switchScreen('PLAYING');
            }
            syncUiSnapshot();
            break;
          }

          case 'PLAYER_UPDATE':
            syncPlayersMap(msg.players);
            if (typeof msg.taskRefreshTimeLeft === 'number') {
              e.taskRefreshTimeLeft = msg.taskRefreshTimeLeft;
            }
            if (typeof msg.gameTimeLeft === 'number') {
              e.gameTimeLeft = msg.gameTimeLeft;
            }
            break;

          case 'ROLE_ASSIGN':
            if (msg.section) e.settings.questionSection = msg.section;
            if (typeof msg.gameTimeLeft === 'number') e.gameTimeLeft = msg.gameTimeLeft;
            showRoleReveal(msg.role, msg.tasks);
            break;

          case 'ROLE_ROTATION':
            exitVentIfNeeded();
            e.deadBodies = [];
            e.deadBodyNear = null;
            showToast('🔄 Role Rotation Activated! All bodies cleared.', 'warning');
            if (msg.role) showRoleReveal(msg.role, msg.tasks);
            break;

          case 'NEW_TASKS': {
            const isImp = String(e.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
            if (isImp) {
              e.assignedTasks = [];
              break;
            }
            if (Array.isArray(msg.tasks)) {
              e.assignedTasks = msg.tasks.map((t) => (typeof t === 'string' ? t : t.room || t.id));
              // Cumulative completedTasks preserved: solved questions NEVER repeat!
              e.taskRefreshTimeLeft = typeof msg.waveTimeLeft === 'number' ? msg.waveTimeLeft : 120;
              setTaskModalState(null);
              showToast('🌊 New task wave arrived! 3 fresh Skeld tasks assigned!', 'info');
              syncUiSnapshot();
            }
            break;
          }

          case 'KILL_FAILED': {
            e.killCooldown = 0;
            showToast(msg.reason || 'Could not reach target!', 'warning');
            syncUiSnapshot();
            break;
          }

          case 'PLAYER_DIED': {
            const vid = msg.victimId || msg.playerId;
            if (vid === e.myId) {
              e.myPlayer.isDead = true;
              showToast('💀 You were eliminated! You are now a Ghost.', 'danger');
            } else {
              const victim = e.players.get(vid);
              if (victim) victim.isDead = true;
              showToast(`💀 ${msg.victimName || victim?.name || 'A crewmate'} was eliminated!`, 'danger');
            }
            if (msg.killerId === e.myId && typeof msg.x === 'number' && typeof msg.y === 'number') {
              e.myPlayer.x = msg.x;
              e.myPlayer.y = msg.y;
            }
            if (typeof msg.x === 'number' && typeof msg.y === 'number') {
              e.deadBodies.push({
                id: `body_${vid}_${Date.now()}`,
                victimId: vid,
                victimName: msg.victimName || 'Crewmate',
                color: msg.color || '#c51111',
                x: msg.x,
                y: msg.y
              });
            }
            syncUiSnapshot();
            break;
          }

          case 'PLAYER_RESPAWN': {
            const pid = msg.playerId;
            e.deadBodies = e.deadBodies.filter((b) => b.victimId !== pid);
            if (pid === e.myId) {
              e.myPlayer.isDead = false;
              e.myPlayer.x = msg.x || 1540;
              e.myPlayer.y = msg.y || 450;
              showToast('⚡ You have respawned in Cafeteria!', 'success');
            } else {
              const other = e.players.get(pid);
              if (other) {
                other.isDead = false;
                if (typeof msg.x === 'number') other.x = msg.x;
                if (typeof msg.y === 'number') other.y = msg.y;
              }
            }
            syncUiSnapshot();
            break;
          }

          case 'SABOTAGE_ALERT':
            if (msg.active) {
              e.activeSabotage = {
                buildingId: msg.buildingId || 'reactor',
                building: msg.building || msg.roomName || 'Reactor'
              };
              e.sabotageCooldown = typeof msg.sabotageCooldownLeft === 'number' ? msg.sabotageCooldownLeft : 30;
              showToast(`🚨 SABOTAGE AT ${e.activeSabotage.building.toUpperCase()}!`, 'danger');
            } else {
              e.activeSabotage = null;
              e.sabotageCooldown = typeof msg.sabotageCooldownLeft === 'number' ? msg.sabotageCooldownLeft : 30;
              showToast(`🔧 Sabotage repaired${msg.repairedBy ? ` by ${msg.repairedBy}` : ''}!`, 'success');
            }
            syncUiSnapshot();
            break;

          case 'VOTE_START':
            e.resetInput?.();
            exitVentIfNeeded();
            setTaskModalState(null);
            setSabotageModalOpen(false);
            e.phase = 'VOTING';
            setMeeting({ ...msg, openedAt: Date.now() });
            break;

          case 'VOTE_UPDATE':
            setMeeting((prev) => (prev ? { ...prev, timeLeft: msg.timeLeft } : null));
            break;

          case 'VOTE_RESULT': {
            e.phase = 'PLAYING';
            e.emergencyCooldown = 30;
            e.sabotageCooldown = 30;
            const summary = msg.ejectedName
              ? `🚀 ${msg.ejectedName} was ejected!`
              : 'No one was ejected (Tie / Skipped).';
            showToast(summary, msg.ejectedName ? 'warning' : 'info');
            setTimeout(() => setMeeting(null), 1600);
            break;
          }

          case 'POINTS_UPDATE':
            if (msg.playerId === e.myId && typeof msg.points === 'number') {
              e.myPlayer.score = msg.points;
              syncUiSnapshot();
            }
            break;

          case 'GAME_END':
            e.resetInput?.();
            setTaskModalState(null);
            setSabotageModalOpen(false);
            setMeeting(null);
            setGameEnd(msg);
            break;

          case 'NOTIFICATION':
            if (msg.msg) showToast(msg.msg, 'info');
            break;

          default:
            break;
        }
      };

      ws.onclose = () => {
        if (pingTimer) clearInterval(pingTimer);
        if (!closedByUnmount) {
          setConnStatus('🔴 Disconnected — Reconnecting...');
          reconnectTimer = setTimeout(connect, 2500);
        }
      };

      ws.onerror = () => {
        setConnStatus('⚠️ Server connection error...');
      };
    };

    connect();

    return () => {
      closedByUnmount = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingTimer) clearInterval(pingTimer);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      try {
        wsRef.current?.close();
      } catch {}
    };
  }, [exitVentIfNeeded, showRoleReveal, showToast, switchScreen, syncUiSnapshot]);

  // Keyboard 'V' shortcut for Impostor venting
  const handleToggleVent = useCallback(() => {
    const e = engineRef.current;
    const isImp = String(e.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
    if (!isImp || e.myPlayer.isDead) return;

    if (e.myPlayer.inVent) {
      exitVentIfNeeded();
      return;
    }
    if (!e.currentVentNear) {
      showToast('Stand near a vent grate to use it!', 'info');
      return;
    }
    const vent = e.currentVentNear;
    e.myPlayer.inVent = true;
    e.activeVent = vent;
    e.ventTimeLeft = 15;
    e.myPlayer.x = vent.x;
    e.myPlayer.y = vent.y;
    setActiveVent(vent);
    sendWs({ type: 'VENT', inVent: true, x: vent.x, y: vent.y });
    showToast(`🕳️ Hidden inside ${vent.room} Vent (15s max)`, 'info');
    syncUiSnapshot();
  }, [exitVentIfNeeded, sendWs, showToast, syncUiSnapshot]);

  // Actions wired to child components
  const handleJoin = useCallback(
    ({ lobbyCode: code, name, usn, color }) => {
      const e = engineRef.current;
      e.lobbyCode = code;
      e.myPlayer.name = name;
      e.myPlayer.usn = usn;
      e.myPlayer.color = color;
      setLobbyCode(code);
      sendWs({ type: 'JOIN', name, collegeId: usn, color, lobbyCode: code });
    },
    [sendWs]
  );

  const handleToggleMap = useCallback(() => {
    const e = engineRef.current;
    const next = e.viewMode === 'camera' ? 'full' : 'camera';
    e.viewMode = next;
    setViewMode(next);
    if (next === 'full') {
      const isImp = String(e.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
      showToast(isImp ? 'Ship Map — Vents & Sabotage view' : 'Task Map — showing remaining tasks only', 'info');
    }
  }, [showToast]);

  const handleOpenStation = useCallback(
    (station, isSab) => {
      if (!station) return;
      const e = engineRef.current;
      if (isSab) {
        const dist = Math.hypot(e.myPlayer.x - station.x, e.myPlayer.y - station.y);
        if (e.myPlayer.isDead) {
          showToast('Ghosts cannot repair sabotages!', 'danger');
          return;
        }
        if (dist > CONFIG.SABOTAGE_FIX_RADIUS + 20) {
          showToast(`🏃 Walk to ${station.name} and tap the sabotage console to fix it!`, 'warning');
          return;
        }
        e.resetInput?.();
        setTaskModalState({ station, isSabotage: true });
        return;
      }

      // Crewmate standard MCQ task
      const isImp = String(e.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
      if (isImp) return;

      const isAssigned = (e.assignedTasks || []).includes(station.id);
      if (!isAssigned) {
        showToast(`📍 No active task at ${station.name} in this wave! Check your map.`, 'info');
        return;
      }

      const sec = e.settings.questionSection || 1;
      const nextQ = getNextQuestionForStation(station.id, sec, e.myPlayer.completedTasks);
      if (!nextQ) {
        showToast(`✅ All tasks at ${station.name} are completed! Check map for other rooms.`, 'info');
        return;
      }
      e.resetInput?.();
      setTaskModalState({ station: { ...station, activeQuestion: nextQ }, isSabotage: false });
    },
    [showToast]
  );

  const handleSabotageBannerClick = useCallback(() => {
    const e = engineRef.current;
    if (!e.activeSabotage || e.myPlayer.isDead) return;
    const sabStation = e.stations.find((st) => isStationSabotaged(st, e.activeSabotage));
    if (!sabStation) return;
    handleOpenStation(sabStation, true);
  }, [handleOpenStation]);

  const handleTravelVent = useCallback(
    (dest) => {
      const e = engineRef.current;
      if (!e.myPlayer.inVent || !dest) return;
      e.activeVent = dest;
      e.myPlayer.x = dest.x;
      e.myPlayer.y = dest.y;
      setActiveVent(dest);
      sendWs({ type: 'VENT', inVent: true, x: dest.x, y: dest.y });
      showToast(`🕳️ Vented to ${dest.room}!`, 'info');
    },
    [sendWs, showToast]
  );

  const handleCallEmergency = useCallback(() => {
    const e = engineRef.current;
    if (e.myPlayer.isDead) {
      showToast('Ghosts cannot call emergency meetings!', 'danger');
      return;
    }
    if (e.myPlayer.inVent) {
      showToast('Cannot call emergency meeting while hidden in a vent!', 'warning');
      return;
    }
    if (e.activeSabotage) {
      showToast(`🚨 Cannot call emergency meeting during active sabotage! Fix ${e.activeSabotage.building || 'the sabotage'} first!`, 'danger');
      return;
    }
    if ((e.emergencyCooldown || 0) > 0) {
      showToast(`⏳ Emergency meeting on cooldown (${Math.ceil(e.emergencyCooldown)}s remaining)!`, 'warning');
      return;
    }
    const distToTable = Math.hypot(e.myPlayer.x - CONFIG.EMERGENCY_TABLE_POS.x, e.myPlayer.y - CONFIG.EMERGENCY_TABLE_POS.y);
    if (distToTable > CONFIG.EMERGENCY_TABLE_RADIUS) {
      showToast('🏃 Walk into the Cafeteria and stand near the emergency table to call a meeting!', 'warning');
      return;
    }
    exitVentIfNeeded();
    sendWs({
      type: 'CALL_VOTE',
      reason: 'Emergency Meeting',
      callerName: e.myPlayer.name
    });
  }, [exitVentIfNeeded, sendWs, showToast]);

  const handleOpenSabotage = useCallback(() => {
    const e = engineRef.current;
    if (e.myPlayer.role !== 'IMPOSTOR' || e.myPlayer.isDead) return;
    if (e.activeSabotage) {
      showToast(`⚠️ Another sabotage is already active at ${e.activeSabotage.building}! Only 1 sabotage allowed at a time.`, 'warning');
      return;
    }
    if ((e.sabotageCooldown || 0) > 0) {
      showToast(`⏳ Sabotage is on cooldown (${Math.ceil(e.sabotageCooldown)}s remaining)!`, 'warning');
      return;
    }
    setSabotageModalOpen(true);
  }, [showToast]);

  const handleTriggerSabotage = useCallback((target) => {
    const e = engineRef.current;
    if (e.myPlayer.role !== 'IMPOSTOR' || e.myPlayer.isDead) return;
    if (e.activeSabotage) {
      showToast(`⚠️ Another sabotage is already active at ${e.activeSabotage.building}! Only 1 sabotage allowed at a time.`, 'warning');
      return;
    }
    if ((e.sabotageCooldown || 0) > 0) {
      showToast(`⏳ Sabotage is on cooldown (${Math.ceil(e.sabotageCooldown)}s remaining)!`, 'warning');
      return;
    }
    e.sabotageCooldown = e.settings.sabotageCooldown || 30;
    e.activeSabotage = { buildingId: target.id, building: target.name };
    setActiveSabotage({ ...e.activeSabotage });
    sendWs({ type: 'SABOTAGE', buildingId: target.id, building: target.name });
    syncUiSnapshot();
    showToast(`🚨 Sabotage triggered at ${target.name}!`, 'danger');
  }, [sendWs, showToast, syncUiSnapshot]);

  const handleReportBody = useCallback(() => {
    const e = engineRef.current;
    if (e.myPlayer.isDead) {
      showToast('Ghosts cannot report bodies!', 'danger');
      return;
    }
    const body = e.deadBodyNear;
    if (!body) {
      showToast('Walk closer to a dead body to report it!', 'info');
      return;
    }
    exitVentIfNeeded();
    sendWs({
      type: 'CALL_VOTE',
      reason: `Reported Body of ${body.victimName}`,
      bodyId: body.id,
      callerName: e.myPlayer.name
    });
  }, [exitVentIfNeeded, sendWs, showToast]);

  const handleKill = useCallback(() => {
    const e = engineRef.current;
    const isImp = String(e.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
    if (!isImp || e.killCooldown > 0 || e.myPlayer.isDead || e.myPlayer.inVent) return;

    let nearest = null;
    let minDist = CONFIG.KILL_RADIUS;
    e.players.forEach((p) => {
      if (!p.isDead && !p.inVent && String(p.role || '').toUpperCase() !== 'IMPOSTOR') {
        const d = Math.hypot(p.x - e.myPlayer.x, p.y - e.myPlayer.y);
        if (d < minDist) {
          minDist = d;
          nearest = p;
        }
      }
    });

    if (nearest) {
      e.killCooldown = e.killCooldownMax || 15;
      sendWs({
        type: 'KILL',
        killerId: e.myId,
        targetId: nearest.id,
        killerX: Math.round(e.myPlayer.x),
        killerY: Math.round(e.myPlayer.y),
        targetX: Math.round(nearest.x),
        targetY: Math.round(nearest.y)
      });
      // Snap killer to target (smooth kill lunge animation like Among Us)
      e.myPlayer.x = nearest.x;
      e.myPlayer.y = nearest.y;
      showToast(`🔪 Eliminated ${nearest.name}!`, 'danger');
      syncUiSnapshot();
    } else {
      showToast('Walk closer to a crewmate to kill! (Hotkeys: Q to kill, WASD to move)', 'info');
    }
  }, [sendWs, showToast, syncUiSnapshot]);

  // Global game keyboard shortcuts (Q: Kill, R: Report, E/Space: Use/Task/Meeting/Vent, V: Vent)
  useEffect(() => {
    const onKeyDown = (ev) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (engineRef.current.screen !== 'PLAYING') return;

      const key = ev.key.toLowerCase();
      if (key === 'v') {
        handleToggleVent();
      } else if (key === 'q') {
        handleKill();
      } else if (key === 'r') {
        handleReportBody();
      } else if (key === 'e' || ev.code === 'Space') {
        const e = engineRef.current;
        if (e.nearEmergencyTable && !e.myPlayer.isDead && !e.myPlayer.inVent) {
          handleCallEmergency();
        } else if (e.currentStationNear) {
          handleOpenStation(e.currentStationNear, hudProx.nearSabotage);
        } else if (e.currentVentNear) {
          handleToggleVent();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleToggleVent, handleKill, handleReportBody, handleCallEmergency, handleOpenStation, hudProx.nearSabotage]);

  const handleSendMove = useCallback((coords) => sendWs({ type: 'MOVE', ...coords }), [sendWs]);

  const handleCloseTaskModal = useCallback(() => {
    setTaskModalState(null);
  }, []);

  const handleTaskSolved = useCallback((station, qObj, answer, pts) => {
    const e = engineRef.current;
    const qKey = qObj?.id || station.activeQuestion?.id || station.id;
    if (!e.myPlayer.completedTasks.includes(qKey)) {
      e.myPlayer.completedTasks.push(qKey);
      e.myPlayer.score += pts;
      // Instantly clear completed station from current wave assignedTasks so yellow '!' vanishes!
      e.assignedTasks = (e.assignedTasks || []).filter((id) => id !== station.id);
      sendWs({ type: 'TASK_COMPLETE', taskId: station.id, questionId: qKey, answer, points: pts });
      syncUiSnapshot();
    }
    const doneCount = e.myPlayer.completedTasks.length;
    showToast(`✅ Question solved! (+${pts} pts) — Total Progress: ${doneCount}/25`, 'success');
  }, [sendWs, showToast, syncUiSnapshot]);

  const handleTaskWrong = useCallback((station, qObj, answer, penalty = 2) => {
    const e = engineRef.current;
    const isImp = String(e.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
    if (isImp) return;

    const qKey = qObj?.id || station?.activeQuestion?.id || station?.id;
    e.myPlayer.score -= penalty;
    syncUiSnapshot();

    showToast(`❌ Wrong answer! (-${penalty} pts)`, 'error');
    sendWs({
      type: 'TASK_WRONG',
      taskId: station?.id,
      questionId: qKey,
      answer,
      penalty
    });
  }, [sendWs, showToast, syncUiSnapshot]);

  const handleSabotagePatched = useCallback((station, line) => {
    const e = engineRef.current;
    const isImp = String(e.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
    if (!isImp) {
      e.myPlayer.score += 10;
      showToast('🔧 Sabotage successfully patched! (+10 pts)', 'success');
    } else {
      showToast('🔧 Sabotage patched (Impostors do not receive points for repairs).', 'info');
    }
    e.activeSabotage = null;
    sendWs({ type: 'SABOTAGE', action: 'fix', buildingId: station.id, line, success: true });
    syncUiSnapshot();
  }, [sendWs, showToast, syncUiSnapshot]);

  const handleColorChange = useCallback((newColor) => {
    const e = engineRef.current;
    if (e.myPlayer) {
      e.myPlayer.color = newColor;
      syncUiSnapshot();
    }
    sendWs({ type: 'CHANGE_COLOR', color: newColor });
  }, [sendWs, syncUiSnapshot]);

  return (
    <>
      {screen === 'JOIN' && (
        <JoinScreen connStatus={connStatus} joinError={joinError} onJoin={handleJoin} />
      )}

      {screen === 'LOBBY' && (
        <LobbyScreen
          lobbyCode={lobbyCode}
          myId={myId}
          myPlayer={mySnapshot}
          otherPlayers={otherPlayers}
          onColorChange={handleColorChange}
        />
      )}

      {screen === 'REVEAL' && (
        <RoleRevealScreen
          role={mySnapshot.role}
          assignedTasks={assignedTasks}
          onDismiss={() => switchScreen('PLAYING')}
        />
      )}

      {screen === 'PLAYING' && (
        <section id="gameScreen" className="screen active">
          <GameCanvas
            engineRef={engineRef}
            isModalOpenRef={isModalOpenRef}
            onSendMove={handleSendMove}
            onProximitySync={setHudProx}
            onTapStation={handleOpenStation}
            onCallEmergency={handleCallEmergency}
            onAutoExitVent={handleAutoExitVent}
            onShowToast={showToast}
          />

          <TopHud
            score={mySnapshot.score}
            role={mySnapshot.role}
            completedCount={mySnapshot.completedTasks.length}
            totalTasks={25}
            matchTimeLeft={hudProx.gameTimeLeft ?? engineRef.current.gameTimeLeft}
            waveTimeLeft={hudProx.waveTimeLeft ?? engineRef.current.taskRefreshTimeLeft}
            viewMode={viewMode}
            activeSabotage={activeSabotage}
            isNearSabotage={hudProx.nearSabotage}
            isDead={mySnapshot.isDead}
            onToggleMap={handleToggleMap}
            onSabotageBannerClick={handleSabotageBannerClick}
          />

          <ActionButtons
            role={mySnapshot.role}
            isDead={mySnapshot.isDead}
            inVent={mySnapshot.inVent}
            activeVent={activeVent}
            nearVent={hudProx.nearVent}
            nearStation={hudProx.nearStation}
            nearSabotage={hudProx.nearSabotage}
            nearBody={hudProx.nearBody}
            nearEmergencyTable={hudProx.nearEmergencyTable}
            canKillTarget={hudProx.canKillTarget}
            killCooldown={hudProx.killCooldown}
            sabotageCooldown={hudProx.sabotageCooldown}
            emergencyCooldown={hudProx.emergencyCooldown}
            ventTimeLeft={hudProx.ventTimeLeft ?? 15}
            activeSabotage={activeSabotage}
            onVote={handleCallEmergency}
            onReport={handleReportBody}
            onToggleVent={handleToggleVent}
            onTravelVent={handleTravelVent}
            onExitVent={exitVentIfNeeded}
            onKill={handleKill}
            onSabotage={handleOpenSabotage}
            onTaskOrFix={() => {
              if (hudProx.nearStation) {
                handleOpenStation(hudProx.nearStation, hudProx.nearSabotage);
              }
            }}
          />
        </section>
      )}

      <TaskModal
        station={taskModalState?.station}
        isSabotage={!!taskModalState?.isSabotage}
        onClose={handleCloseTaskModal}
        onTaskSolved={handleTaskSolved}
        onTaskWrong={handleTaskWrong}
        onSabotagePatched={handleSabotagePatched}
      />

      <SabotageModal
        open={sabotageModalOpen}
        onClose={() => setSabotageModalOpen(false)}
        activeSabotage={activeSabotage}
        sabotageCooldown={hudProx.sabotageCooldown}
        onTriggerSabotage={handleTriggerSabotage}
      />

      <VotingModal
        meeting={meeting}
        myId={myId}
        isDead={mySnapshot.isDead}
        onCastVote={(targetId) => {
          sendWs({ type: 'CAST_VOTE', targetId });
          showToast(targetId === 'skip' ? 'Skipped vote.' : 'Vote locked in!', 'info');
        }}
      />

      <GameEndModal
        gameEnd={gameEnd}
        onBackToLobby={() => {
          setGameEnd(null);
          switchScreen('LOBBY');
        }}
      />

      <ToastContainer toasts={toasts} />
    </>
  );
}
