import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn, signUp } from "./actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type AuthPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Entre un e-mail valide et un mot de passe d'au moins 8 caractères.",
  login_failed: "Connexion impossible. Vérifie ton e-mail et ton mot de passe.",
  signup_failed: "Création du compte impossible avec ces informations.",
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/");
  }

  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-mark">✦</div>
        <p className="eyebrow">ASTRALYA</p>
        <h1>Entre dans le monde astral</h1>
        <p className="muted">
          Crée ton compte ou reconnecte-toi pour retrouver ton personnage.
        </p>

        {error ? (
          <p className="form-error">{ERROR_MESSAGES[error] ?? "Une erreur est survenue."}</p>
        ) : null}

        <form className="auth-form">
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" required />
          </label>

          <label>
            Mot de passe
            <input
              name="password"
              type="password"
              minLength={8}
              autoComplete="current-password"
              required
            />
          </label>

          <div className="auth-actions">
            <button className="primary-button" formAction={signIn}>
              Se connecter
            </button>
            <button className="secondary-button" formAction={signUp}>
              Créer un compte
            </button>
          </div>
        </form>

        <Link className="subtle-link" href="/">
          Retour
        </Link>
      </section>
    </main>
  );
}
