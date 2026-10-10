# Pirate Battle - Game Developer Challenge

A high-performance naval battle simulator built with uncompromising software architecture, delivering a robust 2D rendering engine coupled with asynchronous data synchronization and a reactive user interface.

## 🏗 Architecture & Tech Stack

The architecture strictly separates the game engine (WebGL) from the User Interface (DOM), ensuring stability and maximum performance:
- **PixiJS v8**: The core 2D renderer handling vector geometry, sprites, and the core synchronous physics loop.
- **React & Tailwind CSS**: Used exclusively for the HUD and menus. This guarantees declarative, reactive, and modular UI components entirely isolated from the game loop.
- **MSW & TanStack Query**: MSW mocks a fully operational REST API with dynamic latency, server errors, and stochastic responses. TanStack Query manages data fetching, caching, and offline mutation queues to guarantee idempotency.
- **TypeScript**: Strict typing ensures compile-time safety and a robust data contract across all layers.

*For detailed architectural patterns (Delta Time, Object Pooling, Mark & Sweep), please refer to [ARCHITECTURE.md](ARCHITECTURE.md).*

## 🚀 Setup & Commands

Ensure you are using **Node.js >=20.19**.

Install dependencies:
```bash
npm install
```

### Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server on `localhost:5173` with MSW initialized. |
| `npm run build` | Compiles TypeScript and creates an optimized production bundle in `/dist`. |
| `npm run test` | Runs the full Playwright E2E Test suite headlessly. |
| `npm run lint` | Runs ESLint to check for code quality and strict adherence to rules. |

## 🕹️ Controls

**Desktop (Keyboard):**
- **W / S**: Move Forward / Backward
- **A / D**: Steer Left / Steer Right
- **Q**: Fire Left Cannons
- **E**: Fire Right Cannons
- **Space**: Fire Front Cannon (Big Bomb)
- **Escape**: Pause / Unpause the game

**Mobile (Touch):**
- Virtual UI Joysticks are displayed on screen.
- The UI natively supports continuous holding logic (`pointerdown` and `pointerup`) for smooth steering.
- The game automatically pauses when the browser tab loses visibility (`visibilitychange`).

## 🌐 Network Scenarios & MSW (Debug Panel)

The game includes a dedicated **MSW Config Panel** inside the **Options Menu**. 
This panel allows the evaluator or developer to dynamically toggle network scenarios at runtime, including:

- **Normal**: Standard API behavior with realistic latency.
- **Timeout after Commit**: Simulates a network failure *after* the server has saved a match. Our TanStack Query `useOfflineSync` fallback will retry idempotently and avoid duplicate leaderboard entries.
- **HTTP 500 / 503**: Simulates backend crashes and flaky reads, showcasing the UI's resilience and error boundaries.
- **Offline (Connection failure)**: Simulates total network loss, putting Match Submissions into a LocalStorage queue for background sync.

Use the **Reset Mock Data** button in the panel to wipe all rankings and history.

## 🧪 Testing & Profiling

This project strictly adheres to quality assurance:
- **Playwright (E2E Tests)**: The `playwright` suite covers 8 critical flows including Navigation, Canvas rendering, Controls, Game Over conditions, Automatic Pausing, and MSW Failure scenarios. Test traces are automatically retained on failure (`retain-on-failure`), and an HTML report is generated (`playwright-report`).
- **Performance Profiling**: The Object Pooling system and Garbage Collection (GC) sweeps have been heavily optimized. You will not experience GC stuttering or Frame Drops even with hundreds of entities and projectiles active.

## 📜 Assets & Licenses

Audio files and textures have been replaced with Public Domain (CC0) assets from Kenney Studio (UI Audio, Impact Sounds, and Ships) to ensure strict open-source compliance.