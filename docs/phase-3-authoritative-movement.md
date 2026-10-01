# Phase 3 — Authoritative movement

## Flow

1. Player clicks a destination cell.
2. Client computes an orthogonal route.
3. Before every visual step, the browser calls the authenticated Supabase Edge Function `move-character-step`.
4. The Edge Function reads the current persisted position using the server-only admin client.
5. It accepts only a Manhattan-adjacent cell inside the 11×11 Elyndra prototype map.
6. It persists the accepted coordinate.
7. Only then does PixiJS animate the step.

## Security

- The browser still has no direct `UPDATE` grant on `characters`.
- Movement authority lives in the Edge Function.
- The Edge Function is authenticated with the player's session JWT.
- Database writes use Supabase's server-only admin context.
- The original public `SECURITY DEFINER` movement RPC was removed after the Edge Function was deployed.
- Direct jumps such as `(5,5) → (0,10)` are rejected because every accepted request must move exactly one orthogonal cell.

## Production state

Edge Function: `move-character-step`

Recorded migrations:
- `20261001235520_phase_3_authoritative_movement.sql`
- `20261001235619_phase_3_remove_direct_movement_rpc.sql`

The first migration is retained because it exists in production history; the second removes that transient RPC so fresh environments converge to the same final schema.
