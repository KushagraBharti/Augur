import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const TARGET_CITIES = ["Austin", "Dallas", "Houston", "San Antonio"];

const CORE_PROMPT =
  "We want to develop three new retail centers in Texas this year. Compare Austin, Dallas, Houston, and San Antonio. Recommend where to start and flag policy risks.";

const MODE_CONFIG = {
  ask: {
    mode: "analysis_runner",
    reportType: "expansion_brief",
    title: "Texas Expansion Brief",
    objective:
      "Answer a user-directed expansion question with a source-backed recommendation, city comparison, policy risk readout, and response plan.",
    requiredOutput:
      "consultant-grade expansion memo with recommendation, assumptions, city comparison, risks, response assets, evidence, confidence, and next actions",
  },
  live_monitor: {
    mode: "live_monitor",
    reportType: "daily_monitor",
    title: "Daily Texas Signal Brief",
    objective:
      "Scan the latest available public records and decide whether any company-relevant signal clears the threshold for a brief or score update.",
    requiredOutput:
      "monitor brief with severity, changed records, affected geography, evidence, recommended response, confidence, and next check",
  },
  replay_monitor: {
    mode: "replay_monitor",
    reportType: "replay_monitor",
    title: "Replay Texas Signal Brief",
    objective:
      "Replay a historical public-record window from cached and live-verifiable public sources to demonstrate what Augur would have flagged.",
    requiredOutput:
      "historical replay brief explaining the window, detected signals, recommended response, evidence, uncertainty, and next actions",
  },
};

let adminClient;

export function getSupabaseAdmin() {
  if (adminClient) {
    return adminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

export async function getUserFromBearerToken(request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return null;
  }

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error) {
    throw new Error(`Invalid Supabase session: ${error.message}`);
  }
  return data.user ?? null;
}

function envValue(key) {
  const value = process.env[key]?.trim();
  return value || undefined;
}

function openAiModel() {
  return envValue("OPENAI_MODEL") ?? "gpt-5.4-mini";
}

function openAiReasoningEffort() {
  return envValue("OPENAI_REASONING_EFFORT") ?? "medium";
}

function openAiGeneratedBy() {
  return `openai_${openAiModel().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").toLowerCase()}`;
}

function envInt(key, defaultValue, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number.parseInt(envValue(key) ?? "", 10);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.min(max, Math.max(min, parsed));
}

function hashRecord(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function compactText(value, max = 900) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

async function fetchWithTimeout(url, init = {}, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTextResponse(url, init = {}, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, init = {}, timeoutMs = 20_000) {
  const { response, text } = await fetchTextResponse(url, init, timeoutMs);
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const error = typeof body === "object" && body?.message ? body.message : text.slice(0, 300);
    throw new Error(`${response.status} ${response.statusText}: ${error}`);
  }

  return body;
}

async function fetchOpenAiResponse(payload, timeoutMs = 60_000) {
  if (!envValue("OPENAI_API_KEY")) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  return fetchJson(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${envValue("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openAiModel(),
        reasoning: { effort: openAiReasoningEffort() },
        ...payload,
      }),
    },
    timeoutMs
  );
}

function openAiOutputText(response) {
  if (typeof response?.output_text === "string") {
    return response.output_text;
  }
  const chunks = [];
  for (const item of Array.isArray(response?.output) ? response.output : []) {
    for (const content of Array.isArray(item?.content) ? item.content : []) {
      if (typeof content?.text === "string") chunks.push(content.text);
      if (typeof content?.output_text === "string") chunks.push(content.output_text);
    }
  }
  return chunks.join("\n").trim();
}

async function fetchText(url, init = {}, timeoutMs = 20_000) {
  const { response, text } = await fetchTextResponse(url, init, timeoutMs);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
  }
  return text;
}

function rows(value) {
  return Array.isArray(value) ? value : [];
}

function numberFrom(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const parsed = Number(String(value).replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function dateFrom(value) {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function sourceHeaders(source) {
  if (source === "socrata" && envValue("SOCRATA_APP_TOKEN")) {
    return { "X-App-Token": envValue("SOCRATA_APP_TOKEN") };
  }
  if (source === "openstates" && envValue("OPENSTATES_API_KEY")) {
    return { "X-API-KEY": envValue("OPENSTATES_API_KEY") };
  }
  return {};
}

export async function getDemoCompany(supabase = getSupabaseAdmin()) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, slug, name, description, vertical, owner_user_id, is_demo, profile_json")
    .eq("slug", "lonestar-retail-group")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("LoneStar Retail Group seed company was not found");
  }

  return data;
}

async function getPrimaryCompanyForUser(userId, supabase = getSupabaseAdmin()) {
  if (!userId) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("primary_company_id")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) {
    throw profileError;
  }

  if (profile?.primary_company_id) {
      const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, slug, name, description, vertical, owner_user_id, is_demo, profile_json")
      .eq("id", profile.primary_company_id)
      .maybeSingle();
    if (companyError) {
      throw companyError;
    }
    if (company) {
      return company;
    }
  }

  const { data: membership, error: membershipError } = await supabase
    .from("company_memberships")
    .select("company_id, companies(id, slug, name, description, vertical, profile_json)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (membershipError) {
    throw membershipError;
  }

  return membership?.companies ?? null;
}

