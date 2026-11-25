import React, { useEffect, useRef } from 'react';
import { CONFIG } from '../../game/config.js';
import { movePlayerWithCollision } from '../../game/skeldCollision.js';
import { renderSkeldFrame, screenToWorld, isStationSabotaged } from '../../game/skeldRenderer.js';
import { InputController } from '../../game/inputController.js';
import { SKELD_VENTS } from '../../game/skeldMapData.js';
import { getNextQuestionForStation } from '../../game/taskCatalog.js';

/**
 * 60 FPS Skeld Canvas Component
 * Runs smooth local movement, doorway collision, stuck-proof touch joystick,
 * direct map tap for Sabotage/Task consoles, and pushes proximity updates to React HUD.
 */
export default function GameCanvas({
  engineRef,
  isModalOpenRef,
  onSendMove,
  onProximitySync,
  onTapStation,
  onCallEmergency,
  onAutoExitVent,
  onShowToast
}) {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  // Keep stable callback ref so useEffect never rebinds or destroys InputController on re-renders
  const callbacksRef = useRef({});
  callbacksRef.current = {
    onSendMove,
    onProximitySync,
    onTapStation,
    onCallEmergency,
    onAutoExitVent,
    onShowToast
  };

  // Expose resetInput helper on engineRef so modals/screen changes clear stuck touches
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMapTap = (screenX, screenY) => {
      const state = engineRef.current;
      if (state.viewMode !== 'camera' || state.myPlayer.isDead || state.myPlayer.inVent) return;
      if (isModalOpenRef.current || state.phase === 'VOTING') return;

      const world = screenToWorld(screenX, screenY, canvas, state);
      const isImp = String(state.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';

      // 0. Direct tap on Cafeteria Emergency Table
      const distToTableCenter = Math.hypot(world.x - CONFIG.EMERGENCY_TABLE_POS.x, world.y - CONFIG.EMERGENCY_TABLE_POS.y);
      if (distToTableCenter <= 75) {
        const playerDist = Math.hypot(state.myPlayer.x - CONFIG.EMERGENCY_TABLE_POS.x, state.myPlayer.y - CONFIG.EMERGENCY_TABLE_POS.y);
        if (playerDist <= CONFIG.EMERGENCY_TABLE_RADIUS) {
          if (state.activeSabotage) {
            callbacksRef.current.onShowToast?.('🚨 Cannot call emergency meeting during active sabotage! Repair it first.', 'danger');
            return;
          }
          if ((state.emergencyCooldown || 0) > 0) {
            callbacksRef.current.onShowToast?.(`⏳ Emergency meeting on cooldown (${Math.ceil(state.emergencyCooldown)}s remaining)!`, 'warning');
            return;
          }
          inputRef.current?.resetAll();
          callbacksRef.current.onCallEmergency?.();
        } else {
          callbacksRef.current.onShowToast?.('🏃 Walk closer to the Cafeteria table to call an Emergency Meeting!', 'warning');
        }
        return;
      }

      // 1. Direct tap on the active Sabotage console (must walk there first!)
      if (state.activeSabotage) {
        const sabStation = state.stations.find((st) => isStationSabotaged(st, state.activeSabotage));
        if (sabStation && Math.hypot(world.x - sabStation.x, world.y - sabStation.y) <= 78) {
          const dist = Math.hypot(state.myPlayer.x - sabStation.x, state.myPlayer.y - sabStation.y);
          if (dist <= CONFIG.SABOTAGE_FIX_RADIUS) {
            inputRef.current?.resetAll();
            callbacksRef.current.onTapStation?.(sabStation, true);
          } else {
            callbacksRef.current.onShowToast?.(
              `🏃 Walk closer to ${sabStation.name} and tap the sabotage console to fix it!`,
              'warning'
            );
          }
          return;
        }
      }

      // 2. Crewmate direct tap on an assigned remaining Task console
      if (!isImp) {
        const sec = state.settings?.questionSection || 1;
        const assignedList = state.assignedTasks || [];
        for (const st of state.stations) {
          if (!assignedList.includes(st.id)) continue;
          const nextQ = getNextQuestionForStation(st.id, sec, state.myPlayer.completedTasks);
          if (!nextQ) continue;

          if (Math.hypot(world.x - st.x, world.y - st.y) <= 68) {
            const dist = Math.hypot(state.myPlayer.x - st.x, state.myPlayer.y - st.y);
            if (dist <= CONFIG.PROXIMITY_RADIUS) {
              inputRef.current?.resetAll();
              callbacksRef.current.onTapStation?.(st, false);
            } else {
              callbacksRef.current.onShowToast?.(`🏃 Move closer to ${st.name} to start this task!`, 'info');
            }
            return;
          }
        }
      }
    };

    const input = new InputController(canvas, {
      isPlaying: () => !isModalOpenRef.current && engineRef.current.phase !== 'VOTING',
      onMapTap: handleMapTap
    });
    inputRef.current = input;
    engineRef.current.resetInput = () => input.resetAll();

    let rafId = null;
    let lastFrameTime = performance.now();
    let lastMoveSent = 0;
    let lastHudSyncKey = '';
    let lastTimerInt = -1;

    const loop = (now) => {
      rafId = requestAnimationFrame(loop);
      try {
        const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
        lastFrameTime = now;
        const state = engineRef.current;
        const blocked = isModalOpenRef.current || state.phase === 'VOTING';

        if (blocked) {
          state.myPlayer.vx = 0;
          state.myPlayer.vy = 0;
        } else {
          input.updateFromKeyboard();

          if (input.joystick.active && !state.myPlayer.inVent) {
            const { dx, dy } = input.joystick;
            state.myPlayer.vx = dx;
            state.myPlayer.vy = dy;
            if (Math.abs(dx) > 0.05) state.myPlayer.facing = dx > 0 ? 1 : -1;

            const baseSpeed = Number(state.settings?.moveSpeed ?? state.settings?.playerSpeed ?? 3);
            const speed = Math.max(0.5, baseSpeed * 1.6);
            movePlayerWithCollision(state.myPlayer, dx, dy, speed);

            if (now - lastMoveSent > CONFIG.MOVE_SEND_INTERVAL_MS) {
              callbacksRef.current.onSendMove?.({
                x: Math.round(state.myPlayer.x),
                y: Math.round(state.myPlayer.y),
                vx: dx,
                vy: dy
              });
              lastMoveSent = now;
            }
          } else {
            state.myPlayer.vx = 0;
            state.myPlayer.vy = 0;
          }
        }

        // Timers
        if (state.phase === 'PLAYING') {
          if (state.gameTimeLeft > 0) state.gameTimeLeft = Math.max(0, state.gameTimeLeft - dt);
          if (state.taskRefreshTimeLeft > 0) state.taskRefreshTimeLeft = Math.max(0, state.taskRefreshTimeLeft - dt);
        }
        if (state.killCooldown > 0) {
          state.killCooldown = Math.max(0, state.killCooldown - dt);
        }
        if (state.sabotageCooldown > 0) {
          state.sabotageCooldown = Math.max(0, state.sabotageCooldown - dt);
        }
        if (state.emergencyCooldown > 0) {
          state.emergencyCooldown = Math.max(0, state.emergencyCooldown - dt);
        }

        // Impostor 15-second vent limit timer
        if (state.myPlayer.inVent) {
          if (typeof state.ventTimeLeft !== 'number') state.ventTimeLeft = 15;
          state.ventTimeLeft = Math.max(0, state.ventTimeLeft - dt);
          if (state.ventTimeLeft <= 0) {
            callbacksRef.current.onAutoExitVent?.();
          }
        } else {
          state.ventTimeLeft = 15;
        }

        // Proximity detection
        const isImp = String(state.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
        let nearStation = null;
        let nearSab = false;

        if (!state.myPlayer.isDead) {
          const sec = state.settings?.questionSection || 1;
          const assignedList = state.assignedTasks || [];
          for (const st of state.stations) {
            const dist = Math.hypot(state.myPlayer.x - st.x, state.myPlayer.y - st.y);
            const isSab = isStationSabotaged(st, state.activeSabotage);
            const isAssigned = assignedList.includes(st.id);
            const hasTaskRemaining = !isImp && isAssigned && getNextQuestionForStation(st.id, sec, state.myPlayer.completedTasks) !== null;

            if (isSab && dist <= CONFIG.SABOTAGE_FIX_RADIUS) {
              nearStation = st;
              nearSab = true;
              break;
            }
            if (hasTaskRemaining && dist <= CONFIG.PROXIMITY_RADIUS) {
              nearStation = st;
              nearSab = false;
              break;
            }
          }
        }
        state.currentStationNear = nearStation;

        let nearVent = null;
        if (isImp && !state.myPlayer.isDead) {
          for (const v of SKELD_VENTS) {
            if (Math.hypot(state.myPlayer.x - v.x, state.myPlayer.y - v.y) <= 85) {
              nearVent = v;
              break;
            }
          }
        }
        state.currentVentNear = nearVent;

        let nearBody = null;
        if (!state.myPlayer.inVent) {
          for (const body of state.deadBodies) {
            if (Math.hypot(state.myPlayer.x - body.x, state.myPlayer.y - body.y) <= CONFIG.BODY_PROXIMITY_RADIUS) {
              nearBody = body;
              break;
            }
          }
        }
        state.deadBodyNear = nearBody;

        const distToTable = Math.hypot(state.myPlayer.x - CONFIG.EMERGENCY_TABLE_POS.x, state.myPlayer.y - CONFIG.EMERGENCY_TABLE_POS.y);
        const nearEmergencyTable = !state.myPlayer.isDead && !state.myPlayer.inVent && distToTable <= CONFIG.EMERGENCY_TABLE_RADIUS;
        state.nearEmergencyTable = nearEmergencyTable;

        let canKillTarget = false;
        if (isImp && !state.myPlayer.isDead && !state.myPlayer.inVent && (state.killCooldown || 0) <= 0) {
          for (const p of state.players.values()) {
            if (!p.isDead && !p.inVent && String(p.role || '').toUpperCase() !== 'IMPOSTOR') {
              if (Math.hypot(state.myPlayer.x - p.x, state.myPlayer.y - p.y) <= CONFIG.KILL_RADIUS) {
                canKillTarget = true;
                break;
              }
            }
          }
        }
        state.canKillTarget = canKillTarget;

        // Only push React state update when proximity or whole-second countdown actually changes!
        const gameInt = Math.ceil(state.gameTimeLeft || 0);
        const waveInt = Math.ceil(state.taskRefreshTimeLeft || 0);
        const killInt = Math.ceil(state.killCooldown || 0);
        const sabInt = Math.ceil(state.sabotageCooldown || 0);
        const emerInt = Math.ceil(state.emergencyCooldown || 0);
        const ventInt = Math.ceil(state.ventTimeLeft ?? 15);
        const syncKey = `${nearStation?.id || ''}|${nearSab}|${nearVent?.id || ''}|${nearBody?.id || ''}|${nearEmergencyTable}|${canKillTarget}|${killInt}|${sabInt}|${emerInt}|${ventInt}|${gameInt}|${waveInt}`;
        if (syncKey !== lastHudSyncKey || gameInt !== lastTimerInt) {
          lastHudSyncKey = syncKey;
          lastTimerInt = gameInt;
          callbacksRef.current.onProximitySync?.({
            nearStation,
            nearSabotage: nearSab,
            nearVent,
            nearBody,
            nearEmergencyTable,
            canKillTarget,
            killCooldown: killInt,
            sabotageCooldown: sabInt,
            emergencyCooldown: emerInt,
            ventTimeLeft: ventInt,
            waveTimeLeft: waveInt,
            gameTimeLeft: gameInt
          });
        }

        renderSkeldFrame(ctx, canvas, state);
        input.renderJoystick(ctx);
      } catch (err) {
        console.error('[Skeld Canvas Loop Error]', err);
      }
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      input.destroy();
    };
  }, [engineRef, isModalOpenRef]);

  return <canvas id="gameCanvas" ref={canvasRef} />;
}
