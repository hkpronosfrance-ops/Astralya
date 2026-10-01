import { redirect } from "next/navigation";
import { createCharacter } from "./actions";
import { createClient } from "@/lib/supabase/server";

type CharacterCreatePageProps = {
  searchParams: Promise<{ error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_name:
    "Le nom doit contenir entre 3 et 16 caractères et commencer par une lettre.",
  name_or_character_exists:
    "Ce nom est déjà utilisé, ou un personnage existe déjà sur ce compte.",
  create_failed: "Impossible de créer le personnage pour le moment.",
};

export default async function CharacterCreatePage({
  searchParams,
}: CharacterCreatePageProps) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/auth");
  }

  const { data: existingCharacter } = await supabase
    .from("characters")
    .select("id")
    .maybeSingle();

  if (existingCharacter) {
    redirect("/");
  }

  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card character-create-card">
        <div className="auth-mark">✦</div>
        <p className="eyebrow">CRÉATION DU PERSONNAGE</p>
        <h1>Ton histoire commence ici</h1>
        <p className="muted">
          Pour le prototype, nous créons d'abord un Elyen avec l'équipement
          d'Elyndra. La personnalisation complète arrivera dans une phase dédiée.
        </p>

        {error ? (
          <p className="form-error">{ERROR_MESSAGES[error] ?? "Une erreur est survenue."}</p>
        ) : null}

        <form className="auth-form">
          <label>
            Nom du personnage
            <input
              name="name"
              type="text"
              minLength={3}
              maxLength={16}
              autoComplete="off"
              placeholder="Ex. Hayati"
              required
            />
          </label>

          <button className="primary-button" formAction={createCharacter}>
            Créer mon personnage
          </button>
        </form>
      </section>
    </main>
  );
}
