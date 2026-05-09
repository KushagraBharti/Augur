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
  "FEATHERLESS_API_KEY",
  "FEATHERLESS_MODEL",
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      textPreview: text.slice(0, 600),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFeatherlessChatCompletion(payload: Record<string, unknown>) {
  const request = () =>
    fetchWithTimeout("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${envValue("FEATHERLESS_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

  const firstAttempt = await request();
  if (firstAttempt.status !== 429) {
    return firstAttempt;
  }

  await sleep(15_000);
  return request();
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
      requiredPresent: present(REQUIRED_ENV_KEYS),
      requiredMissing,
      optionalPresent,
      optionalMissing,
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

async function checkFeatherlessChat(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["FEATHERLESS_API_KEY", "FEATHERLESS_MODEL"]);
  if (missingKeys.length > 0) {
    return fail({
      id: "featherless-chat",
      service: "Featherless",
      label: "Chat completion",
      summary: "Featherless chat check cannot run because required env is missing.",
      details: { missing: missingKeys },
    });
  }

  try {
    const { latencyMs, result } = await timed(() =>
      fetchFeatherlessChatCompletion({
        model: envValue("FEATHERLESS_MODEL"),
        messages: [
          {
            role: "system",
            content: "You are a terse diagnostics endpoint. Return only the requested text.",
          },
          {
            role: "user",
            content: "Return exactly: Augur diagnostics online",
          },
        ],
        max_tokens: 128,
        temperature: 0,
      })
    );

    const body = asRecord(result.body);
    const choices = Array.isArray(body?.choices) ? body.choices : [];
    const firstChoice = asRecord(choices[0]);
    const message = asRecord(firstChoice?.message);
    const content = typeof message?.content === "string" ? message.content : "";
    const reasoning = typeof message?.reasoning === "string" ? message.reasoning : "";

    if (!result.ok) {
      return fail({
        id: "featherless-chat",
        service: "Featherless",
        label: "Chat completion",
        summary: "Featherless returned an error for a basic chat completion.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }

    return pass({
      id: "featherless-chat",
      service: "Featherless",
      label: "Chat completion",
      summary: "Featherless accepted a basic OpenAI-compatible chat completion.",
      latencyMs,
      details: {
        model: body?.model,
        choiceCount: choices.length,
        usageKeys: Object.keys(asRecord(body?.usage) ?? {}),
        reasoningPresent: reasoning.length > 0,
      },
      sample: { content: content.slice(0, 300) },
    });
  } catch (error) {
    return fail({
      id: "featherless-chat",
      service: "Featherless",
      label: "Chat completion",
      summary: "Featherless chat request failed before returning usable data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function checkFeatherlessToolCalling(): Promise<DiagnosticCheck> {
  const missingKeys = missing(["FEATHERLESS_API_KEY", "FEATHERLESS_MODEL"]);
  if (missingKeys.length > 0) {
    return fail({
      id: "featherless-tools",
      service: "Featherless",
      label: "Tool calling",
      summary: "Featherless tool-call check cannot run because required env is missing.",
      details: { missing: missingKeys },
    });
  }

  try {
    const { latencyMs, result } = await timed(() =>
      fetchFeatherlessChatCompletion({
        model: envValue("FEATHERLESS_MODEL"),
        messages: [
          {
            role: "system",
            content:
              "You are testing tool-call compatibility. Use the provided tool.",
          },
          {
            role: "user",
            content: "Record that Augur setup diagnostics are online.",
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "record_setup_status",
              description: "Records a service setup check result.",
              parameters: {
                type: "object",
                properties: {
                  service: { type: "string" },
                  status: { type: "string", enum: ["online", "offline"] },
                  note: { type: "string" },
                },
                required: ["service", "status"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "record_setup_status" },
        },
        max_tokens: 128,
        temperature: 0,
      })
    );

    const body = asRecord(result.body);
    const choices = Array.isArray(body?.choices) ? body.choices : [];
    const message = asRecord(asRecord(choices[0])?.message);
    const toolCalls = Array.isArray(message?.tool_calls) ? message.tool_calls : [];

    if (!result.ok) {
      return warn({
        id: "featherless-tools",
        service: "Featherless",
        label: "Tool calling",
        summary:
          "Featherless basic chat can still be used, but this model/provider rejected the tool-call probe.",
        latencyMs,
        details: { status: result.status, statusText: result.statusText },
        error: bodyMessage(result.body) ?? result.textPreview,
      });
    }

    if (toolCalls.length === 0) {
      return warn({
        id: "featherless-tools",
        service: "Featherless",
        label: "Tool calling",
        summary:
          "Featherless returned a response, but no tool call was emitted for the forced tool-call probe.",
        latencyMs,
        details: { choiceCount: choices.length },
        sample: sampleRecord(message),
      });
    }

    return pass({
      id: "featherless-tools",
      service: "Featherless",
      label: "Tool calling",
      summary: "Featherless emitted an OpenAI-style tool call.",
      latencyMs,
      details: {
        toolCallCount: toolCalls.length,
        firstToolName: asRecord(asRecord(toolCalls[0])?.function)?.name,
      },
      sample: toolCalls.slice(0, 2),
    });
  } catch (error) {
    return warn({
      id: "featherless-tools",
      service: "Featherless",
      label: "Tool calling",
      summary: "Featherless tool-call request failed before returning usable data.",
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
      sample: sampleRecord(firstRow),
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
    exaSearch,
    openStates,
    socrataAustin,
    socrataDallas,
    socrataApiKeyPair,
    apify,
    tloPublic,
    tecPublic,
  ] = await Promise.all([
    checkEnvironment(),
    checkSupabaseServiceRole(),
    checkSupabaseAnon(),
    checkExaSearch(),
    checkOpenStates(),
    checkSocrataDataset(
      "socrata-austin",
      "Austin open-data sample",
      "https://data.austintexas.gov/resource/3syk-w9eu.json?$limit=1"
    ),
    checkSocrataDataset(
      "socrata-dallas",
      "Dallas open-data sample",
      "https://www.dallasopendata.com/resource/e7gq-4sah.json?$limit=1"
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
    checkPublicPage(
      "tec-public",
      "Texas Ethics Commission",
      "Public source reachability",
      "https://www.ethics.state.tx.us/search/lobby/",
      "lobby"
    ),
  ]);

  const featherlessChat = await checkFeatherlessChat();
  const featherlessToolCalling = await checkFeatherlessToolCalling();

  const checks = [
    environment,
    supabaseServiceRole,
    supabaseAnon,
    featherlessChat,
    featherlessToolCalling,
    exaSearch,
    openStates,
    socrataAustin,
    socrataDallas,
    socrataApiKeyPair,
    apify,
    tloPublic,
    tecPublic,
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
