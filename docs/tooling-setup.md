# Tooling Setup

## Provisioned Resources

- Supabase: `Augur - Texas Intelligence for Businesses`, project ref `tsikkexwjfbfafwmolna`, region `us-east-2`
- Vercel: `augur-texas-intelligence-for-businesses`, root directory `frontend`
- Railway: `Augur`, production environment, `augur-worker` service, deploy path `workers/ingest`

Vercel rejected the exact human-readable name because Vercel project names must be lowercase slugs. Railway rejected the exact human-readable name and also hit the current free-plan project/service limit when creating additional resources, so the existing production Railway project is being used.

## Decision

Use CLI and MCP together.

CLI is the durable project workflow: cloud project creation, hosted environment configuration, production deployments, logs, and CI/CD. MCP is the agent-control surface: it lets Codex inspect and operate hosted services through OAuth-scoped tools.

## Supabase

Use Supabase CLI for cloud project operations and hosted type generation. Do not run the local Supabase stack for this project.

Use Supabase MCP scoped to the Augur project ref `tsikkexwjfbfafwmolna`. Prefer project-scoped access and avoid broad access to every Supabase project.

## Railway

Use Railway CLI for project/service linking, variables, deploys, logs, and worker operations. Railway CLI is globally installed and authenticated.

Use Railway MCP for Codex-driven infrastructure operations. Railway remote MCP is installed in Codex config.

## Vercel

Use Vercel CLI for project linking, production environment variables, production deployments, and deployment inspection. The production frontend is the top-level `frontend` workspace.

Use Vercel MCP for Codex-driven project/deployment/log/docs operations. Vercel remote MCP is installed in Codex config.
