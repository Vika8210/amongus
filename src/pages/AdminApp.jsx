import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/admin.css';
import { CONFIG } from '../game/config.js';
import { getWsUrl } from '../game/wsUrl.js';

import AdminLogin from '../components/admin/AdminLogin.jsx';
import AdminHeader from '../components/admin/AdminHeader.jsx';
import MultiLobbyBar from '../components/admin/MultiLobbyBar.jsx';
import GameControlsCard from '../components/admin/GameControlsCard.jsx';
import LiveSkeldMap from '../components/admin/LiveSkeldMap.jsx';
import SettingsPanel from '../components/admin/SettingsPanel.jsx';
import SabotagePanel from '../components/admin/SabotagePanel.jsx';
import PlayerRosterTable from '../components/admin/PlayerRosterTable.jsx';
import EventLogPanel from '../components/admin/EventLogPanel.jsx';
import { QrModal, GameOverModal } from '../components/admin/AdminModals.jsx';

const DEFAULT_SETTINGS = {
  impostorsCount: 1,
  tasksPerPlayer: 3,
  killCooldown: 30,
  respawnTime: 45,
  roleRotation: 180,
  votingTime: 60,
  crewVision: 150,
  impostorVision: 250,
  moveSpeed: 3
};

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('campus_admin_auth') === 'true'
  );
  const [isOnline, setIsOnline] = useState(false);
  const [wsStatusText, setWsStatusText] = useState('CONNECTING...');

  const [lobbies, setLobbies] = useState([]);
  const [lobbyCode, setLobbyCode] = useState(null);
  const [phase, setPhase] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [sabotages, setSabotages] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [rotationCountdown, setRotationCountdown] = useState(180);
  const [logs, setLogs] = useState([]);
  const [qrVersion, setQrVersion] = useState(() => Date.now());

  const [qrOpen, setQrOpen] = useState(false);
  const [gameOverData, setGameOverData] = useState(null);

  const wsRef = useRef(null);
  const selectedCodeRef = useRef(null);
  selectedCodeRef.current = lobbyCode;

  const addLog = useCallback((text, type = 'info') => {
    const now = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':');
    setLogs((prev) => [
      ...prev.slice(-99),
      { id: `${Date.now()}_${Math.random()}`, time, text, type }
    ]);
  }, []);

  const sendAdminCmd = useCallback((cmd, params = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const targetLobbyCode =
      params.lobbyCode !== undefined ? params.lobbyCode : selectedCodeRef.current;

    wsRef.current.send(
      JSON.stringify({
        type: 'ADMIN_CMD',
        cmd,
        command: cmd,
        action: cmd,
        lobbyCode: targetLobbyCode,
        adminKey: CONFIG.ADMIN_KEY,
        timestamp: Date.now(),
        ...params
      })
    );
  }, []);

  // Connect Admin WebSocket once authenticated
  useEffect(() => {
    if (!authenticated) return;
    let reconnectTimer = null;
    let unmounted = false;

    addLog('Game Master authenticated. Connected to Skeld Multi-Lobby Command.', 'info');

    const connect = () => {
      if (unmounted) return;
      setIsOnline(false);
      setWsStatusText('CONNECTING...');

      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setIsOnline(true);
        setWsStatusText('ONLINE');
        ws.send(JSON.stringify({ type: 'JOIN', name: 'admin', adminKey: CONFIG.ADMIN_KEY }));
        ws.send(JSON.stringify({ type: 'ADMIN_CMD', cmd: 'get_state', adminKey: CONFIG.ADMIN_KEY }));
      };

      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        if (data.type === 'ADMIN_STATE') {
          const nextCode = data.selectedLobbyCode || null;
          setLobbies(Array.isArray(data.lobbies) ? data.lobbies : []);
          setLobbyCode((prev) => {
            if (prev !== nextCode) setQrVersion(Date.now());
            return nextCode;
          });
          if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));

          if (!data.gameState) {
            setPlayers([]);
            setSabotages([]);
            setPhase('LOBBY');
            setElapsedSeconds(0);
            setRotationCountdown(180);
            return;
          }

          const rawPlayers = data.players || data.gameState.players || {};
          const list = Array.isArray(rawPlayers)
            ? rawPlayers.filter((p) => !p.isAdmin)
            : Object.values(rawPlayers).filter((p) => !p.isAdmin);
          setPlayers(list);

          const gs = data.gameState;
          const nextPhase = String(gs.phase || 'LOBBY').toUpperCase();
          setPhase((prevPhase) => {
            if (nextPhase === 'ENDED' && prevPhase !== 'ENDED') {
              setGameOverData({ winner: gs.winner || 'CREW', players: list });
            }
            return nextPhase;
          });

          if (typeof gs.timer === 'number') setElapsedSeconds(gs.timer);
          if (typeof gs.roleRotationTimeLeft === 'number') {
            setRotationCountdown(gs.roleRotationTimeLeft);
          }

          if (gs.activeSabotage) {
            setSabotages([
              {
                id: gs.activeSabotage.buildingId || 'reactor',
                location: gs.activeSabotage.building || 'Reactor',
                name: 'Critical Subsystem Alert',
                remainingTime: 60
              }
            ]);
          } else {
            setSabotages([]);
          }
          return;
        }

        if (data.type === 'LOBBY_CREATED') {
          setQrVersion(Date.now());
          addLog(`🏠 New Lobby Created! Share code: ${data.lobbyCode}`, 'info');
          return;
        }

        if (data.type === 'PLAYER_UPDATE') {
          if (data.lobbyCode && data.lobbyCode !== selectedCodeRef.current) return;
          if (data.players && typeof data.players === 'object') {
            setPlayers((prev) =>
              prev.map((p) => {
                const pos = data.players[p.id];
                if (!pos) return p;
                return {
                  ...p,
                  x: pos.x,
                  y: pos.y,
                  isDead: typeof pos.isDead === 'boolean' ? pos.isDead : p.isDead,
                  isRespawning:
                    typeof pos.isRespawning === 'boolean' ? pos.isRespawning : p.isRespawning
                };
              })
            );
          }
        }
      };

      ws.onclose = () => {
        if (!unmounted) {
          setIsOnline(false);
          setWsStatusText('OFFLINE (RETRYING)');
          reconnectTimer = setTimeout(connect, 2500);
        }
      };

      ws.onerror = () => {
        setIsOnline(false);
        setWsStatusText('CONNECTION ERROR');
      };
    };

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        wsRef.current?.close();
      } catch {}
    };
  }, [authenticated, addLog]);

  // 1-second local UI clock tick while selected lobby is PLAYING
  useEffect(() => {
    if (!authenticated || phase !== 'PLAYING') return;
    const t = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      setRotationCountdown((r) => (r > 0 ? r - 1 : settings.roleRotation || 180));
    }, 1000);
    return () => clearInterval(t);
  }, [authenticated, phase, settings.roleRotation]);

  const requireLobby = () => {
    if (!lobbyCode) {
      alert('Please create or select a lobby first using "➕ CREATE NEW LOBBY".');
      return false;
    }
    return true;
  };

  const handleExportCsv = () => {
    const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
    const headers = ['Name', 'CollegeID', 'Role', 'Score', 'TasksCompleted', 'Status'];
    const rows = sorted.map((p) => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.collegeId || p.usn || '').replace(/"/g, '""')}"`,
      `"${p.role || 'CREWMATE'}"`,
      p.score ?? 0,
      Array.isArray(p.tasksCompleted) ? p.tasksCompleted.length : 0,
      p.isDead ? 'Dead' : 'Alive'
    ]);
    const csv =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `skeld_scores_${lobbyCode || 'lobby'}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`📥 Exported scores CSV for Lobby ${lobbyCode || '—'}.`, 'info');
  };

  if (!authenticated) {
    return <AdminLogin onAuthenticated={() => setAuthenticated(true)} />;
  }

  const impostors = players
    .filter((p) => (p.role || '').toLowerCase() === 'impostor')
    .map((p) => p.name || p.id);

  return (
    <div id="adminDashboard" style={{ display: 'flex' }}>
      <AdminHeader
        isOnline={isOnline}
        wsStatusText={wsStatusText}
        phase={phase}
        lobbyCode={lobbyCode}
        qrVersion={qrVersion}
        onOpenQr={() => setQrOpen(true)}
        onLogout={() => {
          sessionStorage.removeItem('campus_admin_auth');
          setAuthenticated(false);
        }}
      />

      <main className="dashboard-content">
        <MultiLobbyBar
          lobbies={lobbies}
          selectedLobbyCode={lobbyCode}
          onCreateLobby={(customCode) => {
            sendAdminCmd('create_lobby', customCode ? { code: customCode } : {});
            addLog(`🏠 Creating new Lobby${customCode ? ` (${customCode})` : ''}...`, 'info');
          }}
          onSelectLobby={(code) => {
            if (code === lobbyCode) return;
            sendAdminCmd('select_lobby', { lobbyCode: code });
            addLog(`🔀 Switched dashboard view to Lobby ${code}.`, 'info');
          }}
          onDeleteLobby={(code) => {
            if (!code) return;
            if (
              window.confirm(
                `🗑️ DELETE LOBBY "${code}"?\n\nPlayers inside Lobby ${code} will return to Join screen. Other active lobbies will NOT be affected.`
              )
            ) {
              sendAdminCmd('delete_lobby', { lobbyCode: code });
              addLog(`🗑️ Deleted Lobby ${code}.`, 'info');
            }
          }}
        />

        <div className="top-grid">
          <GameControlsCard
            lobbyCode={lobbyCode}
            phase={phase}
            playerCount={players.length}
            elapsedSeconds={elapsedSeconds}
            rotationCountdown={rotationCountdown}
            impostors={impostors}
            onCreateLobby={(code) => sendAdminCmd('create_lobby', code ? { code } : {})}
            onDeleteLobby={(code) => {
              if (
                window.confirm(
                  `🗑️ DELETE LOBBY "${code}"?\n\nPlayers inside Lobby ${code} will return to Join screen.`
                )
              ) {
                sendAdminCmd('delete_lobby', { lobbyCode: code });
                addLog(`🗑️ Deleted Lobby ${code}.`, 'info');
              }
            }}
            onStart={() => {
              if (!requireLobby()) return;
              sendAdminCmd('start');
              addLog(`▶ [${lobbyCode}] Game Master started game.`, 'info');
            }}
            onReset={() => {
              if (!requireLobby()) return;
              if (window.confirm(`⚠️ RESET LOBBY "${lobbyCode}" back to Lobby?`)) {
                sendAdminCmd('reset');
                addLog(`⟳ [${lobbyCode}] Game reset to Lobby.`, 'info');
              }
            }}
            onForceVote={() => {
              if (!requireLobby()) return;
              sendAdminCmd('force_vote');
              addLog(`🗳️ [${lobbyCode}] Forced emergency vote.`, 'vote');
            }}
            onForceRotation={() => {
              if (!requireLobby()) return;
              sendAdminCmd('force_rotation');
              addLog(`🔄 [${lobbyCode}] Manual role rotation triggered.`, 'rotation');
            }}
            onAddTime={() => {
              if (!requireLobby()) return;
              sendAdminCmd('add_time', { seconds: 30 });
              addLog(`⏱️ [${lobbyCode}] Added +30s to timer.`, 'info');
            }}
            onBroadcast={(text) => {
              if (!requireLobby()) return;
              sendAdminCmd('broadcast', { value: text, message: text, text });
              addLog(`📢 [${lobbyCode}] Broadcast: "${text}"`, 'info');
            }}
            onLog={addLog}
          />

          <LiveSkeldMap players={players} sabotages={sabotages} settings={settings} />
        </div>

        <SettingsPanel
          settings={settings}
          onChangeSetting={(key, value) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
            if (lobbyCode) {
              sendAdminCmd('setting', { key, setting: key, value });
              addLog(`[${lobbyCode}] Setting updated: ${key} = ${value}`, 'info');
            }
          }}
        />

        <SabotagePanel
          sabotages={sabotages}
          onClearSabotage={(sabId) => {
            if (!requireLobby()) return;
            sendAdminCmd('clear_sabotage', { sabotageId: sabId, id: sabId });
            setSabotages([]);
            addLog(`⚡ [${lobbyCode}] Sabotage cleared manually.`, 'info');
          }}
        />

        <PlayerRosterTable
          players={players}
          defaultTasksPerPlayer={settings.tasksPerPlayer || 3}
          onKickPlayer={(playerId, name) => {
            if (!requireLobby()) return;
            if (window.confirm(`Kick player "${name}" from Lobby ${lobbyCode}?`)) {
              sendAdminCmd('kick', { playerId, id: playerId });
              addLog(`🚫 [${lobbyCode}] Kicked player: ${name}`, 'info');
            }
          }}
          onClearRoster={() => {
            if (!requireLobby()) return;
            if (window.confirm(`⚠️ Disconnect all players from Lobby "${lobbyCode}"?`)) {
              sendAdminCmd('clear_players');
              addLog(`🧹 [${lobbyCode}] Cleared all players from lobby.`, 'info');
            }
          }}
          onExportCsv={handleExportCsv}
        />

        <EventLogPanel logs={logs} onClear={() => setLogs([])} />
      </main>

      <QrModal
        open={qrOpen}
        lobbyCode={lobbyCode}
        qrVersion={qrVersion}
        onClose={() => setQrOpen(false)}
      />

      <GameOverModal
        data={gameOverData}
        onStartNew={() => sendAdminCmd('start')}
        onExportCsv={handleExportCsv}
        onClose={() => setGameOverData(null)}
      />
    </div>
  );
}
