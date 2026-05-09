import { runDiagnostics } from "../../lib/diagnostics";

export const dynamic = "force-dynamic";

const statusLabel = {
  pass: "Pass",
  warn: "Warn",
  fail: "Fail",
};

export default async function DiagnosticsPage() {
  const report = await runDiagnostics();

  const counts = report.checks.reduce(
    (acc, check) => {
      acc[check.status] += 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0 }
  );

  return (
    <main className="diagnosticsShell">
      <section className="diagnosticsHeader">
        <div>
          <p className="eyebrow">Setup diagnostics</p>
          <h1>API Key Health</h1>
          <p className="lead">
            Server-side checks for Augur credentials, seeded Supabase data, and
            public-source data shape. Secret values are not rendered.
          </p>
        </div>
        <div className={`overallBadge ${report.overallStatus}`}>
          {statusLabel[report.overallStatus]}
        </div>
      </section>

      <section className="summaryGrid" aria-label="Diagnostics summary">
        <div>
          <span>Passing</span>
          <strong>{counts.pass}</strong>
        </div>
        <div>
          <span>Warnings</span>
          <strong>{counts.warn}</strong>
        </div>
        <div>
          <span>Failing</span>
          <strong>{counts.fail}</strong>
        </div>
        <div>
          <span>Generated</span>
          <strong>{new Date(report.generatedAt).toLocaleString()}</strong>
        </div>
      </section>

      <section className="checksList" aria-label="Diagnostics checks">
        {report.checks.map((check) => (
          <article className="checkRow" key={check.id}>
            <header>
              <div>
                <p>{check.service}</p>
                <h2>{check.label}</h2>
              </div>
              <span className={`checkBadge ${check.status}`}>
                {statusLabel[check.status]}
              </span>
            </header>
            <p className="checkSummary">{check.summary}</p>
            <dl className="checkMeta">
              {typeof check.latencyMs === "number" ? (
                <div>
                  <dt>Latency</dt>
                  <dd>{check.latencyMs} ms</dd>
                </div>
              ) : null}
              {check.error ? (
                <div>
                  <dt>Error</dt>
                  <dd>{check.error}</dd>
                </div>
              ) : null}
            </dl>
            {check.details ? (
              <details className="jsonBlock">
                <summary>Details</summary>
                <pre>{JSON.stringify(check.details, null, 2)}</pre>
              </details>
            ) : null}
            {check.sample ? (
              <details className="jsonBlock">
                <summary>Sample data</summary>
                <pre>{JSON.stringify(check.sample, null, 2)}</pre>
              </details>
            ) : null}
          </article>
        ))}
      </section>

      <a className="apiLink" href="/api/diagnostics">
        Open raw JSON
      </a>
    </main>
  );
}
