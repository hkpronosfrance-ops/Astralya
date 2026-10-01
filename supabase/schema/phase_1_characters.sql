-- Astralya Phase 1 schema candidate.
-- This file is intentionally kept outside supabase/migrations until the Astralya
-- project is created/linked and a migration is generated through the Supabase CLI.

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  appearance jsonb not null default '{}'::jsonb,
  level smallint not null default 1 check (level between 1 and 100),
  xp bigint not null default 0 check (xp >= 0),
  hp integer not null default 100 check (hp >= 0),
  max_hp integer not null default 100 check (max_hp > 0 and hp <= max_hp),
  action_points smallint not null default 6 check (action_points >= 0),
  movement_points smallint not null default 3 check (movement_points >= 0),
  current_map text not null default 'elyndra_spawn',
  grid_x integer not null default 5,
  grid_y integer not null default 5,
  gold bigint not null default 0 check (gold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint characters_one_per_user unique (user_id),
  constraint characters_name_length check (char_length(name) between 3 and 16)
);

create unique index if not exists characters_name_lower_unique
  on public.characters (lower(name));

alter table public.characters enable row level security;

revoke all on table public.characters from anon, authenticated;
grant select on table public.characters to authenticated;
grant insert (name, appearance) on table public.characters to authenticated;

create policy "characters_select_own"
  on public.characters
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "characters_insert_own"
  on public.characters
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

comment on table public.characters is
  'Player-owned character identity and trusted progression state. Client writes are intentionally limited to creation columns.';
