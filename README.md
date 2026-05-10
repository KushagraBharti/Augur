# Augur

Texas intelligence for businesses evaluating expansion, permitting, policy, and market risk.

## Repo Layout

- `frontend` - Next.js app deployed on Vercel.
- `backend` - thin Node service placeholder for backend-only routes/jobs that do not belong in Next.js.
- `workers` - Railway workers for long-running ingestion and agent jobs.
- `shared` - shared TypeScript types and reusable logic.
- `mcp` - MCP/tool exposure, kept minimal until a separate service is actually needed.
- `supabase` - database migrations for the cloud Supabase project.
- `docs` - product plan, implementation plan, setup notes, and transcript context.
- `skills` - local Augur agent skill/reference material.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in the real values.

3. Verify the app can build:

```bash
npm run build
```

## Dev

Start the whole local stack from the project root:

```bash
npm run dev
```

That starts:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:3010/health`
- Worker health: `http://localhost:3020/health`

The dev runner loads root `.env.local` and passes it to every service.

For Railway live monitoring, set these on the `augur-worker` service:

```text
AUGUR_LIVE_MONITOR_ENABLED=true
AUGUR_LIVE_MONITOR_MIN_HOURS=20
```

The worker will queue at most one LoneStar Live Monitor run within that window, then execute it through the same bounded Augur Analyst pipeline as manual runs.

## Diagnostics

After `npm run dev`, open:

```text
http://localhost:3000/diagnostics
```

This tests Supabase, OpenAI, Exa, OpenStates, Socrata, Apify, and public Texas data sources without exposing secret values in the browser.

## MCP

Augur exposes a bounded MCP server from `mcp/src/index.js`. It uses the same shared runtime and demo company data as the dashboard.

Stdio mode:

```bash
npm --workspace mcp run start
```

HTTP mode for Railway or local service checks:

```bash
$env:PORT=3030; npm --workspace mcp run start
```

Available tools:

- `augur.search_texas_bills`
- `augur.get_texas_bill_documents`
- `augur.query_city_dataset`
- `augur.search_lobby_activity`
- `augur.compare_expansion_signals`
- `augur.generate_business_brief`

Available resources include `augur://sources`, `augur://schema`, `augur://company/lonestar-retail-group`, `augur://latest-report`, and `augur://scoring-model`.

## Useful Commands

```bash
npm run build
npm run dev
npm run supabase:types
npm run vercel
npm run railway
```
