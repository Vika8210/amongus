/**
 * Input Controller — Stuck-proof Touch/Mouse Joystick, WASD Keyboard & Map Taps
 * Includes clean destroy() teardown for React useEffect lifecycle.
 */
import { CONFIG } from './config.js';

export class InputController {
  constructor(canvas, { isPlaying, onMapTap }) {
    this.canvas = canvas;
    this.isPlaying = isPlaying;
    this.onMapTap = onMapTap;
    this.keysDown = new Set();
    this.isMouseDown = false;
    this._tapStart = null;
    this.joystick = {
      active: false,
      touchId: null,
      currX: 0,
      currY: 0,
      dx: 0,
      dy: 0
    };
    this._listeners = [];
    this.bindEvents();
  }

  _on(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    this._listeners.push(() => target.removeEventListener(event, handler, options));
  }

  destroy() {
    this._listeners.forEach(unsub => unsub());
    this._listeners = [];
    this.resetAll();
  }

  getBase() {
    return {
      x: CONFIG.JOY_OFFSET_X,
      y: this.canvas.height - CONFIG.JOY_OFFSET_Y
    };
  }

  isNearJoystickZone(x, y) {
    const base = this.getBase();
    return Math.hypot(x - base.x, y - base.y) <= CONFIG.JOY_OUTER_R * 2.1;
  }

  reset() {
    const base = this.getBase();
    this.joystick.active = false;
    this.joystick.touchId = null;
    this.joystick.dx = 0;
    this.joystick.dy = 0;
    this.joystick.currX = base.x;
    this.joystick.currY = base.y;
  }

  resetAll() {
    this.keysDown.clear();
    this.isMouseDown = false;
    this._tapStart = null;
    this.reset();
  }

  updateFromCoords(x, y) {
    const base = this.getBase();
    const dx = x - base.x;
    const dy = y - base.y;
    const dist = Math.hypot(dx, dy);
    const maxR = CONFIG.JOY_OUTER_R;

    if (dist > 0) {
      const clamped = Math.min(dist, maxR);
      this.joystick.currX = base.x + (dx / dist) * clamped;
      this.joystick.currY = base.y + (dy / dist) * clamped;
      this.joystick.dx = (dx / dist) * (clamped / maxR);
      this.joystick.dy = (dy / dist) * (clamped / maxR);
    } else {
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      this.joystick.currX = base.x;
      this.joystick.currY = base.y;
    }
  }

  updateFromKeyboard() {
    let kx = 0;
    let ky = 0;
    if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) kx -= 1;
    if (this.keysDown.has('d') || this.keysDown.has('arrowright')) kx += 1;
    if (this.keysDown.has('w') || this.keysDown.has('arrowup')) ky -= 1;
    if (this.keysDown.has('s') || this.keysDown.has('arrowdown')) ky += 1;