export async function getCompanyForContext({ userId = null, companyId = null } = {}) {
  const supabase = getSupabaseAdmin();

  if (companyId) {
    const { data: company, error } = await supabase
      .from("companies")
      .select("id, slug, name, description, vertical, owner_user_id, is_demo, profile_json")
      .eq("id", companyId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (!company) {
      throw new Error("Requested company was not found.");
    }
    if (!company.is_demo && company.owner_user_id !== userId) {
      const { data: membership, error: membershipError } = await supabase
        .from("company_memberships")
        .select("id")
        .eq("company_id", companyId)
        .eq("user_id", userId)
        .maybeSingle();
      if (membershipError) {
        throw membershipError;
      }
      if (!membership) {
        throw new Error("User does not have access to this company.");
      }
    }
    return company;
  }

  const userCompany = await getPrimaryCompanyForUser(userId, supabase);
  return userCompany ?? getDemoCompany(supabase);
}

function slugifyCompanyName(name) {
  const base = String(name || "company")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${base || "company"}-${Date.now().toString(36)}`;
}

export async function createCompanyForUser({
  user = null,
  name = "",
  vertical = "retail landlord / real estate development team",
  businessGoal = "Develop or expand retail centers across Texas",
  targetCities = TARGET_CITIES,
} = {}) {
  if (!user?.id || !user.email) {
    throw new Error("A signed-in user is required to create a company.");
  }
  if (!name || String(name).trim().length < 2) {
    throw new Error("Company name is required.");
  }

  const supabase = getSupabaseAdmin();
  const profileJson = {
    business_model: vertical,
    goal: businessGoal,
    target_cities: targetCities,
    current_priority: "Identify the best Texas market or corridor for next development",
    risk_sensitivities: [
      "permitting timelines",
      "zoning and land use",
      "commercial property tax",
      "development incentives",
      "parking and signage rules",
      "certificates of occupancy",
      "code violations",
      "retail tenant opening friction",
    ],
    preferred_output: "decisive, source-backed business recommendation with Response Plan",
  };

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      slug: slugifyCompanyName(name),
      name: String(name).trim(),
      description: `${name} company profile created during Augur onboarding.`,
      vertical,
      owner_user_id: user.id,
      is_demo: false,
      profile_json: profileJson,
    })
    .select("id, slug, name, description, vertical, profile_json")
    .single();
  if (companyError) {
    throw companyError;
  }

  const { error: membershipError } = await supabase.from("company_memberships").upsert(
    {
      company_id: company.id,
      user_id: user.id,
      role: "owner",
    },
    { onConflict: "company_id,user_id" }
  );
  if (membershipError) {
    throw membershipError;
  }

  const { error: profileError } = await supabase.from("user_profiles").upsert(
    {
      id: user.id,
      email: user.email,
      primary_company_id: company.id,
      onboarding_completed: true,
    },
    { onConflict: "id" }
  );
  if (profileError) {
    throw profileError;
  }

  const targetRows = targetCities.map((city, index) => ({
    company_id: company.id,
    city,
    geo_unit_type: city === "Austin" ? "council_district" : "city",
    geo_unit_name: "citywide",
    priority: 100 - index * 10,
    notes: city === "Austin" ? "Austin is the deepest first city." : "Comparison market.",
  }));
  const { error: targetsError } = await supabase
    .from("company_geo_targets")
    .upsert(targetRows, { onConflict: "company_id,city,geo_unit_type,geo_unit_name" });
  if (targetsError) {
    throw targetsError;
  }

  return company;
}

export async function createAskRun({
  prompt = CORE_PROMPT,
  userId = null,
  companyId = null,
  mode = "ask",
  signalWindow = null,
} = {}) {
  if (!userId) {
    throw new Error("Sign in before creating an Augur Analyst run.");
  }
  if (!MODE_CONFIG[mode]) {
    throw new Error(`Unsupported Augur run mode: ${mode}`);
  }
  const supabase = getSupabaseAdmin();
  const company = await getCompanyForContext({ userId, companyId });
  const now = new Date();
  const replayDefaultStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const windowStart =
    signalWindow?.from ??
    (mode === "live_monitor"
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      : mode === "replay_monitor"
        ? replayDefaultStart
        : null);
  const windowEnd = signalWindow?.to ?? (mode === "ask" ? null : now.toISOString());
  const { data, error } = await supabase
    .from("agent_runs")
    .insert({
      company_id: company.id,
      created_by_user_id: userId,
      mode,
      status: "queued",
      user_prompt: prompt || MODE_CONFIG[mode].objective,
      signal_window_start: windowStart,
      signal_window_end: windowEnd,
      replay_label: mode === "replay_monitor" ? signalWindow?.label ?? "Historical Texas public-record replay" : null,
      metadata_json: {
        entrypoint: mode === "ask" ? "overview_dashboard" : "monitor_console",
        product_prompt: CORE_PROMPT,
        company_slug: company.slug,
        signal_window: signalWindow,
      },
    })
    .select("id, company_id, mode, status, user_prompt, started_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createDemoRun({
  prompt = CORE_PROMPT,
  mode = "ask",
  signalWindow = null,
} = {}) {
  if (!MODE_CONFIG[mode]) {
    throw new Error(`Unsupported Augur run mode: ${mode}`);
  }
  const supabase = getSupabaseAdmin();
  const company = await getDemoCompany(supabase);
  const now = new Date();
  const replayDefaultStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const windowStart =
    signalWindow?.from ??
    (mode === "live_monitor"
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      : mode === "replay_monitor"
        ? replayDefaultStart
        : null);
  const windowEnd = signalWindow?.to ?? (mode === "ask" ? null : now.toISOString());
  const { data, error } = await supabase
    .from("agent_runs")
    .insert({
      company_id: company.id,
      mode,
      status: "queued",
      user_prompt: prompt || MODE_CONFIG[mode].objective,
      signal_window_start: windowStart,
      signal_window_end: windowEnd,
      replay_label: mode === "replay_monitor" ? signalWindow?.label ?? "Historical Texas public-record replay" : null,
      metadata_json: {
        entrypoint: "augur_mcp_demo",
        product_prompt: CORE_PROMPT,
        company_slug: company.slug,
        system_created: true,
        signal_window: signalWindow,
      },
    })
    .select("id, company_id, mode, status, user_prompt, started_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchDashboardState(context = {}) {
  const supabase = getSupabaseAdmin();
  const company = await getCompanyForContext(context);

  const [scores, latestRun, latestMonitor, companyLatestReport, sources] = await Promise.all([
    supabase
      .from("signal_scores")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("agent_runs")
      .select("*")
      .eq("company_id", company.id)
      .order("started_at", { ascending: false })
      .limit(1),
    supabase
      .from("agent_runs")
      .select("*")
      .eq("company_id", company.id)
      .in("mode", ["live_monitor", "replay_monitor"])
      .order("started_at", { ascending: false })
      .limit(1),
    supabase
      .from("reports")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("data_sources")
      .select("name, source_type, city, dataset_id, citation_url, access_method")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  for (const result of [scores, latestRun, latestMonitor, companyLatestReport, sources]) {
    if (result.error) {
      throw result.error;
    }
  }

  const latestRunRow = latestRun.data?.[0] ?? null;
  let latestReportRow = companyLatestReport.data?.[0] ?? null;
  if (!latestReportRow && latestRunRow?.id) {
    const runReport = await supabase
      .from("reports")
      .select("*")
      .eq("run_id", latestRunRow.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (runReport.error) {
      throw runReport.error;
    }
    latestReportRow = runReport.data?.[0] ?? null;
  }

  return {
    company,
    onboarding: {
      usingDemo: Boolean(company.is_demo),
      signedIn: Boolean(context.userId),
    },
    targetCities: TARGET_CITIES,
    scores: latestScoreByCity(scores.data ?? []),
    latestRun: latestRunRow,
    latestMonitor: latestMonitor.data?.[0] ?? null,
    latestReport: latestReportRow ? normalizeReportRow(latestReportRow) : null,
    sources: sources.data ?? [],
  };
}

export async function fetchRunsForContext(context = {}) {
  if (!context.userId) {
    throw new Error("Sign in before viewing agent runs.");
  }

  const supabase = getSupabaseAdmin();
  const company = await getCompanyForContext(context);
  const { data, error } = await supabase
    .from("agent_runs")
    .select("*, reports(id, title, created_at)")
    .eq("company_id", company.id)
    .order("started_at", { ascending: false })
    .limit(25);

  if (error) {
    throw error;
  }

  return {
    company,
    runs: data ?? [],
  };
}

export async function fetchRunState(runId, context = {}) {
  const supabase = getSupabaseAdmin();
  const runResult = await supabase.from("agent_runs").select("*").eq("id", runId).maybeSingle();
  if (runResult.error) {
    throw runResult.error;
  }
  if (!runResult.data) {
    throw new Error("Agent run was not found.");
  }

  await getCompanyForContext({ userId: context.userId ?? null, companyId: runResult.data.company_id });

  const [toolCalls, evidence, scores, reports] = await Promise.all([
    supabase
      .from("agent_tool_calls")
      .select("*")
      .eq("run_id", runId)
      .order("step_index", { ascending: true }),
    supabase
      .from("evidence_items")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: true }),
    supabase
      .from("signal_scores")
      .select("*")
      .eq("updated_by_run_id", runId)
      .order("created_at", { ascending: false }),
    supabase.from("reports").select("*").eq("run_id", runId).order("created_at", { ascending: false }),
  ]);

  for (const result of [toolCalls, evidence, scores, reports]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    run: runResult.data,
    toolCalls: toolCalls.data ?? [],
    evidence: evidence.data ?? [],
    scores: latestScoreByCity(scores.data ?? []),
    report: reports.data?.[0] ? normalizeReportRow(reports.data[0]) : null,
  };
}

export async function fetchReportState(reportId, context = {}) {
  const supabase = getSupabaseAdmin();
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();

  if (reportError) {
    throw reportError;
  }
  if (!report) {
    throw new Error("Report was not found.");
  }

  await getCompanyForContext({ userId: context.userId ?? null, companyId: report.company_id });

  const [run, toolCalls, evidence, scores] = await Promise.all([
    supabase.from("agent_runs").select("*").eq("id", report.run_id).maybeSingle(),
    supabase
      .from("agent_tool_calls")
      .select("*")
      .eq("run_id", report.run_id)
      .order("step_index", { ascending: true }),
    supabase
      .from("evidence_items")
      .select("*")
      .eq("run_id", report.run_id)
      .order("created_at", { ascending: true }),
    supabase
      .from("signal_scores")
      .select("*")
      .eq("updated_by_run_id", report.run_id)
      .order("created_at", { ascending: false }),
  ]);

  for (const result of [run, toolCalls, evidence, scores]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    report: normalizeReportRow(report),
    run: run.data,
    toolCalls: toolCalls.data ?? [],
    evidence: evidence.data ?? [],
    scores: latestScoreByCity(scores.data ?? []),
  };
}

function normalizeReportRow(report) {
  return {
    ...report,
    markdown: report.markdown_content ?? report.markdown ?? null,
  };
}

function latestScoreByCity(scores) {
  const byCity = new Map();
  for (const score of scores) {
    if (!byCity.has(score.city)) {
      byCity.set(score.city, score);
    }
  }
  for (const city of TARGET_CITIES) {
    if (!byCity.has(city)) {
      byCity.set(city, baselineScore(city));
    }
  }
  return TARGET_CITIES.map((city) => byCity.get(city));
}

function baselineScore(city) {
  const baseline = {
    Austin: [64, 58, 34, 46, 36],
    Dallas: [52, 42, 54, 38, 28],
    Houston: [45, 40, 46, 36, 18],
    "San Antonio": [49, 36, 35, 34, 24],
  }[city] ?? [40, 40, 40, 40, 20];

  return {
    id: `baseline-${city}`,
    city,
    geo_unit_type: "city",
    geo_unit_name: "citywide",
    development_momentum: baseline[0],
    zoning_friction: baseline[1],
    code_occupancy_risk: baseline[2],
    policy_risk: baseline[3],
    confidence: baseline[4],
    reasoning_summary: "Pending first source-backed Augur Analyst run; display this as an unverified starting prior, not as evidence.",
    evidence_ids: [],
    created_at: null,
  };
}

async function logToolCall(supabase, runId, stepIndex, toolName, input, executor) {
  const startedAt = new Date().toISOString();
  const insert = await supabase
    .from("agent_tool_calls")
    .upsert(
      {
        run_id: runId,
        step_index: stepIndex,
        tool_name: toolName,
        input_json: input,
        status: "running",
        started_at: startedAt,
        output_summary: `Started ${toolName}`,
      },
      { onConflict: "run_id,step_index" }
    )
    .select("id")
    .single();

  if (insert.error) {
    throw insert.error;
  }

  try {
    const output = await executor();
    if (output.ok === undefined) {
      output.ok = true;
    }
    const evidenceIds = output.evidenceIds ?? [];
    const { error } = await supabase
      .from("agent_tool_calls")
      .update({
        status: "success",
        output_json: output.compact ?? output,
        output_summary: output.summary,
        evidence_ids: evidenceIds,
        completed_at: new Date().toISOString(),
      })
      .eq("id", insert.data.id);

    if (error) {
      throw error;
    }
    await appendRunMemoryEvent(supabase, runId, {
      type: "tool_result",
      step_index: stepIndex,
      tool_name: toolName,
      status: "success",
      summary: output.summary,
      evidence_ids: evidenceIds,
    });
    return output;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase
      .from("agent_tool_calls")
      .update({
        status: "failed",
        output_summary: `${toolName} failed: ${message}`,
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", insert.data.id);
    await appendRunMemoryEvent(supabase, runId, {
      type: "tool_result",
      step_index: stepIndex,
      tool_name: toolName,
      status: "failed",
      summary: `${toolName} failed: ${message}`,
      evidence_ids: [],
      error: message,
    });
    return {
      ok: false,
      summary: `${toolName} failed: ${message}`,
      evidenceIds: [],
      compact: { error: message },
      error: message,
    };
  }
}

async function getRunMemory(supabase, runId) {
  const { data, error } = await supabase.from("agent_runs").select("metadata_json").eq("id", runId).maybeSingle();
  if (error) {
    throw error;
  }
  const metadata = data?.metadata_json && typeof data.metadata_json === "object" ? data.metadata_json : {};
  return Array.isArray(metadata.run_memory) ? metadata.run_memory : [];
}

async function appendRunMemoryEvent(supabase, runId, event) {
  const { data, error } = await supabase.from("agent_runs").select("metadata_json").eq("id", runId).maybeSingle();
  if (error) {
    throw error;
  }
  const metadata = data?.metadata_json && typeof data.metadata_json === "object" ? data.metadata_json : {};
  const current = Array.isArray(metadata.run_memory) ? metadata.run_memory : [];
  const nextEvent = {
    at: new Date().toISOString(),
    ...event,
  };
  const nextMemory = [...current, nextEvent]
    .slice(-80)
    .map((item) => ({
      ...item,
      summary: compactText(item.summary, 700),
      error: item.error ? compactText(item.error, 500) : undefined,
      evidence_ids: Array.isArray(item.evidence_ids) ? item.evidence_ids.slice(0, 12) : [],
    }));
  const { error: updateError } = await supabase
    .from("agent_runs")
    .update({
      metadata_json: {
        ...metadata,
        run_memory: nextMemory,
        run_memory_updated_at: nextEvent.at,
      },
    })
    .eq("id", runId);
  if (updateError) {
    throw updateError;
  }
}

async function nextStepIndex(supabase, runId) {
  const { data, error } = await supabase
    .from("agent_tool_calls")
    .select("step_index")
    .eq("run_id", runId)
    .order("step_index", { ascending: false })
    .limit(1);
  if (error) throw error;
  return Number(data?.[0]?.step_index ?? 0) + 1;
}

async function sourceIdByName(supabase, name) {
  const { data, error } = await supabase
    .from("data_sources")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data?.id ?? null;
}

async function saveEvidence(supabase, item) {
  const { data, error } = await supabase
    .from("evidence_items")
    .insert(item)
    .select("id")
    .single();
  if (error) {
    throw error;
  }
  return data.id;
}

async function saveRawAndCityRecords(supabase, sourceName, city, recordType, sourceUrl, records, normalize) {
  const sourceId = await sourceIdByName(supabase, sourceName);
  const fetchInsert = await supabase
    .from("source_fetches")
    .insert({
      source_id: sourceId,
      fetch_type: recordType,
      status: "success",
      source_url: sourceUrl,
      record_count: records.length,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (fetchInsert.error) {
    throw fetchInsert.error;
  }

  const saved = [];
  for (const record of records) {
    const normalized = normalize(record);
    const uniqueHash = hashRecord({ sourceName, normalized, record });
    const raw = await supabase
      .from("raw_records")
      .upsert(
        {
          source_id: sourceId,
          source_fetch_id: fetchInsert.data.id,
          external_id: normalized.external_id,
          record_type: recordType,
          payload: record,
          source_url: sourceUrl,
          record_date: normalized.record_date,
          unique_hash: uniqueHash,
        },
        { onConflict: "source_id,unique_hash" }
      )
      .select("id")
      .single();

    if (raw.error) {
      throw raw.error;
    }

    const cityRecord = await supabase
      .from("city_records")
      .upsert(
        {
          raw_record_id: raw.data.id,
          source_id: sourceId,
          city,
          record_type: recordType,
          external_id: normalized.external_id,
          record_date: normalized.record_date,
          geo_unit_type: normalized.geo_unit_type,
          geo_unit_name: normalized.geo_unit_name,
          location_text: normalized.location_text,
          latitude: normalized.latitude,
          longitude: normalized.longitude,
          status: normalized.status,
          category: normalized.category,
          description: normalized.description,
          valuation: normalized.valuation,
          square_footage: normalized.square_footage,
          normalized_json: normalized,
        },
        { onConflict: "city,record_type,external_id" }
      )
      .select("id")
      .single();

    if (cityRecord.error) {
      throw cityRecord.error;
    }

    saved.push({ rawId: raw.data.id, cityRecordId: cityRecord.data.id, normalized, record });
  }

  return { sourceId, saved };
}

async function saveSourceFetchFailure(supabase, sourceName, fetchType, sourceUrl, errorMessage) {
  const sourceId = await sourceIdByName(supabase, sourceName);
  await supabase.from("source_fetches").insert({
    source_id: sourceId,
    fetch_type: fetchType,
    status: "failed",
    source_url: sourceUrl,
    record_count: 0,
    completed_at: new Date().toISOString(),
    error_message: errorMessage,
  });
  return { sourceId, saved: [], error: errorMessage };
}

async function latestScoresForCompany(supabase, companyId) {
  const { data, error } = await supabase
    .from("signal_scores")
    .select("city, geo_unit_type, geo_unit_name, development_momentum, zoning_friction, code_occupancy_risk, policy_risk, confidence, reasoning_summary, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw error;
  return latestScoreByCity(data ?? []);
}

async function latestReportsForCompany(supabase, companyId) {
  const { data, error } = await supabase
    .from("reports")
    .select("id, title, report_type, created_at, summary_json")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(3);
  if (error) throw error;
  return data ?? [];
}

async function activeSourceRegistry(supabase) {
  const { data, error } = await supabase
    .from("data_sources")
    .select("name, source_type, city, dataset_id, access_method, refresh_frequency, citation_url, notes")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function buildRunContextPacket({ supabase, run, company }) {
  const config = MODE_CONFIG[run.mode] ?? MODE_CONFIG.ask;
  const [sourceRegistry, priorScores, priorReports] = await Promise.all([
    activeSourceRegistry(supabase),
    latestScoresForCompany(supabase, company.id),
    latestReportsForCompany(supabase, company.id),
  ]);

  return {
    mode: config.mode,
    run_id: run.id,
    signal_window: {
      mode: run.mode === "replay_monitor" ? "replay" : "live",
      from: run.signal_window_start,
      to: run.signal_window_end,
      source: run.mode === "replay_monitor" ? "cached_public_records" : "live_fetch",
      replay_label: run.replay_label,
    },
    company: {
      id: company.id,
      name: company.name,
      vertical: company.vertical,
      description: company.description,
      profile: company.profile_json,
      demo_context: company.slug === "lonestar-retail-group" ? "LoneStar Retail Group demo profile" : null,
    },
    user_objective: run.user_prompt ?? CORE_PROMPT,
    decision_frame: {
      decision: "Which Texas market, public-record signal, or policy response should the company prioritize next?",
      required_output: config.requiredOutput,
      objective: config.objective,
    },
    source_registry: sourceRegistry,
    known_city_depth: {
      Austin: "deepest first city; permits and zoning with council-district context",
      Dallas: "city-level permits and certificates of occupancy now; code-violation context remains lower confidence until normalized",
      "San Antonio": "city-level permits and lighter land-use depth",
      Houston: "watchlisted and intentionally lower confidence until connector quality improves",
    },
    prior_scores: priorScores,
    prior_reports: priorReports,
    tool_policy: [
      "Call bounded tools before making factual claims.",
      "Use evidence IDs and public URLs for factual claims.",
      "Show source failures and lower confidence instead of hiding gaps.",
      "Draft outreach and public messaging only; do not send, post, create accounts, buy ads, or automate engagement.",
      "No legal advice and no manipulative lobbying framing.",
    ],
    output_contract: {
      sections: [
        "Executive Summary",
        "Recommendation",
        "Company Context and Assumptions",
        "Decision Frame",
        "City / Area Comparison",
        "Development Momentum",
        "Zoning and Land-Use Friction",
        "Code / Occupancy Risk",
        "Policy Risk",
        "Lobbying / Stakeholder Response Plan",
        "Contact Paths / Public Officials / Staff / Agencies",
        "Draft Outreach Email(s)",
        "Draft Talking Points",
        "Public Messaging / Social Campaign Concepts",
        "Evidence and Sources",
        "Confidence, Uncertainty, and Open Questions",
        "Next Actions",
      ],
    },
  };
}

function buildSystemPrompt(mode = "ask") {
  const config = MODE_CONFIG[mode] ?? MODE_CONFIG.ask;
  return `You are Augur Analyst, one bounded public-data analyst for Texas retail landlords and real estate development teams.

Mode: ${config.mode}.

Operate as a professional consultant, not as a chatbot. Use tools before factual claims. Treat public records as evidence, not as certainty. Distinguish facts, assumptions, interpretations, and recommendations. If a source fails, say so and reduce confidence. Do not fabricate bills, contacts, alerts, replay events, recommendations, or source URLs.

Allowed work: inspect bounded public-data tools, update validated scores, save report artifacts, and draft response assets for human review. Forbidden work: sending emails, posting content, creating accounts, buying ads, automating engagement, arbitrary code execution, legal advice, or manipulative lobbying framing.

When native tools are available, call them. If a provider cannot reliably request valid bounded actions, the run must fail visibly rather than inventing or pre-filling analyst work. Finish only after city, policy, lobbying/context, official document/contact, score, and report needs have been addressed or explicitly failed.`;
}

async function fetchDatasetResult({ name, url, headers, rowsFrom }) {
  try {
    const body = await fetchJson(url, { headers });
    return {
      ok: true,
      name,
      url,
      records: rowsFrom(body),
    };
  } catch (error) {
    return {
      ok: false,
      name,
      url,
      records: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function getRunModeWindow(supabase, runId) {
  if (!runId) {
    return null;
  }
  const { data, error } = await supabase
    .from("agent_runs")
    .select("mode, signal_window_start, signal_window_end, replay_label")
    .eq("id", runId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

function countCachedRecords(records, city, recordType) {
  return records.filter((record) => record.city === city && record.record_type === recordType).length;
}

function toSavedLikeRecords(records) {
  return records.map((record) => ({
    normalized: {
      geo_unit_name: record.geo_unit_name,
      geo_unit_type: record.geo_unit_type,
    },
  }));
}

async function queryCachedReplayCityDatasetTool(supabase, runId, run) {
  const baseSelect =
    "id, city, record_type, record_date, geo_unit_type, geo_unit_name, status, category, description, valuation, source_id, raw_record_id, normalized_json";
  let query = supabase
    .from("city_records")
    .select(baseSelect)
    .in("city", TARGET_CITIES)
    .order("record_date", { ascending: false, nullsFirst: false })
    .limit(80);

  if (run?.signal_window_start) {
    query = query.gte("record_date", run.signal_window_start);
  }
  if (run?.signal_window_end) {
    query = query.lte("record_date", run.signal_window_end);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  let records = data ?? [];
  let closestWindowUsed = false;
  if (records.length === 0) {
    const closestWindow = await supabase
      .from("city_records")
      .select(baseSelect)
      .in("city", TARGET_CITIES)
      .order("record_date", { ascending: false, nullsFirst: false })
      .limit(40);
    if (closestWindow.error) {
      throw closestWindow.error;
    }
    records = closestWindow.data ?? [];
    closestWindowUsed = true;
  }

  const evidenceIds = [];
  const samplesByKey = new Map();
  for (const record of records) {
    const key = `${record.city}:${record.record_type}`;
    if (!samplesByKey.has(key)) {
      samplesByKey.set(key, record);
    }
  }

  for (const record of [...samplesByKey.values()].slice(0, 6)) {
    const id = await saveEvidence(supabase, {
      run_id: runId,
      source_id: record.source_id,
      raw_record_id: record.raw_record_id,
      city_record_id: record.id,
      title: `${record.city} cached ${record.record_type} replay record`,
      evidence_type: "cached_city_replay",
      source_url: record.normalized_json?.source_url ?? null,
      excerpt: compactText(record.description ?? `${record.category ?? "public city record"} ${record.status ?? ""}`),
      metadata_json: {
        replay_label: run?.replay_label,
        requested_window_start: run?.signal_window_start,
        requested_window_end: run?.signal_window_end,
        closest_window_used: closestWindowUsed,
        record,
      },
    });
    evidenceIds.push(id);
  }

  const recordCounts = {
    austinPermits: countCachedRecords(records, "Austin", "permit"),
    austinZoning: countCachedRecords(records, "Austin", "zoning_case"),
    dallasPermits: countCachedRecords(records, "Dallas", "permit"),
    dallasOccupancy: countCachedRecords(records, "Dallas", "certificate_of_occupancy"),
    dallasCode: countCachedRecords(records, "Dallas", "code_violation"),
    sanAntonioPermits: countCachedRecords(records, "San Antonio", "permit"),
  };
  const cachedStatus = (count, { stale = false } = {}) => {
    if (count <= 0) {
      return "no_cached_replay_records";
    }
    const base = closestWindowUsed ? "success_cached_closest_window" : "success_cached_replay";
    return stale ? `${base}_stale_archive` : base;
  };
  const sourceStatus = {
    austinPermits: cachedStatus(recordCounts.austinPermits),
    austinZoning: cachedStatus(recordCounts.austinZoning),
    dallasPermits: cachedStatus(recordCounts.dallasPermits),
    dallasOccupancy: cachedStatus(recordCounts.dallasOccupancy),
    dallasCode: cachedStatus(recordCounts.dallasCode, { stale: true }),
    sanAntonioPermits: cachedStatus(recordCounts.sanAntonioPermits),
  };

  return {
    ok: records.length > 0,
    summary: closestWindowUsed
      ? `Replay used ${records.length} cached public city records because no cached city records matched the requested replay window exactly. Confidence must be lower for window-specific claims.`
      : `Replay used ${records.length} cached public city records inside the requested historical window.`,
    evidenceIds,
    compact: {
      replayMode: true,
      replayLabel: run?.replay_label,
      requestedWindow: {
        from: run?.signal_window_start,
        to: run?.signal_window_end,
      },
      closestWindowUsed,
      sourceStatus,
      recordCounts,
      topAustinDistricts: summarizeDistricts(
        toSavedLikeRecords(records.filter((record) => record.city === "Austin" && record.record_type === "permit"))
      ),
      topDallasCodeDistricts: summarizeDistricts(
        toSavedLikeRecords(
          records.filter((record) => record.city === "Dallas" && record.record_type === "certificate_of_occupancy")
        )
      ),
      topDallasCodeZips: summarizeDistricts(
        toSavedLikeRecords(records.filter((record) => record.city === "Dallas" && record.record_type === "code_violation"))
      ),
      cachedRecords: records.slice(0, 12),
    },
  };
}

export async function queryCityDatasetTool(supabase, runId) {
  const run = await getRunModeWindow(supabase, runId);
  if (run?.mode === "replay_monitor") {
    return queryCachedReplayCityDatasetTool(supabase, runId, run);
  }

  const austinUrl =
    "https://data.austintexas.gov/resource/3syk-w9eu.json?$limit=40&$order=issue_date%20DESC";
  const austinZoningUrl =
    "https://data.austintexas.gov/resource/edir-dcnf.json?$limit=25&$order=data_portal_update%20DESC";
  const dallasUrl =
    "https://www.dallasopendata.com/resource/e7gq-4sah.json?$limit=25&$order=permit_number%20DESC";
  const dallasOccupancyUrl =
    "https://www.dallasopendata.com/resource/9qet-qt9e.json?$limit=25&$order=date_issued%20DESC";
  const dallasCodeUrl =
    "https://www.dallasopendata.com/resource/x9pz-kdq9.json?$limit=25&$order=created%20DESC";
  const sanAntonioUrl =
    "https://data.sanantonio.gov/api/3/action/datastore_search?resource_id=c21106f9-3ef5-4f3a-8604-f992b4db7512&limit=25";

  const [austinPermits, austinZoning, dallasPermits, dallasOccupancy, dallasCode, sanAntonioPermits] = await Promise.all([
    fetchDatasetResult({
      name: "Austin Issued Construction Permits",
      url: austinUrl,
      headers: sourceHeaders("socrata"),
      rowsFrom: rows,
    }),
    fetchDatasetResult({
      name: "Austin Zoning Cases",
      url: austinZoningUrl,
      headers: sourceHeaders("socrata"),
      rowsFrom: rows,
    }),
    fetchDatasetResult({
      name: "Dallas Building Permits",
      url: dallasUrl,
      headers: sourceHeaders("socrata"),
      rowsFrom: rows,
    }),
    fetchDatasetResult({
      name: "Dallas Certificates of Occupancy",
      url: dallasOccupancyUrl,
      headers: sourceHeaders("socrata"),
      rowsFrom: rows,
    }),
    fetchDatasetResult({
      name: "Dallas Code Violations",
      url: dallasCodeUrl,
      headers: sourceHeaders("socrata"),
      rowsFrom: rows,
    }),
    fetchDatasetResult({
      name: "San Antonio Building Permits",
      url: sanAntonioUrl,
      headers: {},
      rowsFrom: (body) => rows(body?.result?.records),
    }),
  ]);

  const austinPermitRecords = austinPermits.records;
  const austinZoningRecords = austinZoning.records;
  const dallasPermitRecords = dallasPermits.records;
  const dallasOccupancyRecords = dallasOccupancy.records;
  const dallasCodeRecords = dallasCode.records;
  const sanAntonioRecords = sanAntonioPermits.records;

  const austinSaved = austinPermits.ok
    ? await saveRawAndCityRecords(
        supabase,
        "Austin Issued Construction Permits",
        "Austin",
        "permit",
        austinUrl,
        austinPermitRecords,
        (record) => ({
      external_id: record.permit_number ?? record.folderrsn ?? hashRecord(record),
      record_date: dateFrom(record.issue_date ?? record.issueddate),
      geo_unit_type: "council_district",
      geo_unit_name: record.council_district ? `District ${record.council_district}` : "citywide",
      location_text: compactText(record.permit_location ?? record.original_address1 ?? record.address),
      status: record.status_current ?? record.permit_class_mapped,
      category: record.permit_type_desc ?? record.work_class ?? record.permit_class,
      description: compactText(record.description ?? record.work_description),
      valuation: numberFrom(
        record.total_valuation ??
          record.valuation ??
          record.building_valuation ??
          record.plumbing_valuation ??
          record.electrical_valuation ??
          record.mechanical_valuation
      ),
      square_footage: numberFrom(record.total_new_add_sqft ?? record.total_sq_ft ?? record.square_footage),
      latitude: numberFrom(record.latitude),
      longitude: numberFrom(record.longitude),
    })
      )
    : await saveSourceFetchFailure(
        supabase,
        "Austin Issued Construction Permits",
        "permit",
        austinUrl,
        austinPermits.error
      );

  const zoningSaved = austinZoning.ok
    ? await saveRawAndCityRecords(
        supabase,
        "Austin Zoning Cases",
        "Austin",
        "zoning_case",
        austinZoningUrl,
        austinZoningRecords,
        (record) => ({
      external_id: record.case_number ?? record.permit_number ?? record.folderrsn ?? hashRecord(record),
      record_date: dateFrom(record.application_start_date ?? record.status_date ?? record.data_portal_update),
      geo_unit_type: "city",
      geo_unit_name: "citywide",
      location_text: compactText(record.site_address ?? record.location?.human_address ?? record.address),
      status: record.detailed_status ?? record.case_status ?? record.status,
      category: record.sub_type ?? record.case_type ?? record.work_type,
      description: compactText(record.description_of_work ?? record.proposed_zoning ?? record.case_name),
      latitude: numberFrom(record.latitude ?? record.location?.latitude),
      longitude: numberFrom(record.longitude ?? record.location?.longitude),
    })
      )
    : await saveSourceFetchFailure(
        supabase,
        "Austin Zoning Cases",
        "zoning_case",
        austinZoningUrl,
        austinZoning.error
      );

  const dallasSaved = dallasPermits.ok
    ? await saveRawAndCityRecords(
        supabase,
        "Dallas Building Permits",
        "Dallas",
        "permit",
        dallasUrl,
        dallasPermitRecords,
        (record) => ({
      external_id: record.permit_number ?? hashRecord(record),
      record_date: dateFrom(record.issued_date ?? record.issue_date ?? record.applied_date),
      geo_unit_type: "city",
      geo_unit_name: "citywide",
      location_text: compactText(record.street_address ?? record.address ?? record.full_address),
      status: record.status ?? record.permit_status,
      category: record.permit_type ?? record.land_use ?? record.work_type,
      description: compactText(record.work_description ?? record.description),
      valuation: numberFrom(record.value ?? record.valuation),
      square_footage: numberFrom(record.area ?? record.square_feet),
      normalized_source_quality: "Dallas public sample can be stale depending on portal sort behavior.",
    })
      )
    : await saveSourceFetchFailure(
        supabase,
        "Dallas Building Permits",
        "permit",
        dallasUrl,
        dallasPermits.error
      );

  const dallasOccupancySaved = dallasOccupancy.ok
    ? await saveRawAndCityRecords(
        supabase,
        "Dallas Certificates of Occupancy",
        "Dallas",
        "certificate_of_occupancy",
        dallasOccupancyUrl,
        dallasOccupancyRecords,
        (record) => ({
      external_id: record.co ?? record.certificate_number ?? hashRecord(record),
      record_date: dateFrom(record.date_issued ?? record.date_approved),
      geo_unit_type: "city",
      geo_unit_name: record.code_district ? `Code district ${record.code_district}` : "citywide",
      location_text: compactText(record.address ?? record.geolocation?.human_address),
      status: record.type_of_co ?? "Certificate of Occupancy",
      category: record.land_use ?? record.occupancy,
      description: compactText(
        `${record.business_name ?? "Dallas business"} - ${record.land_use ?? record.occupancy ?? "occupancy record"}`
      ),
      square_footage: numberFrom(record.sq_ft),
      latitude: numberFrom(record.geolocation?.latitude),
      longitude: numberFrom(record.geolocation?.longitude),
      occupancy: record.occupancy,
      code_district: record.code_district,
      zip_code: record.zip_code,
    })
      )
    : await saveSourceFetchFailure(
        supabase,
        "Dallas Certificates of Occupancy",
        "certificate_of_occupancy",
        dallasOccupancyUrl,
        dallasOccupancy.error
      );

  const dallasCodeSaved = dallasCode.ok
    ? await saveRawAndCityRecords(
        supabase,
        "Dallas Code Violations",
        "Dallas",
        "code_violation",
        dallasCodeUrl,
        dallasCodeRecords,
        (record) => ({
      external_id: record.service_request_id ?? record.service_request ?? hashRecord(record),
      record_date: dateFrom(record.created ?? record.updated),
      geo_unit_type: "zip_code",
      geo_unit_name: record.zone ? `ZIP ${record.zone}` : "citywide",
      location_text: compactText(
        record.location?.human_address ??
          [record.str_num, record.str_nam, record.str_suffix].filter(Boolean).join(" ")
      ),
      status: record.status,
      category: record.type ?? record.nuisance,
      description: compactText(record.nuisance ?? record.service_request),
      normalized_source_quality:
        "Dallas code-violation dataset is reachable but appears archived/stale in the current public sample.",
    })
      )
    : await saveSourceFetchFailure(
        supabase,
        "Dallas Code Violations",
        "code_violation",
        dallasCodeUrl,
        dallasCode.error
      );

  const sanAntonioSaved = sanAntonioPermits.ok
    ? await saveRawAndCityRecords(
        supabase,
        "San Antonio Building Permits",
        "San Antonio",
        "permit",
        sanAntonioUrl,
        sanAntonioRecords,
        (record) => ({
      external_id: String(record["PERMIT #"] ?? record.permit_number ?? record.PERMIT_NUMBER ?? record._id ?? hashRecord(record)),
      record_date: dateFrom(record["DATE ISSUED"] ?? record.issue_date ?? record.ISSUE_DATE ?? record.permit_issued_date),
      geo_unit_type: "city",
      geo_unit_name: "citywide",
      location_text: compactText(record.ADDRESS ?? record.address),
      status: record.status ?? record.STATUS,
      category: record["PERMIT TYPE"] ?? record.permit_type ?? record.PERMIT_TYPE,
      description: compactText(record["PROJECT NAME"] ?? record.description ?? record.DESCRIPTION ?? record.work_description),
      valuation: numberFrom(record["DECLARED VALUATION"] ?? record.valuation ?? record.VALUATION),
      square_footage: numberFrom(record["AREA (SF)"] ?? record.square_feet ?? record.SQUARE_FEET),
      latitude: numberFrom(record.Y_COORD),
      longitude: numberFrom(record.X_COORD),
    })
      )
    : await saveSourceFetchFailure(
        supabase,
        "San Antonio Building Permits",
        "permit",
        sanAntonioUrl,
        sanAntonioPermits.error
      );

  const evidenceIds = [];
  const samples = [
    {
      sourceId: austinSaved.sourceId,
      title: "Austin issued construction permits live sample",
      type: "city_permits",
      sourceUrl: austinUrl,
      saved: austinSaved.saved,
      note: "Recent Austin issued construction permits, including commercial construction signals where present.",
    },
    {
      sourceId: zoningSaved.sourceId,
      title: "Austin zoning cases live sample",
      type: "city_zoning",
      sourceUrl: austinZoningUrl,
      saved: zoningSaved.saved,
      note: "Recent Austin zoning case activity used as friction and land-use-change context.",
    },
    {
      sourceId: dallasSaved.sourceId,
      title: "Dallas building permits live sample",
      type: "city_permits",
      sourceUrl: dallasUrl,
      saved: dallasSaved.saved,
      note: "Recent Dallas permits used as a city-level comparison for development momentum.",
    },
    {
      sourceId: dallasOccupancySaved.sourceId,
      title: "Dallas certificate-of-occupancy live sample",
      type: "city_occupancy",
      sourceUrl: dallasOccupancyUrl,
      saved: dallasOccupancySaved.saved,
      note: "Dallas certificates of occupancy used as a tenant-opening and code/occupancy friction signal.",
    },
    {
      sourceId: dallasCodeSaved.sourceId,
      title: "Dallas code-violation public sample",
      type: "city_code",
      sourceUrl: dallasCodeUrl,
      saved: dallasCodeSaved.saved,
      note: "Dallas code-violation records are reachable but treated as stale/archive-quality unless newer records appear.",
    },
    {
      sourceId: sanAntonioSaved.sourceId,
      title: "San Antonio building permits live sample",
      type: "city_permits",
      sourceUrl: sanAntonioUrl,
      saved: sanAntonioSaved.saved,
      note: "Recent San Antonio permit records from the city open-data API.",
    },
  ];

  for (const sample of samples) {
    if (sample.saved.length === 0) {
      continue;
    }
    const first = sample.saved[0];
    const id = await saveEvidence(supabase, {
      run_id: runId,
      source_id: sample.sourceId,
      raw_record_id: first?.rawId ?? null,
      city_record_id: first?.cityRecordId ?? null,
      title: sample.title,
      evidence_type: sample.type,
      source_url: sample.sourceUrl,
      excerpt: sample.note,
      metadata_json: {
        record_count: sample.saved.length,
        sample: sample.saved.slice(0, 3).map((item) => item.normalized),
      },
    });
    evidenceIds.push(id);
  }

  return {
    ok: [austinPermits, austinZoning, dallasPermits, dallasOccupancy, dallasCode, sanAntonioPermits].some(
      (source) => source.ok
    ),
    summary: `Queried city datasets: Austin permits (${austinPermitRecords.length}), Austin zoning (${austinZoningRecords.length}), Dallas permits (${dallasPermitRecords.length}), Dallas certificates of occupancy (${dallasOccupancyRecords.length}), Dallas code violations (${dallasCodeRecords.length}), San Antonio permits (${sanAntonioRecords.length}).`,
    evidenceIds,
    compact: {
      sourceStatus: {
        austinPermits: austinPermits.ok ? "success" : `failed: ${austinPermits.error}`,
        austinZoning: austinZoning.ok ? "success" : `failed: ${austinZoning.error}`,
        dallasPermits: dallasPermits.ok ? "success" : `failed: ${dallasPermits.error}`,
        dallasOccupancy: dallasOccupancy.ok ? "success" : `failed: ${dallasOccupancy.error}`,
        dallasCode: dallasCode.ok ? "success_stale_archive" : `failed: ${dallasCode.error}`,
        sanAntonioPermits: sanAntonioPermits.ok ? "success" : `failed: ${sanAntonioPermits.error}`,
      },
      recordCounts: {
        austinPermits: austinPermitRecords.length,
        austinZoning: austinZoningRecords.length,
        dallasPermits: dallasPermitRecords.length,
        dallasOccupancy: dallasOccupancyRecords.length,
        dallasCode: dallasCodeRecords.length,
        sanAntonioPermits: sanAntonioRecords.length,
      },
      topAustinDistricts: summarizeDistricts(austinSaved.saved),
      topDallasCodeDistricts: summarizeDistricts(dallasOccupancySaved.saved),
      topDallasCodeZips: summarizeDistricts(dallasCodeSaved.saved),
    },
  };
}

function summarizeDistricts(saved) {
  const counts = new Map();
  for (const item of saved) {
    const district = item.normalized.geo_unit_name ?? "citywide";
    counts.set(district, (counts.get(district) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([district, count]) => ({ district, count }));
}

export async function searchTexasBillsTool(supabase, runId) {
  const query =
    "zoning OR permitting OR property tax OR land use OR development incentives OR parking OR signage";
  const url = `https://v3.openstates.org/bills?jurisdiction=tx&per_page=10&sort=updated_desc&q=${encodeURIComponent(
    query
  )}`;

  const body = await fetchJson(url, { headers: sourceHeaders("openstates") });
  const billRows = rows(body.results);
  const sourceId = await sourceIdByName(supabase, "OpenStates Texas Bills");
  const savedBills = [];

  for (const bill of billRows) {
    const identifier = bill.identifier ?? bill.bill_id ?? bill.id;
    const session = String(bill.session ?? "unknown");
    const { data, error } = await supabase
      .from("bills")
      .upsert(
        {
          source: "OpenStates",
          jurisdiction: "tx",
          session,
          bill_id: identifier,
          title: bill.title,
          status: bill.latest_action_description,
          sponsors: bill.sponsorships ?? [],
          subjects: bill.subject ?? [],
          last_action: bill.latest_action_description,
          last_action_date: bill.latest_action_date,
          updated_at_source: bill.updated_at,
          source_url: bill.openstates_url ?? bill.sources?.[0]?.url,
          raw_json: bill,
        },
        { onConflict: "session,bill_id" }
      )
      .select("id")
      .single();

    if (error) {
      throw error;
    }
    savedBills.push({ id: data.id, bill });
  }

  const evidenceIds = [];
  for (const item of savedBills.slice(0, 3)) {
    const id = await saveEvidence(supabase, {
      run_id: runId,
      source_id: sourceId,
      bill_id: item.id,
      title: `${item.bill.identifier ?? item.bill.id}: ${compactText(item.bill.title, 180)}`,
      evidence_type: "texas_bill_metadata",
      source_url: item.bill.openstates_url ?? item.bill.sources?.[0]?.url,
      excerpt: compactText(item.bill.latest_action_description ?? item.bill.title),
      metadata_json: {
        session: item.bill.session,
        subjects: item.bill.subject ?? [],
        latest_action_date: item.bill.latest_action_date,
      },
    });
    evidenceIds.push(id);
  }

  return {
    summary: `Searched OpenStates for Texas policy terms relevant to retail development; returned ${billRows.length} recent bill records.`,
    evidenceIds,
    compact: {
      query,
      bills: billRows.slice(0, 5).map((bill) => ({
        identifier: bill.identifier,
        title: bill.title,
        session: bill.session,
        latestActionDate: bill.latest_action_date,
        latestAction: bill.latest_action_description,
        url: bill.openstates_url ?? bill.sources?.[0]?.url,
      })),
    },
  };
}

export async function getTexasBillDocumentsTool(supabase, runId) {
  const url = "https://capitol.texas.gov/tlodocs/892/billtext/html/HB00023F.htm";
  const html = await fetchText(url);
  const text = compactText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " "),
    1600
  );
  const sourceId = await sourceIdByName(supabase, "Texas Legislature Online File Downloads");
  const id = await saveEvidence(supabase, {
    run_id: runId,
    source_id: sourceId,
    title: "Texas Legislature Online official bill text reachability sample",
    evidence_type: "official_bill_document",
    source_url: url,
    excerpt: text.slice(0, 700),
    metadata_json: {
      document_url: url,
      text_length: text.length,
      note: "Official TLO document path used to verify document fetch/cache behavior for relevant bills.",
    },
  });

  return {
    summary: "Retrieved and parsed an official Texas Legislature Online bill-text document path.",
    evidenceIds: [id],
    compact: { url, textPreview: text.slice(0, 600), textLength: text.length },
  };
}

export async function searchLobbyActivityTool(supabase, runId) {
  const pageUrl = "https://www.ethics.state.tx.us/search/lobby/";
  const zipUrl = "https://prd.tecprd.ethicsefile.com/public/lobby/public/TEC_LA_CSV.zip";
  const [page, zip] = await Promise.all([
    fetchWithTimeout(pageUrl),
    fetchWithTimeout(zipUrl, { method: "HEAD" }),
  ]);

  if (!page.ok || !zip.ok) {
    throw new Error(`TEC lobby endpoints returned page=${page.status}, package=${zip.status}`);
  }

  const sourceId = await sourceIdByName(supabase, "Texas Ethics Commission Lobby Records");
  const id = await saveEvidence(supabase, {
    run_id: runId,
    source_id: sourceId,
    title: "Texas Ethics Commission lobby activity package",
    evidence_type: "lobbying_source",
    source_url: zipUrl,
    excerpt:
      "TEC public lobby search and CSV package are reachable for development-related subject activity imports.",
    metadata_json: {
      page_url: pageUrl,
      package_url: zipUrl,
      content_type: zip.headers.get("content-type"),
      content_length: zip.headers.get("content-length"),
      last_modified: zip.headers.get("last-modified"),
    },
  });

  return {
    summary: "Verified TEC public lobby data page and lobby activity CSV package reachability.",
    evidenceIds: [id],
    compact: {
      pageStatus: page.status,
      packageStatus: zip.status,
      contentLength: zip.headers.get("content-length"),
      lastModified: zip.headers.get("last-modified"),
    },
  };
}

export async function webResearchTool(supabase, runId) {
  const sourceId = await sourceIdByName(supabase, "Exa Web Research");
  if (envValue("EXA_API_KEY")) {
    const body = await fetchJson("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": envValue("EXA_API_KEY"),
      },
      body: JSON.stringify({
        query:
          "official Texas city economic development contact Austin Dallas San Antonio Houston retail development permitting",
        numResults: 5,
        type: "auto",
        includeDomains: [
          "austintexas.gov",
          "dallascityhall.com",
          "sanantonio.gov",
          "houstontx.gov",
          "capitol.texas.gov",
          "texas.gov",
        ],
      }),
    });
    const results = rows(body.results);
    const id = await saveEvidence(supabase, {
      run_id: runId,
      source_id: sourceId,
      title: "Official-source web research for Response Plan contact paths",
      evidence_type: "web_research",
      source_url: results[0]?.url ?? "https://exa.ai/",
      excerpt: "Bounded web research was limited to official Texas and city domains.",
      metadata_json: { results: results.slice(0, 5) },
    });
    return {
      summary: `Searched official-source web pages through Exa; returned ${results.length} candidate contact/context pages.`,
      evidenceIds: [id],
      compact: { results: results.slice(0, 5).map((r) => ({ title: r.title, url: r.url })) },
    };
  }

  const officialPages = [
    "https://www.austintexas.gov/department/development-services",
    "https://dallascityhall.com/departments/sustainabledevelopment/",
    "https://www.sanantonio.gov/DSD",
    "https://www.houstontx.gov/planning/",
  ];
  const checks = await Promise.all(
    officialPages.map(async (url) => {
      const response = await fetchWithTimeout(url);
      return { url, status: response.status, ok: response.ok };
    })
  );
  const id = await saveEvidence(supabase, {
    run_id: runId,
    source_id: sourceId,
    title: "Official city development contact pages",
    evidence_type: "web_research",
    source_url: officialPages[0],
    excerpt: "Fallback web research checked official city development-service pages only.",
    metadata_json: { checks },
  });
  return {
    summary: "Checked official city development-service pages as bounded public web research.",
    evidenceIds: [id],
    compact: { checks },
  };
}

export async function getCompanyDossierTool(supabase, run, company, contextPacket) {
  return {
    summary: `Loaded ${company.name} dossier, target cities, risk sensitivities, prior scores, and prior report references.`,
    evidenceIds: [],
    compact: {
      company: contextPacket.company,
      targetCities: company.profile_json?.target_cities ?? TARGET_CITIES,
      riskSensitivities: company.profile_json?.risk_sensitivities ?? [],
      priorScores: contextPacket.prior_scores,
      priorReports: contextPacket.prior_reports,
    },
  };
}

export async function listAvailableSourcesTool(supabase) {
  const sources = await activeSourceRegistry(supabase);
  return {
    summary: `Loaded ${sources.length} active public data sources from the source registry.`,
    evidenceIds: [],
    compact: {
      sources: sources.map((source) => ({
        name: source.name,
        type: source.source_type,
        city: source.city,
        method: source.access_method,
        url: source.citation_url,
      })),
    },
  };
}

export async function searchTloRssTool(supabase, runId) {
  const feedUrl = "https://capitol.texas.gov/MyTLO/RSS/RSSFeeds.aspx";
  const text = await fetchText(feedUrl);
  const sourceId = await sourceIdByName(supabase, "Texas Legislature Online RSS");
  const excerpt = compactText(text.replace(/<[^>]+>/g, " "), 900);
  const id = await saveEvidence(supabase, {
    run_id: runId,
    source_id: sourceId,
    title: "Texas Legislature Online RSS feed index",
    evidence_type: "legislation_change_feed",
    source_url: feedUrl,
    excerpt,
    metadata_json: {
      text_length: text.length,
      purpose: "TLO RSS is used as monitor change-detection input before deeper official document retrieval.",
    },
  });
  return {
    summary: "Checked the Texas Legislature Online RSS feed index for monitor change-detection coverage.",
    evidenceIds: [id],
    compact: { feedUrl, textLength: text.length, excerpt },
  };
}

export async function searchCampaignFinanceTool(supabase, runId) {
  const pageUrl = "https://www.ethics.state.tx.us/search/cf/";
  const response = await fetchWithTimeout(pageUrl);
  if (!response.ok) {
    throw new Error(`TEC campaign-finance page returned ${response.status}`);
  }
  const sourceId = await sourceIdByName(supabase, "Texas Ethics Commission Campaign Finance");
  const id = await saveEvidence(supabase, {
    run_id: runId,
    source_id: sourceId,
    title: "Texas Ethics Commission campaign-finance search",
    evidence_type: "campaign_finance_source",
    source_url: pageUrl,
    excerpt:
      "TEC public campaign-finance search is reachable. Augur treats this as public context only and does not infer influenceability.",
    metadata_json: {
      status: response.status,
      content_type: response.headers.get("content-type"),
    },
  });
  return {
    summary: "Verified TEC campaign-finance public search reachability for professional policy-context use.",
    evidenceIds: [id],
    compact: { pageUrl, status: response.status },
  };
}

export async function inspectCityRecordTool(supabase, runId) {
  const run = await getRunModeWindow(supabase, runId);
  let query = supabase
    .from("city_records")
    .select("id, city, record_type, record_date, geo_unit_type, geo_unit_name, status, category, description, valuation, source_id")
    .in("city", TARGET_CITIES);

  if (run?.mode === "replay_monitor" && run.signal_window_start) {
    query = query.gte("record_date", run.signal_window_start);
  }
  if (run?.mode === "replay_monitor" && run.signal_window_end) {
    query = query.lte("record_date", run.signal_window_end);
  }

  let { data, error } = await query.order("record_date", { ascending: false, nullsFirst: false }).limit(8);
  if (error) throw error;
  let records = data ?? [];
  let closestWindowUsed = false;
  if (run?.mode === "replay_monitor" && records.length === 0) {
    const closestWindow = await supabase
      .from("city_records")
      .select("id, city, record_type, record_date, geo_unit_type, geo_unit_name, status, category, description, valuation, source_id")
      .in("city", TARGET_CITIES)
      .order("record_date", { ascending: false, nullsFirst: false })
      .limit(8);
    if (closestWindow.error) throw closestWindow.error;
    records = closestWindow.data ?? [];
    closestWindowUsed = true;
  }
  const evidenceIds = [];
  for (const record of records.slice(0, 2)) {
    const id = await saveEvidence(supabase, {
      run_id: runId,
      source_id: record.source_id,
      city_record_id: record.id,
      title: `${record.city} ${record.record_type} inspected record`,
      evidence_type: run?.mode === "replay_monitor" ? "cached_city_replay_inspection" : "city_record_inspection",
      excerpt: compactText(record.description ?? `${record.category ?? "city record"} ${record.status ?? ""}`),
      metadata_json: {
        record,
        replay_label: run?.replay_label,
        requested_window_start: run?.signal_window_start,
        requested_window_end: run?.signal_window_end,
        closest_window_used: closestWindowUsed,
      },
    });
    evidenceIds.push(id);
  }
  return {
    summary:
      run?.mode === "replay_monitor"
        ? `Inspected ${records.length} cached normalized city records for replay${closestWindowUsed ? "; no exact requested-window match was available, so closest cached public records were marked as lower confidence for that window." : " inside the requested window."}`
        : `Inspected ${records.length} cached normalized city records from the current public-data cache.`,
    evidenceIds,
    compact: {
      records,
      replayMode: run?.mode === "replay_monitor",
      closestWindowUsed,
    },
  };
}

export async function findPublicContactPathsTool(supabase, run, toolResults = {}) {
  const contacts = [
    {
      policy_issue: "Development services and permitting timelines",
      office_or_org: "Austin Development Services Department",
      contact_type: "official_city_department",
      source_url: "https://www.austintexas.gov/department/development-services",
      why_relevant: "Austin is the deepest current Augur market and permitting/zoning timelines affect retail tenant openings.",
    },
    {
      policy_issue: "Certificate of occupancy and code-compliance opening friction",
      office_or_org: "Dallas Sustainable Development and Construction",
      contact_type: "official_city_department",
      source_url: "https://dallascityhall.com/departments/sustainabledevelopment/",
      why_relevant: "Dallas occupancy and code compliance can affect whether retail tenants can open on schedule.",
    },
    {
      policy_issue: "Development services and permits",
      office_or_org: "San Antonio Development Services Department",
      contact_type: "official_city_department",
      source_url: "https://www.sanantonio.gov/DSD",
      why_relevant: "San Antonio is a comparison expansion market with available building-permit public records.",
    },
    {
      policy_issue: "Planning and development review",
      office_or_org: "Houston Planning and Development Department",
      contact_type: "official_city_department",
      source_url: "https://www.houstontx.gov/planning/",
      why_relevant: "Houston remains on the watchlist while connector confidence is lower.",
    },
  ];
  const { data, error } = await supabase
    .from("contact_paths")
    .insert(
      contacts.map((contact) => ({
        ...contact,
        run_id: run.id,
        company_id: run.company_id,
        talking_points:
          "Ask about process timelines, upcoming public meetings, tenant-opening requirements, and official guidance for retail development. Keep the discussion factual and non-legal.",
        public_contact_info: { source_url: contact.source_url },
      }))
    )
    .select("id, office_or_org, policy_issue, source_url, why_relevant");
  if (error) throw error;
  return {
    summary: `Created ${data?.length ?? 0} public contact-path artifacts from official city pages for human-reviewed response planning.`,
    evidenceIds: toolResults.web?.evidenceIds ?? [],
    compact: { contactPaths: data ?? contacts },
  };
}

function draftOutreachEmailTool(company, toolResults = {}) {
  const contacts = toolResults.contacts?.compact?.contactPaths ?? [];
  return {
    summary: "Drafted a human-reviewed outreach email artifact; no message was sent.",
    evidenceIds: [],
    compact: {
      subject: "Retail development process questions for upcoming Texas expansion review",
      body: `Hello,\n\n${company.name} is evaluating retail development opportunities and is reviewing public permitting, zoning, and tenant-opening requirements. We would appreciate guidance on current review timelines, upcoming public meetings, and any published materials relevant to retail center development.\n\nWe are using public records to prepare our questions and are not requesting legal advice. Thank you for pointing us to the appropriate official process or staff contact.\n\nRegards,\n${company.name}`,
      suggestedRecipients: contacts.map((contact) => contact.office_or_org),
      reviewRequired: true,
    },
  };
}

function draftTalkingPointsTool(company, scores = []) {
  const topCity = [...scores].sort((a, b) => Number(b.confidence ?? 0) - Number(a.confidence ?? 0))[0]?.city ?? "Austin";
  return {
    summary: "Drafted talking points for human review; no outreach was executed.",
    evidenceIds: [],
    compact: {
      talkingPoints: [
        `${company.name} is comparing Texas markets using public permitting, zoning, code/occupancy, and policy records.`,
        `${topCity} currently has the strongest evidence coverage in this run, but final site decisions require city-specific diligence.`,
        "The company is looking for official guidance on timelines, tenant-opening requirements, public meetings, and published process materials.",
        "Any policy discussion should stay focused on predictable development review, infrastructure readiness, and small-business tenant openings.",
      ],
      reviewRequired: true,
    },
  };
}

function draftSocialCampaignTool(company) {
  return {
    summary: "Drafted public-messaging concepts for human review; nothing was posted.",
    evidenceIds: [],
    compact: {
      concepts: [
        {
          title: "Tenant Opening Readiness",
          message:
            "Explain how predictable permitting and certificate-of-occupancy processes help local retail tenants open on time.",
        },
        {
          title: "Neighborhood Services Gap",
          message:
            "Frame retail-center investment around access to restaurants, services, and everyday neighborhood needs.",
        },
      ],
      guardrails: [
        "Do not cite unsupported claims.",
        "Do not imply legal conclusions.",
        "Do not automate posting or engagement.",
      ],
      reviewRequired: true,
      company: company.name,
    },
  };
}

function suggestVisualAssetsTool(toolResults = {}) {
  return {
    summary: "Suggested visual assets for report/Miro-style review artifacts.",
    evidenceIds: [],
    compact: {
      assets: [
        "Texas city comparison score table with confidence bands",
        "Austin council-district permit concentration callout",
        "Source coverage matrix separating successful calls from degraded sources",
        "Response-plan board with official contact paths and draft talking points",
      ],
      sourceBasis: {
        cityEvidence: toolResults.city?.evidenceIds ?? [],
        policyEvidence: toolResults.bills?.evidenceIds ?? [],
      },
    },
  };
}

function toolDefinitions() {
  return [
    {
      type: "function",
      function: {
        name: "get_company_dossier",
        description: "Load the company dossier, objectives, prior scores, and prior report references.",
        parameters: { type: "object", properties: { reason: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "list_available_sources",
        description: "List active public data sources and source coverage caveats.",
        parameters: { type: "object", properties: { reason: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "query_city_dataset",
        description: "Query live public city datasets for Texas expansion signals.",
        parameters: { type: "object", properties: { reason: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "inspect_city_record",
        description: "Inspect cached normalized public city records from the current run/cache.",
        parameters: { type: "object", properties: { city: { type: "string" }, reason: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "search_texas_bills",
        description: "Search Texas bill metadata for retail development policy risks.",
        parameters: { type: "object", properties: { terms: { type: "array", items: { type: "string" } } } },
      },
    },
    {
      type: "function",
      function: {
        name: "search_tlo_rss",
        description: "Check Texas Legislature Online RSS/change-detection coverage.",
        parameters: { type: "object", properties: { reason: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "get_texas_bill_documents",
        description: "Fetch an official Texas Legislature Online document path.",
        parameters: { type: "object", properties: { bill: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "search_lobby_activity",
        description: "Check Texas Ethics Commission public lobby data context.",
        parameters: { type: "object", properties: { topic: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "search_campaign_finance",
        description: "Check public TEC campaign-finance source reachability as professional context only.",
        parameters: { type: "object", properties: { topic: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "web_research",
        description: "Search bounded official web pages for Response Plan contact paths.",
        parameters: { type: "object", properties: { purpose: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "find_public_contact_paths",
        description: "Create reviewed contact-path artifacts from official/public sources. Does not send outreach.",
        parameters: { type: "object", properties: { purpose: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "draft_outreach_email",
        description: "Draft a human-reviewed outreach email artifact. Does not send email.",
        parameters: { type: "object", properties: { audience: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "draft_talking_points",
        description: "Draft human-reviewed talking points. Does not automate engagement.",
        parameters: { type: "object", properties: { topic: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "draft_social_campaign",
        description: "Draft public-messaging concepts for review. Does not post or buy ads.",
        parameters: { type: "object", properties: { goal: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "suggest_visual_assets",
        description: "Suggest visual report/Miro-style artifacts based on the evidence pack.",
        parameters: { type: "object", properties: { purpose: { type: "string" } } },
      },
    },
    {
      type: "function",
      function: {
        name: "finish_investigation",
        description: "Finish when enough source-backed evidence has been gathered.",
        parameters: { type: "object", properties: { reason: { type: "string" } } },
      },
    },
  ];
}

function parseToolArguments(value) {
  if (!value || typeof value !== "string") return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function createAgentToolRegistry({ supabase, run, company, contextPacket, toolResults }) {
  return {
    get_company_dossier: {
      key: "dossier",
      execute: () => getCompanyDossierTool(supabase, run, company, contextPacket),
    },
    list_available_sources: {
      key: "sources",
      execute: () => listAvailableSourcesTool(supabase),
    },
    query_city_dataset: {
      key: "city",
      execute: () => queryCityDatasetTool(supabase, run.id),
    },
    inspect_city_record: {
      key: "cityInspection",
      execute: () => inspectCityRecordTool(supabase, run.id),
    },
    search_texas_bills: {
      key: "bills",
      execute: () => searchTexasBillsTool(supabase, run.id),
    },
    search_tlo_rss: {
      key: "rss",
      execute: () => searchTloRssTool(supabase, run.id),
    },
    get_texas_bill_documents: {
      key: "documents",
      execute: () => getTexasBillDocumentsTool(supabase, run.id),
    },
    search_lobby_activity: {
      key: "lobby",
      execute: () => searchLobbyActivityTool(supabase, run.id),
    },
    search_campaign_finance: {
      key: "campaignFinance",
      execute: () => searchCampaignFinanceTool(supabase, run.id),
    },
    web_research: {
      key: "web",
      execute: () => webResearchTool(supabase, run.id),
    },
    find_public_contact_paths: {
      key: "contacts",
      execute: () => findPublicContactPathsTool(supabase, run, toolResults),
    },
    draft_outreach_email: {
      key: "outreachEmail",
      execute: () => draftOutreachEmailTool(company, toolResults),
    },
    draft_talking_points: {
      key: "talkingPoints",
      execute: () => draftTalkingPointsTool(company, contextPacket.prior_scores),
    },
    draft_social_campaign: {
      key: "socialCampaign",
      execute: () => draftSocialCampaignTool(company),
    },
    suggest_visual_assets: {
      key: "visualAssets",
      execute: () => suggestVisualAssetsTool(toolResults),
    },
  };
}

function parseStructuredActionResponse(content) {
  const cleaned = stripMarkdownFence(content);
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    try {
      const parsedArray = JSON.parse(cleaned);
      return { actions: Array.isArray(parsedArray) ? parsedArray : [] };
    } catch {
      return { actions: [] };
    }
  }
  try {
    const parsed = JSON.parse(match[0]);
    return {
      actions: Array.isArray(parsed.actions) ? parsed.actions : Array.isArray(parsed.tool_calls) ? parsed.tool_calls : [],
      finishReason: parsed.finish_reason ?? parsed.finishReason ?? null,
    };
  } catch {
    return { actions: [] };
  }
}

async function fetchOpenAiStructuredActions({ contextPacket }) {
  const response = await fetchOpenAiResponse(
    {
      input: [
        {
          role: "system",
          content:
            `You are Augur Analyst's bounded action planner. Return only the requested JSON. Choose source-backed Augur tools before scoring/report generation. Allowed tools: ${Object.keys(createAgentToolRegistry({ supabase: null, run: { id: null }, company: {}, contextPacket, toolResults: {} })).join(", ")}, finish_investigation. Do not include update_signal_scores or save_markdown_report; the backend handles those after evidence collection.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            mode: contextPacket.mode,
            objective: contextPacket.user_objective,
            decision_frame: contextPacket.decision_frame,
            company: contextPacket.company,
            signal_window: contextPacket.signal_window,
            source_registry: contextPacket.source_registry?.map((source) => ({
              name: source.name,
              type: source.source_type,
              city: source.city,
              access_method: source.access_method,
            })),
            prior_scores: contextPacket.prior_scores,
            required:
              "Return exactly these 15 tools in this order: get_company_dossier, list_available_sources, query_city_dataset, inspect_city_record, search_texas_bills, search_tlo_rss, get_texas_bill_documents, search_lobby_activity, search_campaign_finance, web_research, find_public_contact_paths, draft_outreach_email, draft_talking_points, draft_social_campaign, suggest_visual_assets. Do not omit draft artifacts.",
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "augur_action_plan",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              actions: {
                type: "array",
                maxItems: 15,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    tool: { type: "string" },
                    input: { type: "object", additionalProperties: false, properties: {}, required: [] },
                    reason: { type: "string" },
                  },
                  required: ["tool", "input", "reason"],
                },
              },
              finish_reason: { type: "string" },
            },
            required: ["actions", "finish_reason"],
          },
        },
      },
      max_output_tokens: 1800,
    },
    envInt("AUGUR_OPENAI_ACTION_TIMEOUT_MS", 45_000, { min: 10_000, max: 90_000 })
  );
  return parseStructuredActionResponse(openAiOutputText(response));
}

