create or replace function public.move_character_step(
  target_x integer,
  target_y integer
)
returns table (
  grid_x integer,
  grid_y integer,
  current_map text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  uid uuid := auth.uid();
  current_x integer;
  current_y integer;
  map_name text;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if target_x < 0 or target_x > 10 or target_y < 0 or target_y > 10 then
    raise exception 'destination_out_of_bounds' using errcode = '22023';
  end if;

  select c.grid_x, c.grid_y, c.current_map
    into current_x, current_y, map_name
  from public.characters c
  where c.user_id = uid
  for update;

  if not found then
    raise exception 'character_not_found' using errcode = 'P0002';
  end if;

  if map_name <> 'elyndra_spawn' then
    raise exception 'unsupported_map' using errcode = '22023';
  end if;

  if abs(target_x - current_x) + abs(target_y - current_y) <> 1 then
    raise exception 'invalid_step' using errcode = '22023';
  end if;

  update public.characters c
  set
    grid_x = target_x,
    grid_y = target_y,
    updated_at = now()
  where c.user_id = uid;

  return query
  select target_x, target_y, map_name;
end;
$function$;

revoke all on function public.move_character_step(integer, integer) from public;
revoke all on function public.move_character_step(integer, integer) from anon;
grant execute on function public.move_character_step(integer, integer) to authenticated;

comment on function public.move_character_step(integer, integer) is
  'Authoritative single-cell movement step for the authenticated user. Validates map bounds and Manhattan adjacency before persisting position.';
