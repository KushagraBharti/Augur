# Augur Agent Notes

Augur is a Texas public-data intelligence dashboard for retail landlords and real estate development teams. Keep implementation aligned with `docs/plan.md`.

Core constraints:
- Use one main agent, Augur Analyst, with bounded tools. Do not invent fake sub-agents.
- Use real public data only: live APIs, official downloads, cached public records, or real historical replay. No fake demo alerts or hardcoded recommendation paths.
- Store raw records, normalized records, evidence, reports, score snapshots, agent runs, and tool calls in Supabase.
- Use Vercel for the Next.js web app, Railway for ingestion/monitor/MCP services, and Supabase for database/state.
- Keep reports source-backed and distinguish facts, assumptions, interpretations, and recommendations.
- Policy output can include contact paths and talking points, but must not frame public records as manipulation or legal advice.

Tooling:
- Supabase CLI is installed locally as a dev dependency. Use `npm run supabase -- <command>` or `npx supabase <command>`.
- Vercel CLI is installed globally and authenticated.
- Railway CLI is installed globally and authenticated.
- Vercel and Railway MCP are configured for Codex. Supabase MCP must be configured with the Augur project ref after the Supabase cloud project is created.

Skills:
- Use the Supabase skill for any Supabase CLI, MCP, schema, migration, RLS, or auth work.
- Use Supabase Postgres best practices for SQL/schema/index design.
- Use Railway guidance for project/service/deployment/variable work.
- Use Vercel/React guidance for Next.js app implementation and performance.
- Use frontend-design guidance when building the dashboard UI.
