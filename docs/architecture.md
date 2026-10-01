# Astralya — Architecture v0.1

## Applications

- `apps/web`: Next.js + PixiJS browser client.
- `apps/game-server`: authoritative game server foundation.
- `packages/shared`: shared TypeScript contracts and core rules.
- `supabase/`: database migrations and local Supabase configuration (added when the project is linked).

## Authority model

The browser renders the world and sends player intentions. It must never decide trusted outcomes such as inventory mutations, rewards, combat damage, movement legality, or currency changes.

The game server will become authoritative for real-time gameplay. Supabase will provide authentication and persistent PostgreSQL storage.

## Phase 0 scope

- Monorepo foundation.
- Responsive Next.js client.
- PixiJS v8 renderer.
- Procedural isometric test grid.
- Player placeholder and lightweight HUD.
- Minimal Node health server.
- Shared game types.

No production gameplay or database schema is introduced in this phase.
