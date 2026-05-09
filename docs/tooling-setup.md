# Tooling Setup

## Provisioned Resources

- Supabase: `Augur - Texas Intelligence for Businesses`, project ref `tsikkexwjfbfafwmolna`, region `us-east-2`
- Vercel: `augur-texas-intelligence-for-businesses`, root directory `frontend`
- Railway: `Augur`, production environment, `augur-worker` service for workers, `augur-mcp` service for MCP

Vercel rejected the exact human-readable name because Vercel project names must be lowercase slugs. Railway rejected the exact human-readable name, so the production Railway project is named `Augur`.

Current setup status:

- Vercel CLI is linked to project `augur-texas-intelligence-for-businesses`.
- Supabase CLI is linked to project ref `tsikkexwjfbfafwmolna`.
- Railway CLI is linked to project `Augur`, environment `production`, service `augur-worker`.
- Railway service `augur-mcp` exists in the same `Augur` project. It has baseline Supabase/app/model variables but should not be deployed until the MCP server implementation has a real start command.
- Vercel production env currently has Supabase vars, `APP_BASE_URL`, and `FEATHERLESS_MODEL`.
- Railway `augur-worker` currently has Supabase vars, Railway platform vars, `APP_BASE_URL`, and `FEATHERLESS_MODEL`.
- Railway `augur-mcp` currently has baseline Supabase vars, Railway platform vars, `APP_BASE_URL`, `FEATHERLESS_MODEL`, and `MCP_SERVICE_NAME`.

## Decision

Use CLI and MCP together.

CLI is the durable project workflow: cloud project creation, hosted environment configuration, production deployments, logs, and CI/CD. MCP is the agent-control surface: it lets Codex inspect and operate hosted services through OAuth-scoped tools.

## Supabase

Use Supabase CLI for cloud project operations and hosted type generation. Do not run the local Supabase stack for this project.

Use Supabase MCP scoped to the Augur project ref `tsikkexwjfbfafwmolna`. Prefer project-scoped access and avoid broad access to every Supabase project.

Needed Supabase variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_REF
SUPABASE_ACCESS_TOKEN
```

`NEXT_PUBLIC_*` values can be used in the browser. `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_ACCESS_TOKEN` are server/CLI-only and must never be exposed in frontend code.

## Railway

Use Railway CLI for project/service linking, variables, deploys, logs, and worker operations. Railway CLI is globally installed and authenticated.

Use Railway MCP for Codex-driven infrastructure operations. Railway remote MCP is installed in Codex config.

## Vercel

Use Vercel CLI for project linking, production environment variables, production deployments, and deployment inspection. The production frontend is the top-level `frontend` workspace.

Use Vercel MCP for Codex-driven project/deployment/log/docs operations. Vercel remote MCP is installed in Codex config.

## External API Keys

Required before the full agent can run:

```txt
FEATHERLESS_API_KEY
OPENSTATES_API_KEY
EXA_API_KEY
SOCRATA_APP_TOKEN
```

For Socrata/Austin/Dallas public open-data reads, `SOCRATA_APP_TOKEN` is the important value. Socrata app tokens are sent as the `X-App-Token` header and identify the Augur application for higher/better-attributed rate limits. Socrata API key ID/secret pairs are different: they are user credentials for Basic Auth and are only needed for authenticated/private/write operations. Augur should not need the API key pair for normal public city dataset reads.

Useful later:

```txt
APIFY_API_KEY
SOCRATA_API_KEY_ID
SOCRATA_API_KEY_SECRET
MIRO_CLIENT_ID
MIRO_CLIENT_SECRET
MIRO_ACCESS_TOKEN
VERCEL_TOKEN
RAILWAY_TOKEN
```

`FEATHERLESS_MODEL` is not secret. The current target value is:

```txt
FEATHERLESS_MODEL=moonshotai/Kimi-K2.6
```

`VERCEL_TOKEN` and `RAILWAY_TOKEN` are not needed for normal local CLI work while the user is logged in. They are only needed for CI or programmatic automation that cannot use the existing authenticated CLI session.
