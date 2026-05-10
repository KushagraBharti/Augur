# Augur Implementation Plan

This plan follows dependency order, not reduced product versions.

## 1. Foundation

Create the simple workspace structure: `frontend`, `backend`, `workers`, `shared`, `mcp`, and the Augur skill.

Keep `backend` thin. The MVP should use `frontend` for Next.js UI, auth, route handlers, and server actions; `shared` for reusable data and agent logic; `workers` for Railway jobs; and `mcp` for tool exposure.

## 2. Database

Create Supabase migrations for companies, data sources, raw records, normalized city records, bills, bill documents, lobby records, signal scores, agent runs, tool calls, evidence items, reports, and contact paths.

Add basic Supabase email/password auth. Each user account is keyed by unique email and can create or load one company profile. Seed LoneStar Retail Group as the demo company.

## 3. Data Connectors

Implement connectors in `shared` for OpenStates, TLO RSS, TLO FTP, TEC lobbying downloads, TEC campaign-finance data if clean, Austin Socrata, Dallas Socrata, San Antonio CKAN/API/downloads, and Houston if clean.

Use Austin council districts as the first deep geo unit. Austin is the deepest first city; Dallas and San Antonio are solid but lighter; Houston can be lower-confidence if the connector is weaker.

## 4. Agent Tools

Wrap core functions as bounded tools: `search_texas_bills`, `get_texas_bill_documents`, `query_city_dataset`, `search_lobby_activity`, `web_research`, `update_signal_scores`, and `save_markdown_report`.

Every tool call writes to `agent_tool_calls`.

Use Exa as the preferred web research API when configured. Keep secondary web fetching/search bounded to live official public pages.

## 5. Ask Mode

Implement the prompt-driven Augur Analyst flow: load company profile, call tools, retrieve evidence, update scores, save report, and render activity.

Vercel creates the `agent_runs` row from the dashboard. A Railway worker executes the long-running agent loop, calls native OpenAI through a provider wrapper, writes activity/evidence rows, updates scores, and saves the final report.

Use `gpt-5.4-mini` with medium reasoning effort as the MVP model. Legacy provider paths should not stay on the critical report or agent path.

The frontend should poll for progress every few seconds. Do not require Supabase Realtime for the MVP.

## 6. Live And Replay Monitor

Implement `SignalWindow` with `live` and `replay` modes. Both modes run the same pipeline. Replay only uses real cached historical public records.

Choose a real historical Texas policy/data window for Replay Mode by researching actual public events. Do not add fake replay fixtures.

## 7. Dashboard

Build the dark command-center UI with Overview, Texas Map, City Signals, Bills, Lobby Signals, Reports, and Agent Runs. Keep raw data behind evidence drawers.

The first screen is the Overview dashboard. Activity logs should show production-readable summaries, source names, links, evidence IDs, timestamps, and statuses, with raw JSON hidden behind deeper debug views if needed.

## 8. MCP And Skill

Expose Augur MCP tools from `mcp` using functions from `shared`. Keep the tracked Augur skill in `skills/augur-texas-business-intelligence`.

## 9. Miro

Add report-to-Miro sync only after the core product is working.

---

# Detailed Execution Checklist

This section expands the dependency order above into the concrete build path. `plan.md` remains the detailed product truth; this file is the build checklist.

## Phase 0. Confirm Cloud Wiring

Goal: make sure the project is production-cloud-first before building features.

Tasks:

- Confirm Supabase project `Augur - Texas Intelligence for Businesses` is reachable.
- Confirm Vercel project `augur-texas-intelligence-for-businesses` points at `frontend`.
- Confirm Railway project `Augur` has production environment available.
- Confirm `.env` values are configured in the appropriate platforms, not committed.
- Keep local Supabase disabled. Do not add Docker as a required app dependency.

Acceptance:

- `frontend` can read public Supabase env vars.
- server/worker code can read Supabase service-role env var only in server environments.
- Vercel and Railway both build from the simplified repo layout.

## Phase 1. Repo and Shared Contracts

Goal: define the code boundaries before feature work spreads.

Tasks:

- Keep `frontend`, `backend`, `workers`, `shared`, `mcp`, `skills`, and `docs`.
- Keep `backend` thin and mostly empty until there is a clear need for a standalone service.
- Put shared schemas, connector types, agent tool types, score validators, and Supabase helpers in `shared`.
- Make all app/worker/MCP code import shared logic instead of duplicating connector or validation logic.
- Add TypeScript path aliases only if they are simple and work from Vercel/Railway builds.

Acceptance:

