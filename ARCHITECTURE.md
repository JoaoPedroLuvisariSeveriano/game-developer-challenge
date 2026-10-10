# Architecture Overview

This document outlines the core technical decisions, patterns, and structure of the Pirate Battle engine.

## React/PixiJS Integration

The application enforces a strict separation of concerns between the declarative UI (React) and the imperative, continuous rendering engine (PixiJS). 
- **Decoupled Lifecycles**: PixiJS is initialized within a `useEffect` hook in a dedicated canvas component. We use React's `key` prop tied to a `matchId` to guarantee a full teardown and rebuild of the PixiJS application upon every new match. This prevents state contamination between rounds and safely sidesteps React's concurrent rendering artifacts.
- **State Segregation**: HUD and Menu states are managed via React Context/Zustand and do not block the game loop. The game engine emits events or updates shared refs that React polls at low frequency, ensuring the high-frequency 60/144hz simulation loop never triggers React reconciliations.

## Simulation Loop & Collisions

- **Time-Based Logic**: The simulation loop uses a delta-time (`dt`) based approach. This decouples movement and physics from the display framerate, ensuring consistent game speed whether running on a 60Hz or 144Hz monitor.
- **Euclidean Vector Math**: Movement, steering, and aiming rely on pure trigonometric vector mathematics.
- **Circular Physics**: We abandoned AABB (Axis-Aligned Bounding Box) in favor of strictly circular collision boundaries (`distance < radiusA + radiusB`). This guarantees O(1) mathematical complexity for hit tests, ensuring stable performance even with dozens of projectiles and procedural islands in the viewport.

## Resource Management

- **Object Pooling**: Projectiles (cannonballs) and particle effects are extremely short-lived entities that usually cause massive Garbage Collection (GC) spikes. To mitigate this, we implemented an Object Pool for projectiles. Entities are deactivated, hidden, and reset upon expiration rather than destroyed and re-instantiated. 
- **Strict Teardown**: Upon unmount (e.g., when a match ends or React Strict Mode triggers), the engine performs a recursive teardown of all active textures, baseTextures, tickers, and DOM event listeners. This eliminates GPU memory leaks and orphaned loops.

## Local Persistence

- **Gameplay Options**: User configurations (such as session time and enemy spawn intervals) are managed via Zustand stores and persisted locally using `localStorage` bindings. This allows players to retain their preferred game settings across sessions without backend dependencies for trivial configurations.

## Ranking & History Integration

- **Mock Service Worker (MSW)**: The application uses MSW to intercept API calls at the network level. This allows for rigorous frontend testing of loading states, pagination, and network failures without relying on a live backend server.
- **TanStack Query**: Data fetching is fully delegated to TanStack Query. It manages the caching layer, background refetching, and deduping of requests for both the Ranking and Match History tables. 
- **Idempotent Submissions**: Match results are submitted with an idempotency key (the unique `matchId`). This ensures that network retries or component re-renders do not result in duplicate records on the server.
