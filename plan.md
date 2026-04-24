## Goal
Build a polished client-side Snake game in Next.js featuring randomized valid obstacle layouts each game, multiple visually distinct special beans, persistent local leaderboard history, and responsive controls for both desktop keyboards and mobile via an on-screen D-pad.

## Context
The request is for a fully client-side game implemented in Next.js. The game should support repeatable play sessions with per-game randomized obstacle placement that always yields a valid playable layout, include at least three distinct special bean types with different visuals and likely gameplay effects, persist leaderboard/history data locally in the browser, and provide responsive controls that work well on both desktop and mobile.

Because no workspace files or existing codebase were provided, this plan assumes a greenfield implementation inside a Next.js app using client components and browser storage APIs.

## Acceptance Criteria
- AC-1: A playable Snake game is implemented as a client-side Next.js experience without requiring a backend service.
- AC-2: Each new game generates a randomized obstacle layout that does not create an unwinnable or immediately invalid board state for the snake spawn and food spawning.
- AC-3: Standard food and at least three visually distinct special bean types appear in gameplay.
- AC-4: Each special bean type has a clearly defined gameplay effect and distinct visual treatment that is recognizable during play.
- AC-5: The snake can be controlled via keyboard on desktop using expected directional keys.
- AC-6: A touch-friendly on-screen D-pad is available and usable on mobile/tablet layouts.
- AC-7: The layout adapts responsively so gameplay and controls remain usable across common mobile and desktop viewport sizes.
- AC-8: Game-over results are saved to persistent local browser storage and displayed in a leaderboard/history view across page reloads.
- AC-9: Leaderboard/history entries include enough data to distinguish sessions, such as score and timestamp.
- AC-10: The game presents polished UI feedback for core states such as start, active play, pause/restart, and game over.
- AC-11: The game prevents invalid input behavior such as instantaneous reversal into the snake’s own body when standard snake rules disallow it.
- AC-12: Food and special beans never spawn on the snake body or obstacle tiles.

## Implementation Notes
- Use a client component for the game loop and input handling, likely driven by `requestAnimationFrame` or a controlled interval/tick model.
- Represent the board as a grid with deterministic state objects for snake segments, obstacles, empty cells, standard food, and special beans.
- For obstacle generation, create randomized layouts with validation logic:
  - Ensure the snake spawn area is clear.
  - Ensure at least one reachable valid path region exists for food spawning and movement.
  - Ensure obstacle density remains bounded to preserve playability.
- Use a path/reachability check such as flood fill/BFS from the initial snake head position to validate open-space connectivity after obstacles are placed.
- Define at least three special bean types, for example:
  - Speed bean: temporarily increases movement speed.
  - Bonus bean: grants extra points.
  - Shrink or ghost bean: temporarily alters collision/body length behavior.
- Store leaderboard/history in `localStorage` with a versioned schema to support future updates safely.
- Handle SSR carefully in Next.js by isolating browser-only APIs (`window`, `localStorage`, touch events) to client-side code.
- Prefer accessible button sizing and clear directional affordances for the mobile D-pad.
- Add visual polish through animation, color differentiation, score HUD, and clear state messaging, while keeping performance smooth on mobile devices.
- Consider extracting reusable logic into modules such as:
  - game state reducer/engine
  - obstacle generation and validation
  - bean spawning/effects
  - leaderboard persistence helpers
  - responsive control components
- If using TypeScript, define explicit types for board coordinates, entity types, game phases, and leaderboard records.

## Out of Scope
- Online multiplayer or shared/global leaderboards
- Backend APIs, databases, or user authentication
- AI/autoplay snake behavior
- Level editor or custom obstacle authoring UI
- Monetization, ads, or analytics integrations
- Native mobile app packaging
- Complex audio system beyond basic optional game sound effects