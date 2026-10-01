import { withSupabase } from "npm:@supabase/server";

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

    if (
      !Number.isInteger(targetX) ||
      !Number.isInteger(targetY) ||
      targetX < 0 ||
      targetX > 10 ||
      targetY < 0 ||
      targetY > 10
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

    const distance =
      Math.abs(targetX - character.grid_x) +
      Math.abs(targetY - character.grid_y);

    if (distance !== 1) {
      return Response.json(
        {
          error: "invalid_step",
          position: {
            x: character.grid_x,
            y: character.grid_y,
          },
        },
        { status: 409, headers: corsHeaders },
      );
    }

    const { data: updated, error: updateError } = await ctx.supabaseAdmin
      .from("characters")
      .update({
        grid_x: targetX,
        grid_y: targetY,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("grid_x", character.grid_x)
      .eq("grid_y", character.grid_y)
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
