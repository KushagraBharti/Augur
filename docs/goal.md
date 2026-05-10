# Autonomous Goal Instructions

Build Augur from the current working baseline into a much deeper, demo-ready hackathon MVP. Do not restart the repo and do not delete working functionality. First read `docs/plan.md` completely, then `docs/implementation-plan.md` completely, then inspect the current implementation before editing. `plan.md` is the product truth; `implementation-plan.md` is the execution guide.

Core instruction: the current app has working plumbing, but the product is too shallow. Improve depth, completeness, agent behavior, report quality, and desktop product polish. Work phase by phase, keep builds passing, and verify each phase before moving on.

## Skills To Use

Use installed skills when relevant:

- Supabase skill for DB/auth/data work.
- Supabase Postgres best practices for schema/query/migration changes.
- Railway skill for workers, cron-like services, env vars, deploys, and logs.
- Vercel/Next.js skills for frontend, API routes, deployments, env vars, and production behavior.
- Vercel AI SDK / AI Elements skills when improving agent, report, activity, or tool-call UI.
- Frontend-design / design-taste / high-end-visual-design skills for dashboard, run detail, report reader, and desktop app polish.
- Browser skill to verify localhost UI flows.

Use CLI first when efficient. Use MCP only when it is better.

## Preserve The Baseline

Current baseline to preserve:

- Auth routes exist.
- Onboarding exists.
- Dashboard exists.
- Runs and reports exist.
- Supabase cloud is wired.
- Railway worker exists.
- Vercel frontend exists.
- Diagnostics mostly pass.
- Native OpenAI API is the primary model path.
- Use `gpt-5.4-mini` with medium reasoning effort for the MVP.
- Legacy provider paths are removed from the MVP runtime and should not constrain report quality.

Do not throw this away. Upgrade it.

## Non-Negotiables

- No fake hardcoded recommendation, fake bill, fake alert, or fake source.
- No one-page demo collage.
- Keep dedicated routes: `/login`, `/signup`, `/onboarding`, `/dashboard`, `/runs`, `/runs/[id]`, `/reports/[id]`, `/diagnostics`.
- Desktop product quality first.
- The app should feel like a serious Texas intelligence workspace for businesses, not a cheap generated prototype.
- The agent must be bounded: no terminal, no sandbox, no arbitrary code execution.
- The agent can draft emails, talking points, response plans, social/public messaging concepts, and visual asset prompts.
- The agent must not send emails, post content, create accounts, buy ads, or manipulate engagement.
- Every report claim should cite evidence IDs/source URLs or explicitly state uncertainty.
- Source failures must be visible and lower confidence instead of silently disappearing.
- Secrets must never be exposed.

## Primary Objective

Make Augur's agent and reports dramatically more complete. The app should show that Augur can run a serious analysis for a business deciding where/how to expand in Texas, and can also run a monitor that watches for new policy, market, lobbying, campaign-finance, and city-record signals.

## Phase 1. Deep Context And Prompt Builder

- Create a proper prompt/context builder in shared code.
- Build separate prompts for:
  - Analysis Runner;
  - Live Monitor;
  - Replay Monitor.
- The first LLM request must include a full context packet:
  - mode;
  - company dossier;
  - user objective;
  - decision frame;
  - source registry;
  - known city/source depth;
  - latest signal scores;
  - relevant prior reports/runs if available;
  - tool policy;
  - output contract.
- The system prompts should be detailed and professional.
- The prompts should explain how Augur thinks, how to use evidence, how to handle uncertainty, how to produce response plans, and how to avoid shallow answers.

## Phase 2. Run Memory And Stateless LLM Handling

- Persist the important agent run transcript:
  - initial context;
  - assistant planning/action requests;
  - tool calls/actions;
  - tool results;
  - evidence IDs;
  - source failures;
  - score updates;
  - final report request.
- Every later model call must include the relevant prior run state because LLMs are stateless.
- Make the activity log useful for users: show concise summaries of what the agent searched, read, found, failed, scored, and drafted.

## Phase 3. Tool/Action Layer

