# Pirate Battle - Architecture & Design Decisions

## 1. Asset Scaffolding Strategy
To unblock the development phase while original graphical and audio assets were restricted/missing, a Node.js script (`scripts/generate-assets.js`) was utilized to scaffold placeholder assets automatically. This ensured that the Vite server and PixiJS loaders did not crash on 404 errors. 
- PixiJS `Sprite.from` instances were gracefully wrapped or supplemented with `PIXI.Graphics` fallbacks (e.g., drawing explicit bounds/colors) so the entities remained fully visible and interactive for collision and gameplay debugging.

## 2. Object Pooling & 60 FPS Target
Garbage Collection (GC) pressure is a primary cause of frame drops in JavaScript game engines. 
- **ProjectilePool & EnemyManager**: We pre-allocate arrays of entities (200 projectiles, dozens of enemies) upfront during the `init()` phase.
- Instead of calling `new Projectile()` or `destroy()`, we toggle an `active` boolean. Inactive objects are hidden and detached from physics checks.
- **DeltaTime (dt)**: All physics (movement, rotation, cooldowns, and `GameFeel` screen shake) strictly multiply by `ticker.deltaTime` to ensure smooth gameplay scaling regardless of the monitor's refresh rate (e.g., 60Hz or 144Hz).

## 3. React ↔ PixiJS Decoupling
PixiJS handles the game loop inside an HTML `<canvas>`, rendering at 60+ FPS. React handles the UI, but React is not meant to re-render 60 times a second.
- **Zustand Throttling**: The `useMatchStore` acts as a data bus. 
- The PixiJS `Ticker` pushes data to Zustand (`setMatchData(hp, score, timeRemaining)`), but inside the Zustand action, a guard clause only updates the React state if the **integer** values have changed. This eliminates continuous sub-frame React updates.
- HUD components use `pointer-events-none` and `position: absolute` so they overlay cleanly without stealing keyboard focus from the Canvas.

## 4. Idempotency & Network Resilience (MSW + TanStack Query)
Network reliability is simulated via Mock Service Worker (MSW), which can intercept and fail requests.
- **Client-Side ID Generation**: A unique `matchId` (UUID) is generated at the start of every game.
- **TanStack Query Mutation**: On Game Over, we call the `POST /api/history` endpoint. If MSW simulates a Timeout or HTTP 500 error, TanStack Query catches it and provides the `isError` state.
- **Idempotency**: The UI offers a "Retry Submit" button. Because the `matchId` remains identical across retries, the server recognizes it. Our MSW handler intercepts this duplicate `matchId` and responds with an HTTP 200 OK (idempotent success) instead of HTTP 201 Created, protecting the leaderboard from duplicated records.
