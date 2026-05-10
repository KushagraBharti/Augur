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

  return (
    <AppShell userEmail={email}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Augur Analyst</p>
          <h2>Agent Runs</h2>
          <p>Create a real queued run and inspect the production activity trace from Supabase.</p>
        </div>
      </header>

      <section className="runGrid">
        <form className="askPanel" onSubmit={createRun}>
          <div className="sectionHeader">
            <h3>Create Run</h3>
            <span>{mode.replace("_", " ")}</span>
          </div>
          <div className="modePicker" aria-label="Run mode">
            <button className={mode === "ask" ? "selected" : ""} onClick={() => setMode("ask")} type="button">
              Ask
            </button>
            <button className={mode === "live_monitor" ? "selected" : ""} onClick={() => setMode("live_monitor")} type="button">
              Live Monitor
            </button>
            <button className={mode === "replay_monitor" ? "selected" : ""} onClick={() => setMode("replay_monitor")} type="button">
              Replay
            </button>
          </div>
          <label>
            Business question
            <textarea onChange={(event) => setPrompt(event.target.value)} rows={7} value={prompt} />
          </label>
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
            <span>→</span>
          </button>
        </form>

        <section className="activityPanel">
          <div className="sectionHeader">
            <h3>Run History</h3>
            <span>{runs.length}</span>
          </div>
          <div className="runList">
            {runs.map((run) => (
              <Link className="runItem" href={`/runs/${run.id}`} key={run.id}>
                <span className={`checkBadge ${statusClass(run.status)}`}>{run.status}</span>
                <strong>{run.mode ?? "ask"} run</strong>
                <p>{cleanText(run.user_prompt, 180)}</p>
                <small>{formatDate(run.started_at)}</small>
              </Link>
            ))}
            {!runs.length ? <p className="mutedText">No runs yet. Queue the first Ask Mode run.</p> : null}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
