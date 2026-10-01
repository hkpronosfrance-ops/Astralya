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

Astralya Supabase project: `ojyoisfbykoxqzaigcsb` in `eu-west-1`.

Recorded migrations:

- `20261001233355_phase_1_characters.sql`
- `20261001233434_secure_rls_auto_enable_function.sql`

Validation completed:

- `characters` exists with RLS enabled;
- ownership policies restrict reads/inserts to `auth.uid()`;
- authenticated clients only receive INSERT on `name` and `appearance`;
- no direct UPDATE grant is exposed to the browser;
- Supabase security advisors: clean;
- Supabase performance advisors: clean;
- generated TypeScript database types are committed under `apps/web/lib/database.types.ts`.