async function runOpenAiStructuredActionLoop({ supabase, run, company, contextPacket, startStepIndex = 2 }) {
  if (!envValue("OPENAI_API_KEY")) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  const toolResults = {
    __runtime: {
      mode: "openai_structured_json_action_loop",
      model: openAiModel(),
      reasoning_effort: openAiReasoningEffort(),
      warnings: [],
    },
  };
  const registry = createAgentToolRegistry({ supabase, run, company, contextPacket, toolResults });
  const { actions, finishReason } = await fetchOpenAiStructuredActions({ contextPacket });
  const validActions = actions.slice(0, 15);
  if (validActions.length === 0) {
    throw new Error("OpenAI structured action loop returned no valid actions.");
  }

  const executed = new Set();
  let stepIndex = startStepIndex;
  for (const action of validActions) {
    const name = String(action.tool ?? action.tool_name ?? action.name ?? "").trim();
    const input = action.input && typeof action.input === "object" && !Array.isArray(action.input) ? action.input : {};
    if (name === "finish_investigation") {
      toolResults.__runtime.warnings.push(`OpenAI action loop finished: ${compactText(action.reason ?? finishReason ?? "finished", 400)}`);
      break;
    }
    const tool = registry[name];
    if (!tool) {
      toolResults.__runtime.warnings.push(`Rejected unknown OpenAI action: ${name || "missing tool name"}.`);
      continue;
    }
    if (executed.has(name)) continue;
    await appendRunMemoryEvent(supabase, run.id, {
      type: "model_action_request",
      tool_name: name,
      status: "validated",
      summary: `OpenAI requested ${name}: ${compactText(action.reason ?? "No reason provided.", 420)}`,
      evidence_ids: [],
    });
    const result = await logToolCall(supabase, run.id, stepIndex++, name, input, tool.execute);
    executed.add(name);
    toolResults[tool.key] = result;
  }
  if (executed.size === 0) {
    throw new Error("OpenAI structured action loop produced no executable Augur actions.");
  }
  return toolResults;
}

