import { createClient } from "@supabase/supabase-js";

export type DiagnosticStatus = "pass" | "warn" | "fail";

export type DiagnosticCheck = {
  id: string;
  service: string;
  label: string;
  status: DiagnosticStatus;
  summary: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
  sample?: unknown;
  error?: string;
};

export type DiagnosticsReport = {
  generatedAt: string;
  overallStatus: DiagnosticStatus;
  checks: DiagnosticCheck[];
};

const REQUIRED_ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_REASONING_EFFORT",
  "OPENSTATES_API_KEY",
  "EXA_API_KEY",
  "SOCRATA_APP_TOKEN",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_PROJECT_REF",
  "APP_BASE_URL",
] as const;

const OPTIONAL_ENV_KEYS = [
  "SOCRATA_API_KEY_ID",
  "SOCRATA_API_KEY_SECRET",
  "APIFY_API_KEY",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_DB_PASSWORD",
  "DATABASE_URL",
  "DIRECT_URL",
  "RAILWAY_TOKEN",
  "VERCEL_TOKEN",
  "MIRO_CLIENT_ID",
  "MIRO_CLIENT_SECRET",
  "MIRO_ACCESS_TOKEN",
] as const;

type FetchResult = {
  body: unknown;
  contentType: string;
  headers: Record<string, string>;
  ok: boolean;
  status: number;
  statusText: string;
  textPreview: string;
};

type TimedResult<T> = {
  latencyMs: number;
  result: T;
};

function hasEnv(key: string): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

