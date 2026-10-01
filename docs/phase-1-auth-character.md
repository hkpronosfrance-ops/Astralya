# Phase 1 — Auth & Character

## Goal

Introduce account authentication and a single persistent character without giving the browser authority over trusted game progression.

## Auth

The web app follows the current Supabase SSR model:

- `@supabase/ssr` with cookie-backed sessions.
- Next.js `proxy.ts` refreshes auth tokens.
- Server-side identity checks use `supabase.auth.getClaims()`.
- The browser only receives the publishable key.

## Character security

For the Phase 1 prototype each account can own exactly one character.

Authenticated users may:

- read their own character;
- insert only `name` and `appearance` when creating it.

Authenticated browser clients may **not** directly update:

- level / XP;
- health;
- PA / PM;
- position / map;
- gold.

Those fields are reserved for the authoritative game server in later phases.

## Database status

`supabase/schema/phase_1_characters.sql` is a schema candidate, not a recorded migration. Once an Astralya Supabase project exists, create the migration through the Supabase CLI, apply it to the project, run security/performance advisors, then verify cross-user isolation.