async function ensureRequiredToolCoverage({ supabase, run, toolResults }) {
  const required = [
    "dossier",
    "sources",
    "city",
    "cityInspection",
    "bills",
    "rss",
    "documents",
    "lobby",
    "campaignFinance",
    "web",
    "contacts",
    "outreachEmail",
    "talkingPoints",
    "socialCampaign",
    "visualAssets",
  ];
  const missing = required.filter((key) => !toolResults[key]);
  if (missing.length > 0) {
    throw new Error(`Model action plan did not execute required Augur tool coverage: ${missing.join(", ")}`);
  }
  return toolResults;
}

async function getRunEvidence(supabase, runId) {
  const { data, error } = await supabase
    .from("evidence_items")
    .select("id, title, evidence_type, source_url, excerpt, metadata_json")
    .eq("run_id", runId)
    .order("created_at", { ascending: true });
  if (error) {
    throw error;
  }
  return data ?? [];
}

function computeScores(toolResults, evidence) {
  const cityCounts = toolResults.city?.compact?.recordCounts ?? {};
  const topDistricts = toolResults.city?.compact?.topAustinDistricts ?? [];
  const topDallasCodeDistricts = toolResults.city?.compact?.topDallasCodeDistricts ?? [];
  const sourceStatus = toolResults.city?.compact?.sourceStatus ?? {};
  const replayCity = toolResults.city?.compact?.replayMode
    ? {
        label: toolResults.city.compact.replayLabel ?? run.replay_label ?? "Historical public-record replay",
        from: toolResults.city.compact.requestedWindow?.from ?? run.signal_window_start,
        to: toolResults.city.compact.requestedWindow?.to ?? run.signal_window_end,
        closestWindowUsed: Boolean(toolResults.city.compact.closestWindowUsed),
      }
    : null;
  const billsOk = toolResults.bills?.ok !== false && !toolResults.bills?.error;
  const runtime = toolResults.__runtime ?? {};
  const runtimeWarnings = runtime.warnings?.length ? runtime.warnings.join("\n- ") : "None recorded.";
  const documentsOk = toolResults.documents?.ok !== false && !toolResults.documents?.error;
  const lobbyOk = toolResults.lobby?.ok !== false && !toolResults.lobby?.error;
  const webOk = toolResults.web?.ok !== false && !toolResults.web?.error;
  const billCount = billsOk ? (toolResults.bills?.compact?.bills?.length ?? 0) : 0;
  const hasLobby = lobbyOk && Boolean(toolResults.lobby?.compact?.packageStatus);
  const hasWeb = webOk && Boolean(toolResults.web?.compact);

  const evidenceIds = evidence.map((item) => item.id);
  const countScore = (count, base) => Math.min(88, base + Math.round(Number(count ?? 0) * 1.6));
  const statusOk = (key) => String(sourceStatus[key] ?? "").startsWith("success");
  const statusDegraded = (key) => {
    const status = String(sourceStatus[key] ?? "");
    return (
      status.includes("cached") ||
      status.includes("closest_window") ||
      status.includes("stale") ||
      status.includes("archive")
    );
  };
  const policyConfidencePenalty = [billsOk, documentsOk, lobbyOk, webOk].filter(Boolean).length;
  const baseConfidence = 18 + evidence.length * 3 + policyConfidencePenalty * 4;

  return [
    {
      city: "Austin",
      geo_unit_type: "city",
      geo_unit_name: "citywide",
      development_momentum: countScore(cityCounts.austinPermits, 35),
      zoning_friction: Math.min(82, 36 + Number(cityCounts.austinZoning ?? 0)),
      code_occupancy_risk: 34,
      policy_risk: Math.min(76, 34 + billCount * 5 + (hasLobby ? 6 : 0)),
      confidence: Math.min(
        86,
        baseConfidence + (statusOk("austinPermits") ? 16 : 0) + (statusOk("austinZoning") ? 12 : 0)
      ),
      reasoning_summary: `Austin confidence reflects ${statusOk("austinPermits") ? "successful permits" : "failed permits"} and ${statusOk("austinZoning") ? "successful zoning" : "failed zoning"} source calls. Strongest district-level sample: ${topDistricts[0]?.district ?? "not available"}.`,
      evidence_ids: evidenceIds.slice(0, 6),
    },
    {
      city: "Dallas",
      geo_unit_type: "city",
      geo_unit_name: "citywide",
      development_momentum: countScore(cityCounts.dallasPermits, 28),
      zoning_friction: 42,
      code_occupancy_risk: statusOk("dallasOccupancy")
        ? Math.min(
            78,
            38 +
              Math.round(Number(cityCounts.dallasOccupancy ?? 0) * 1.2) +
              (statusDegraded("dallasCode") ? 7 : 0)
          )
        : 58,
      policy_risk: Math.min(70, 30 + billCount * 4 + (hasLobby ? 5 : 0)),
      confidence: Math.min(
        78,
        baseConfidence + (statusOk("dallasPermits") ? 10 : -8) + (statusOk("dallasOccupancy") ? 12 : -6)
      ),
      reasoning_summary:
        `Dallas confidence reflects ${statusOk("dallasPermits") ? "successful permit coverage" : "a failed permit call"} and ${statusOk("dallasOccupancy") ? `successful certificate-of-occupancy coverage; strongest code-district sample: ${topDallasCodeDistricts[0]?.district ?? "not available"}` : "a failed certificate-of-occupancy call"}. Code violations are reachable but treated as stale/archive-quality in this run.`,
      evidence_ids: evidenceIds.slice(0, 6),
    },
    {
      city: "San Antonio",
      geo_unit_type: "city",
      geo_unit_name: "citywide",
      development_momentum: countScore(cityCounts.sanAntonioPermits, 30),
      zoning_friction: 36,
      code_occupancy_risk: 35,
      policy_risk: Math.min(66, 29 + billCount * 4 + (hasWeb ? 3 : 0)),
      confidence: Math.min(68, baseConfidence + (statusOk("sanAntonioPermits") ? 10 : -8)),
      reasoning_summary:
        `San Antonio confidence reflects ${statusOk("sanAntonioPermits") ? "successful permit API coverage" : "a failed permit API call"} and less local friction detail than Austin.`,
      evidence_ids: evidenceIds.slice(0, 6),
    },
    {
      city: "Houston",
      geo_unit_type: "city",
      geo_unit_name: "citywide",
      development_momentum: 45,
      zoning_friction: 40,
      code_occupancy_risk: 46,
      policy_risk: Math.min(62, 28 + billCount * 4),
      confidence: Math.min(28, 16 + (webOk ? 6 : 0) + (billsOk ? 4 : 0)),
      reasoning_summary:
        "Houston is kept on the dashboard as a target city, but this run did not find a clean first-pass connector comparable to Austin, Dallas, or San Antonio; confidence is intentionally lower.",
      evidence_ids: evidenceIds.slice(0, 5),
    },
  ];
}

