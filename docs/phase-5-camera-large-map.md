# Phase 5 — Camera & expanded Elyndra

## Goal

Move from a small fit-to-screen prototype board to a larger explorable district with a camera that follows the player, while keeping movement fast and server-authoritative.

## Map

- `elyndra_spawn` expands from 11×11 to 25×25 cells.
- The current saved character position remains valid.
- The map now includes:
  - central Place Astrale;
  - northern terraces;
  - eastern district;
  - southern suspended gardens;
  - western promenade;
  - four transition-gate markers reserved for later inter-zone travel.

## Camera

The whole map is no longer scaled down to fit the viewport.

- desktop scale: ~0.92;
- medium screens: ~0.82;
- mobile: ~0.72;
- camera continuously follows the PixiJS player container;
- movement stays centered while the world moves around the player;
- resize updates scale and recenters immediately.

## Movement v2

The initial authoritative implementation validated every single tile with a separate network request. It was secure but too slow on a large map.

Phase 5 now uses a destination-based authoritative flow:

1. player clicks one destination;
2. the browser sends one authenticated request;
3. the Edge Function computes the BFS path server-side using the trusted collision map;
4. the server persists only the approved destination;
5. the server returns the complete approved path;
6. PixiJS animates that path locally at ~60 ms per tile.

This removes per-tile network latency while preserving server authority.

## Security

- the browser still has no direct UPDATE grant on `characters`;
- the server computes the route and rejects blocked/unreachable destinations;
- database persistence uses the authenticated user's current position as an optimistic-concurrency condition;
- concurrent or stale movement requests are rejected;
- path length is bounded;
- `move-character-step` Edge Function version 4 handles destination-based movement.

## Transitions

The four edge gates are visual/preparatory only in Phase 5. Actual map transitions are deferred to the next zone-system phase.
