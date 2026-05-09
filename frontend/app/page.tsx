const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

export default function Home() {
  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Production bootstrap</p>
        <h1>Augur</h1>
        <p className="lead">
          Texas intelligence for retail landlords and real estate development teams.
        </p>
        <dl className="statusGrid">
          <div>
            <dt>Supabase</dt>
            <dd>{supabaseConfigured ? "Connected" : "Missing env"}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>Production</dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>Texas public-data signals</dd>
          </div>
        </dl>
        <a className="primaryLink" href="/diagnostics">
          Run API diagnostics
        </a>
      </section>
    </main>
  );
}