async function saveScores(supabase, run, scores) {
  const rowsToInsert = scores.map((score) => ({
    company_id: run.company_id,
    city: score.city,
    geo_unit_type: score.geo_unit_type,
    geo_unit_name: score.geo_unit_name,
    development_momentum: score.development_momentum,
    zoning_friction: score.zoning_friction,
    code_occupancy_risk: score.code_occupancy_risk,
    policy_risk: score.policy_risk,
    confidence: score.confidence,
    evidence_ids: score.evidence_ids,
    reasoning_summary: score.reasoning_summary,
    updated_by_run_id: run.id,
    score_window_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    score_window_end: new Date().toISOString().slice(0, 10),
  }));

  const { error } = await supabase.from("signal_scores").insert(rowsToInsert);
  if (error) {
    throw error;
  }
}

async function tryOpenAiSummary(markdown, evidence) {
  if (!envValue("OPENAI_API_KEY")) {
    return null;
  }
  try {
    const response = await fetchOpenAiResponse(
      {
        input: [
          {
            role: "system",
            content:
              "You are Augur Analyst. Return a concise executive summary grounded only in the provided report and evidence. Do not add new facts.",
          },
          {
            role: "user",
            content: JSON.stringify({
              report: markdown.slice(0, 12000),
              evidence: evidence.slice(0, 12).map((item) => ({
                title: item.title,
                source_url: item.source_url,
                excerpt: item.excerpt,
              })),
            }),
          },
        ],
        max_output_tokens: 500,
      },
      envInt("AUGUR_OPENAI_SUMMARY_TIMEOUT_MS", 45_000, { min: 10_000, max: 90_000 })
    );
    return openAiOutputText(response) || null;
  } catch {
    return null;
  }
}

