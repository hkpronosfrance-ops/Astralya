# Phase 5 — Camera & expanded Elyndra

## Goal

Move from a small fit-to-screen prototype board to a larger explorable district with a camera that follows the player.

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

## Movement

- BFS pathfinding still uses orthogonal neighbors.
- Expanded obstacle layout is shared conceptually between the client map and the server movement validator.
- `move-character-step` Edge Function version 3 validates coordinates in the 25×25 map and rejects blocked cells.
- Movement remains server-authoritative and persistent.

## Transitions

The four edge gates are visual/preparatory only in Phase 5. Actual map transitions are deferred to the next zone-system phase.