- No old `apps/` or `packages/augur-core` paths remain in active docs or scripts.
- `shared` is the single reusable business-logic layer.
- `backend` does not become a second app by accident.

## Phase 2. Supabase Schema and Seeds

Goal: create the database foundation for real data, evidence, runs, reports, and multi-company support.

Tasks:

- Create migrations for:
  - `companies`
  - `company_geo_targets`
  - `data_sources`
  - `raw_records`
  - `city_records`
  - `bills`
  - `bill_documents`
  - `lobby_records`
  - campaign-finance records if the first data inspection supports a clean shape
  - `signal_scores`
  - `agent_runs`
  - `agent_tool_calls`
  - `evidence_items`
  - `reports`
  - `contact_paths`
- Add updated timestamps where needed.
- Add uniqueness constraints for external records where useful.
- Seed LoneStar Retail Group.
- Seed initial data source registry rows.
- Seed initial city targets: Austin, Dallas, Houston, San Antonio.

Acceptance:

- Migrations apply cleanly to Supabase cloud.
- LoneStar exists as a demo company.
- Source registry has the core sources.
- Tables support raw record retention and evidence linking.

## Phase 3. Basic Auth and Company Onboarding

Goal: make the app usable by a real user without overbuilding account management.

Tasks:

- Add Supabase email/password sign-up.
- Add Supabase email/password login.
- Use email uniqueness through Supabase Auth.
- On first authenticated entry, prompt user to create a company profile.
- Associate the authenticated user/email with one primary company profile for MVP.
- Allow loading the seeded LoneStar demo company for demo/development.
- Keep UI simple: no teams, roles, org invites, SSO, or complex permissions.

Acceptance:

- A user can sign up with email/password.
- A user can log in.
- A user can create a company profile.
- A user lands on Overview after auth/onboarding.
- LoneStar can be loaded as demo data.

## Phase 4. Data Connectors

Goal: ingest real public records and normalize enough for agent tools.

Tasks:

- Implement source registry helpers.
- Implement raw record upsert helpers with hashes or source-specific unique keys.
- Implement Austin Socrata connector:
  - issued construction permits
  - zoning cases
  - Austin council district as first deep geo unit
- Implement OpenStates connector for Texas bills.
- Implement TLO RSS parser for change detection.
- Implement TLO official document fetch/cache path.
- Implement Dallas connector:
  - building permits
  - certificate/code/occupancy context where clean
- Implement San Antonio connector:
  - permits
  - future land use or equivalent if clean
- Implement TEC lobbying importer.
- Implement TEC campaign-finance importer if clean enough after inspection.
- Implement Houston connector only if it is clean enough; otherwise mark Houston lower-confidence/watchlisted.
- Add connector scripts/workers that can run on Railway.

Acceptance:

- Connectors write raw records.
- Normalized city records exist for core city datasets.
- Bills and bill documents can be cached.
- Lobbying/campaign-finance data has at least useful searchable normalized fields.
- Source failures are captured visibly, not swallowed.

## Phase 5. Agent Tool Layer

Goal: expose bounded, logged tools that the model can safely use.

Tasks:

- Implement `search_texas_bills`.
- Implement `get_texas_bill_documents`.
- Implement `query_city_dataset`.
- Implement `search_lobby_activity`.
- Add campaign-finance search or fold it into policy/influence search if the schema is clean.
- Implement `web_research` with Exa as preferred provider.
- Keep secondary web research bounded to live official pages.
- Implement `update_signal_scores`.
- Implement `save_markdown_report`.
- Add evidence creation helpers.
- Ensure every tool call writes to `agent_tool_calls`.
- Return compact summaries, record counts, evidence IDs, and source links instead of huge raw payloads.

Acceptance:

- Tools can be called without the model.
- Tool logs are readable in `agent_tool_calls`.
- Tool outputs are small enough for model context.
- Evidence IDs can be traced back to raw records/public URLs.
- Score writes validate bounds and evidence IDs.

## Phase 6. Native OpenAI Provider

Goal: make model calls reliable and restore full report output through native OpenAI calls.

Tasks:

- Check current official OpenAI docs before implementing the request shape.
- Add/configure `OPENAI_API_KEY`.
- Add/configure `OPENAI_MODEL`, defaulting to `gpt-5.4-mini`.
- Add/configure `OPENAI_REASONING_EFFORT`, defaulting to `medium`.
- Implement an OpenAI provider wrapper.
- Prefer the Responses API if it is the cleanest fit for reasoning, tools, and structured output.
- Use Chat Completions only if it is simpler and still supports the needed behavior.
- Add timeout and token limits.
- Verify:
  - basic model call
  - medium reasoning configuration
  - single tool call or structured action output
  - multi-step tool call or structured action loop
  - structured JSON output
  - full markdown report generation
  - explicit failure after model write and one repair attempt fail
