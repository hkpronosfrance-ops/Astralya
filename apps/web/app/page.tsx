import { redirect } from "next/navigation";
import { AstralyaGame } from "@/components/game/AstralyaGame";
import { SupabaseSetupNotice } from "@/components/system/SupabaseSetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./auth/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return <SupabaseSetupNotice />;
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/auth");
  }

  const { data: character, error: characterError } = await supabase
    .from("characters")
    .select("id, name, level, hp, max_hp, grid_x, grid_y")
    .maybeSingle();

  if (characterError) {
    throw new Error(`Unable to load character: ${characterError.message}`);
  }

  if (!character) {
    redirect("/character/create");
  }

  return (
    <main className="game-shell">
      <AstralyaGame
        displayName={character.name}
        level={character.level}
        hp={character.hp}
        maxHp={character.max_hp}
        startX={character.grid_x}
        startY={character.grid_y}
      />

      <form action={signOut} className="logout-form">
        <button className="hud-button" type="submit">
          Déconnexion
        </button>
      </form>
    </main>
  );
}
