"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/app-nav";
import { cleanText, formatDate, statusClass } from "../components/format";
import { TexasMap } from "../components/texas-map";
import { getAuthHeaders, getSignedInUser } from "../lib/supabase-browser";

type DashboardState = {
  company: { name: string };
  latestRun: { id: string; status: string; started_at?: string | null; user_prompt?: string | null } | null;
  latestMonitor: { id: string; mode?: string; status: string; started_at?: string | null; final_summary?: string | null } | null;
  latestReport: { id: string; title?: string | null; created_at?: string | null; markdown?: string | null; summary_json?: Record<string, any> | null } | null;
  scores: Array<Record<string, any>>;
  sources?: Array<Record<string, any>>;
  targetCities?: string[];
  onboarding?: { usingDemo?: boolean };
};

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("Austin");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const user = await getSignedInUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? null);
      const response = await fetch("/api/dashboard", {
        headers: await getAuthHeaders(),
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Dashboard failed to load.");
      }
      if (body?.onboarding?.usingDemo) {
        router.replace("/onboarding");
        return;
      }
      setState(body);
    }
    load().catch((loadError) => setError(loadError instanceof Error ? loadError.message : String(loadError)));
  }, [router]);

  const selectedScore = state?.scores?.find((score) => score.city === selectedCity) ?? state?.scores?.[0];
  const sortedScores = [...(state?.scores ?? [])].sort((a, b) => Number(b.confidence ?? 0) - Number(a.confidence ?? 0));
  const topCity = sortedScores[0];
  const averageConfidence = state?.scores?.length
    ? Math.round(state.scores.reduce((sum, score) => sum + Number(score.confidence ?? 0), 0) / state.scores.length)
    : 0;
  const sourceMix = summarizeSources(state?.sources ?? []);

  return (
    <AppShell userEmail={email}>
      <header className="topbar commandTopbar">
        <div>
          <p className="eyebrow">{state?.company?.name ?? "Company workspace"}</p>
          <h2>Overview</h2>
          <p>Texas public-data operations console for expansion signals, monitor status, source coverage, and evidence-backed analyst output.</p>
        </div>
        <div className="topbarActions">
          {state?.latestReport ? (
            <Link className="secondaryLink" href={`/reports/${state.latestReport.id}`}>
              Latest memo
            </Link>
          ) : null}
          <Link className="actionLink" href="/runs">
            Run analysis
          </Link>
        </div>
      </header>

      {error ? <div className="errorBanner">{error}</div> : null}
      {!state ? <div className="skeletonRow" /> : null}

      {state ? (
        <>
          <section className="opsStrip">
            <div>
              <span>Best current read</span>
              <strong>{topCity?.city ?? "pending"}</strong>
            </div>
            <div>
              <span>Avg confidence</span>
              <strong>{averageConfidence}%</strong>
            </div>
            <div>
              <span>Monitor</span>
              <strong className={state.latestMonitor ? statusClass(state.latestMonitor.status) : ""}>{state.latestMonitor?.status ?? "not run"}</strong>
            </div>
            <div>
              <span>Source classes</span>
              <strong>{sourceMix.length}</strong>
            </div>
          </section>

          <section className="overviewGrid">
            <div className="mapPanel">
              <div className="sectionHeader">
                <div>
                  <h3>Texas Signal Map</h3>
                  <p className="sectionSubcopy">Austin is deepest; Dallas and San Antonio are comparable; Houston stays lower confidence unless live coverage improves.</p>
                </div>
                <span>{selectedCity}</span>
              </div>
              <TexasMap selectedCity={selectedCity} onSelectCity={setSelectedCity} />
            </div>
            <aside className="cityPanel">
              <div className="sectionHeader">
                <div>
                  <h3>{selectedScore?.city ?? "City"} Signal</h3>
                  <p className="sectionSubcopy">Compressed score read from the latest evidence-backed run.</p>
                </div>
                <span>{selectedScore?.confidence ?? 0}% confidence</span>
              </div>
              <ScoreRows score={selectedScore} />
              <p className="reasoning">{cleanText(selectedScore?.reasoning_summary, 420)}</p>
            </aside>
          </section>

          <section className="productGrid">
            <article className="activityPanel">
              <div className="sectionHeader">
                <div>
                  <h3>Latest Analyst Run</h3>
                  <p className="sectionSubcopy">Bounded tools, evidence, score writes, and final memo generation.</p>
                </div>
                {state.latestRun ? <span className={statusClass(state.latestRun.status)}>{state.latestRun.status}</span> : <span>None</span>}
              </div>
              {state.latestRun ? (
                <>
                  <p>{cleanText(state.latestRun.user_prompt, 260)}</p>
                  <p className="mutedText">{formatDate(state.latestRun.started_at)}</p>
                  <Link className="textLink" href={`/runs/${state.latestRun.id}`}>
                    View activity trace
                  </Link>
                </>
              ) : (
                <p className="mutedText">No Augur Analyst run has been created for this company yet.</p>
              )}
            </article>
            <article className="reportPanel compact">
              <div className="sectionHeader">
                <div>
                  <h3>Latest Intelligence Memo</h3>
                  <p className="sectionSubcopy">{cleanText(state.latestReport?.summary_json?.generated_by ?? "Model-authored report", 80)}</p>
                </div>
                {state.latestReport ? <span>{formatDate(state.latestReport.created_at)}</span> : <span>None</span>}
              </div>
              {state.latestReport ? (
                <>
                  <h4>{state.latestReport.title ?? "Latest Augur report"}</h4>
                  <p>{cleanText(state.latestReport.markdown, 520)}</p>
                  <Link className="textLink" href={`/reports/${state.latestReport.id}`}>
                    Open readable report
                  </Link>
                </>
              ) : (
                <p className="mutedText">Reports appear after a completed source-backed run.</p>
              )}
            </article>
            <article className="activityPanel">
              <div className="sectionHeader">
                <div>
                  <h3>Monitor Status</h3>
                  <p className="sectionSubcopy">Daily signal brief path for changes and threshold checks.</p>
                </div>
                {state.latestMonitor ? <span className={statusClass(state.latestMonitor.status)}>{state.latestMonitor.status}</span> : <span>Not run</span>}
              </div>
              {state.latestMonitor ? (
                <>
                  <p>{cleanText(state.latestMonitor.final_summary ?? `${state.latestMonitor.mode} is available from the run trace.`, 260)}</p>
                  <p className="mutedText">{formatDate(state.latestMonitor.started_at)}</p>
                  <Link className="textLink" href={`/runs/${state.latestMonitor.id}`}>
                    Open monitor trace
                  </Link>
                </>
              ) : (
                <>
                  <p className="mutedText">Live and replay monitor runs can be queued from Agent Runs.</p>
                  <Link className="textLink" href="/runs">
                    Queue monitor
                  </Link>
                </>
              )}
            </article>
          </section>

          <section className="intelGrid">
            <article className="activityPanel">
              <div className="sectionHeader">
                <div>
                  <h3>City Signal Board</h3>
                  <p className="sectionSubcopy">Scores are directional indicators, not magic rankings.</p>
                </div>
                <span>{state.scores.length} cities</span>
              </div>
              <div className="signalTable">
                <div className="signalTableHead">
                  <span>City</span>
                  <span>Momentum</span>
                  <span>Zoning</span>
                  <span>Code</span>
                  <span>Policy</span>
                  <span>Confidence</span>
                </div>
                {state.scores.map((score) => (
                  <button className={score.city === selectedCity ? "selected" : ""} key={score.city} onClick={() => setSelectedCity(score.city)} type="button">
                    <strong>{score.city}</strong>
                    <span>{score.development_momentum}</span>
                    <span>{score.zoning_friction}</span>
                    <span>{score.code_occupancy_risk}</span>
                    <span>{score.policy_risk}</span>
                    <span>{score.confidence}</span>
                  </button>
                ))}
              </div>
            </article>

            <aside className="activityPanel">
              <div className="sectionHeader">
                <div>
                  <h3>Source Coverage</h3>
                  <p className="sectionSubcopy">Active public sources available to Augur Analyst.</p>
                </div>
                <span>{state.sources?.length ?? 0}</span>
              </div>
              <div className="sourceMix dashboardMix">
                {sourceMix.map((item) => (
                  <div key={item.type}>
                    <span>{item.type}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
              <div className="sourceCoverageList">
                {(state.sources ?? []).slice(0, 8).map((source) => (
                  <div key={`${source.name}-${source.dataset_id ?? source.city ?? source.source_type}`}>
                    <strong>{source.name}</strong>
                    <p>{[source.city, source.source_type, source.access_method].filter(Boolean).join(" / ")}</p>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}

function summarizeSources(sources: Array<Record<string, any>>) {
  const counts = new Map<string, number>();
  for (const source of sources) {
    const type = cleanText(source.source_type ?? "source", 48);
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

function ScoreRows({ score }: { score?: Record<string, any> }) {
  const rows = [
    ["Development momentum", score?.development_momentum ?? 0],
    ["Zoning friction", score?.zoning_friction ?? 0],
    ["Code/occupancy risk", score?.code_occupancy_risk ?? 0],
    ["Policy risk", score?.policy_risk ?? 0],
    ["Confidence", score?.confidence ?? 0],
  ];

  return (
    <div className="scoreRows">
      {rows.map(([label, value]) => (
        <div className="scoreRow" key={label}>
          <div>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
          <meter min={0} max={100} value={Number(value)} />
        </div>
      ))}
    </div>
  );
}