- Prefer native OpenAI tool calls if valid.
- If native tool calls are unreliable in a specific request, implement a robust structured JSON action loop.
- Validate all model-requested actions before execution.
- Expand available actions/tools beyond the current minimal probes:
  - `get_company_dossier`;
  - `list_available_sources`;
  - `search_texas_bills`;
  - `get_texas_bill_documents`;
  - `search_tlo_rss`;
  - `search_lobby_activity`;
  - `search_campaign_finance`;
  - `query_city_dataset`;
  - `inspect_city_record`;
  - `web_research`;
  - `find_public_contact_paths`;
  - `update_signal_scores`;
  - `draft_outreach_email`;
  - `draft_talking_points`;
  - `draft_social_campaign`;
  - `suggest_visual_assets`;
  - `save_markdown_report`;
  - `finish_investigation`.
- Drafting tools create reviewed report/database artifacts only.
- Drafting tools do not execute external actions.
- Full report generation must use native OpenAI. If model write and one repair attempt fail validation, the run fails visibly instead of saving a generated backup memo.

## Phase 4. Consultant-Grade Analysis Runner

- Make `/runs` create a real analysis workflow.
- The final report must be much deeper than the current surface-level report.
- Required report sections:
  - Executive Summary;
  - Recommendation;
  - Company Context and Assumptions;
  - Decision Frame;
  - City / Area Comparison;
  - Development Momentum;
  - Zoning and Land-Use Friction;
  - Code / Occupancy Risk;
  - Policy Risk;
  - Lobbying / Stakeholder Response Plan;
  - Contact Paths / Public Officials / Staff / Agencies when available;
  - Draft Outreach Email(s);
  - Draft Talking Points;
  - Public Messaging / Social Campaign Concepts when useful;
  - Evidence and Sources;
  - Confidence, Uncertainty, and Open Questions;
  - Next Actions.
- This should read like a serious consultant's memo, not a toy markdown output.

## Phase 5. Live Monitor

- Implement the monitor as a distinct mode, not just a renamed analysis run.
- It should scan available sources for new relevant records/signals.
- It should compare against prior run state when possible.
- It should produce alerts only when there is a meaningful company-relevant signal.
- It should save monitor activity, evidence, score updates, and a signal brief.
- Monitor output should include severity, why it matters, affected geography, evidence, recommended response, contact path, draft outreach/talking points if useful, confidence, and next check.

## Phase 6. Replay Monitor

- Use real cached public historical data only.
- Pick or support a historical policy/data window that demonstrates what Augur would have flagged.
- The replay report must clearly explain the window, what changed, what Augur would have detected, and what response it would have recommended.
- No fake replay fixtures.

## Phase 7. Desktop UI Overhaul

- Make the UI feel like a real intelligence workspace.
- Fix dashboard layout:
  - Texas map / city signal overview;
  - company context;
  - score summary;
  - latest report;
  - monitor status;
  - recent evidence-backed alerts;
  - clear action to start analysis.
- Fix run detail:
  - status header;
  - activity timeline;
  - tool/source calls;
  - evidence found;
  - score updates;
  - failures/degraded-source notices;
  - final report link.
- Fix report page:
  - polished full-width memo reader;
  - readable section hierarchy;
  - evidence table;
  - drafted artifacts clearly separated;
  - no cramped card-in-card dump.
- Ignore mobile perfection for now. Desktop demo quality matters first.

## Phase 8. Verification

- Run lint/build/tests/diagnostics as available.
- Use Browser on localhost to verify:
  - login;
  - onboarding if needed;
  - dashboard;
  - start analysis run;
  - run detail progress;
  - report page;
  - diagnostics.
- Verify data stays real and evidence-backed.
- Verify source failures are visible.
- Verify no secrets are exposed.
- Update docs only when implementation reality changes.

## Work Style

- Make focused changes by phase.
- Do not ask questions unless blocked by missing credentials or a true product decision.
- If something is too large, complete the next highest-value vertical slice first: deep Analysis Runner prompt/context, better report, and better run detail UI.
- Keep the app working at all times.
