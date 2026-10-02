import { withSupabase } from "npm:@supabase/server";

type GridPosition = {
  x: number;
  y: number;
};

const GRID_SIZE = 25;
const MAX_PATH_LENGTH = 64;

function gridKey(position: GridPosition) {
  return `${position.x},${position.y}`;
}

function isInsideMap(position: GridPosition) {
  return (
    position.x >= 0 &&
    position.x < GRID_SIZE &&
    position.y >= 0 &&
    position.y < GRID_SIZE
  );
}

function isBlockedCell(x: number, y: number) {
  if (x === 12 && y === 12) {
    return true;
  }

  if (
    (x === 8 && y === 8) ||
    (x === 16 && y === 8) ||
    (x === 8 && y === 16) ||
    (x === 16 && y === 16)
  ) {
    return true;
  }

  if ((x === 5 || x === 19) && y >= 7 && y <= 17 && ![9, 12, 15].includes(y)) {
    return true;
  }

  if ((y === 5 || y === 19) && x >= 7 && x <= 17 && ![9, 12, 15].includes(x)) {
    return true;
  }

  if (
    (x >= 2 && x <= 4 && y >= 2 && y <= 3) ||
    (x >= 20 && x <= 22 && y >= 2 && y <= 3) ||
    (x >= 2 && x <= 4 && y >= 21 && y <= 22) ||
    (x >= 20 && x <= 22 && y >= 21 && y <= 22)
  ) {
    return true;
  }

  return false;
}

function isWalkable(position: GridPosition) {
  return isInsideMap(position) && !isBlockedCell(position.x, position.y);
}

function getNeighbors(position: GridPosition) {
  return [
    { x: position.x + 1, y: position.y },
    { x: position.x - 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x, y: position.y - 1 },
  ].filter(isWalkable);
}

function buildPath(from: GridPosition, to: GridPosition) {
  if (!isWalkable(from) || !isWalkable(to)) {
    return [] as GridPosition[];
  }

  const startKey = gridKey(from);
  const targetKey = gridKey(to);
  const queue: GridPosition[] = [{ ...from }];
  const visited = new Set([startKey]);
  const previous = new Map<string, GridPosition>();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    if (gridKey(current) === targetKey) {
      const path: GridPosition[] = [];
      let cursor = { ...to };

      while (gridKey(cursor) !== startKey) {
        path.unshift(cursor);

        if (path.length > MAX_PATH_LENGTH) {
          return [];
        }

        const parent = previous.get(gridKey(cursor));

        if (!parent) {
          return [];
        }

        cursor = parent;
      }

      return path;
    }

    for (const neighbor of getNeighbors(current)) {
      const neighborKey = gridKey(neighbor);

      if (visited.has(neighborKey)) {
        continue;
      }

      visited.add(neighborKey);
      previous.set(neighborKey, current);
      queue.push(neighbor);
    }
  }

  return [] as GridPosition[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const protectedHandler = withSupabase(
  { auth: "user" },
  async (req: Request, ctx) => {
    if (req.method !== "POST") {
      return Response.json(
        { error: "method_not_allowed" },
        { status: 405, headers: corsHeaders },
      );
    }

    const body = await req.json().catch(() => null);
    const targetX = body?.target_x;
    const targetY = body?.target_y;
    const destination = { x: targetX, y: targetY };

    if (
      !Number.isInteger(targetX) ||
      !Number.isInteger(targetY) ||
      !isWalkable(destination)
    ) {
      return Response.json(
        { error: "invalid_destination" },
        { status: 400, headers: corsHeaders },
      );
    }

    const userId = ctx.userClaims?.id ?? ctx.jwtClaims?.sub;

    if (!userId) {
      return Response.json(
        { error: "not_authenticated" },
        { status: 401, headers: corsHeaders },
      );
    }

    const { data: character, error: readError } = await ctx.supabaseAdmin
      .from("characters")
      .select("grid_x, grid_y, current_map")
      .eq("user_id", userId)
      .maybeSingle();

    if (readError) {
      console.error("move-character-step read failed", readError);
      return Response.json(
        { error: "database_read_failed" },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!character) {
      return Response.json(
        { error: "character_not_found" },
        { status: 404, headers: corsHeaders },
      );
    }

    if (character.current_map !== "elyndra_spawn") {
      return Response.json(
        { error: "unsupported_map" },
        { status: 409, headers: corsHeaders },
      );
    }

    const start = {
      x: character.grid_x,
      y: character.grid_y,
    };

    const path = buildPath(start, destination);

    if (path.length === 0) {
      return Response.json(
        { error: "path_not_found", position: start },
        { status: 409, headers: corsHeaders },
      );
    }

    const { data: updated, error: updateError } = await ctx.supabaseAdmin
      .from("characters")
      .update({
        grid_x: destination.x,
        grid_y: destination.y,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("grid_x", start.x)
      .eq("grid_y", start.y)
      .select("grid_x, grid_y, current_map")
      .maybeSingle();

    if (updateError) {
      console.error("move-character-step update failed", updateError);
      return Response.json(
        { error: "database_update_failed" },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!updated) {
      return Response.json(
        { error: "movement_conflict" },
        { status: 409, headers: corsHeaders },
      );
    }

    return Response.json(
      {
        path,
        position: {
          x: updated.grid_x,
          y: updated.grid_y,
        },
        map: updated.current_map,
      },
      { headers: corsHeaders },
    );
  },
);

export default {
  fetch(req: Request) {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    return protectedHandler(req);
  },
};
