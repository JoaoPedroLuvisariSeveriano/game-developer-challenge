# Pirate Battle - Architecture & Technical Decisions

This document details the core architectural decisions, patterns, and technical trade-offs made during the development of the Pirate Battle game. The focus is on achieving a stable 60 FPS gameplay experience, clean state management, and robust network resilience.

## 1. React / PixiJS Bridge & UI Synchronization

Integrating a declarative UI library (React) with an imperative, loop-based rendering engine (PixiJS) requires careful separation of concerns to avoid severe performance degradation.

### The Problem
If the React tree re-renders at the engine's frame rate (60 FPS), the Garbage Collector and Virtual DOM diffing algorithms will choke the main thread, causing frame drops and stuttering in the PixiJS canvas.

### The Solution (Zustand & Idempotent Updates)
We utilized **Zustand** (`src/state/matchStore.ts`) to act as the bridge between the PixiJS simulation and the React HUD.
- The `Game.ts` ticker runs at 60 FPS, updating the physical simulation (movement, collision, damage).
- Every frame, the game calls `setMatchData(hp, score, timeRemaining)` on the Zustand store.
- **Crucial Optimization:** Inside the Zustand action, we explicitly check if the *integer representation* of the data has changed. If the `hp`, `score`, or `Math.ceil(timeRemaining)` are identical to the previous state, we return the existing state object. This bails out React's rendering lifecycle entirely.
- The React HUD components only re-render once per second (when the clock ticks down) or when damage is taken/score is earned, rather than 60 times a second.

## 2. Object Pooling & Memory Management

Garbage Collection (GC) pauses are the primary cause of jank in HTML5 games. Creating and destroying objects (like projectiles or enemies) on the fly forces the JS engine to constantly allocate and deallocate memory.

### The Projectile Pool (`ProjectilePool.ts`)
We implemented a strict **Object Pool** pattern for all projectiles.
- Upon game initialization, a fixed array of 200 `Projectile` instances is created and kept in memory.
- When the player or an enemy fires, we do not call `new Projectile()`. Instead, we query the pool for an inactive projectile, initialize its position and velocity, and set it to active.
- When a projectile hits a target or leaves the arena, it is simply deactivated (hidden and ignored in the physics loop) rather than destroyed.
- **Result:** Zero memory allocation during the core gameplay loop, preventing GC spikes and ensuring a buttery smooth 60 FPS.

## 3. Game Cycle & Strict Mode Cleanup

React 18's Strict Mode mounts, unmounts, and remounts components in development to detect lifecycle bugs. If the PixiJS application is not correctly dismantled, textures and WebGL contexts leak, quickly crashing the browser.

We handle this in `PixiCanvas.tsx` by returning a cleanup function in the `useEffect` hook. The cleanup function calls `game.destroy()`, which systematically:
1. Removes all keyboard and window event listeners.
2. Destroys all entities (Player, Enemies).
3. Calls `app.destroy(true, { children: true, texture: true })` to deeply purge the PIXI instance and free the WebGL context and GPU memory.

## 4. Network Resilience & Idempotency (MSW)

The requirement for the game was to handle hostile network conditions (timeouts, 503s, 500s) gracefully when submitting the match result to the backend.

### The Idempotency Key
We generate a unique `matchId` (UUID) at the start of each match. This ID acts as an **Idempotency Key**.
When the match ends, we submit a payload containing the `matchId` and a fixed `playedAt` timestamp.

### MSW Fault Scenarios & Silent Retries
Our mock backend (`handlers.ts`) is designed to simulate timeouts and outages.
- **Scenario:** The client submits the record. The server persists it, but the connection hangs (timeout).
- **Client Handling:** `axios` aborts the request after 8 seconds. Our `TanStack Query` configuration (`shouldRetry` in `queryClient.ts`) intercepts the network error and performs an exponential backoff **silent retry**.
- **Server Idempotency:** When the retry hits the server, MSW checks if the `matchId` already exists. It finds the record from the first attempt, compares the payload hash (`sameSubmission`), and returns `HTTP 200 OK` with a `{ duplicate: true }` flag.
- **Result:** The user is completely shielded from the network failure. The record is saved, the game recovers, and no duplicate records pollute the Ranking or Match History.

## 5. Balancing & Configurations

All game design parameters (Entity speeds, HP, cooldowns, arena bounds) are centralized in a Zustand store (`optionsStore.ts`). 
- When the `Game` initializes, it captures a **snapshot** of the current options.
- This ensures that if the user tweaks the options in the menu, it only applies to the *next* match, preserving the integrity of the ongoing session.

## 6. Simulation Cycle & Collisions

To keep the game logic deterministic and decoupled from the rendering frame rate, the simulation cycle is strictly ordered within the main game loop (`Ticker`):

1. **Input Collection:** Keyboard states and touch events are collected and translated into intention vectors.
2. **Movement Integration:** Velocity vectors are applied to entity positions (Player, Enemies, Projectiles) using delta time to ensure consistent movement regardless of frame drops.
3. **Collision Detection (AABB):** 
   - We use Axis-Aligned Bounding Box (AABB) intersection checks for fast collision resolution.
   - **Player vs. Islands:** Movement is blocked and corrected.
   - **Projectiles vs. Islands:** Projectiles are destroyed/deactivated upon impact.
   - **Projectiles vs. Ships:** Damage is applied to the target, and the projectile is deactivated.
   - **Player vs. Chasers:** Physical impact damage is applied to the player, and the Chaser explodes.
4. **State Resolution:** Dead entities are removed or deactivated, cooldowns are decremented, and the Zustand HUD state is synchronized only if integer values have changed.
