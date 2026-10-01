export function SupabaseSetupNotice() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-mark">✦</div>
        <p className="eyebrow">ASTRALYA — PHASE 1</p>
        <h1>Connexion Supabase requise</h1>
        <p className="muted">
          Le client PixiJS est prêt. Pour activer les comptes et les personnages,
          configure NEXT_PUBLIC_SUPABASE_URL et
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
        </p>
      </section>
    </main>
  );
}