function envValue(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function missing(keys: readonly string[]): string[] {
  return keys.filter((key) => !hasEnv(key));
}

function present(keys: readonly string[]): string[] {
  return keys.filter((key) => hasEnv(key));
}

async function timed<T>(fn: () => Promise<T>): Promise<TimedResult<T>> {
  const started = Date.now();
  const result = await fn();
  return {
    latencyMs: Date.now() - started,
    result,
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 15_000
): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();
    let body: unknown = text;

    if (contentType.includes("json")) {
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }
    }

    return {
      body,
      contentType,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      textPreview: text.slice(0, 600),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function openAiModel(): string {
  return envValue("OPENAI_MODEL") ?? "gpt-5.4-mini";
}

function openAiReasoningEffort(): string {
  return envValue("OPENAI_REASONING_EFFORT") ?? "medium";
}

async function fetchOpenAiResponse(payload: Record<string, unknown>, timeoutMs = 45_000) {
  return fetchWithTimeout(
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

function responseOutputText(body: unknown): string {
  const record = asRecord(body);
  if (typeof record?.output_text === "string") {
    return record.output_text;
  }
  const output = Array.isArray(record?.output) ? record.output : [];
  const chunks: string[] = [];
  for (const item of output) {
    const content = Array.isArray(asRecord(item)?.content) ? asRecord(item)?.content : [];
    for (const part of content as unknown[]) {
      const partRecord = asRecord(part);
      if (typeof partRecord?.text === "string") chunks.push(partRecord.text);
      if (typeof partRecord?.output_text === "string") chunks.push(partRecord.output_text);
    }
  }
  return chunks.join("\n").trim();
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function sampleRecord(value: unknown, maxKeys = 10): Record<string, unknown> | unknown {
  const record = asRecord(value);
  if (!record) {
    return value;
  }

  return Object.fromEntries(Object.entries(record).slice(0, maxKeys));
}

function sampleRows(value: unknown, maxRows = 3, maxKeys = 12): unknown[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, maxRows).map((row) => sampleRecord(row, maxKeys));
}

function decodeXmlText(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRssItems(xml: string, maxItems = 5) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .slice(0, maxItems)
    .map((match) => {
      const itemXml = match[1] ?? "";
      const valueFor = (tag: string) => {
        const tagMatch = itemXml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
        return tagMatch ? decodeXmlText(tagMatch[1].trim()) : undefined;
      };

      return {
        title: valueFor("title"),
        link: valueFor("link") ?? valueFor("guid"),
        description: valueFor("description"),
      };
    });
}

function bodyMessage(body: unknown): string | undefined {
  const record = asRecord(body);
  if (!record) {
    return undefined;
  }

  const error = record.error;
  if (typeof error === "string") {
    return error;
  }
  const errorRecord = asRecord(error);
  if (typeof errorRecord?.message === "string") {
    return errorRecord.message;
  }
  if (typeof record.message === "string") {
    return record.message;
  }

  return undefined;
}

function pass(check: Omit<DiagnosticCheck, "status">): DiagnosticCheck {
  return { ...check, status: "pass" };
}

function warn(check: Omit<DiagnosticCheck, "status">): DiagnosticCheck {
  return { ...check, status: "warn" };
}

function fail(check: Omit<DiagnosticCheck, "status">): DiagnosticCheck {
  return { ...check, status: "fail" };
}

async function checkEnvironment(): Promise<DiagnosticCheck> {
  const requiredMissing = missing(REQUIRED_ENV_KEYS);
  const optionalPresent = present(OPTIONAL_ENV_KEYS);
  const optionalMissing = missing(OPTIONAL_ENV_KEYS);

  const base = {
    id: "environment",
    service: "Config",
    label: "Runtime environment",
    summary:
      requiredMissing.length === 0
        ? "All required runtime variables are present."
        : `${requiredMissing.length} required runtime variable(s) are missing.`,
    details: {
      requiredPresentCount: REQUIRED_ENV_KEYS.length - requiredMissing.length,
      requiredMissingCount: requiredMissing.length,
      requiredTotal: REQUIRED_ENV_KEYS.length,
      optionalPresentCount: optionalPresent.length,
      optionalMissingCount: optionalMissing.length,
      optionalTotal: OPTIONAL_ENV_KEYS.length,
      publicClientEnvPresent: present(REQUIRED_ENV_KEYS).filter((key) => key.startsWith("NEXT_PUBLIC_")).length,
      serverOnlyEnvPresent: present(REQUIRED_ENV_KEYS).filter((key) => !key.startsWith("NEXT_PUBLIC_")).length,
    },
  };

  return requiredMissing.length === 0 ? pass(base) : fail(base);
}

async function checkSupabaseServiceRole(): Promise<DiagnosticCheck> {
  const missingKeys = missing([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);
  if (missingKeys.length > 0) {
    return fail({
      id: "supabase-service-role",
      service: "Supabase",
      label: "Service-role database read",
      summary: "Supabase service-role check cannot run because required env is missing.",
      details: { missing: missingKeys },
    });
  }

  try {
    const { latencyMs, result } = await timed(async () => {
      const supabase = createClient(
        envValue("NEXT_PUBLIC_SUPABASE_URL")!,
        envValue("SUPABASE_SERVICE_ROLE_KEY")!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const [company, targets, sources] = await Promise.all([
        supabase
          .from("companies")
          .select("id, slug, name, vertical, is_demo")
          .eq("slug", "lonestar-retail-group")
          .maybeSingle(),
        supabase
          .from("company_geo_targets")
          .select("city, geo_unit_type, geo_unit_name, priority")
          .order("priority", { ascending: true })
          .limit(8),
        supabase
          .from("data_sources")
          .select("name, source_type, source_domain, city, dataset_id, access_method")
          .order("name", { ascending: true })
          .limit(8),
      ]);

      return { company, targets, sources };
    });

    const errors = [result.company.error, result.targets.error, result.sources.error]
      .filter(Boolean)
      .map((error) => error?.message);

    if (errors.length > 0) {
      return fail({
        id: "supabase-service-role",
        service: "Supabase",
        label: "Service-role database read",
        summary: "Supabase responded, but one or more database reads failed.",
        latencyMs,
        details: { errors },
      });
    }

    return pass({
      id: "supabase-service-role",
      service: "Supabase",
      label: "Service-role database read",
      summary: "Service-role key can read seeded Augur tables.",
      latencyMs,
      details: {
        demoCompanyFound: Boolean(result.company.data),
        geoTargetsReturned: result.targets.data?.length ?? 0,
        dataSourcesReturned: result.sources.data?.length ?? 0,
      },
      sample: {
        company: result.company.data,
        geoTargets: result.targets.data,
        dataSources: result.sources.data,
      },
    });
  } catch (error) {
    return fail({
      id: "supabase-service-role",
      service: "Supabase",
      label: "Service-role database read",
      summary: "Supabase service-role request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkSupabaseAnon(): Promise<DiagnosticCheck> {
  const missingKeys = missing([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);
  if (missingKeys.length > 0) {
    return fail({
      id: "supabase-anon",
      service: "Supabase",
      label: "Anon public read",
      summary: "Supabase anon check cannot run because required env is missing.",
      details: { missing: missingKeys },
    });
  }

  try {
    const { latencyMs, result } = await timed(async () => {
      const supabase = createClient(
        envValue("NEXT_PUBLIC_SUPABASE_URL")!,
        envValue("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      return supabase
        .from("data_sources")
        .select("name, source_type, source_domain, city, dataset_id")
        .eq("is_active", true)
        .limit(5);
    });

    if (result.error) {
      return fail({
        id: "supabase-anon",
        service: "Supabase",
        label: "Anon public read",
        summary: "Supabase anon key could not read public active data sources.",
        latencyMs,
        error: result.error.message,
      });
    }

    return pass({
      id: "supabase-anon",
      service: "Supabase",
      label: "Anon public read",
      summary: "Anon key can read active public source metadata.",
      latencyMs,
      details: { rowsReturned: result.data?.length ?? 0 },
      sample: result.data,
    });
  } catch (error) {
    return fail({
      id: "supabase-anon",
      service: "Supabase",
      label: "Anon public read",
      summary: "Supabase anon request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkOpenAiBasic(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["OPENAI_API_KEY"]);
  if (missingKeys.length > 0) {
    return fail({
      id: "openai-basic",
      service: "OpenAI",
      label: "Responses API",
      summary: "OpenAI Responses API check cannot run because required env is missing.",
      details: { missing: missingKeys, modelDefault: openAiModel(), reasoningDefault: openAiReasoningEffort() },
    });
  }

  try {
    const { latencyMs, result } = await timed(() =>
      fetchOpenAiResponse({
        input: [
          { role: "system", content: "Return only the requested text." },
          { role: "user", content: "Return exactly: Augur OpenAI online" },
        ],
        max_output_tokens: 128,
      })
    );
    if (!result.ok) {
      return fail({
        id: "openai-basic",
        service: "OpenAI",
        label: "Responses API",
        summary: "OpenAI returned an error for a basic Responses API call.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText, model: openAiModel(), reasoning: openAiReasoningEffort() },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }
    return pass({
      id: "openai-basic",
      service: "OpenAI",
      label: "Responses API",
      summary: "OpenAI Responses API accepted the configured model and reasoning effort.",
      latencyMs,
      details: { model: asRecord(result.body)?.model, reasoning: openAiReasoningEffort() },
      sample: { output: responseOutputText(result.body).slice(0, 300) },
    });
  } catch (error) {
    return fail({
      id: "openai-basic",
      service: "OpenAI",
      label: "Responses API",
      summary: "OpenAI basic request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkOpenAiStructuredOutput(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["OPENAI_API_KEY"]);
  if (missingKeys.length > 0) {
    return fail({
      id: "openai-structured-output",
      service: "OpenAI",
      label: "Structured output",
      summary: "OpenAI structured-output check cannot run because required env is missing.",
      details: { missing: missingKeys },
    });
  }
  try {
    const { latencyMs, result } = await timed(() =>
      fetchOpenAiResponse(
        {
          input: [
            { role: "system", content: "Return the requested JSON only." },
            { role: "user", content: "Create an Augur diagnostic status object." },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "augur_diagnostic_status",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  status: { type: "string", enum: ["online"] },
                  provider: { type: "string" },
                  reasoning_effort: { type: "string" },
                },
                required: ["status", "provider", "reasoning_effort"],
              },
            },
          },
          max_output_tokens: 256,
        },
        45_000
      )
    );
    if (!result.ok) {
      return fail({
        id: "openai-structured-output",
        service: "OpenAI",
        label: "Structured output",
        summary: "OpenAI returned an error for the structured-output probe.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }
    const text = responseOutputText(result.body);
    const parsed = JSON.parse(text);
    return pass({
      id: "openai-structured-output",
      service: "OpenAI",
      label: "Structured output",
      summary: "OpenAI produced schema-conformant JSON through Responses API text.format.",
      latencyMs,
      details: { model: asRecord(result.body)?.model },
      sample: parsed,
    });
  } catch (error) {
    return fail({
      id: "openai-structured-output",
      service: "OpenAI",
      label: "Structured output",
      summary: "OpenAI structured-output request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkOpenAiReportGeneration(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["OPENAI_API_KEY"]);
  if (missingKeys.length > 0) {
    return fail({
      id: "openai-report-generation",
      service: "OpenAI",
      label: "Report generation",
      summary: "OpenAI report-generation check cannot run because required env is missing.",
      details: { missing: missingKeys },
    });
  }
  try {
    const { latencyMs, result } = await timed(() =>
      fetchOpenAiResponse(
        {
          input: [
            {
              role: "system",
              content: "Write concise markdown only. Use the exact headings requested.",
            },
            {
              role: "user",
              content:
                "Write a tiny Augur memo with headings ## Executive Summary and ## Evidence and Sources. Cite evidence ID ev_demo_1. No legal advice.",
            },
          ],
          max_output_tokens: 900,
        },
        60_000
      )
    );
    if (!result.ok) {
      return fail({
        id: "openai-report-generation",
        service: "OpenAI",
        label: "Report generation",
        summary: "OpenAI returned an error for the report-generation probe.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }
    const markdown = responseOutputText(result.body);
    const hasHeadings = markdown.includes("## Executive Summary") && markdown.includes("## Evidence and Sources");
    return hasHeadings
      ? pass({
          id: "openai-report-generation",
          service: "OpenAI",
          label: "Report generation",
          summary: "OpenAI generated markdown with required memo headings.",
          latencyMs,
          details: { model: asRecord(result.body)?.model },
          sample: markdown.slice(0, 700),
        })
      : warn({
          id: "openai-report-generation",
          service: "OpenAI",
          label: "Report generation",
          summary: "OpenAI responded, but the markdown did not include both diagnostic headings.",
          latencyMs,
          sample: markdown.slice(0, 700),
        });
  } catch (error) {
    return fail({
      id: "openai-report-generation",
      service: "OpenAI",
      label: "Report generation",
      summary: "OpenAI report-generation request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkExaSearch(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["EXA_API_KEY"]);
  if (missingKeys.length > 0) {
    return fail({
      id: "exa-search",
      service: "Exa",
      label: "Web search",
      summary: "Exa search check cannot run because required env is missing.",
      details: { missing: missingKeys },
    });
  }

  try {
    const { latencyMs, result } = await timed(() =>
      fetchWithTimeout("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": envValue("EXA_API_KEY")!,
        },
        body: JSON.stringify({
          query: "Texas Legislature Online land use permitting Texas",
          numResults: 2,
          contents: { text: true },
        }),
      })
    );

    const body = asRecord(result.body);
    const results = Array.isArray(body?.results) ? body.results : [];

    if (!result.ok) {
      return fail({
        id: "exa-search",
        service: "Exa",
        label: "Web search",
        summary: "Exa returned an error for a basic search.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }

    return pass({
      id: "exa-search",
      service: "Exa",
      label: "Web search",
      summary: "Exa returned web research results.",
      latencyMs,
      details: { resultCount: results.length },
      sample: results.slice(0, 2).map((item) => {
        const record = asRecord(item) ?? {};
        return {
          title: record.title,
          url: record.url,
          score: record.score,
          textLength: typeof record.text === "string" ? record.text.length : 0,
        };
      }),
    });
  } catch (error) {
    return fail({
      id: "exa-search",
      service: "Exa",
      label: "Web search",
      summary: "Exa search request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkOpenStates(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["OPENSTATES_API_KEY"]);
  if (missingKeys.length > 0) {
    return fail({
      id: "openstates",
      service: "OpenStates",
      label: "Texas jurisdiction metadata",
      summary: "OpenStates check cannot run because required env is missing.",
      details: { missing: missingKeys },
    });
  }

  try {
    const { latencyMs, result } = await timed(() =>
      fetchWithTimeout(
        "https://v3.openstates.org/jurisdictions/ocd-jurisdiction%2Fcountry%3Aus%2Fstate%3Atx%2Fgovernment",
        {
          headers: {
            "X-API-KEY": envValue("OPENSTATES_API_KEY")!,
          },
        }
      )
    );

    if (!result.ok) {
      return fail({
        id: "openstates",
        service: "OpenStates",
        label: "Texas jurisdiction metadata",
        summary: "OpenStates returned an error for Texas jurisdiction metadata.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }

    const body = asRecord(result.body) ?? {};

    return pass({
      id: "openstates",
      service: "OpenStates",
      label: "Texas jurisdiction metadata",
      summary: "OpenStates key can read Texas legislative metadata.",
      latencyMs,
      details: {
        id: body.id,
        name: body.name,
        classification: body.classification,
      },
      sample: sampleRecord(body),
    });
  } catch (error) {
    return fail({
      id: "openstates",
      service: "OpenStates",
      label: "Texas jurisdiction metadata",
      summary: "OpenStates request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkOpenStatesBills(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["OPENSTATES_API_KEY"]);
  if (missingKeys.length > 0) {
    return fail({
      id: "openstates-bills",
      service: "OpenStates",
      label: "Texas bills search",
      summary: "OpenStates bill search cannot run because required env is missing.",
      details: { missing: missingKeys },
    });
  }

  try {
    const { latencyMs, result } = await timed(() =>
      fetchWithTimeout(
        "https://v3.openstates.org/bills?jurisdiction=tx&per_page=3&sort=updated_desc",
        {
          headers: {
            "X-API-KEY": envValue("OPENSTATES_API_KEY")!,
          },
        }
      )
    );

    if (!result.ok) {
      return fail({
        id: "openstates-bills",
        service: "OpenStates",
        label: "Texas bills search",
        summary: "OpenStates returned an error for the Texas bills search probe.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }

    const body = asRecord(result.body) ?? {};
    const results = Array.isArray(body.results) ? body.results : [];

    return pass({
      id: "openstates-bills",
      service: "OpenStates",
      label: "Texas bills search",
      summary: "OpenStates returned live Texas bill records sorted by recent update.",
      latencyMs,
      details: {
        resultCount: results.length,
        pagination: body.pagination,
      },
      sample: results.slice(0, 3).map((item) => {
        const bill = asRecord(item) ?? {};
        const jurisdiction = asRecord(bill.jurisdiction) ?? {};
        const chamber = asRecord(bill.from_organization) ?? {};
        return {
          id: bill.id,
          identifier: bill.identifier,
          title: bill.title,
          session: bill.session,
          jurisdiction: jurisdiction.name,
          chamber: chamber.name,
          subjects: Array.isArray(bill.subject) ? bill.subject.slice(0, 5) : [],
          latestActionDate: bill.latest_action_date,
          latestActionDescription: bill.latest_action_description,
          openstatesUrl: bill.openstates_url,
        };
      }),
    });
  } catch (error) {
    return fail({
      id: "openstates-bills",
      service: "OpenStates",
      label: "Texas bills search",
      summary: "OpenStates bill search failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkSocrataDataset(
  id: string,
  label: string,
  url: string
): Promise<DiagnosticCheck> {
  const missingKeys = missing(["SOCRATA_APP_TOKEN"]);
  if (missingKeys.length > 0) {
    return fail({
      id,
      service: "Socrata",
      label,
      summary: "Socrata dataset check cannot run because the app token is missing.",
      details: { missing: missingKeys },
    });
  }

  try {
    const { latencyMs, result } = await timed(() =>
      fetchWithTimeout(url, {
        headers: {
          "X-App-Token": envValue("SOCRATA_APP_TOKEN")!,
        },
      })
    );

    if (!result.ok) {
      return fail({
        id,
        service: "Socrata",
        label,
        summary: "Socrata returned an error for a seeded public dataset probe.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }

    const rows = Array.isArray(result.body) ? result.body : [];
    const firstRow = rows[0];

    return pass({
      id,
      service: "Socrata",
      label,
      summary: "Socrata app token can read this public city dataset.",
      latencyMs,
      details: {
        rowsReturned: rows.length,
        firstRowKeys: Object.keys(asRecord(firstRow) ?? {}),
      },
      sample: sampleRows(rows, 3, 14),
    });
  } catch (error) {
    return fail({
      id,
      service: "Socrata",
      label,
      summary: "Socrata dataset request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkTloRssLiveData(): Promise<DiagnosticCheck> {
  const feeds = [
    {
      name: "Upcoming House Committee Meetings",
      url: "https://capitol.texas.gov/MyTLO/RSS/RSS.aspx?Type=upcomingmeetingshouse",
    },
    {
      name: "Upcoming Senate Committee Meetings",
      url: "https://capitol.texas.gov/MyTLO/RSS/RSS.aspx?Type=upcomingmeetingssenate",
    },
    {
      name: "Today's Bill Text",
      url: "https://capitol.texas.gov/MyTLO/RSS/RSS.aspx?Type=todaysbilltext",
    },
  ];

  try {
    const { latencyMs, result } = await timed(async () => {
      const responses = await Promise.all(
        feeds.map(async (feed) => {
          const response = await fetchWithTimeout(feed.url);
          const xml = typeof response.body === "string" ? response.body : response.textPreview;
          return {
            ...feed,
            ok: response.ok,
            status: response.status,
            contentType: response.contentType,
            items: parseRssItems(xml, 5),
          };
        })
      );

      return responses;
    });

    const failed = result.filter((feed) => !feed.ok);
    if (failed.length > 0) {
      return warn({
        id: "tlo-rss-live",
        service: "Texas Legislature Online",
        label: "RSS legislative activity",
        summary: "One or more TLO RSS feeds did not return cleanly.",
        latencyMs,
        details: { failed },
      });
    }

    return pass({
      id: "tlo-rss-live",
      service: "Texas Legislature Online",
      label: "RSS legislative activity",
      summary: "TLO RSS feeds returned live legislative activity data.",
      latencyMs,
      details: {
        feedsChecked: result.length,
        itemCounts: result.map((feed) => ({
          name: feed.name,
          count: feed.items.length,
        })),
      },
      sample: result.map((feed) => ({
        name: feed.name,
        url: feed.url,
        items: feed.items,
      })),
    });
  } catch (error) {
    return warn({
      id: "tlo-rss-live",
      service: "Texas Legislature Online",
      label: "RSS legislative activity",
      summary: "TLO RSS live-data probe failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkTloBillTextDocument(): Promise<DiagnosticCheck> {
  const url = "https://capitol.texas.gov/tlodocs/892/billtext/html/HB00023F.htm";

  try {
    const { latencyMs, result } = await timed(() => fetchWithTimeout(url));
    const text = typeof result.body === "string" ? result.body : result.textPreview;
    const plainText = text
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!result.ok || plainText.length < 100) {
      return warn({
        id: "tlo-bill-text",
        service: "Texas Legislature Online",
        label: "Bill text document",
        summary: "TLO bill text page responded, but the document text looked incomplete.",
        latencyMs,
        details: {
          status: result.status,
          contentType: result.contentType,
          textLength: plainText.length,
        },
        sample: plainText.slice(0, 500),
      });
    }

    return pass({
      id: "tlo-bill-text",
      service: "Texas Legislature Online",
      label: "Bill text document",
      summary: "TLO bill text HTML is reachable and parseable.",
      latencyMs,
      details: {
        status: result.status,
        contentType: result.contentType,
        textLength: plainText.length,
        url,
      },
      sample: plainText.slice(0, 900),
    });
  } catch (error) {
    return warn({
      id: "tlo-bill-text",
      service: "Texas Legislature Online",
      label: "Bill text document",
      summary: "TLO bill text probe failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkTecPackage(
  id: string,
  label: string,
  pageUrl: string,
  zipUrl: string
): Promise<DiagnosticCheck> {
  try {
    const { latencyMs, result } = await timed(async () => {
      const [page, zip] = await Promise.all([
        fetchWithTimeout(pageUrl),
        fetchWithTimeout(zipUrl, { method: "HEAD" }),
      ]);
      return { page, zip };
    });

    if (!result.page.ok || !result.zip.ok) {
      return warn({
        id,
        service: "Texas Ethics Commission",
        label,
        summary: "TEC page or CSV package endpoint did not return cleanly.",
        latencyMs,
        details: {
          pageStatus: result.page.status,
          zipStatus: result.zip.status,
          zipContentType: result.zip.contentType,
        },
      });
    }

    return pass({
      id,
      service: "Texas Ethics Commission",
      label,
      summary:
        "TEC public data page and CSV package are reachable. The package is intentionally not downloaded in diagnostics.",
      latencyMs,
      details: {
        pageStatus: result.page.status,
        zipStatus: result.zip.status,
        zipContentType: result.zip.contentType,
        zipContentLengthBytes: result.zip.headers["content-length"],
        zipLastModified: result.zip.headers["last-modified"],
        pageUrl,
        zipUrl,
      },
      sample: {
        packageUrl: zipUrl,
        bytes: result.zip.headers["content-length"],
        lastModified: result.zip.headers["last-modified"],
        contentType: result.zip.contentType,
      },
    });
  } catch (error) {
    return warn({
      id,
      service: "Texas Ethics Commission",
      label,
      summary: "TEC package probe failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkSocrataApiKeyPair(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["SOCRATA_API_KEY_ID", "SOCRATA_API_KEY_SECRET"]);
  if (missingKeys.length > 0) {
    return warn({
      id: "socrata-api-key-pair",
      service: "Socrata",
      label: "API key pair",
      summary:
        "Socrata API key ID/secret are optional for first-pass public reads; the app token is the required read-path credential.",
      details: { missing: missingKeys },
    });
  }

  try {
    const basicToken = Buffer.from(
      `${envValue("SOCRATA_API_KEY_ID")}:${envValue("SOCRATA_API_KEY_SECRET")}`
    ).toString("base64");
    const { latencyMs, result } = await timed(() =>
      fetchWithTimeout(
        "https://data.austintexas.gov/resource/3syk-w9eu.json?$limit=1",
        {
          headers: {
            Authorization: `Basic ${basicToken}`,
            "X-App-Token": envValue("SOCRATA_APP_TOKEN") ?? "",
          },
        }
      )
    );

    if (!result.ok) {
      return warn({
        id: "socrata-api-key-pair",
        service: "Socrata",
        label: "API key pair",
        summary:
          "Socrata API key pair did not authenticate on a public read probe; this is not required for first-pass MVP reads.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }

    const rows = Array.isArray(result.body) ? result.body : [];

    return pass({
      id: "socrata-api-key-pair",
      service: "Socrata",
      label: "API key pair",
      summary: "Socrata API key ID/secret were accepted on a public read probe.",
      latencyMs,
      details: { rowsReturned: rows.length },
      sample: sampleRecord(rows[0]),
    });
  } catch (error) {
    return warn({
      id: "socrata-api-key-pair",
      service: "Socrata",
      label: "API key pair",
      summary: "Socrata API key-pair request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkApify(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["APIFY_API_KEY"]);
  if (missingKeys.length > 0) {
    return warn({
      id: "apify",
      service: "Apify",
      label: "Account token",
      summary: "Apify is optional/later in the plan, and no token is configured.",
      details: { missing: missingKeys },
    });
  }

  try {
    const { latencyMs, result } = await timed(() =>
      fetchWithTimeout("https://api.apify.com/v2/users/me", {
        headers: {
          Authorization: `Bearer ${envValue("APIFY_API_KEY")}`,
        },
      })
    );

    if (!result.ok) {
      return fail({
        id: "apify",
        service: "Apify",
        label: "Account token",
        summary: "Apify returned an error for the account-token probe.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }

    const data = asRecord(asRecord(result.body)?.data) ?? asRecord(result.body) ?? {};

    return pass({
      id: "apify",
      service: "Apify",
      label: "Account token",
      summary: "Apify token can read account metadata.",
      latencyMs,
      details: {
        idPresent: typeof data.id === "string",
        username: data.username,
      },
      sample: {
        id: data.id,
        username: data.username,
        emailPresent: typeof data.email === "string",
      },
    });
  } catch (error) {
    return fail({
      id: "apify",
      service: "Apify",
      label: "Account token",
      summary: "Apify request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkPublicPage(
  id: string,
  service: string,
  label: string,
  url: string,
  expectedText?: string
): Promise<DiagnosticCheck> {
  try {
    const { latencyMs, result } = await timed(() => fetchWithTimeout(url));
    const text = typeof result.body === "string" ? result.body : result.textPreview;
    const matched = expectedText ? text.toLowerCase().includes(expectedText.toLowerCase()) : true;

    if (!result.ok || !matched) {
      return warn({
        id,
        service,
        label,
        summary: "Public source responded, but the probe did not find the expected page shape.",
        latencyMs,
        details: {
          status: result.status,
          statusText: result.statusText,
          contentType: result.contentType,
          expectedTextMatched: matched,
        },
        sample: result.textPreview,
      });
    }

    return pass({
      id,
      service,
      label,
      summary: "Public source is reachable and returned the expected page shape.",
      latencyMs,
      details: {
        status: result.status,
        contentType: result.contentType,
        expectedTextMatched: matched,
      },
    });
  } catch (error) {
    return warn({
      id,
      service,
      label,
      summary: "Public source probe failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function runDiagnostics(): Promise<DiagnosticsReport> {
  const [
    environment,
    supabaseServiceRole,
    supabaseAnon,
    openAiBasic,
    openAiStructuredOutput,
    openAiReportGeneration,
    exaSearch,
    openStates,
    openStatesBills,
    socrataAustin,
    socrataAustinZoningCases,
    socrataAustinZoningByAddress,
    socrataDallas,
    socrataApiKeyPair,
    apify,
    tloPublic,
    tloRssLive,
    tloBillText,
    tecPublic,
    tecLobbyPackage,
    tecCampaignFinancePackage,
  ] = await Promise.all([
    checkEnvironment(),
    checkSupabaseServiceRole(),
    checkSupabaseAnon(),
    checkOpenAiBasic(),
    checkOpenAiStructuredOutput(),
    checkOpenAiReportGeneration(),
    checkExaSearch(),
    checkOpenStates(),
    checkOpenStatesBills(),
    checkSocrataDataset(
      "socrata-austin",
      "Austin permits live sample",
      "https://data.austintexas.gov/resource/3syk-w9eu.json?%24limit=3&%24order=issue_date%20DESC"
    ),
    checkSocrataDataset(
      "socrata-austin-zoning-cases",
      "Austin zoning cases live sample",
      "https://data.austintexas.gov/resource/edir-dcnf.json?%24limit=3&%24order=data_portal_update%20DESC"
    ),
    checkSocrataDataset(
      "socrata-austin-zoning-by-address",
      "Austin zoning by address live sample",
      "https://data.austintexas.gov/resource/nbzi-qabm.json?%24limit=3"
    ),
    checkSocrataDataset(
      "socrata-dallas",
      "Dallas permits live sample",
      "https://www.dallasopendata.com/resource/e7gq-4sah.json?%24limit=3&%24order=permit_number%20DESC"
    ),
    checkSocrataApiKeyPair(),
    checkApify(),
    checkPublicPage(
      "tlo-public",
      "Texas Legislature Online",
      "Public source reachability",
      "https://capitol.texas.gov/",
      "Texas Legislature Online"
    ),
    checkTloRssLiveData(),
    checkTloBillTextDocument(),
    checkPublicPage(
      "tec-public",
      "Texas Ethics Commission",
      "Public source reachability",
      "https://www.ethics.state.tx.us/search/lobby/",
      "lobby"
    ),
    checkTecPackage(
      "tec-lobby-package",
      "Lobby activity CSV package",
      "https://www.ethics.state.tx.us/search/lobby/",
      "https://prd.tecprd.ethicsefile.com/public/lobby/public/TEC_LA_CSV.zip"
    ),
    checkTecPackage(
      "tec-campaign-finance-package",
      "Campaign finance CSV package",
      "https://www.ethics.state.tx.us/search/cf/",
      "https://prd.tecprd.ethicsefile.com/public/cf/public/TEC_CF_CSV.zip"
    ),
  ]);

  const checks = [
    environment,
    supabaseServiceRole,
    supabaseAnon,
    openAiBasic,
    openAiStructuredOutput,
    openAiReportGeneration,
    exaSearch,
    openStates,
    openStatesBills,
    socrataAustin,
    socrataAustinZoningCases,
    socrataAustinZoningByAddress,
    socrataDallas,
    socrataApiKeyPair,
    apify,
    tloPublic,
    tloRssLive,
    tloBillText,
    tecPublic,
    tecLobbyPackage,
    tecCampaignFinancePackage,
  ];

  const overallStatus = checks.some((check) => check.status === "fail")
    ? "fail"
    : checks.some((check) => check.status === "warn")
      ? "warn"
      : "pass";

  return {
    generatedAt: new Date().toISOString(),
    overallStatus,
    checks,
  };
}
