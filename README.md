# Among Us: The Skeld — Multi-Lobby Edition (SDMCET Tech Event)

A real-time multiplayer Among Us game built with **React (Vite)**, **HTML5 Canvas (60 FPS)**, and a **Node.js + WebSocket** backend.

Features authentic **The Skeld** 14-room spaceship map with 2.5D metallic walls, smooth doorway collision sliding, animated cel-shaded crewmates, live vision fog-of-war, C-programming coding tasks, sabotage alarms with in-person repair puzzles, emergency meetings & voting, and an **Admin Control Panel** supporting unlimited concurrent lobbies.

---

## 🚀 Features

- **Exact 14-Room "The Skeld" Map (2800 × 1680):** Cafeteria, Reactor, Upper/Lower Engine, MedBay, Security, Electrical, Storage, Admin, Communications, O2, Weapons, Shields, and Navigation.
- **Multi-Lobby System:** The Admin can create and orchestrate multiple simultaneous, completely isolated lobbies in parallel. Each lobby has its own 6-character code, QR code, settings, players, and timers.
- **60 FPS Canvas & Collision:** Axis-separated collision with doorway corner-slide assist and auto-unstuck algorithms.
- **Stuck-Proof Controls:** Virtual touch joystick for mobile phones + WASD/Arrow keys for desktop.
- **Vision & Fog-of-War:** Dynamic radial vision synced to Admin settings. Crew vision dims during Electrical/Lights sabotage; ghosts have full vision.
- **C Programming MCQ Tasks:** Crewmates complete timed 20-second C coding challenges (+10 pts each) across the ship with fresh waves every 2 minutes.
- **In-Person Sabotage Repair:** When Impostors sabotage systems (Reactor Meltdown, Electrical Lights, O2 Depletion, Comms), crewmates must walk directly to that room and tap the console to solve the bug-line puzzle (+20 pts).
- **Impostor Vents & Kills:** Authentic connected vent network with destination switching and kill cooldowns.
- **Emergency Meetings & Voting:** Report bodies or press the emergency button to discuss and cast ejection votes.
- **Admin Command Dashboard (`/admin`):** Real-time mini-map telemetry, settings sliders, kick player, force vote/rotation, CSV score export, and lobby management.

---

## 🛠️ Project Structure

```text
amongus/
├── server.js              # Multi-Lobby Node.js Express + WebSocket backend
├── vite.config.mjs        # Vite build & development proxy configuration
├── package.json           # Dependencies and build scripts
├── index.html             # React mount HTML entry
└── src/
    ├── main.jsx           # React DOM root
    ├── App.jsx            # Router (/ -> PlayerApp, /admin -> AdminApp)
    ├── pages/
    │   ├── PlayerApp.jsx  # Player game client
    │   └── AdminApp.jsx   # Admin multi-lobby orchestrator
    ├── components/
    │   ├── player/        # Join, Lobby, HUD, Modals, Canvas & Action buttons
    │   └── admin/         # Login, Lobby tabs, Controls, Map, Settings & Roster
    ├── game/              # Skeld map geometry, collision, renderer, tasks & config
    └── styles/            # Player and Admin stylesheets
```

---

## 💻 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode (Hot-Reload)
Runs both the backend server (`port 3000`) and the Vite dev server (`port 5173`) concurrently:
```bash
npm run dev
```
- **Player App:** `http://localhost:5173`
- **Admin Panel:** `http://localhost:5173/admin` (Password: `Vik@#123`)

### 3. Production / Event Mode
Builds the React client into `dist/` and serves both the client and WebSocket server on a single port (`3000`) for mobile phones on local Wi-Fi:
```bash
npm run build
npm start
```
- **Player App:** `http://localhost:3000` (or `http://<YOUR_LOCAL_IP>:3000`)
- **Admin Panel:** `http://localhost:3000/admin` (Password: `Vik@#123`)
- **QR Code:** `http://localhost:3000/qr`

---

## 👥 Default Credentials
- **Admin Password:** `Vik@#123`
