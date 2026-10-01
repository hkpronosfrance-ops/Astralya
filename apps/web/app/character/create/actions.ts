"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CHARACTER_NAME = /^[\p{L}][\p{L}\p{N}' -]{2,15}$/u;

export async function createCharacter(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/auth");
  }

  const name = String(formData.get("name") ?? "").trim();

  if (!CHARACTER_NAME.test(name)) {
    redirect("/character/create?error=invalid_name");
  }

  const appearance = {
    body: "elyen",
    outfit: "elyndra_starter",
    hair: "default_01",
  };

  const { error } = await supabase.from("characters").insert({
    name,
    appearance,
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/character/create?error=name_or_character_exists");
    }

    redirect("/character/create?error=create_failed");
  }

  redirect("/");
}