- Keep legacy provider code off the critical path.

Acceptance:

- Provider wrapper can run `gpt-5.4-mini`.
- Provider wrapper can execute at least one tool/action path.
- Reports are generated by OpenAI, validated, and saved only after passing required-section checks.
- Saved reports use accurate `summary_json.generated_by`: `openai_gpt_5_4_mini` or `openai_model_repaired`.
- Failure mode is explicit and logged.
- Agent code does not depend directly on OpenAI-specific details outside the provider wrapper.

## Phase 7. Ask Mode Worker

Goal: create the first end-to-end agent run.

Tasks:

- Add Vercel route/server action to create an `agent_runs` row with status `queued`.
- Add Railway worker job loop to claim queued runs.
- Load company profile and prompt.
- Run Augur Analyst observe-act-observe loop.
- Call tools through the tool registry.
- Save production-readable activity summaries.
- Update city-level scores through `update_signal_scores`.
- Save one final markdown report through `save_markdown_report`.
- Mark run completed or failed.
- Lower confidence and report source gaps when data calls fail.

Acceptance:

- User can trigger Ask Mode from dashboard.
- Railway worker completes the run.
- Activity rows appear during execution.
- Scores update.
- Report appears after completion.
- Recommendation is data-driven, not hardcoded.

## Phase 8. Dashboard

Goal: make the product feel like a serious intelligence dashboard, not a raw data viewer.

Tasks:

- Build Overview as the first screen.
- Build dark command-center layout.
- Add left navigation:
  - Overview
  - Texas Map
  - City Signals
  - Bills
  - Lobby Signals
  - Reports
  - Agent Runs
- Build interactive Texas map with Austin, Dallas, Houston, and San Antonio.
- Add city cards with five scores.
- Add Ask Mode entry point using the core demo prompt.
- Add active Augur Analyst side panel.
- Poll run status every few seconds.
- Add report viewer for markdown reports.
- Add evidence drawer.
- Keep raw data behind drawer/debug layers.
- Keep activity logs compact and human-readable.

Acceptance:

- Overview is the default post-login screen.
- Map hover/click interactions work.
- City scores render.
- Active run panel updates via polling.
- Final report renders cleanly.
- Evidence drawer shows source names, URLs, windows, record counts, samples, and why evidence matters.

## Phase 9. Live Monitor

Goal: run a production-shaped daily monitor over recent records.

Tasks:

- Implement `SignalWindow` for live mode.
- Use last 24 hours or configured recent window.
- Scan TLO RSS/OpenStates updates.
- Scan recent city record deltas where available.
- Search lobby/campaign-finance context when policy movement is relevant.
- Generate a daily monitor report.
- Update scores when warranted.
- Schedule on Railway after manual runs work.

Acceptance:

- Manual live monitor run works first.
- Scheduled Railway run works after manual verification.
- "No major new signal" is a valid source-backed output.
- Any detected source failure appears in the activity log/report.

## Phase 10. Replay Monitor

Goal: create a dramatic demo without fake data.

Tasks:

- Research and pick a real historical Texas policy/data event window.
- Ensure needed records for that historical window are cached in Supabase.
- Implement `SignalWindow` for replay mode.
- Run the same monitor pipeline against cached historical public records.
- Generate Replay Texas Signal Brief.
- Update scores if appropriate.

Acceptance:

- Replay uses only real cached public records.
- No fake bills, alerts, or records exist.
- Replay report explains the historical window.
- Replay output demonstrates what Augur would have flagged.

## Phase 11. MCP Server

Goal: ship the custom MCP layer for judges and agent interoperability.

Tasks:

- Build MCP server in `mcp`.
- Import tool functions from `shared`.
- Expose:
  - `augur.search_texas_bills`
  - `augur.get_texas_bill_documents`
  - `augur.query_city_dataset`
  - `augur.search_lobby_activity`
  - `augur.compare_expansion_signals`
  - `augur.generate_business_brief`
- Add resources:
  - `augur://sources`
  - `augur://schema`
  - `augur://company/lonestar-retail-group`
  - `augur://latest-report`
  - `augur://scoring-model`
- Deploy on Railway as its own service if service capacity allows.

Acceptance:

- MCP server starts.
- Tools list correctly.
- At least one tool can be called successfully.
- README or docs explain how to connect.

## Phase 12. Augur Skill

Goal: ship a proper skill that explains how to use Augur safely.

Tasks:

