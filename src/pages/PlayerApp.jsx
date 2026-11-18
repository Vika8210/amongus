import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/player.css';
import { CONFIG } from '../game/config.js';
import { SKELD_STATIONS } from '../game/taskCatalog.js';
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
    taskRefreshTimeLeft: 120,
    settings: { crewVision: 150, impostorVision: 250, moveSpeed: 3, tasksPerPlayer: 3 },
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
    killCooldown: 0,
    waveTimeLeft: 120
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
      } else if (Array.isArray(tasks) && tasks.length > 0) {
        e.assignedTasks = tasks.map((t) => (typeof t === 'string' ? t : t.room || t.id));
        e.myPlayer.completedTasks = [];
      } else if (e.assignedTasks.length === 0) {
        const shuffled = [...SKELD_STATIONS].sort(() => 0.5 - Math.random());
        e.assignedTasks = shuffled.slice(0, 3).map((s) => s.id);
      }

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

  const exitVentIfNeeded = useCallback(() => {
    const e = engineRef.current;
    if (!e.myPlayer.inVent) return;
    const prevVent = e.activeVent;
    e.myPlayer.inVent = false;
    e.activeVent = null;
    setActiveVent(null);
    sendWs({
      type: 'VENT',
      inVent: false,
      x: Math.round(e.myPlayer.x),
      y: Math.round(e.myPlayer.y)
    });
    if (prevVent) showToast(`🚪 Exited ${prevVent.room} Vent`, 'info');
    syncUiSnapshot();
  }, [sendWs, showToast, syncUiSnapshot]);

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
              if (typeof st.settings.tasksPerPlayer === 'number') e.settings.tasksPerPlayer = st.settings.tasksPerPlayer;
            }
            if (typeof st.taskRefreshTimeLeft === 'number') e.taskRefreshTimeLeft = st.taskRefreshTimeLeft;
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
            break;

          case 'ROLE_ASSIGN':
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
              e.myPlayer.completedTasks = [];
              break;
            }
            if (Array.isArray(msg.tasks)) {
              e.assignedTasks = msg.tasks.map((t) => (typeof t === 'string' ? t : t.room || t.id));
              e.myPlayer.completedTasks = [];
              e.taskRefreshTimeLeft = 120;
              setTaskModalState(null);
              showToast('📋 New Task Wave! 3 fresh Skeld tasks assigned!', 'info');
              syncUiSnapshot();
            }
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
              showToast(`🚨 SABOTAGE AT ${e.activeSabotage.building.toUpperCase()}!`, 'danger');
            } else {
              e.activeSabotage = null;
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
    e.myPlayer.x = vent.x;
    e.myPlayer.y = vent.y;
    setActiveVent(vent);
    sendWs({ type: 'VENT', inVent: true, x: vent.x, y: vent.y });
    showToast(`🕳️ Hidden inside ${vent.room} Vent`, 'info');
    syncUiSnapshot();
  }, [exitVentIfNeeded, sendWs, showToast, syncUiSnapshot]);

  useEffect(() => {
    const onKeyDown = (ev) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (engineRef.current.screen === 'PLAYING' && ev.key.toLowerCase() === 'v') {
        handleToggleVent();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleToggleVent]);

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
      }
      e.resetInput?.();
      setTaskModalState({ station, isSabotage: !!isSab });
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
      sendWs({ type: 'KILL', killerId: e.myId, targetId: nearest.id, x: nearest.x, y: nearest.y });
      showToast(`🔪 Eliminated ${nearest.name}!`, 'danger');
    } else {
      showToast('Walk closer to a crewmate to kill!', 'info');
    }
  }, [sendWs, showToast]);

  const handleSendMove = useCallback((coords) => sendWs({ type: 'MOVE', ...coords }), [sendWs]);

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
            onShowToast={showToast}
          />

          <TopHud
            score={mySnapshot.score}
            role={mySnapshot.role}
            completedCount={mySnapshot.completedTasks.length}
            totalTasks={assignedTasks.length || 3}
            waveTimeLeft={hudProx.waveTimeLeft}
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
            killCooldown={hudProx.killCooldown}
            onVote={() => {
              if (engineRef.current.myPlayer.isDead) {
                showToast('Ghosts cannot call emergency meetings!', 'danger');
                return;
              }
              exitVentIfNeeded();
              sendWs({
                type: 'CALL_VOTE',
                reason: 'Emergency Meeting',
                callerName: engineRef.current.myPlayer.name
              });
            }}
            onReport={() => {
              const body = engineRef.current.deadBodyNear;
              if (!body) return;
              exitVentIfNeeded();
              sendWs({
                type: 'CALL_VOTE',
                reason: `Reported Body of ${body.victimName}`,
                bodyId: body.id,
                callerName: engineRef.current.myPlayer.name
              });
            }}
            onToggleVent={handleToggleVent}
            onTravelVent={handleTravelVent}
            onExitVent={exitVentIfNeeded}
            onKill={handleKill}
            onSabotage={() => setSabotageModalOpen(true)}
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
        onClose={() => setTaskModalState(null)}
        onTaskSolved={(station, answer, pts) => {
          const e = engineRef.current;
          if (!e.myPlayer.completedTasks.includes(station.id)) {
            e.myPlayer.completedTasks.push(station.id);
            e.myPlayer.score += pts;
            sendWs({ type: 'TASK_COMPLETE', taskId: station.id, answer, points: pts });
            syncUiSnapshot();
          }
          showToast(`✅ Task completed at ${station.name}! (+${pts} pts)`, 'success');
        }}
        onSabotagePatched={(station, line) => {
          const e = engineRef.current;
          e.myPlayer.score += 20;
          e.activeSabotage = null;
          sendWs({ type: 'SABOTAGE', action: 'fix', buildingId: station.id, line, success: true });
          syncUiSnapshot();
          showToast('🔧 Sabotage successfully patched! (+20 pts)', 'success');
        }}
      />

      <SabotageModal
        open={sabotageModalOpen}
        onClose={() => setSabotageModalOpen(false)}
        onTriggerSabotage={(target) => {
          engineRef.current.activeSabotage = { buildingId: target.id, building: target.name };
          sendWs({ type: 'SABOTAGE', buildingId: target.id, building: target.name });
          syncUiSnapshot();
          showToast(`🚨 Sabotage triggered at ${target.name}!`, 'danger');
        }}
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
