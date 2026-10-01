import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-mark">✦</div>
        <p className="eyebrow">ASTRALYA</p>
        <h1>Vérifie ta boîte mail</h1>
        <p className="muted">
          Ton compte a été créé. Utilise le lien envoyé par Supabase pour confirmer
          ton adresse, puis reconnecte-toi.
        </p>
        <Link className="primary-button link-button" href="/auth">
          Revenir à la connexion
        </Link>
      </section>
    </main>
  );
}
