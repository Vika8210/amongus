import React, { useEffect, useRef } from 'react';
import { CONFIG } from '../../game/config.js';
import { movePlayerWithCollision } from '../../game/skeldCollision.js';
import { renderSkeldFrame, screenToWorld, isStationSabotaged } from '../../game/skeldRenderer.js';
import { InputController } from '../../game/inputController.js';
import { SKELD_VENTS } from '../../game/skeldMapData.js';

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
  onShowToast
}) {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

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

      // 1. Direct tap on the active Sabotage console (must walk there first!)
      if (state.activeSabotage) {
        const sabStation = state.stations.find((st) => isStationSabotaged(st, state.activeSabotage));
        if (sabStation && Math.hypot(world.x - sabStation.x, world.y - sabStation.y) <= 78) {
          const dist = Math.hypot(state.myPlayer.x - sabStation.x, state.myPlayer.y - sabStation.y);
          if (dist <= CONFIG.SABOTAGE_FIX_RADIUS) {
            inputRef.current?.resetAll();
            onTapStation(sabStation, true);
          } else {
            onShowToast(
              `🏃 Walk closer to ${sabStation.name} and tap the sabotage console to fix it!`,
              'warning'
            );
          }
          return;
        }
      }

      // 2. Crewmate direct tap on an assigned remaining Task console
      if (!isImp) {
        for (const st of state.stations) {
          const isMyTask =
            state.assignedTasks.includes(st.id) &&
            !state.myPlayer.completedTasks.includes(st.id);
          if (!isMyTask) continue;

          if (Math.hypot(world.x - st.x, world.y - st.y) <= 68) {
            const dist = Math.hypot(state.myPlayer.x - st.x, state.myPlayer.y - st.y);
            if (dist <= CONFIG.PROXIMITY_RADIUS) {
              inputRef.current?.resetAll();
              onTapStation(st, false);
            } else {
              onShowToast(`🏃 Move closer to ${st.name} to start this task!`, 'info');
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

            const speed = Math.max(2.5, (state.settings.moveSpeed || 3) * 1.75);
            movePlayerWithCollision(state.myPlayer, dx, dy, speed);

            if (now - lastMoveSent > CONFIG.MOVE_SEND_INTERVAL_MS) {
              onSendMove({
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
        if (state.phase === 'PLAYING' && state.taskRefreshTimeLeft > 0) {
          state.taskRefreshTimeLeft = Math.max(0, state.taskRefreshTimeLeft - dt);
        }
        if (state.killCooldown > 0) {
          state.killCooldown = Math.max(0, state.killCooldown - dt);
        }

        // Proximity detection
        const isImp = String(state.myPlayer.role || '').toUpperCase() === 'IMPOSTOR';
        let nearStation = null;
        let nearSab = false;

        if (!state.myPlayer.isDead) {
          for (const st of state.stations) {
            const dist = Math.hypot(state.myPlayer.x - st.x, state.myPlayer.y - st.y);
            const isSab = isStationSabotaged(st, state.activeSabotage);
            const isMyTask =
              !isImp &&
              state.assignedTasks.includes(st.id) &&
              !state.myPlayer.completedTasks.includes(st.id);

            if (isSab && dist <= CONFIG.SABOTAGE_FIX_RADIUS) {
              nearStation = st;
              nearSab = true;
              break;
            }
            if (isMyTask && dist <= CONFIG.PROXIMITY_RADIUS) {
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

        // Only push React state update when proximity or whole-second countdown actually changes!
        const waveInt = Math.ceil(state.taskRefreshTimeLeft || 0);
        const killInt = Math.ceil(state.killCooldown || 0);
        const syncKey = `${nearStation?.id || ''}|${nearSab}|${nearVent?.id || ''}|${nearBody?.id || ''}|${killInt}`;
        if (syncKey !== lastHudSyncKey || waveInt !== lastTimerInt) {
          lastHudSyncKey = syncKey;
          lastTimerInt = waveInt;
          onProximitySync({
            nearStation,
            nearSabotage: nearSab,
            nearVent,
            nearBody,
            killCooldown: killInt,
            waveTimeLeft: waveInt
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
  }, [engineRef, isModalOpenRef, onSendMove, onProximitySync, onTapStation, onShowToast]);

  return <canvas id="gameCanvas" ref={canvasRef} />;
}