const REQUIRED_REPORT_SECTIONS = [
  "Executive Summary",
  "Recommendation",
  "Company Context and Assumptions",
  "Decision Frame",
  "City / Area Comparison",
  "Development Momentum",
  "Zoning and Land-Use Friction",
  "Code / Occupancy Risk",
  "Policy Risk",
  "Lobbying / Stakeholder Response Plan",
  "Contact Paths / Public Officials / Staff / Agencies",
  "Draft Outreach Email(s)",
  "Draft Talking Points",
  "Public Messaging / Social Campaign Concepts",
  "Evidence and Sources",
  "Confidence, Uncertainty, and Open Questions",
  "Next Actions",
];

function stripMarkdownFence(value) {
  return String(value ?? "")
    .replace(/^```(?:markdown)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function missingReportSections(markdown) {
  return REQUIRED_REPORT_SECTIONS.filter((section) => !markdown.includes(`## ${section}`));
}

function toolCompactForReport(toolResults) {
  const toolSummary = (result, compact = {}) =>
    result
      ? {
          ok: result.ok !== false && !result.error,
          summary: result.summary,
          evidence_ids: result.evidenceIds ?? result.evidence_ids ?? [],
          error: result.error,
          ...compact,
        }
      : null;
  const city = toolResults.city?.compact ?? {};
  const bills = toolResults.bills?.compact ?? {};
  return {
    runtime: toolResults.__runtime,
    dossier: toolSummary(toolResults.dossier),
    sources: toolSummary(toolResults.sources, { source_count: toolResults.sources?.compact?.sources?.length }),
    city: toolSummary(toolResults.city, {
      record_counts: city.recordCounts,
      source_status: city.sourceStatus,
      top_austin_districts: city.topAustinDistricts?.slice?.(0, 4),
      top_dallas_code_districts: city.topDallasCodeDistricts?.slice?.(0, 4),
      replay: city.replayMode
        ? {
            label: city.replayLabel,
            requested_window: city.requestedWindow,
            closest_window_used: city.closestWindowUsed,
          }
        : null,
    }),
    cityInspection: toolSummary(toolResults.cityInspection),
    bills: toolSummary(toolResults.bills, {
      bills: bills.bills?.slice?.(0, 8)?.map((bill) => ({
        identifier: bill.identifier,
        title: bill.title,
        latestActionDate: bill.latestActionDate,
        latestActionDescription: bill.latestActionDescription,
        openstatesUrl: bill.openstatesUrl,
      })),
    }),
    rss: toolSummary(toolResults.rss, { feeds: toolResults.rss?.compact?.feeds?.slice?.(0, 5) }),
    documents: toolSummary(toolResults.documents, {
      documents: toolResults.documents?.compact?.documents?.slice?.(0, 3),
    }),
    lobby: toolSummary(toolResults.lobby, { package_status: toolResults.lobby?.compact?.packageStatus }),
    campaignFinance: toolSummary(toolResults.campaignFinance, {
      package_status: toolResults.campaignFinance?.compact?.packageStatus,
    }),
    web: toolSummary(toolResults.web, {
      results: toolResults.web?.compact?.results?.slice?.(0, 5)?.map((result) => ({
        title: result.title,
        url: result.url,
      })),
    }),
    contacts: toolSummary(toolResults.contacts, { contact_paths: toolResults.contacts?.compact?.contactPaths }),
    outreachEmail: toolSummary(toolResults.outreachEmail, toolResults.outreachEmail?.compact),
    talkingPoints: toolSummary(toolResults.talkingPoints, toolResults.talkingPoints?.compact),
    socialCampaign: toolSummary(toolResults.socialCampaign, toolResults.socialCampaign?.compact),
    visualAssets: toolSummary(toolResults.visualAssets, toolResults.visualAssets?.compact),
  };
}

function sourceGapsForReport(toolResults) {
  const gaps = [];
  for (const [key, value] of Object.entries(toolResults)) {
    if (key === "__runtime") continue;
    if (!value || value.ok === false || value.error) {
      gaps.push({
        group: key,
        error: value?.error ?? "Tool did not return a successful result.",
        summary: value?.summary,
      });
    }
  }
  const sourceStatus = toolResults.city?.compact?.sourceStatus ?? {};
  for (const [source, status] of Object.entries(sourceStatus)) {
    const text = String(status ?? "");
    if (!text.startsWith("success")) {
      gaps.push({ group: source, error: text || "not attempted" });
    }
  }
  return gaps;
}

function compactContextPacketForReport(contextPacket) {
  return {
    mode: contextPacket?.mode,
    run_id: contextPacket?.run_id,
    signal_window: contextPacket?.signal_window,
    company: contextPacket?.company,
    user_objective: contextPacket?.user_objective,
    decision_frame: contextPacket?.decision_frame,
    source_registry: (contextPacket?.source_registry ?? []).map((source) => ({
      name: source.name,
      source_type: source.source_type,
      city: source.city,
      dataset_id: source.dataset_id,
      access_method: source.access_method,
      citation_url: source.citation_url,
    })),
    known_city_depth: contextPacket?.known_city_depth,
    prior_scores: contextPacket?.prior_scores,
    prior_reports: (contextPacket?.prior_reports ?? []).slice(0, 3).map((report) => ({
      id: report.id,
      title: report.title,
      created_at: report.created_at,
      summary: compactText(report.summary_json?.executive_summary ?? report.markdown_content, 900),
    })),
    tool_policy: contextPacket?.tool_policy,
    output_contract: contextPacket?.output_contract,
  };
}

function buildReportPacket({ run, company, scores, evidence, toolResults, contextPacket, runMemory }) {
  return {
    mode: run.mode,
    title: MODE_CONFIG[run.mode]?.title ?? "Texas Expansion Brief",
    company: {
      name: company.name,
      vertical: company.vertical,
      description: company.description,
      profile: company.profile_json,
    },
    context_packet: compactContextPacketForReport(contextPacket),
    tool_summaries: toolCompactForReport(toolResults),
    evidence: evidence.map((item) => ({
      id: item.id,
      title: item.title,
      evidence_type: item.evidence_type,
      source_url: item.source_url,
      excerpt: item.excerpt,
      metadata: item.metadata_json,
    })),
    scores,
    drafts: {
      contacts: toolResults.contacts?.compact,
      outreach_email: toolResults.outreachEmail?.compact,
      talking_points: toolResults.talkingPoints?.compact,
      social_campaign: toolResults.socialCampaign?.compact,
      visual_assets: toolResults.visualAssets?.compact,
    },
    source_gaps: sourceGapsForReport(toolResults),
    run_memory: runMemory.slice(-36),
    required_sections: REQUIRED_REPORT_SECTIONS,
    required_report_outline: REQUIRED_REPORT_SECTIONS.map((section) => `## ${section}`).join("\n"),
  };
}

async function fetchOpenAiReportMarkdown({ packet, repair = null }) {
  const modeInstructions =
    packet.mode === "live_monitor"
      ? "This is a Daily Texas Signal Brief. Explain what changed in the latest source window, what matters, whether any alert clears threshold, and say clearly when no major signal clears threshold while still showing source checks."
      : packet.mode === "replay_monitor"
        ? "This is a Replay Texas Signal Brief. Explain the historical public-record window and make clear that replay uses real cached public records, not fabricated alerts."
        : "This is an expansion intelligence memo. Make a decisive but evidence-qualified recommendation for the business decision.";

  const response = await fetchOpenAiResponse(
    {
      input: [
        {
          role: "system",
          content:
            "You are Augur Analyst writing the final consultant-grade markdown memo for a Texas public-data intelligence product. Use only the provided packet. Do not invent bills, records, contacts, URLs, alerts, or legal advice. Every factual claim must cite an evidence ID/source URL from the packet or explicitly state uncertainty/source gap. Draft artifacts are for human review only. Return markdown only. You must include every required level-two heading exactly as supplied, in order, before finishing. Do not use alternate heading names. Keep sections concise enough that all required headings and contents fit in one response.",
        },
        {
          role: "user",
          content: JSON.stringify({
            instruction: repair
              ? `Repair the markdown so it passes validation. Missing/invalid sections: ${repair.missing.join(", ") || "unknown"}. Re-emit the complete memo, not only the missing sections. Keep the same facts and evidence boundaries. Include every heading in required_heading_block exactly.`
              : "Write the full final consultant-grade memo from this evidence packet. Include every heading in required_heading_block exactly. Be thorough and decision-grade without useless repetition. Target 2-5 bullets or short paragraphs per section so no section is skipped.",
            mode_instructions: modeInstructions,
            required_heading_block: packet.required_report_outline,
            packet,
            markdown_to_repair: repair?.markdown,
          }),
        },
      ],
      max_output_tokens: repair
        ? envInt("AUGUR_OPENAI_REPORT_REPAIR_MAX_TOKENS", 14000, { min: 4000, max: 16000 })
        : envInt("AUGUR_OPENAI_REPORT_MAX_TOKENS", 16000, { min: 6000, max: 20000 }),
    },
    envInt("AUGUR_OPENAI_REPORT_TIMEOUT_MS", 120_000, { min: 30_000, max: 240_000 })
  );
  return stripMarkdownFence(openAiOutputText(response));
}

async function tryModelAuthoredReport({ run, company, scores, evidence, toolResults, contextPacket, runMemory = [] }) {
  if (!envValue("OPENAI_API_KEY")) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const packet = buildReportPacket({
    run,
    company,
    scores,
    evidence,
    toolResults,
    contextPacket,
    runMemory: runMemory.slice(-60),
  });

  let candidate;
  candidate = await fetchOpenAiReportMarkdown({ packet });

  const missing = missingReportSections(candidate);
  if (candidate && missing.length === 0) {
    return {
      markdown: candidate,
      generatedBy: openAiGeneratedBy(),
      warnings: [],
    };
  }

  const repaired = await fetchOpenAiReportMarkdown({
    packet,
    repair: { markdown: candidate, missing: missing.length ? missing : ["empty response"] },
  });
  const repairedMissing = missingReportSections(repaired);
  if (repaired && repairedMissing.length === 0) {
    return {
      markdown: repaired,
      generatedBy: "openai_model_repaired",
      warnings: [`Initial model report failed validation and was repaired: ${missing.join(", ") || "empty response"}`],
    };
  }
  throw new Error(
    `OpenAI report failed validation after repair. Initial missing: ${missing.join(", ") || "empty response"}. Repair missing: ${repairedMissing.join(", ") || "empty response"}.`
  );
}

async function saveReport(supabase, run, company, markdown, evidence, summary, generatedBy) {
  const config = MODE_CONFIG[run.mode] ?? MODE_CONFIG.ask;
  const { error } = await supabase.from("reports").insert({
    company_id: run.company_id ?? company.id,
    run_id: run.id,
    title: config.title,
    report_type: config.reportType,
    markdown_content: markdown,
    summary_json: {
      executive_summary: summary,
      generated_by: generatedBy,
    },
    evidence_ids: evidence.map((item) => item.id),
  });
  if (error) {
    throw error;
  }
}

export async function executeRun(runId) {
  const supabase = getSupabaseAdmin();
  const { data: run, error: runError } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("id", runId)
    .maybeSingle();

  if (runError) {
    throw runError;
  }
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }
  if (!["queued", "running"].includes(run.status)) {
    return run;
  }

  await supabase
    .from("agent_runs")
    .update({ status: "running", claimed_at: new Date().toISOString() })
    .eq("id", runId);

  try {
    const company = await getCompanyForContext({
      userId: run.created_by_user_id,
      companyId: run.company_id,
    });
    const contextPacket = await buildRunContextPacket({ supabase, run, company });
    let toolResults;

    await appendRunMemoryEvent(supabase, runId, {
      type: "initial_context",
      mode: contextPacket.mode,
      summary: `Context packet loaded for ${company.name}: ${contextPacket.source_registry.length} sources, ${contextPacket.prior_scores.length} prior score rows, ${contextPacket.prior_reports.length} prior reports, ${contextPacket.known_city_depth?.length ?? 0} city-depth notes.`,
      evidence_ids: [],
    });
    await logToolCall(supabase, runId, 1, "build_run_context", { mode: run.mode, company_slug: company.slug }, async () => ({
      summary: `Built ${contextPacket.mode} context packet for ${company.name} with ${contextPacket.source_registry.length} sources, ${contextPacket.prior_scores.length} score rows, and ${contextPacket.prior_reports.length} prior reports.`,
      evidenceIds: [],
      compact: {
        context: contextPacket,
      },
    }));

    try {
      toolResults = await runOpenAiStructuredActionLoop({ supabase, run, company, contextPacket });
      toolResults = await ensureRequiredToolCoverage({ supabase, run, toolResults });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await appendRunMemoryEvent(supabase, runId, {
        type: "model_action_planning_failed",
        status: "failed",
        summary: `OpenAI action planning failed; run will fail rather than filling tool coverage: ${message}`,
        evidence_ids: [],
        error: message,
      });
      throw error;
    }

    const evidence = await getRunEvidence(supabase, runId);
    const scores = computeScores(toolResults, evidence);
    await logToolCall(supabase, runId, await nextStepIndex(supabase, runId), "update_signal_scores", { cities: TARGET_CITIES }, async () => {
      await saveScores(supabase, run, scores);
      return {
        summary: "Updated source-backed city-level signal scores.",
        evidenceIds: evidence.map((item) => item.id).slice(0, 8),
        compact: { scores },
      };
    });

    const finalEvidence = await getRunEvidence(supabase, runId);
    await appendRunMemoryEvent(supabase, runId, {
      type: "final_report_request",
      summary: `Final memo requested with ${finalEvidence.length} evidence item(s), ${Object.keys(toolResults).filter((key) => key !== "__runtime").length} tool result group(s), and ${scores.length} score row(s).`,
      evidence_ids: finalEvidence.map((item) => item.id),
    });
    const authoredReport = await tryModelAuthoredReport({
      run,
      company,
      scores,
      evidence: finalEvidence,
      toolResults,
      contextPacket,
      runMemory: await getRunMemory(supabase, runId),
    });
    authoredReport.warnings.forEach((warning) => {
      toolResults.__runtime ??= { warnings: [] };
      toolResults.__runtime.warnings ??= [];
      toolResults.__runtime.warnings.push(warning);
    });
    const markdown = authoredReport.markdown;
    const summary = await tryOpenAiSummary(markdown, finalEvidence);
    await logToolCall(supabase, runId, await nextStepIndex(supabase, runId), "save_markdown_report", { report_type: MODE_CONFIG[run.mode]?.reportType ?? "expansion_brief" }, async () => {
      await saveReport(supabase, run, company, markdown, finalEvidence, summary, authoredReport.generatedBy);
      return {
        summary: "Generated and saved the final source-backed expansion brief.",
        evidenceIds: finalEvidence.map((item) => item.id),
        compact: {
          title: MODE_CONFIG[run.mode]?.title ?? "Texas Expansion Brief",
          executiveSummary: summary,
          evidenceCount: finalEvidence.length,
          generatedBy: authoredReport.generatedBy,
          reportValidationWarnings: authoredReport.warnings,
        },
      };
    });

    await supabase
      .from("agent_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        final_summary:
          summary ||
          `${MODE_CONFIG[run.mode]?.title ?? "Augur report"} completed with source gaps reflected in confidence, evidence, and response-plan artifacts.`,
      })
      .eq("id", runId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await appendRunMemoryEvent(supabase, runId, {
      type: "run_failed",
      status: "failed",
      summary: `Run failed: ${message}`,
      evidence_ids: [],
      error: message,
    }).catch(() => {});
    await supabase
      .from("agent_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq("id", runId);
    throw error;
  }
}

export async function claimAndExecuteQueuedRuns(limit = 1) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("agent_runs")
    .select("id")
    .eq("status", "queued")
    .in("mode", ["ask", "live_monitor", "replay_monitor"])
    .order("started_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  for (const run of data ?? []) {
    await executeRun(run.id);
  }

  return data?.length ?? 0;
}

export async function queueDueLiveMonitorRun({ minHoursBetweenRuns = 20 } = {}) {
  const supabase = getSupabaseAdmin();
  const company = await getDemoCompany(supabase);
  const since = new Date(Date.now() - minHoursBetweenRuns * 60 * 60 * 1000).toISOString();
  const { data: recent, error: recentError } = await supabase
    .from("agent_runs")
    .select("id, status, started_at")
    .eq("company_id", company.id)
    .eq("mode", "live_monitor")
    .gte("started_at", since)
    .order("started_at", { ascending: false })
    .limit(1);
  if (recentError) {
    throw recentError;
  }
  if (recent?.length) {
    return { queued: false, reason: "recent_live_monitor_exists", run: recent[0] };
  }

  const run = await createDemoRun({
    mode: "live_monitor",
    prompt:
      "Run the scheduled daily LoneStar Retail Group public-record monitor. Scan recent city, legislative, lobbying, campaign-finance, and official web signals; write a source-backed signal brief even when no major signal clears threshold.",
  });
  return { queued: true, reason: "live_monitor_due", run };
}
