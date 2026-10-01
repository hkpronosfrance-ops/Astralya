# Phase 2 — Isometric movement

## Scope

- Load the persisted spawn coordinates from Supabase.
- Make the PixiJS isometric grid interactive.
- Highlight hoverable cells.
- Click/tap a destination cell.
- Build a deterministic orthogonal path.
- Animate the player cell-by-cell.
- Expose local coordinates in the HUD for QA.

## Security boundary

The browser does **not** persist movement in this phase.

The authenticated role still has no UPDATE permission on `characters.grid_x`, `grid_y`, or `current_map`. Supabase remains the trusted persistent spawn state.

The animated movement is intentionally local-only until an authoritative movement endpoint/server validates and persists movement in a later phase.