- Create/maintain `skills/augur-texas-business-intelligence/SKILL.md`.
- Add references:
  - `data-sources.md`
  - `safety-policy.md`
  - `scoring-model.md`
- Add demo script if useful.
- Make skill instructions align with `plan.md`.

Acceptance:

- Skill has valid name/description frontmatter.
- Skill explains source-backed workflow.
- Skill forbids fake data, legal advice, deceptive lobbying, and external sending.
- Skill references Augur MCP tools.

## Phase 13. Miro

Goal: add sponsor-facing visual output only after the core product works.

Tasks:

- Add report-to-Miro sync.
- Create Texas map board section.
- Create city comparison cards.
- Create policy alert card.
- Create Response Plan cards.
- Create evidence cards.

Acceptance:

- Miro sync is optional.
- Core product works without Miro.
- Miro output reflects real report/evidence data.

## Phase 14. Deep Agent And Report Overhaul

Goal: replace the current shallow agent behavior with the full bounded analyst described in `plan.md`.

This phase is required before treating the agent as demo-ready.

Provider correction: report generation and agent reasoning use native OpenAI with `gpt-5.4-mini` and medium reasoning effort, with full required report output.

Tasks:

- Add a real prompt-building module in `shared`.
- Build separate prompt/context builders for:
  - Analysis Runner;
  - Live Monitor;
  - Replay Monitor.
- Add a full first-call context packet containing:
  - company dossier;
  - user objective;
  - decision frame;
  - available source registry;
  - known city depth and confidence caveats;
  - prior scores;
  - prior reports or latest report summary when available;
  - tool policy;
  - output contract.
- Persist run memory:
  - model request summary;
  - assistant action requests;
  - tool calls;
  - tool responses;
  - evidence IDs;
  - score updates;
  - source failures;
  - final report request.
- Make every later LLM call include the relevant prior messages/tool results because the model is stateless.
- Keep native OpenAI tool calling or structured action output as the primary path.
- Keep legacy provider paths out of the runtime.
- Use structured JSON action output when native `tool_calls` are unreliable.
- Validate every model action before executing it.
- Expand tools beyond diagnostics:
  - `get_company_dossier`;
  - `list_available_sources`;
  - `inspect_city_record`;
  - `search_campaign_finance`;
  - `find_public_contact_paths`;
  - `draft_outreach_email`;
  - `draft_talking_points`;
  - `draft_social_campaign`;
  - `suggest_visual_assets`.
- Make drafting tools produce database/report artifacts only.
- Do not send emails, post social content, create accounts, buy ads, or automate engagement.
- Replace placeholder report generation with an OpenAI-authored consultant memo that is validated and saved.
- Restore full report behavior: keep every required section and allow substantial output. Do not compress the report for provider timeouts.

Acceptance:

- A run has a visible transcript/activity trail that proves the agent inspected sources.
- The final report is substantially more complete than the current surface-level markdown.
- The report path saves `generated_by` as `openai_gpt_5_4_mini` or `openai_model_repaired`.
- Report claims cite evidence IDs or state uncertainty.
- The agent can draft response assets without executing external actions.
- Source failures are shown and lower confidence.
- Score writes are bounded and validated.

## Phase 15. Product UI Repair

Goal: turn the current working app into a credible desktop product instead of a one-page or cheap demo surface.

Tasks:

- Preserve separate routes:
  - `/login`;
  - `/signup`;
  - `/onboarding`;
  - `/dashboard`;
  - `/runs`;
  - `/runs/[id]`;
  - `/reports/[id]`;
  - `/diagnostics`.
- Rework dashboard as a desktop operations screen:
  - Texas map / city signal overview;
  - current company context;
  - score summary;
  - latest report;
  - monitor status;
  - recent evidence-backed alerts;
  - clear navigation to run analysis.
- Rework run detail:
  - status header;
  - activity timeline;
  - tool/source calls;
  - evidence found;
  - score updates;
  - failure/degraded-source notices;
  - final report link.
- Rework report page:
  - full-width memo reader;
  - executive summary;
  - recommendation;
  - city comparison;
  - policy and market risk;
  - response plan;
  - evidence table;
  - drafted outreach/talking points when present.
- Keep the app dense, calm, and business-focused.
- Avoid giant marketing hero sections inside the app.
- Avoid card-in-card layouts and decorative filler.
- Prioritize desktop demo quality first.

Acceptance:

- The app looks like a serious Texas intelligence workspace.
- The user can understand where they are at every step.
- Login, onboarding, dashboard, run progress, and report reading feel like separate coherent workflows.
- The UI exposes agent depth instead of hiding everything inside a final markdown blob.