    if (kx !== 0 || ky !== 0) {
      const mag = Math.hypot(kx, ky);
      this.joystick.dx = kx / mag;
      this.joystick.dy = ky / mag;
      this.joystick.active = true;
      const base = this.getBase();
      this.joystick.currX = base.x + this.joystick.dx * CONFIG.JOY_OUTER_R * 0.8;
      this.joystick.currY = base.y + this.joystick.dy * CONFIG.JOY_OUTER_R * 0.8;
    } else if (!this.isMouseDown && this.joystick.touchId === null && this.joystick.active) {
      this.reset();
    }
  }

  bindEvents() {
    this._on(window, 'keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        this.keysDown.add(key);
      }
    });

    this._on(window, 'keyup', (e) => {
      this.keysDown.delete(e.key.toLowerCase());
    });

    this._on(window, 'blur', () => this.resetAll());
    this._on(document, 'visibilitychange', () => {
      if (document.hidden) this.resetAll();
    });

    this._on(this.canvas, 'touchstart', (e) => {
      if (!this.isPlaying()) return;
      if (this.joystick.touchId !== null) {
        const stillPresent = Array.from(e.touches).some(t => t.identifier === this.joystick.touchId);
        if (!stillPresent) this.reset();
      }

      for (const touch of e.changedTouches) {
        const inJoyZone =
          this.isNearJoystickZone(touch.clientX, touch.clientY) ||
          (touch.clientX < window.innerWidth * 0.38 && touch.clientY > window.innerHeight * 0.48);

        if (inJoyZone && this.joystick.touchId === null) {
          e.preventDefault();
          this.joystick.active = true;
          this.joystick.touchId = touch.identifier;
          this.updateFromCoords(touch.clientX, touch.clientY);
        } else {
          this._tapStart = {
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
            time: performance.now(),
            moved: false
          };
        }
      }
    }, { passive: false });

    this._on(window, 'touchmove', (e) => {
      if (!this.isPlaying()) return;
      if (this.joystick.active && this.joystick.touchId !== null) {
        for (const touch of e.changedTouches) {
          if (touch.identifier === this.joystick.touchId) {
            if (e.cancelable) e.preventDefault();
            this.updateFromCoords(touch.clientX, touch.clientY);
            break;
          }
        }
      }
      if (this._tapStart) {
        for (const touch of e.changedTouches) {
          if (touch.identifier === this._tapStart.id) {
            if (Math.hypot(touch.clientX - this._tapStart.x, touch.clientY - this._tapStart.y) > 18) {
              this._tapStart.moved = true;
            }
          }
        }
      }
    }, { passive: false });

    const endTouch = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.joystick.touchId) this.reset();
        if (this._tapStart && touch.identifier === this._tapStart.id) {
          const elapsed = performance.now() - this._tapStart.time;
          if (!this._tapStart.moved && elapsed < 450 && this.isPlaying()) {
            this.onMapTap?.(touch.clientX, touch.clientY);
          }
          this._tapStart = null;
        }
      }
      if (e.touches && e.touches.length === 0 && this.joystick.touchId !== null) {
        this.reset();
      }
    };
    this._on(window, 'touchend', endTouch, { passive: true });
    this._on(window, 'touchcancel', endTouch, { passive: true });

    this._on(this.canvas, 'mousedown', (e) => {
      if (!this.isPlaying() || e.button !== 0) return;
      if (this.isNearJoystickZone(e.clientX, e.clientY)) {
        this.isMouseDown = true;
        this.joystick.active = true;
        this.updateFromCoords(e.clientX, e.clientY);
      } else {
        this._tapStart = {
          id: 'mouse',
          x: e.clientX,
          y: e.clientY,
          time: performance.now(),
          moved: false
        };
      }
    });

    this._on(window, 'mousemove', (e) => {
      if (this.isMouseDown && this.joystick.active) {
        this.updateFromCoords(e.clientX, e.clientY);
      }
      if (this._tapStart && this._tapStart.id === 'mouse') {
        if (Math.hypot(e.clientX - this._tapStart.x, e.clientY - this._tapStart.y) > 14) {
          this._tapStart.moved = true;
        }
      }
    });

    this._on(window, 'mouseup', (e) => {
      if (this.isMouseDown) {
        this.isMouseDown = false;
        this.reset();
      }
      if (this._tapStart && this._tapStart.id === 'mouse') {
        const elapsed = performance.now() - this._tapStart.time;
        if (!this._tapStart.moved && elapsed < 450 && this.isPlaying()) {
          this.onMapTap?.(e.clientX, e.clientY);
        }
        this._tapStart = null;
      }
    });
  }

  renderJoystick(ctx) {
    const base = this.getBase();
    const knobX = this.joystick.active ? this.joystick.currX : base.x;
    const knobY = this.joystick.active ? this.joystick.currY : base.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(base.x, base.y, CONFIG.JOY_OUTER_R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(knobX, knobY, CONFIG.JOY_INNER_R, 0, Math.PI * 2);
    ctx.fillStyle = this.joystick.active ? 'rgba(56, 189, 248, 0.8)' : 'rgba(148, 163, 184, 0.45)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  }
}
