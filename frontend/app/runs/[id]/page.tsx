"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "../../components/app-nav";
import { cleanText, confidenceConsequence, formatDate, statusClass } from "../../components/format";
import { getAuthHeaders, getSignedInUser } from "../../lib/supabase-browser";

type RunState = {
  run: {
    id: string;
    status: string;
    user_prompt?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    metadata_json?: { run_memory?: Array<Record<string, any>> } | null;
  };
  toolCalls: Array<Record<string, any>>;
  evidence: Array<Record<string, any>>;
  scores: Array<Record<string, any>>;
  report: { id: string; title?: string | null } | null;
};

const REQUIRED_TOOL_SEQUENCE = [
  "build_run_context",
  "get_company_dossier",
  "list_available_sources",
  "query_city_dataset",
  "inspect_city_record",
  "search_texas_bills",
  "search_tlo_rss",
  "get_texas_bill_documents",
  "search_lobby_activity",
  "search_campaign_finance",
  "web_research",
  "find_public_contact_paths",
  "draft_outreach_email",
  "draft_talking_points",
  "draft_social_campaign",
  "suggest_visual_assets",
  "update_signal_scores",
  "save_markdown_report",
];

export default function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [state, setState] = useState<RunState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      const user = await getSignedInUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? null);
      const response = await fetch(`/api/agent-runs/${id}`, {
        headers: await getAuthHeaders(),
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Could not load run.");
      }
      setState(body);
      if (body.run?.status === "queued" || body.run?.status === "running") {
        timer = setTimeout(load, 4000);
      }
    }

    load().catch((loadError) => setError(loadError instanceof Error ? loadError.message : String(loadError)));
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [id, router]);

  const failedCalls = state?.toolCalls?.filter((call) => call.status === "failed") ?? [];
  const runMemory = state?.run?.metadata_json?.run_memory ?? [];
  const successfulCalls = state?.toolCalls?.filter((call) => call.status === "success") ?? [];
  const draftArtifacts = extractDraftArtifacts(state?.toolCalls ?? []);
  const sourceCalls = (state?.toolCalls ?? []).filter((call) =>
    ["query_city_dataset", "inspect_city_record", "search_texas_bills", "search_tlo_rss", "get_texas_bill_documents", "search_lobby_activity", "search_campaign_finance", "web_research", "find_public_contact_paths"].includes(call.tool_name)
  );
  const progress = state
    ? state.run.status === "completed"
      ? 100
      : Math.min(100, Math.round((successfulCalls.length / REQUIRED_TOOL_SEQUENCE.length) * 100))
    : 0;
  const latestCall = [...(state?.toolCalls ?? [])].reverse().find((call) => call.status === "running") ?? [...(state?.toolCalls ?? [])].reverse()[0];
  const missingTools = REQUIRED_TOOL_SEQUENCE.filter((tool) => !(state?.toolCalls ?? []).some((call) => call.tool_name === tool && call.status === "success"));
  const phases = summarizeRunPhases(state?.toolCalls ?? []);

  return (
    <AppShell userEmail={email}>
      <header className="topbar commandTopbar">
        <div className="titleStack">
          <p className="breadcrumbLine">Texas Expansion Intelligence / Agent Runs / Run Detail</p>
          <p className="eyebrow">Activity trace</p>
          <h2>Run Detail</h2>
          <p>{state?.run ? cleanText(state.run.user_prompt, 360) : "Loading production run state."}</p>
        </div>
        <div className="commandDock" aria-label="Run detail actions">
          <div className="commandSearch">
            <span />
            <p>Search trace, sources, memory</p>
            <kbd>K</kbd>
          </div>
          <div className="topbarActions">
            <Link className="secondaryLink" href="/runs">
              All runs
            </Link>
            {state?.report ? (
              <Link className="actionLink" href={`/reports/${state.report.id}`}>
                Open report
              </Link>
            ) : (
              <Link className="actionLink" href="/runs">
                Run analysis
              </Link>
            )}
          </div>
        </div>
      </header>

      {error ? <div className="errorBanner">{error}</div> : null}
      {!state ? <div className="skeletonRow" /> : null}

      {state ? (
        <>
          <section className="summaryStrip runSummaryStrip">
            <div className="statusSummaryCard">
              <span>Status</span>
              <strong className={statusClass(state.run.status)}>{state.run.status}</strong>
            </div>
            <div>
              <span>Started</span>
              <strong>{formatDate(state.run.started_at)}</strong>
            </div>
            <div>
              <span>Completed</span>
              <strong>{formatDate(state.run.completed_at)}</strong>
            </div>
            <div>
              <span>Evidence rows</span>
              <strong>{state.evidence.length}</strong>
            </div>
          </section>

          <section className="runProgressPanel">
            <div>
              <span>Augur Analyst progress</span>
              <strong>{progress}%</strong>
            </div>
            <meter min={0} max={100} value={progress} />
            <p>
              {state.run.status === "completed"
                ? "Source checks, scores, draft artifacts, and final memo have been persisted."
                : `Current stage: ${cleanText(latestCall?.tool_name?.replaceAll("_", " ") ?? "queued", 80)}. The worker is calling bounded public-data tools and persisting evidence.`}
            </p>
          </section>

          <section className="phaseRail" aria-label="Run phase coverage">
            {phases.map((phase) => (
              <div className={phase.failed ? "phaseBlock failSoft" : phase.done ? "phaseBlock passSoft" : "phaseBlock"} key={phase.label}>
                <span>{phase.label}</span>
                <strong>{phase.done}/{phase.total}</strong>
              </div>
            ))}
          </section>

          {failedCalls.length ? (
            <section className="errorBanner">
              Failed source calls are visible below. Their consequence is reduced confidence and no source-success claims for those categories.
            </section>
          ) : state.run.status === "failed" ? (
            <section className="errorBanner">The run failed before saving a final report. No generated backup report was created.</section>
          ) : null}

          <section className="runDetailGrid commandRunDetailGrid">
            <article className="activityPanel timelinePanel">
              <div className="sectionHeader">
                <div>
                  <h3>Analyst Timeline</h3>
                  <p className="sectionSubcopy">Validated model actions and local tool execution, in persisted order.</p>
                </div>
                <span>{successfulCalls.length}/{REQUIRED_TOOL_SEQUENCE.length}</span>
              </div>
              <ol className="activityList">
                {state.toolCalls.map((call) => (
                  <li key={call.id}>
                    <span>{call.step_index}</span>
                    <div>
                      <strong>{call.tool_name}</strong>
                      <p>{cleanText(call.output_summary ?? call.error_message, 520)}</p>
                      <small className={`checkBadge ${statusClass(call.status)}`}>{call.status}</small>
                      {call.status === "failed" ? <p className="failureConsequence">{confidenceConsequence(call)}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <aside className="runDetailStack">
              <div className="sectionHeader">
                <div>
                  <h3>Source Timeline</h3>
                  <p className="sectionSubcopy">Public-data and contact/source checks used by the report.</p>
                </div>
                <span>{sourceCalls.length}</span>
              </div>
              <div className="sourceTimeline">
                {sourceCalls.map((call) => (
                  <div key={`source-${call.id}`}>
                    <strong>{call.tool_name.replaceAll("_", " ")}</strong>
                    <p>{cleanText(call.output_summary ?? call.error_message, 220)}</p>
                    <small className={`checkBadge ${statusClass(call.status)}`}>{call.status}</small>
                  </div>
                ))}
                {!sourceCalls.length ? <p className="mutedText">Source calls appear as the analyst reaches public-data collection.</p> : null}
              </div>
            </aside>

            <aside className="runDetailStack">
              <div className="sectionHeader">
                <div>
                  <h3>Score Updates</h3>
                  <p className="sectionSubcopy">Bounded city-level score writes tied to this run.</p>
                </div>
                <span>{state.scores.length}</span>
              </div>
              <div className="scoreUpdateList scoreCardsList">
                {state.scores.map((score) => (
                  <div key={score.id ?? score.city}>
                    <strong>{score.city}</strong>
                    <p>
                      Momentum {score.development_momentum} · Zoning {score.zoning_friction}
                      <br />
                      Code {score.code_occupancy_risk} · Policy {score.policy_risk}
                    </p>
                    <small>{cleanText(score.reasoning_summary, 170) || "Pending verification"}</small>
                  </div>
                ))}
                {!state.scores.length ? <p className="mutedText">No score updates have been written yet.</p> : null}
              </div>
            </aside>

            <aside className="runDetailStack">
              <div className="sectionHeader">
                <div>
                  <h3>Drafted Artifacts</h3>
                  <p className="sectionSubcopy">Human-reviewed assets only. Nothing is sent or posted.</p>
                </div>
                <span>{draftArtifacts.length}</span>
              </div>
              <div className="artifactList">
                {draftArtifacts.map((artifact) => (
                  <div key={artifact.name}>
                    <strong>{artifact.label}</strong>
                    <p>{cleanText(artifact.summary, 240)}</p>
                    <small>Review required. Nothing was sent or posted.</small>
                  </div>
                ))}
                {!draftArtifacts.length ? <p className="mutedText">No drafted artifacts yet.</p> : null}
              </div>
            </aside>

            <aside className="runDetailStack memoryPanel">
              <div className="sectionHeader">
                <div>
                  <h3>Run Memory</h3>
                  <p className="sectionSubcopy">Context that later model calls can receive because models are stateless.</p>
                </div>
                <span>{runMemory.length}</span>
              </div>
              <div className="scoreUpdateList memoryList">
                {runMemory.slice(-8).map((event, index) => (
                  <div key={`${event.at ?? "memory"}-${index}`}>
                    <strong>{cleanText(event.type ?? event.tool_name ?? "memory", 80)}</strong>
                    <p>{cleanText(event.summary ?? event.error, 260)}</p>
                    <small>{event.at ? formatDate(event.at) : "persisted state"}</small>
                  </div>
                ))}
                {!runMemory.length ? <p className="mutedText">Run memory will appear as the analyst context, tools, evidence, scores, and report request are persisted.</p> : null}
              </div>
            </aside>

            <aside className="runDetailStack">
              <div className="sectionHeader">
                <div>
                  <h3>Evidence</h3>
                  <p className="sectionSubcopy">Source rows and public URLs supporting the memo.</p>
                </div>
                <span>{state.evidence.length}</span>
              </div>
              <div className="evidenceList compactEvidenceList">
                {state.evidence.slice(0, 5).map((item) => (
                  <a href={item.source_url ?? "#"} key={item.id} rel="noreferrer" target="_blank">
                    <strong>{cleanText(item.title ?? item.source_name ?? "Evidence item", 130)}</strong>
                    <p>{cleanText(item.excerpt ?? item.summary ?? item.metadata_json?.summary, 180)}</p>
                    <span>{cleanText(item.source_name ?? item.source_url ?? "public source", 90)}</span>
                  </a>
                ))}
                {!state.evidence.length ? <p className="mutedText">No evidence rows have been written yet.</p> : null}
              </div>
            </aside>

            <aside className="runDetailStack workflowPanel">
              <div className="sectionHeader">
                <div>
                  <h3>Remaining workflow</h3>
                  <p className="sectionSubcopy">Required bounded tools not yet completed for this run.</p>
                </div>
                <span>{missingTools.length}</span>
              </div>
              {missingTools.length && state.run.status !== "completed" ? (
                <ul className="workflowList">
                  {missingTools.slice(0, 8).map((tool) => (
                    <li key={tool}>{tool.replaceAll("_", " ")}</li>
                  ))}
                </ul>
              ) : (
                <p className="mutedText">All required workflow stages are complete.</p>
              )}
            </aside>
          </section>

          {missingTools.length && state.run.status !== "completed" ? (
            <section className="missingToolList runDetailRemaining">
              <strong>Full remaining workflow</strong>
              <p>{missingTools.map((tool) => tool.replaceAll("_", " ")).join(", ")}</p>
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}

function summarizeRunPhases(toolCalls: Array<Record<string, any>>) {
  const groups = [
    { label: "Context", tools: ["build_run_context", "get_company_dossier", "list_available_sources"] },
    { label: "Public Sources", tools: ["query_city_dataset", "inspect_city_record", "search_texas_bills", "search_tlo_rss", "get_texas_bill_documents", "search_lobby_activity", "search_campaign_finance", "web_research"] },
    { label: "Response Assets", tools: ["find_public_contact_paths", "draft_outreach_email", "draft_talking_points", "draft_social_campaign", "suggest_visual_assets"] },
    { label: "Scores + Memo", tools: ["update_signal_scores", "save_markdown_report"] },
  ];
  return groups.map((group) => {
    const calls = toolCalls.filter((call) => group.tools.includes(call.tool_name));
    return {
      label: group.label,
      total: group.tools.length,
      done: calls.filter((call) => call.status === "success").length,
      failed: calls.some((call) => call.status === "failed"),
    };
  });
}

function extractDraftArtifacts(toolCalls: Array<Record<string, any>>) {
  const labels: Record<string, string> = {
    find_public_contact_paths: "Contact Paths",
    draft_outreach_email: "Draft Outreach Email",
    draft_talking_points: "Draft Talking Points",
    draft_social_campaign: "Public Messaging Concepts",
    suggest_visual_assets: "Visual Asset Suggestions",
  };

  return toolCalls
    .filter((call) => labels[call.tool_name] && call.status === "success")
    .map((call) => ({
      name: call.tool_name,
      label: labels[call.tool_name],
      summary: call.output_summary ?? call.output_json?.summary ?? "Created reviewed artifact.",
    }));
}
