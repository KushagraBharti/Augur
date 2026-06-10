"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/app-nav";
import { cleanText, formatDate, statusClass } from "../components/format";
import { getAuthHeaders, getSignedInUser } from "../lib/supabase-browser";

const defaultPrompt =
  "We want to develop three new retail centers in Texas this year. Compare Austin, Dallas, Houston, and San Antonio. Recommend where to start and flag policy risks.";

type Run = {
  id: string;
  status: string;
  mode?: string;
  user_prompt?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  reports?: Array<{ id: string; title?: string | null }>;
};

export default function RunsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [mode, setMode] = useState<"ask" | "live_monitor" | "replay_monitor">("ask");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadRuns() {
    const user = await getSignedInUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setEmail(user.email ?? null);
    const response = await fetch("/api/agent-runs", {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.error ?? "Could not load runs.");
    }
    setRuns(body.runs ?? []);
  }

  useEffect(() => {
    loadRuns().catch((error) => setMessage(error instanceof Error ? error.message : String(error)));
  }, []);

  async function createRun(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const replayEnd = new Date();
    replayEnd.setUTCHours(23, 59, 59, 999);
    const replayStart = new Date(replayEnd);
    replayStart.setUTCDate(replayStart.getUTCDate() - 90);
    replayStart.setUTCHours(0, 0, 0, 0);
    const response = await fetch("/api/agent-runs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({
        prompt,
        mode,
        signalWindow:
          mode === "replay_monitor"
            ? {
                from: replayStart.toISOString(),
                to: replayEnd.toISOString(),
                label: "Recent cached Texas public-record replay window",
              }
            : null,
      }),
    });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(body.error ?? "Run creation failed.");
      return;
    }
    router.push(`/runs/${body.run.id}`);
  }

  const activeRun = runs[0];
  const traceStatus = activeRun ? statusClass(activeRun.status) : "";

  return (
    <AppShell userEmail={email}>
      <header className="topbar commandTopbar">
        <div className="titleStack">
          <p className="breadcrumbLine">Texas Expansion Intelligence / Agent Runs</p>
          <p className="eyebrow">Augur Analyst</p>
          <h2>Agent Runs</h2>
          <p>Create a real queued run and inspect the production activity trace from Supabase.</p>
        </div>
        <div className="commandDock" aria-label="Run actions">
          <div className="commandSearch">
            <span />
            <p>Search runs, memos, sources</p>
            <kbd>K</kbd>
          </div>
          <div className="topbarActions">
            <Link className="secondaryLink" href="/diagnostics">
              Diagnostics
            </Link>
            <Link className="actionLink" href="#create-run">
              Run analysis
            </Link>
          </div>
        </div>
      </header>

      <section className="runGrid">
        <form className="askPanel runComposer" id="create-run" onSubmit={createRun}>
          <div className="sectionHeader">
            <div>
              <h3>Create Run</h3>
              <p className="sectionSubcopy">Select mode, confirm outputs, and queue Augur Analyst against public-data sources.</p>
            </div>
            <span>{modeLabel(mode)}</span>
          </div>
          <div className="modePicker" aria-label="Run mode">
            <button className={mode === "ask" ? "selected" : ""} onClick={() => setMode("ask")} type="button">
              <span className="modeIcon chatIcon" />
              Ask
            </button>
            <button className={mode === "live_monitor" ? "selected" : ""} onClick={() => setMode("live_monitor")} type="button">
              <span className="modeIcon pulseIcon" />
              Live Monitor
            </button>
            <button className={mode === "replay_monitor" ? "selected" : ""} onClick={() => setMode("replay_monitor")} type="button">
              <span className="modeIcon replayIcon" />
              Replay
            </button>
          </div>
          <div className="runChips" aria-label="Run context">
            <span>Texas Expansion</span>
            <span>4 cities</span>
            <span>Evidence-backed</span>
            <span>Priority medium</span>
          </div>
          <label>
            Business question
            <textarea onChange={(event) => setPrompt(event.target.value)} rows={6} value={prompt} />
          </label>
          <div className="runChecks" aria-label="Requested outputs">
            <span>Generate memo</span>
            <span>Score cities</span>
            <span>Include policy review</span>
            <span>Attach source coverage</span>
          </div>
          <div className="runConfig">
            <p>Run configuration</p>
            <div>
              <span>Agent</span>
              <strong>Augur Analyst</strong>
            </div>
            <div>
              <span>Evidence scope</span>
              <strong>Public data</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>Memo + scorecard</strong>
            </div>
            <div>
              <span>Runtime target</span>
              <strong>{mode === "replay_monitor" ? "90-day replay" : "Standard"}</strong>
            </div>
          </div>
          <p className="mutedText">
            {mode === "ask"
              ? "Prompt-driven analysis runner."
              : mode === "live_monitor"
                ? "Checks the latest public-record window and writes a monitor brief."
                : "Uses a historical public-record window without fake replay fixtures."}
          </p>
          {message ? <p className="formMessage">{message}</p> : null}
          <button className="primaryButton" disabled={busy} type="submit">
            <span>{busy ? "Queueing" : "Queue Augur Analyst"}</span>
            <span>›</span>
          </button>
        </form>

        <div className="runOpsStack">
          <section className="activityPanel runHistoryPanel">
            <div className="sectionHeader">
              <h3>Run History</h3>
              <span>{runs.length}</span>
            </div>
            {runs.length ? (
              <div className="runList">
                {runs.map((run) => (
                  <Link className="runItem" href={`/runs/${run.id}`} key={run.id}>
                    <span className={`checkBadge ${statusClass(run.status)}`}>{run.status}</span>
                    <strong>{modeLabel(run.mode ?? "ask")} run</strong>
                    <p>{cleanText(run.user_prompt, 180)}</p>
                    <small>{formatDate(run.started_at)}</small>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="runEmptyState" aria-label="No runs yet">
                <span className="emptyOrbit" />
                <strong>No runs yet.</strong>
                <p>Queue the first Ask Mode run.</p>
              </div>
            )}
          </section>

          <section className="activityPanel executionPanel">
            <div className="sectionHeader">
              <h3>Execution Trace</h3>
              <span className={traceStatus}>{activeRun?.status ?? "No run queued"}</span>
            </div>
            <ol className="traceList">
              {traceSteps(activeRun?.status).map((step) => (
                <li className={step.state} key={step.title}>
                  <span />
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="activityPanel starterPanel">
            <div className="sectionHeader">
              <div>
                <h3>Get started</h3>
                <p className="sectionSubcopy">Helpful tools and shortcuts to configure and run analyses.</p>
              </div>
            </div>
            <div className="starterGrid">
              <Link href="/diagnostics">
                <span className="starterIcon pulseIcon" />
                <strong>View agent diagnostics</strong>
                <p>Check agent health and configuration.</p>
              </Link>
              <Link href="/dashboard">
                <span className="starterIcon replayIcon" />
                <strong>Open monitor queue</strong>
                <p>Review live and queued analysis runs.</p>
              </Link>
              <Link href="/dashboard">
                <span className="starterIcon docIcon" />
                <strong>Review run outputs</strong>
                <p>Open reports and score snapshots.</p>
              </Link>
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}

function modeLabel(mode: string) {
  return mode.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function traceSteps(status?: string) {
  const current = (status ?? "").toLowerCase();
  const running = current && current !== "failed" && current !== "completed";
  const completed = current === "completed";
  const failed = current === "failed";
  const state = (index: number) => {
    if (!current) return "waiting";
    if (failed) return index === 0 ? "failed" : "waiting";
    if (completed) return "complete";
    return index === 0 || running ? "active" : "waiting";
  };

  return [
    { title: "Prompt accepted", detail: current ? "Run request is stored and ready for processing." : "Waiting for a run to be queued.", state: state(0) },
    { title: "Agent planning", detail: "Plan and break down the analysis.", state: state(1) },
    { title: "Source collection", detail: "Discover and retrieve relevant public sources.", state: state(2) },
    { title: "Scoring", detail: "Score cities across key dimensions.", state: state(3) },
    { title: "Memo generation", detail: "Generate memo and scorecard output.", state: state(4) },
  ];
}
