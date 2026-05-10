# Augur — Full Project Specification

## 0. The product in one sentence

**Augur is a Texas public-data intelligence dashboard for retail landlords and real estate development teams. It uses one long-running agent to monitor legislation, lobbying records, permits, zoning, code/occupancy risk, and city development data, then turns those signals into expansion recommendations, policy alerts, response plans, and source-backed reports.**

The entire product is built around one clean question:

> **“Where should LoneStar Retail Group develop next in Texas, and what public-data signals or policy risks could affect that decision?”**

This is not a legal chatbot. It is not a generic lobbyist. It is not a map with a few filters. Augur is an agentic public-data operating layer for business decisions in Texas.

The project fits the BrainForge / Vicinity Texas Open Data track because it takes raw Texas public data and makes it usable through a visual interface, bounded data tools, citations, an agent workflow, and a proper MCP/skill layer. It also keeps the original Fed10-style inspiration: surfaced threats, impact-first matching, “what this means for you,” relevant contacts, and action-oriented intelligence rather than generic search. The Fed10 reference material emphasizes “reads every bill,” “matches impact,” “surfaces threats,” “flags exposure,” and provides contact/action intelligence; Augur narrows that idea to Texas public data and retail-development decisions. 

---

# 1. Product identity

## 1.1 Name

The name is **Augur**.

An augur was an interpreter of early signs. That is exactly the product metaphor: Augur watches weak public signals before they become expensive business problems. It sees a zoning case, a permit spike, a bill movement, a lobby-registration pattern, a committee hearing, or a code/occupancy friction point, and it converts that scattered signal into a concrete business recommendation.

The name should be written as:

```txt
Augur
```

Not “Auger.” An auger is a drill. Augur is the signal-reader.

## 1.2 Category

The category is:

> **Texas expansion intelligence for retail landlords and real estate development teams.**

The product sits between civic open-data dashboards, regulatory-intelligence tools, and business expansion software. It has a map, but it is not “just a map.” It has policy alerts, but it is not “just bill tracking.” It has an agent, but it is not “just chat with data.” The wedge is that the agent can move across multiple public-data surfaces, form an opinion, cite evidence, update structured scores, and generate a report.

## 1.3 Target customer

The demo customer is **LoneStar Retail Group**, a Texas retail landlord and strip-mall developer.

LoneStar Retail Group owns and develops retail properties. It leases spaces to restaurants, convenience stores, local retailers, service businesses, and small-format commercial tenants. The company is deciding where to develop or expand its next retail centers across Texas. It needs to know which cities and corridors show commercial development momentum, which areas have zoning or permitting friction, where code/occupancy issues may slow openings, and which state or local policy changes could affect retail development.

The company is not a coffee shop. It is not a pure retail operating brand. It is a **retail landlord/developer**, so it naturally cares about both real estate signals and expansion signals.

## 1.4 What Augur produces

Each meaningful agent run should produce four types of outputs.

First, it produces **dashboard updates**. These are numeric indicators and surfaced alerts that update the main Augur interface. The dashboard should show Development Momentum, Zoning Friction, Code/Occupancy Risk, Policy Risk, and Confidence for each supported city or area.

Second, it produces **a final markdown report**. For now, each run produces one complete report at the end. We are not doing live-updating markdown during the run. The report should include the recommendation, analysis, evidence, policy concerns, response plan, and source list.

Third, it produces **an agent activity trace**. This is not a raw transcript. It is a Codex-style sequence of meaningful actions: loaded company profile, queried Austin permits, found elevated commercial permit activity, checked Texas bills, pulled bill documents, searched lobby activity, updated scores, generated report.

Fourth, it optionally produces **Miro output** at the end. Miro is a sponsor flex, not a core dependency. The base product works without it. If completed, Miro receives the final report, city comparison, risk map, evidence cards, and response plan. Miro’s MCP integration is specifically positioned to let Codex interact with boards and create diagrams / code from board context, which makes it a good final integration once the core product is working. ([Miro][1])

---

# 2. Core problem

Retail landlords and real estate developers make expensive decisions with fragmented public information.

A company deciding where to build or expand in Texas needs to understand permits, zoning, land use, certificates of occupancy, code violations, construction activity, economic development incentives, legislative changes, local policy changes, and stakeholder activity. That information is public, but it lives across different systems: city open-data portals, Texas Legislature Online, OpenStates, Texas Ethics Commission data, PDFs, FTP folders, RSS feeds, Socrata APIs, CKAN portals, and miscellaneous web pages.

The actual pain is not “can I find a dataset?” The pain is:

> **“Does this public signal matter to my business, and what should I do because of it?”**

A permit spike is not useful unless it is interpreted as development momentum. A zoning case is not useful unless it is mapped to development friction. A bill title is not useful unless it is connected to permitting, zoning, signage, property tax, land use, or development incentives. Lobbying records are not useful unless they help explain who else is active in the same policy space. A city dashboard is not useful unless it helps the company decide where to spend capital.

Augur solves the interpretation layer.

---

# 3. Core solution

Augur combines a dashboard, a public-data ingestion layer, a single long-running agent, an MCP server, and an agent skill.

The dashboard gives the user a clean overview of Texas expansion signals. The ingestion layer pulls public data from Texas legislative sources, Texas lobbying sources, and city open-data portals. The agent reasons over that data using the company profile and decides what matters. The MCP server exposes the same data capabilities to other agents. The skill document explains how agents should use Augur safely and effectively.

The core workflow is:

```txt
Company profile
→ live or replay signal window
→ public data fetch
→ normalization and caching
→ agent investigation
→ score update
→ final markdown report
→ dashboard update
→ optional Miro sync
```

The important design principle is that **live mode and replay mode use the same pipeline**. Replay mode is not a hardcoded fake demo. Replay mode simply runs the pipeline over a historical date range of real public records already cached in Supabase. That gives demo reliability without compromising the real system.

---

# 4. System principles

## 4.1 One agent, many tools

Augur should have **one main agent**, called **Augur Analyst**.

We are not creating fake sub-agents like “Zoning Agent,” “Permit Agent,” “Miro Agent,” “Company Agent,” or “Policy Agent.” Those are tools, modules, or functions. The actual agent is the thing that plans, chooses tools, observes results, decides whether to go deeper, updates scores, and writes the report.

This mirrors how serious coding agents feel. Codex does not expose “file reading agent,” “editing agent,” “testing agent,” and “review agent” as separate products. It has one agent with tools. Augur should feel the same.

## 4.2 Live data only, plus real historical replay

There should be no hardcoded fake alert. No fake bill. No synthetic demo signal pretending to be live.

Data can come from:

```txt
live APIs
official public downloads
cached copies of real public records
historical public records replayed through the real pipeline
```

Data should not come from:

```txt
hardcoded fake records
manually written fake bill payloads
custom if-statements that force a demo result
```

The demo can use a replay window, but the replay window must reference real records fetched into Supabase.

## 4.3 Source-backed outputs

Every factual claim in the report should connect to an evidence item. The report should distinguish between public-record facts, model-generated interpretations, assumptions, and recommendations. This matters because the product deals with policy, development, and business decisions.

The user-facing output should never imply legal advice. It can say “this may create permitting risk” or “this bill appears relevant to retail development,” but it should not say “you are legally required to do X” without proper sourced context and review language.

## 4.4 Professional policy response, not sketchy lobbying

Augur can recommend who to contact, what to say, and why that contact matters. It can use public records to identify offices, committees, agencies, and public lobbying activity. It can produce talking points.

It should not say things like “target this person because donations show they can be influenced.” The internal model can use raw public context, including lobby and campaign/public activity records if available, but the output should frame the recommendation around official responsibility, jurisdiction, committee relevance, public role, and issue history.

A good phrasing is:

> “This office is relevant because it is connected to the committee or procedural path for the issue. Public records also show active industry interest around this subject.”

A bad phrasing is:

> “This person is influenceable; pressure them.”

## 4.5 Explainable scores, not magic scores

Augur should show numeric signal indicators, but they must be transparent. A score is simply a dashboard compression of underlying public data. It helps users compare cities and districts without reading hundreds of raw records.

Scores should not replace explanation. The agent still writes the recommendation in plain English and cites the evidence.

---

# 5. Product modes

## 5.1 Ask Mode

Ask Mode is triggered by a user prompt.

Example prompt:

> “We want to develop three new retail centers in Texas this year. Compare Austin, Dallas, Houston, and San Antonio. Recommend where to start and flag policy risks.”

The agent reads the company profile, decides what information it needs, calls data tools, compares the cities, checks Texas bills and public lobbying records, updates scores, and writes a report.

Ask Mode is useful when the user wants a specific investigation.

## 5.2 Live Monitor Mode

Live Monitor Mode is scheduled. It should run once per day, likely around 8 AM.

It checks what changed in the last 24 hours across legislation and supported city datasets. It then decides whether anything matters to LoneStar Retail Group. If nothing material changed, it still creates a short daily signal digest. If something matters, it goes deeper, updates scores, and creates a report.

Live Monitor Mode should use real live data from APIs or official public sources.

## 5.3 Replay Monitor Mode

Replay Monitor Mode is for demo reliability and historical analysis.

It accepts a date range, pulls real historical public records already cached into Supabase, and runs the same pipeline as Live Monitor Mode. The only difference is the signal window.

Replay Mode exists because live public data may not produce a dramatic alert on the morning of the demo. Replay Mode solves that without hardcoding anything.

The mode abstraction should look like this:

```ts
type RunMode = "live" | "replay";

type SignalWindow = {
  mode: RunMode;
  from: string;
  to: string;
  source: "live_fetch" | "cached_public_records";
};
```

The execution pipeline is identical:

```txt
load company profile
→ fetch signal window records
→ normalize records
→ agent investigates
→ update scores
→ save final report
→ update dashboard
```

---

# 6. Data architecture

## 6.1 Data source philosophy

Augur’s data architecture should use each source for what it is best at.

OpenStates is best for structured bill metadata. Texas Legislature Online is best for official Texas documents. TLO RSS is best for change detection. Texas Ethics Commission is best for lobbying/influence snapshots. Socrata-style city portals are best for Austin and Dallas datasets. CKAN-style portals are useful for San Antonio and Houston. Exa/web search is a bounded secondary research tool when structured public data is incomplete.

This is intentionally not “scrape everything.” The hierarchy is:

```txt
official API first
official download second
official FTP/RSS third
light scraper only when no structured source exists
web search for context, not as source of truth
```

## 6.2 Legislative data

### OpenStates

OpenStates API v3 provides a JSON API for programmatic access to state legislative information, and exposes endpoints for jurisdictions, people, bills, committees, and events. It requires an API key. ([Open States][2])

In Augur, OpenStates is used for discovery and metadata. It should answer questions like:

```txt
What Texas bills match “zoning,” “permitting,” “property tax,” “land use,” or “development incentives”?
Who sponsored the bill?
What actions have occurred?
What documents or versions are linked?
When was the bill updated?
What session is it in?
```

OpenStates should not be treated as the final official-text source. It can link to sources and provide bill records, but Augur should fetch official bill text and analyses from Texas Legislature Online when a bill becomes relevant.

### Texas Legislature Online FTP

Texas Legislature Online provides anonymous FTP downloads for bill text, bill analyses, fiscal notes, reports, and bill witness lists. Its file-download page documents the FTP file availability and folder structure. ([Texas Legislature][3])

This is important because it gives Augur official source material, not just metadata.

In Augur, TLO FTP is used after the agent decides a bill is relevant enough to inspect deeply. The flow is:

```txt
OpenStates finds candidate bill
→ agent decides bill might matter
→ get_texas_bill_documents retrieves TLO official docs
→ parser extracts relevant provisions, fiscal notes, analyses, and witness records
→ report cites the official source
```

TLO also explicitly positions FTP as an alternative to downloading documents through a browser, so the implementation should prefer FTP over aggressive web-page scraping. ([Texas Legislature][3])

### Texas Legislature Online RSS

TLO RSS feeds cover upcoming House and Senate committee meetings, calendars, today’s bill text, fiscal notes, bill analyses, bills filed in House/Senate, and passed bills. ([Texas Legislature][4])

In Augur, RSS is not the data source for deep analysis. It is the change detector. The daily monitor should read the RSS feeds to identify what changed today, then fetch richer data from OpenStates and TLO FTP.

The monitor pipeline is:

```txt
Read RSS feeds
→ identify new/changed bill IDs or document URLs
→ fetch metadata via OpenStates
→ fetch official docs via TLO FTP if relevant
→ run policy-risk analysis
```

## 6.3 Lobbying and influence data

Texas Ethics Commission provides public tools for lobby registration and activity reports, including custom lobby database search, activity report CSVs, lobby registration lists, lobby activity lists, lobby expenditures, and client compensation codes. ([Texas Ethics Commission][5])

TEC also publishes registration lists with current-year registered lobbyists, clients, and subject-matter lists in PDF/Excel formats. ([Texas Ethics Commission][6])

In Augur, TEC data is initially a snapshot layer. We download the current Excel/CSV files, normalize them, and store them in Supabase. The agent can then search public records for entities active around subjects like real estate, zoning, taxation, development, retail, land use, property, and construction.

This layer is not used to make manipulative claims. It is used to add context:

```txt
Which entities are publicly active around this topic?
Which industries appear in lobby registrations?
Which subject areas have activity?
Who might be useful context or coalition signal?
```

The user-facing report should phrase this professionally:

> “Public lobby records show activity from entities in real estate/development-related subject areas. This suggests the issue is already active among industry stakeholders.”

## 6.4 Austin data

Austin is the primary city for the demo.

The most important Austin dataset is **Issued Construction Permits**, dataset ID `3syk-w9eu`. It includes building, electrical, mechanical, plumbing, and driveway/sidewalk permits, with details such as issue date, location, council district, expiration date, description of work, square footage, valuation, and units. ([City of Austin Open Data Portal][7])

Augur uses this dataset to estimate Development Momentum. For a retail landlord, the relevant signals include commercial permit volume, permit valuation, issue-date trends, work descriptions, and council-district concentration.

Austin zoning cases are also important. The Austin Zoning Cases dataset includes zoning cases submitted for city review, with case status, case number, proposed use, applicant, owner, and location. ([City of Austin Open Data Portal][7])

Augur uses zoning cases to estimate Zoning Friction. A high volume of active zoning cases can mean neighborhood change, but it can also mean process complexity or uncertainty. The agent should not assume “zoning cases = bad.” It should interpret zoning activity in context.

Austin zoning-by-address exists and can be used later for specific site analysis, but the hackathon demo should not use property addresses. We stay at city/council-district/corridor level.

## 6.5 Dallas data

Dallas is the second major comparison city.

Dallas OpenData has a Building Permits dataset with dataset ID `e7gq-4sah`. ([City of Dallas][8])

Dallas also has certificate-of-occupancy and code-violation datasets. The Dallas Certificate of Occupancy data matters because retail landlords care about whether tenants can legally occupy and use a space. Dallas city documentation says that if code violations exist, a new certificate of occupancy may require inspections and code compliance approval. ([Dallas City Hall][9])

Augur uses Dallas data primarily for Code/Occupancy Risk and development comparison.

## 6.6 San Antonio data

San Antonio should be included as a comparison city.

Open Data SA has a building permits dataset. The dataset covers commercial and residential development, including new single-family homes, commercial construction, remodels, additions, and related work. ([San Antonio Data][10])

The San Antonio permit resource exposes downloadable formats and a Data API. ([San Antonio Data][11])

Augur uses San Antonio data for permit activity, development momentum, and comparison against Austin/Dallas.

## 6.7 Houston data

Houston remains in scope but should not block the demo.

Houston’s open-data portal is CKAN-based. CKAN is an open-source data management system used to publish, share, and use open data, and its Action API exposes core dataset functionality to external code. ([ckanorg][12])

If Houston’s APIs are clean during implementation, include Houston. If Houston is time-consuming, include it as partially supported. Austin + Dallas + San Antonio + Texas legislation + TEC lobbying data is already strong enough.

## 6.8 Socrata implementation

Austin and Dallas are Socrata-style portals. Socrata’s SODA API gives each dataset an endpoint, and every Socrata dataset has a built-in open-data API. ([Socrata Developers][13])

Socrata supports SoQL, the Socrata Query Language, for rich filtering and querying. ([Socrata Developers][14])

For Augur's public Austin and Dallas reads, use a Socrata application token as the default credential. Send it with the `X-App-Token` header. Socrata API key ID/secret credentials are different from an app token: they represent a user for Basic Auth and are only needed if Augur later performs authenticated/private/write operations. The MVP should not require Socrata API key ID/secret for public open-data reads.

For implementation, use the simplest reliable endpoint first:

```txt
https://data.austintexas.gov/resource/3syk-w9eu.json?$limit=500
```

Then add filters:

```txt
$where=issued_date between '2025-01-01T00:00:00' and '2025-12-31T23:59:59'
```

For Dallas:

```txt
https://www.dallasopendata.com/resource/e7gq-4sah.json?$limit=500
```

The exact field names should be inspected from Socrata API Foundry before coding filters. The connector should not assume field names until verified.

## 6.9 CKAN implementation

San Antonio and Houston may expose CKAN-style APIs. CKAN’s Action API lets external code access dataset metadata and resources, including actions such as package lookup and datastore access. ([CKAN][15])

The typical implementation pattern is:

```txt
GET /api/3/action/package_show?id=<dataset_name>
GET /api/3/action/datastore_search?resource_id=<resource_id>
```

If the datastore endpoint is not enabled or is inconvenient, the worker can download the JSON/CSV resource and cache it in Supabase.

## 6.10 Exa/web research

Exa or another web-search API should be available to the agent as bounded secondary research. It should not replace official data sources. It should be used when the agent needs context, public official pages, committee pages, agency descriptions, or news/background context.

The agent should treat web results as lower-confidence unless they are official sources.

---

# 7. Infrastructure architecture

The stack should be split across Vercel, Supabase, and Railway.

## 7.1 Vercel

Vercel hosts the Next.js web app. It should handle the dashboard, report viewer, evidence drawer, map UI, and lightweight API routes.

Do not use Vercel for heavy ingestion or FTP downloads. Vercel Cron exists, but heavy data ingestion and FTP work are better on Railway. Vercel’s cron documentation includes plan-specific limits; for example, the usage page notes Hobby scheduling limits around daily execution. 

## 7.2 Supabase

Supabase is the main database and storage layer.

It stores company profiles, normalized data, raw public records, reports, score snapshots, agent runs, tool calls, evidence items, and contact records. If vector search becomes useful, Supabase supports pgvector for storing embeddings and vector similarity search. ([Supabase][16])

Supabase can also schedule Edge Functions through `pg_cron` and `pg_net`, but for this project it is cleaner to use Supabase as the state store and Railway as the heavy worker layer. Supabase docs describe scheduled Edge Functions using `pg_cron` and `pg_net`. ([Supabase][17])

## 7.3 Railway

Railway should run the ingestion worker, daily monitor, TLO FTP downloader, TEC importer, and MCP server.

Railway cron jobs can start a service based on a crontab expression, and Railway expects cron-job services to perform the task and terminate. ([Railway Docs][18])

This is exactly what Augur needs:

```txt
daily 8 AM monitor
TLO FTP sync worker
TEC lobby snapshot importer
city dataset refresh
MCP server process
```

## 7.4 Repo layout

The repo should be structured like this:

```txt
augur/
  frontend/
    app/
    components/
    lib/
    api/
  backend/
    README.md
    src/
      index.ts
      routes/
      services/
  shared/
    data-sources/
    scoring/
    agent/
    reports/
    schemas/
    supabase/
  mcp/
    server.ts
    tools/
  workers/
    ingest/
      tlo-ftp-worker.ts
      openstates-sync.ts
      city-sync.ts
      tec-importer.ts
      monitor-runner.ts
  skills/
    augur-texas-business-intelligence/
      SKILL.md
      references/
        data-sources.md
        safety-policy.md
        scoring-model.md
      scripts/
        run-demo-query.ts
  docs/
    architecture.md
    data-sources.md
    demo-script.md
```

The `shared` workspace matters because the web app, worker jobs, backend services, and MCP server should not duplicate business logic.

For the MVP, `backend` should stay thin. The fastest path is:

- `frontend` owns the Next.js dashboard, auth screens, server actions, and route handlers needed by the web app.
- `shared` owns reusable data connectors, schemas, scoring helpers, agent tools, report helpers, and Supabase access wrappers.
- `workers` owns long-running or scheduled production jobs on Railway: ingestion, replay, live monitor, TLO FTP, TEC imports, and heavy agent runs.
- `mcp` owns the Augur MCP server and imports from `shared`.
- `backend` is reserved for a separate HTTP/API service only if a route does not belong cleanly in Vercel or Railway workers. It should not become a duplicate application layer.

---

# 8. Data architecture in detail

## 8.1 Data flow

The data flow should be:

```txt
Public source
→ connector
→ raw record storage
→ normalization
→ evidence indexing
→ agent tool access
→ score/report generation
→ dashboard rendering
```

Raw records should never be discarded. Normalized records can be regenerated if the normalization logic changes. Reports should cite evidence items, and evidence items should point back to raw records and public URLs.

## 8.2 Raw vs normalized data

Raw records are the original payloads from APIs, RSS feeds, FTP downloads, Excel files, CSV downloads, or CKAN resources. They are stored as JSON or text with source metadata.

Normalized records are Augur’s internal shape. For example, Austin permits and Dallas permits may have different field names, but Augur normalizes them into a common `city_records` structure:

```txt
source_city
record_type
external_id
date
geo_unit
description
valuation
permit_type
status
location_text
raw_record_id
```

This makes the agent tools simple.

## 8.3 Evidence items

Every important conclusion in a report should cite evidence items.

An evidence item is not necessarily the entire raw record. It is a claim-supporting reference. For example:

```txt
Evidence item:
Austin issued construction permit record
Dataset: Issued Construction Permits
Record ID: <external_id>
Date: 2025-04-12
Fields used: issue date, council district, permit type, valuation, description
Source URL: data.austintexas.gov dataset page or API endpoint
```

The report should cite evidence by source name and preferably link to the public source or dataset page.

## 8.4 Cached live data

“Live data” does not mean every UI hover calls the city API. Live data means Augur’s data came from real live public sources, not fake records. The system should cache public records in Supabase for performance, reproducibility, replay, and evidence tracking.

The ingestion process should record:

```txt
when fetched
which source
which query
how many records
source URL/API endpoint
hash or version if possible
```

This makes the replay mode legitimate.

---

# 9. Supabase schema

Below is a detailed schema. It is intentionally more complete than the first implementation might need, but it gives the project a real structure.

```sql
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  vertical text not null,
  profile_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

The `companies` table stores LoneStar Retail Group and later any other company profile. `profile_json` contains the operational facts that the agent uses: business model, target cities, risk sensitivities, development strategy, watched subjects, and preferred output style.

```sql
create table company_geo_targets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  city text not null,
  geo_unit_type text not null,
  geo_unit_name text not null,
  priority integer default 0,
  notes text,
  created_at timestamptz not null default now()
);
```

This stores watched areas. For Austin, `geo_unit_type` might be `council_district` or `corridor`. For the demo, we can use Austin council districts and display readable labels.

```sql
create table data_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null,
  source_domain text,
  city text,
  dataset_id text,
  access_method text not null,
  refresh_frequency text,
  citation_url text,
  notes text,
  created_at timestamptz not null default now()
);
```

This table is the source registry. Every connector should register itself here.

```sql
create table raw_records (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references data_sources(id),
  external_id text,
  record_type text not null,
  payload jsonb,
  raw_text text,
  source_url text,
  fetched_at timestamptz not null default now(),
  record_date timestamptz,
  unique_hash text
);
```

This table stores raw data exactly as fetched.

```sql
create table city_records (
  id uuid primary key default gen_random_uuid(),
  raw_record_id uuid references raw_records(id),
  city text not null,
  record_type text not null,
  external_id text,
  record_date timestamptz,
  geo_unit_type text,
  geo_unit_name text,
  location_text text,
  latitude numeric,
  longitude numeric,
  status text,
  category text,
  description text,
  valuation numeric,
  square_footage numeric,
  normalized_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

This is the normalized city-data table. Permits, zoning cases, code violations, and occupancy records all become city records.

```sql
create table bills (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  jurisdiction text not null default 'tx',
  session text not null,
  bill_id text not null,
  title text,
  status text,
  sponsors jsonb default '[]',
  subjects jsonb default '[]',
  last_action text,
  last_action_date date,
  updated_at_source timestamptz,
  source_url text,
  raw_json jsonb default '{}',
  created_at timestamptz not null default now(),
  unique(session, bill_id)
);
```

This stores legislative metadata from OpenStates/TLO.

```sql
create table bill_documents (
  id uuid primary key default gen_random_uuid(),
  bill_uuid uuid references bills(id) on delete cascade,
  document_type text not null,
  version text,
  source_url text,
  source_path text,
  raw_text text,
  parsed_json jsonb default '{}',
  fetched_at timestamptz not null default now()
);
```

This stores bill text, fiscal notes, analyses, witness lists, or other official docs.

```sql
create table lobby_records (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references data_sources(id),
  year integer not null,
  lobbyist_name text,
  client_name text,
  subject_matter text,
  compensation_band text,
  activity_type text,
  raw_record_id uuid references raw_records(id),
  normalized_json jsonb default '{}',
  created_at timestamptz not null default now()
);
```

This stores TEC lobby data. It does not need to be perfect at first; the key is that the agent can search by topic/industry/client.

```sql
create table signal_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  city text not null,
  geo_unit_type text,
  geo_unit_name text,
  development_momentum numeric not null,
  zoning_friction numeric not null,
  code_occupancy_risk numeric not null,
  policy_risk numeric not null,
  confidence numeric not null,
  score_window_start date,
  score_window_end date,
  evidence_ids uuid[] default '{}',
  reasoning_summary text,
  updated_by_run_id uuid,
  created_at timestamptz not null default now()
);
```

This table stores the dashboard scores. Scores are time-specific snapshots. The dashboard should read the latest score per city/geo unit.

```sql
create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  mode text not null,
  status text not null,
  user_prompt text,
  signal_window_start timestamptz,
  signal_window_end timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  final_summary text,
  error_message text
);
```

This stores every agent run.

```sql
create table agent_tool_calls (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references agent_runs(id) on delete cascade,
  step_index integer not null,
  tool_name text not null,
  input_json jsonb,
  output_json jsonb,
  output_summary text,
  status text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
```

This powers the Codex-style activity log.

```sql
create table evidence_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references agent_runs(id) on delete cascade,
  source_id uuid references data_sources(id),
  raw_record_id uuid references raw_records(id),
  city_record_id uuid references city_records(id),
  bill_id uuid references bills(id),
  bill_document_id uuid references bill_documents(id),
  title text not null,
  evidence_type text not null,
  source_url text,
  excerpt text,
  metadata_json jsonb default '{}',
  created_at timestamptz not null default now()
);
```

This links report claims to source records.

```sql
create table reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  run_id uuid references agent_runs(id) on delete set null,
  title text not null,
  report_type text not null,
  markdown_content text not null,
  summary_json jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

This stores the final markdown report.

```sql
create table contact_paths (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references agent_runs(id) on delete cascade,
  policy_issue text not null,
  contact_name text,
  office_or_org text,
  role text,
  contact_type text,
  public_contact_info jsonb default '{}',
  why_relevant text,
  source_url text,
  talking_points text,
  created_at timestamptz not null default now()
);
```

This stores official/stakeholder contact recommendations for the Response Plan.

---

# 10. Scoring model

## 10.1 What scores are

Scores are a compact dashboard representation of public-data signals. They let the user compare cities or districts quickly.

They are not magic. They are not final decisions. They are not “the AI’s gut.” Each score is calculated from evidence, and the agent explains the score in the report.

The dashboard should show:

```txt
Development Momentum: 0–100
Zoning Friction: 0–100
Code / Occupancy Risk: 0–100
Policy Risk: 0–100
Confidence: 0–100
```

The scores update after the daily monitor job and after relevant agent runs.

## 10.2 Development Momentum

Development Momentum measures whether an area appears commercially active and suitable for development expansion.

Inputs include:

```txt
commercial permit count
recent permit growth
permit valuation
new construction permits
remodel permits
mixed-use or commercial descriptions
permit density by council district / city
```

A high Development Momentum score means public records show strong development activity or commercial construction activity. It does not automatically mean the area is cheap or easy. It means the area is active.

Example formula:

```txt
Development Momentum =
0.35 × normalized commercial permit count
+ 0.25 × normalized permit valuation
+ 0.20 × recent growth rate
+ 0.10 × new construction share
+ 0.10 × retail/commercial keyword relevance
```

## 10.3 Zoning Friction

Zoning Friction measures local land-use complexity.

Inputs include:

```txt
active zoning cases
rezoning frequency
pending zoning status
proposed use changes
case concentration near target areas
commercial incompatibility signals
```

A high Zoning Friction score means the area may require more land-use review, rezoning work, or local process management. It is a risk score, so high is not necessarily good. It can also indicate a transforming area, so the agent should explain whether the friction is opportunity-related or delay-related.

Example formula:

```txt
Zoning Friction =
0.40 × active zoning case density
+ 0.25 × pending / unresolved case share
+ 0.20 × commercial-use conflict indicators
+ 0.15 × recent zoning-change volatility
```

## 10.4 Code / Occupancy Risk

Code/Occupancy Risk measures whether development or tenant openings may face operational friction.

Inputs include:

```txt
code violations
certificate of occupancy records
inspection-related constraints
violation density
unresolved enforcement signals
```

This score matters for a retail landlord because a tenant cannot operate smoothly if occupancy approvals, inspections, or code issues slow down opening.

Example formula:

```txt
Code / Occupancy Risk =
0.40 × code violation density
+ 0.25 × unresolved/active violation share
+ 0.25 × certificate-of-occupancy friction indicators
+ 0.10 × recency weighting
```

## 10.5 Policy Risk

Policy Risk measures whether Texas bills, local policy activity, or public lobbying records indicate a possible threat to the company’s development strategy.

Inputs include:

```txt
bill relevance to retail/development/permitting/zoning/property tax/signage/parking
bill status and recency
official documents available
committee or hearing activity
public lobby activity around the subject
policy-topic match to company sensitivities
```

A high Policy Risk score means the agent found relevant public policy movement that could affect LoneStar Retail Group’s development or leasing business.

Example formula:

```txt
Policy Risk =
0.35 × bill relevance
+ 0.20 × bill/action recency
+ 0.15 × procedural importance
+ 0.15 × public lobbying subject activity
+ 0.15 × company sensitivity match
```

## 10.6 Confidence

Confidence measures the quality and completeness of evidence behind the analysis.

Inputs include:

```txt
number of supporting datasets
freshness of data
official-source coverage
geographic specificity
record completeness
availability of source URLs
agreement across independent sources
```

A high confidence score means the agent had enough current, official, geographically specific data to support its recommendation.

Example formula:

```txt
Confidence =
0.30 × source freshness
+ 0.25 × number of supporting datasets
+ 0.20 × official-source weight
+ 0.15 × geographic specificity
+ 0.10 × record completeness
```

## 10.7 Score update process

Scores should be updated through a tool and validated before database write.

The agent can either call `update_signal_scores` directly or return structured JSON that the backend validates and writes. The best design is both: the final response includes structured score JSON, and the backend saves it through a controlled function.

Example score payload:

```json
{
  "company_id": "lonestar-retail-group",
  "city": "austin",
  "geo_unit_type": "council_district",
  "geo_unit_name": "District 3",
  "development_momentum": 84,
  "zoning_friction": 46,
  "code_occupancy_risk": 32,
  "policy_risk": 58,
  "confidence": 79,
  "reasoning_summary": "Austin District 3 shows elevated commercial permit activity and moderate zoning-case activity. Policy risk is elevated due to relevant Texas bills around permitting and land-use process.",
  "evidence_ids": ["..."]
}
```

---

# 11. Agent architecture

## 11.1 Augur Analyst

Augur Analyst is the one main agent.

It follows the agent structure from the diagram we discussed:

```txt
Brain
Tools
Memory
Planner / Logic
Guardrails
Observe → Act → Observe loop
```

The agent receives a goal, observes company context and public-data signals, decides what it needs, calls tools, evaluates outputs, decides whether to continue, and finally writes a report.

## 11.2 Brain

The brain is the LLM.

The model’s job is not to memorize Texas data. Its job is to decide which tools to use, interpret the returned data, compare it to the company profile, and write a source-backed business recommendation.

OpenAI’s tool/function calling is the right pattern because tools let the model interact with external systems and data sources through JSON-schema-defined functions. ([Model Context Protocol][19])

Structured outputs should be used for final report metadata and score payloads so the app can reliably parse and render them. OpenAI’s documentation distinguishes function calling for invoking tools from structured outputs for producing schema-constrained model output. ([OpenAI Developers][20])

## 11.3 Tools

Tools are the agent’s action surface. They query public datasets, fetch bill documents, search lobby records, retrieve evidence, update scores, and save reports.

The model should not directly call arbitrary APIs. It should call Augur’s controlled tools. This keeps queries bounded, logged, and safe.

## 11.4 Memory

Memory lives in Supabase.

Short-term memory is the current run: prompt, tool outputs, open questions, evidence IDs, intermediate conclusions, score drafts, and report outline.

Long-term memory is the company profile and prior history: watched cities, watched areas, policy sensitivities, past reports, prior score history, false positives, and user feedback.

The agent should not stuff every raw record into context. Instead, tools return compact summaries and record IDs. If the agent needs deeper detail, it calls a retrieval tool for specific records.

The context flow should be:

```txt
raw data in Supabase
→ tool returns summary + IDs
→ agent decides what to inspect
→ retrieval tool returns selected evidence
→ final report cites evidence
```

## 11.5 Planner

The planner is not separate. It is the reasoning loop inside Augur Analyst.

At each step, the agent asks:

```txt
What do I know?
What do I still need?
Which tool should I call?
Is the result enough?
Do I need city data, policy data, lobby data, or web context?
Should I update scores yet?
Is the report ready?
```

This is what makes it agentic. A fixed workflow would always run the same sequence. Augur Analyst can branch. If Austin looks promising, it checks zoning cases. If a bill looks relevant, it fetches official bill documents. If a policy issue appears active, it searches lobbying records. If data is weak, it lowers confidence.

## 11.6 Guardrails

Guardrails are implemented through system prompt rules, tool boundaries, report validators, and citation checks.

Core guardrails:

```txt
No legal advice.
No unsupported factual claims.
No fake lobbying.
No external sending.
No hardcoded fake demo data.
No unbounded scraping.
No manipulation framing.
Cite source-backed claims.
Separate facts, assumptions, and recommendations.
Use public records responsibly.
```

The product can recommend a Response Plan, but it should not actually send emails, file comments, call officials, or automate outreach during the demo.

---

# 12. Tool definitions

Below are the core tools. In the real implementation, each tool should log its inputs and outputs to `agent_tool_calls`.

## 12.1 `search_texas_bills`

This tool searches Texas bills using OpenStates metadata and cached TLO records.

```json
{
  "type": "function",
  "name": "search_texas_bills",
  "description": "Search Texas bills using OpenStates metadata and cached Texas Legislature Online records. Use this for policy topics related to retail development, zoning, permitting, property tax, land use, signage, parking, development incentives, and certificates of occupancy.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "session": { "type": "string", "description": "Texas legislative session identifier, e.g. 89R." },
      "updated_since": { "type": "string", "format": "date" },
      "subjects": {
        "type": "array",
        "items": { "type": "string" }
      },
      "limit": { "type": "integer", "minimum": 1, "maximum": 50 }
    },
    "required": ["query"]
  }
}
```

## 12.2 `get_texas_bill_documents`

This tool fetches official TLO documents from cache or triggers ingestion if missing.

```json
{
  "type": "function",
  "name": "get_texas_bill_documents",
  "description": "Fetch official Texas Legislature Online documents for a bill, including bill text, bill analysis, fiscal notes, witness lists, and history when available.",
  "parameters": {
    "type": "object",
    "properties": {
      "bill_id": { "type": "string", "description": "Example: HB 1482." },
      "session": { "type": "string", "description": "Example: 89R." },
      "document_types": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["bill_text", "bill_analysis", "fiscal_note", "witness_list", "history"]
        }
      }
    },
    "required": ["bill_id", "session", "document_types"]
  }
}
```

## 12.3 `query_city_dataset`

This is the generic city data tool. It keeps the agent from needing separate tool names for every dataset.

```json
{
  "type": "function",
  "name": "query_city_dataset",
  "description": "Query bounded Texas city open-data records for expansion analysis, including permits, zoning cases, code violations, certificates of occupancy, and land-use records.",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "enum": ["austin", "dallas", "houston", "san_antonio"]
      },
      "dataset": {
        "type": "string",
        "enum": [
          "permits",
          "zoning_cases",
          "zoning_by_address",
          "code_violations",
          "certificates_of_occupancy",
          "future_land_use"
        ]
      },
      "start_date": { "type": "string", "format": "date" },
      "end_date": { "type": "string", "format": "date" },
      "geo_unit_type": {
        "type": "string",
        "enum": ["city", "council_district", "zip", "corridor", "neighborhood", "unknown"]
      },
      "geo_unit_name": { "type": "string" },
      "commercial_only": { "type": "boolean" },
      "limit": { "type": "integer", "minimum": 1, "maximum": 1000 }
    },
    "required": ["city", "dataset", "limit"]
  }
}
```

## 12.4 `search_lobby_activity`

This tool searches normalized Texas Ethics Commission public lobby data.

```json
{
  "type": "function",
  "name": "search_lobby_activity",
  "description": "Search normalized Texas Ethics Commission lobby records for public subject, client, and lobbyist signals. Use this only for public context and stakeholder awareness.",
  "parameters": {
    "type": "object",
    "properties": {
      "topic": { "type": "string" },
      "industry": { "type": "string" },
      "year": { "type": "integer" },
      "limit": { "type": "integer", "minimum": 1, "maximum": 50 }
    },
    "required": ["topic", "year"]
  }
}
```

## 12.5 `web_research`

This tool performs bounded web research for official pages, public contact paths, committee information, and context.

```json
{
  "type": "function",
  "name": "web_research",
  "description": "Run bounded web research for official public pages, agency/committee context, and source-backed contact paths. Prefer official government or organization sources.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "allowed_domains": {
        "type": "array",
        "items": { "type": "string" }
      },
      "limit": { "type": "integer", "minimum": 1, "maximum": 10 }
    },
    "required": ["query"]
  }
}
```

## 12.6 `update_signal_scores`

This tool updates numeric dashboard indicators.

```json
{
  "type": "function",
  "name": "update_signal_scores",
  "description": "Update public-data signal scores for a city or district after an agent analysis.",
  "parameters": {
    "type": "object",
    "properties": {
      "company_id": { "type": "string" },
      "city": { "type": "string" },
      "geo_unit_type": { "type": "string" },
      "geo_unit_name": { "type": "string" },
      "development_momentum": { "type": "number", "minimum": 0, "maximum": 100 },
      "zoning_friction": { "type": "number", "minimum": 0, "maximum": 100 },
      "code_occupancy_risk": { "type": "number", "minimum": 0, "maximum": 100 },
      "policy_risk": { "type": "number", "minimum": 0, "maximum": 100 },
      "confidence": { "type": "number", "minimum": 0, "maximum": 100 },
      "evidence_ids": {
        "type": "array",
        "items": { "type": "string" }
      },
      "reasoning_summary": { "type": "string" }
    },
    "required": [
      "company_id",
      "city",
      "development_momentum",
      "zoning_friction",
      "code_occupancy_risk",
      "policy_risk",
      "confidence",
      "evidence_ids",
      "reasoning_summary"
    ]
  }
}
```

## 12.7 `save_markdown_report`

This tool saves the final report.

```json
{
  "type": "function",
  "name": "save_markdown_report",
  "description": "Save a complete source-backed markdown report to Supabase for rendering in the Augur dashboard.",
  "parameters": {
    "type": "object",
    "properties": {
      "company_id": { "type": "string" },
      "run_id": { "type": "string" },
      "title": { "type": "string" },
      "report_type": {
        "type": "string",
        "enum": ["daily_monitor", "expansion_brief", "policy_alert", "city_comparison"]
      },
      "markdown": { "type": "string" },
      "summary_json": { "type": "object" },
      "evidence_ids": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["company_id", "run_id", "title", "report_type", "markdown"]
  }
}
```

---

# 13. Report format

Each run produces one complete markdown report.

The title should be generated dynamically based on the run. It should not always be “Texas Expansion Brief.” Examples:

```txt
Austin Retail Development Brief — LoneStar Retail Group
Texas Expansion Risk & Opportunity Report — May 9 Replay
Policy Alert: Texas Land-Use and Retail Development Signals
```

The report should include these sections:

```txt
# Executive Summary

# Recommendation

# City / Area Comparison

# Development Momentum

# Zoning and Land-Use Friction

# Code / Occupancy Risk

# Policy Risk

# Response Plan

# Evidence and Sources

# Agent Activity Summary

# Uncertainty and Open Questions
```

The report should be written for a business operator, not a lawyer. It should be decisive but careful. It should say what the public data suggests and what Augur recommends doing next.

The Response Plan should include:

```txt
who to contact
why that office/contact matters
what to say
which source supports the recommendation
what internal owner should handle it
what to monitor next
```

---

# 14. UI specification

## 14.1 Overall visual style

The UI should feel like a dark, serious command center. The Fed10 reference is useful here: surfaced threats, clean cards, sharp typography, activity signals, and a feeling that the product is reading the world in real time. 

It should not look like a civic hackathon map from 2014. It should look like a serious intelligence dashboard.

## 14.2 Layout

The main dashboard has three regions.

The left sidebar contains navigation:

```txt
Overview
Texas Map
City Signals
Bills
Lobby Signals
Reports
Agent Runs
```

The center panel contains the main work surface. On the Overview tab, this is the Texas map and surfaced cards. On Reports, it is the markdown report viewer. On Agent Runs, it is the run trace.

The right panel contains the active Augur Analyst run: current step, tool calls, evidence found, and next actions.

## 14.3 Overview tab

The Overview tab is the first screen.

It should show:

```txt
Texas map
city cards
latest surfaced signals
latest report
agent status
```

The Texas map should show at least:

```txt
Austin
Dallas
Houston
San Antonio
```

Each city should display the five numeric indicators:

```txt
Development Momentum
Zoning Friction
Code / Occupancy Risk
Policy Risk
Confidence
```

The scores should be visually distinct. Risk metrics should not be confused with opportunity metrics. Development Momentum being high is generally good. Zoning Friction, Code/Occupancy Risk, and Policy Risk being high are generally warning signals.

## 14.4 City detail panel

Clicking Austin should show a city detail panel.

For Austin, use council districts or the easiest supported public-data unit. The UI can display readable labels like:

```txt
District 3 — East / Southeast Austin corridor
District 4 — Highland / North Central corridor
```

The detail panel should show:

```txt
recent commercial permits
permit valuation trend
active zoning cases
policy alerts
score history
evidence links
agent explanation
```

No individual property addresses are required.

## 14.5 Surfaced signals

Surfaced signals are cards such as:

```txt
AUSTIN-PERMIT-MOMENTUM
Commercial permit activity elevated in target corridor
Type: Opportunity
Confidence: 78

TX-POLICY-RISK
Bill relevant to local permitting / land-use process
Type: Policy Risk
Confidence: 71

DALLAS-CO-FRICTION
Certificate-of-occupancy context suggests opening friction
Type: Operational Risk
Confidence: 64
```

Each card should expand into evidence.

## 14.6 Evidence drawer

Raw datasets should not clutter the dashboard. They should live behind evidence drawers.

An evidence drawer should show:

```txt
source name
dataset
record count
date window
query used
sample records
source URL
why this evidence matters
```

This is how the product stays readable while remaining transparent.

## 14.7 Agent activity log

The activity log should be visible and polished.

It should look like:

```txt
✓ Loaded LoneStar Retail Group profile
✓ Queried Austin construction permits for recent commercial activity
✓ Found elevated commercial permits in Austin target districts
✓ Queried Austin zoning cases for same geography
✓ Searched Texas bills for permitting, zoning, land use, property tax
✓ Retrieved official bill documents for 2 relevant bills
✓ Searched TEC lobby records for real estate/development subject activity
✓ Updated Austin and Dallas signal scores
✓ Generated final report
```

Each line should expand to show:

```txt
tool name
input JSON
output summary
evidence IDs
timestamp
status
```

The log should prove the agent did real work without dumping raw LLM text.

---

# 15. Demo flow

## 15.1 Demo company

The demo company is:

```txt
LoneStar Retail Group
```

Profile:

```txt
Business model:
Retail landlord and strip-mall developer.

Goal:
Develop or expand retail centers across Texas.

Target cities:
Austin, Dallas, Houston, San Antonio.

Current priority:
Identify the best Texas market/corridor for next development.

Business sensitivities:
Permitting timelines
Zoning and land use
Commercial property tax
Development incentives
Parking and signage rules
Certificates of occupancy
Code violations
Retail tenant opening friction
```

## 15.2 Demo 1 — Ask Mode

The user prompt:

> “We want to develop three new retail centers in Texas this year. Compare Austin, Dallas, Houston, and San Antonio. Recommend where to start and flag policy or market risks.”

The UI should show Augur Analyst working.

Expected activity log:

```txt
✓ Loaded LoneStar Retail Group profile
✓ Queried Austin issued construction permits
✓ Queried Austin zoning cases
✓ Queried Dallas building permits
✓ Queried Dallas code / occupancy records
✓ Queried San Antonio building permits
✓ Searched Texas bills for zoning, permitting, land use, property tax, parking, signage, development incentives
✓ Retrieved official documents for relevant Texas bills
✓ Searched Texas public lobby records for development-related activity
✓ Updated city/corridor signal scores
✓ Generated report
```

Expected result:

```txt
Recommendation:
Start with Austin, with the strongest near-term signal around the East / Highland-adjacent corridors depending on district-level evidence.

Why:
Austin shows stronger development momentum in recent commercial permit records. Zoning activity indicates some friction, but also signals active land-use transformation. Dallas shows useful development activity but higher occupancy/code friction in selected public records. San Antonio is promising but currently lower-confidence depending on available permit/land-use data. Houston remains watchlisted unless connector quality supports confident analysis.

Policy watch:
The agent identifies Texas bills or official policy movement relevant to permitting, zoning, land use, property tax, development incentives, signage, parking, or occupancy risk.

Response Plan:
The report recommends the official/office/contact path, why each contact matters, and suggested talking points.
```

## 15.3 Demo 2 — Live Monitor Mode

Click:

```txt
Run Live Daily Monitor
```

The system scans the last 24 hours.

If no major event exists, that is still valid:

```txt
Live Texas Signal Brief
Scanned recent Texas bill updates and city records.
No high-severity new signal found.
Low-priority changes are listed below.
```

This demonstrates the real product.

## 15.4 Demo 3 — Replay Monitor Mode

Click:

```txt
Run Replay Monitor
```

Replay Mode uses a selected historical date range of real public data already cached into Supabase. The same agent pipeline runs.

Expected result:

```txt
Replay Texas Signal Brief
Scanned historical public records from selected window.
Found material development and policy signals.
Updated scores.
Generated report.
```

This gives the judges the dramatic result without fake data.

## 15.5 Demo 4 — Evidence view

Open the evidence drawer for the recommendation.

Show:

```txt
Austin construction permit records
Austin zoning cases
Texas bill metadata
TLO official documents
TEC public lobby records
Dallas occupancy/code context
```

The point is to show Augur is grounded in public data, not hallucinating.

## 15.6 Demo 5 — MCP and skill proof

Show the MCP server exposing tools like:

```txt
augur.search_texas_bills
augur.get_texas_bill_documents
augur.query_city_dataset
augur.search_lobby_activity
augur.compare_expansion_signals
augur.generate_business_brief
```

MCP tools are model-invokable functions exposed by a server so language models can query external systems, call APIs, or perform computations. ([Model Context Protocol][19])

Then show the skill folder with `SKILL.md`. Codex skills are directories with a `SKILL.md` file plus optional scripts, references, and assets; the `SKILL.md` must include a name and description. ([OpenAI Developers][21])

## 15.7 Demo 6 — Miro sync, if done

At the very end, show:

```txt
Sync report to Miro
```

Miro receives:

```txt
Texas map
city comparison
policy alert
evidence cards
response plan
```

This is optional. It should not be on the critical path.

---

# 16. MCP plan

## 16.1 Purpose

The MCP server is the agent-access layer for Augur’s Texas public-data tools.

The BrainForge / Texas Open Data track asks for either a custom MCP server or a proper agent skill. Shipping both makes the submission stronger.

## 16.2 MCP server workspace

Location:

```txt
mcp/
```

It imports functions from:

```txt
shared/
```

The server should expose tools, not raw database tables.

## 16.3 MCP tools

The core MCP tools:

```txt
augur.search_texas_bills
augur.get_texas_bill_documents
augur.query_city_dataset
augur.search_lobby_activity
augur.compare_expansion_signals
augur.generate_business_brief
```

## 16.4 MCP resources

MCP resources can expose contextual data such as source documentation, schema descriptions, or company profiles. MCP resources are designed to provide contextual data to language models, such as files, schemas, or application-specific information. ([Model Context Protocol][22])

Possible Augur resources:

```txt
augur://sources
augur://schema
augur://company/lonestar-retail-group
augur://latest-report
augur://scoring-model
```

## 16.5 MCP prompts

MCP prompts can be used as reusable request templates. For Augur, useful prompts include:

```txt
Analyze Texas expansion risk
Compare city development signals
Generate policy response plan
Summarize daily monitor
```

The prompt layer is not required for MVP, but it is useful if time allows.

---

# 17. Agent skill plan

## 17.1 Purpose

The skill explains how another agent should safely use Augur.

Location:

```txt
skills/augur-texas-business-intelligence/
```

Structure:

```txt
SKILL.md
references/
  data-sources.md
  safety-policy.md
  scoring-model.md
scripts/
  run-demo-query.ts
```

## 17.2 `SKILL.md`

The skill should look like this:

```md
---
name: augur-texas-business-intelligence
description: Use this skill when analyzing Texas public data for real estate development, retail landlord expansion, permitting, zoning, land use, code/occupancy risk, Texas legislation, lobbying records, or business response planning.
---

# Augur Texas Business Intelligence Skill

Use this skill to query Augur’s MCP tools and produce source-backed business intelligence reports from Texas public data.

## Core workflow

1. Identify the company profile and business question.
2. Use bounded Augur MCP tools to query public datasets.
3. Compare city or district-level signals.
4. Search Texas bills only for policy areas relevant to the company.
5. Use official public records wherever possible.
6. Cite every factual claim.
7. Separate facts, assumptions, and recommendations.
8. Never provide legal advice.
9. Never recommend deceptive lobbying or mass outreach.
10. Produce a business-ready report.

## Required output

Every analysis should include:
- recommendation
- supporting evidence
- signal scores
- policy risks
- response plan
- uncertainty
- source list
- next actions
```

## 17.3 References

`data-sources.md` should list every source, dataset ID, source URL, access method, and refresh frequency.

`safety-policy.md` should define how to discuss lobbying, contact paths, and public records responsibly.

`scoring-model.md` should define Development Momentum, Zoning Friction, Code/Occupancy Risk, Policy Risk, and Confidence.

---

# 18. Build plan

This is phased by dependency order, not by watered-down product versions. The goal is still to build the full thing.

## Phase 0 — Pre-hackathon setup

Before the hackathon, get:

```txt
OpenAI API key
OpenStates API key
Supabase project
Vercel project
Railway project
Socrata app token if possible
Exa API key
Apify API key if useful
Miro sandbox / MCP access
```

Also inspect field names for the core datasets:

```txt
Austin permits: 3syk-w9eu
Austin zoning cases
Dallas permits: e7gq-4sah
Dallas certificates of occupancy: 9qet-qt9e
Dallas code violations
San Antonio permits
TEC lobby lists
TLO RSS/FTP structure
```

## Phase 1 — Core repo and database

Build the monorepo and Supabase schema.

Deliverables:

```txt
Next.js app boots
Supabase connection works
tables created
company profile seeded
source registry seeded
basic report viewer works
agent run table works
```

## Phase 2 — Data connectors

Build connectors in `shared`.

Deliverables:

```txt
OpenStates connector
TLO RSS parser
TLO FTP worker skeleton
Austin Socrata connector
Dallas Socrata connector
San Antonio connector
TEC importer
```

The connectors should all write raw records to Supabase and normalize where possible.

## Phase 3 — Agent tool registry

Build tool wrappers around the core data functions.

Deliverables:

```txt
search_texas_bills
get_texas_bill_documents
query_city_dataset
search_lobby_activity
update_signal_scores
save_markdown_report
```

Every tool call must write to `agent_tool_calls`.

## Phase 4 — Ask Mode

Implement the main user prompt flow.

Deliverables:

```txt
user enters prompt
agent loads company profile
agent calls tools
agent updates scores
agent saves report
dashboard shows report and activity log
```

This is the first full end-to-end product moment.

## Phase 5 — Live Monitor Mode

Implement daily monitor logic.

Deliverables:

```txt
signal window last 24 hours
TLO RSS scan
OpenStates updates
city dataset deltas
agent report
score updates
```

Run it manually first, then schedule on Railway.

## Phase 6 — Replay Monitor Mode

Implement replay using real cached public records.

Deliverables:

```txt
select historical date range
fetch cached records from Supabase
run same monitor pipeline
generate report
update scores
```

No fake records.

## Phase 7 — Dashboard polish

Build the full UI.

Deliverables:

```txt
Overview tab
Texas map
city cards
signal scores
surfaced alerts
evidence drawer
agent run log
report viewer
```

## Phase 8 — MCP server

Build the MCP server around Augur core functions.

Deliverables:

```txt
Railway MCP server running
tools listed
tools callable
README showing usage
```

## Phase 9 — Agent skill

Build the skill folder.

Deliverables:

```txt
SKILL.md
data-sources.md
safety-policy.md
scoring-model.md
demo script
```

## Phase 10 — Miro sponsor flex

Add optional Miro output.

Deliverables:

```txt
report-to-Miro sync
city comparison board
policy alert card
response plan cards
evidence cards
```

---

# 19. Implementation details that matter

## 19.1 Context management

The agent must not receive thousands of raw records.

The correct pattern is:

```txt
Tool returns aggregate summary + top records + evidence IDs.
Agent decides if more detail is needed.
Agent retrieves specific evidence records.
Report cites evidence IDs.
```

Example city query return:

```json
{
  "city": "austin",
  "dataset": "permits",
  "window": "2025-01-01 to 2025-05-01",
  "record_count": 482,
  "commercial_record_count": 91,
  "total_valuation": 184000000,
  "top_geo_units": [
    {
      "geo_unit": "District 3",
      "commercial_records": 22,
      "valuation": 39000000,
      "evidence_ids": ["..."]
    }
  ],
  "summary": "Commercial permit activity is concentrated in District 3 and District 4 during the selected window."
}
```

This gives the agent enough to reason without blowing context.

## 19.2 Source attribution

Each source should have a citation URL and a data-source ID. Reports should not cite raw internal tables alone. They should cite the original public source wherever possible.

## 19.3 Error handling

If a source fails, the run should not silently collapse. The agent log should show:

```txt
Austin permits query succeeded
Dallas permits query failed due to API timeout
San Antonio permits query succeeded
Confidence lowered because Dallas data was incomplete
```

The report should say when evidence is incomplete.

## 19.4 No hardcoded data

The implementation can seed the database with real public records for replay. It cannot seed fake policy cards.

Acceptable:

```txt
downloaded Austin permits from real public dataset
cached TLO bill records from real public source
historical OpenStates bill records
TEC lobby Excel imported
```

Not acceptable:

```txt
manually written fake bill
manually written fake alert
if demo_mode then return “Austin is best”
```

---

# 20. Final product definition

Augur is a Texas public-data intelligence dashboard for retail landlords and real estate development teams. It uses one long-running agent, Augur Analyst, to investigate live and historical public data across Texas legislation, city permits, zoning cases, code/occupancy data, and public lobbying records. It compares those signals against a company profile, updates transparent numeric indicators, produces a complete markdown report, and gives a response plan with source-backed contact paths and talking points.

The dashboard starts with LoneStar Retail Group, a retail landlord and strip-mall developer deciding where to develop next. The first strong recommendation should likely focus on Austin, with Austin council district or corridor-level depth, and compare it against Dallas, San Antonio, and Houston where data permits.

The project’s winning point is not that it has an agent. The winning point is that the agent does real work over real Texas public data:

```txt
reads company context
queries official sources
pulls public records
investigates deeper when needed
updates scores
writes an evidence-backed report
shows its work
ships MCP tools
ships a proper agent skill
```

The final demo should make one thing obvious:

> **Augur turns Texas public data into business decisions.**

## 20.1 Locked implementation decisions

These decisions supersede older exploratory notes in `transcript.md`.

- `plan.md` is the canonical product spec. `transcript.md` is decision history and context.
- The mechanical repo layout is `frontend`, `backend`, `workers`, `shared`, `mcp`, `skills`, and `docs`.
- Keep `backend` thin. The MVP should use Next.js route handlers/server actions in `frontend`, shared logic in `shared`, long-running jobs in `workers`, and MCP exposure in `mcp`.
- Build minimal multi-company support because the schema already supports companies, but keep the demo centered on LoneStar Retail Group.
- Add basic Supabase email/password auth. Keep it simple: account creation, email uniqueness, login, company profile onboarding/storage, and no advanced auth flows. For the MVP, each email maps directly to the user's company profile.
- The first screen is always the Overview dashboard with an interactive Texas map and highlighted Austin, Dallas, Houston, and San Antonio.
- Ask Mode uses the core expansion prompt from the demo plan, but the recommendation must be data-driven and cannot hardcode Austin.
- Austin is the deepest first city. Dallas and San Antonio should be solid but lighter. Houston can be lower-confidence or watchlisted if connector quality is weaker.
- Austin council districts are the first preferred geo unit. Do not add extra corridor/neighborhood mapping until the core product works.
- Replay Mode should use a real historical public-data window selected from actual Texas policy/data events. No fake replay fixtures.
- Cached real public records are acceptable when live sources fail, if the run clearly says that cached data was used and confidence is adjusted.
- Failed source calls should appear in the activity log and lower confidence when relevant instead of silently disappearing.
- Include TEC lobbying records and campaign-finance data in the data pass, prioritizing the cleanest public downloads first.
- The agent assigns signal scores through the `update_signal_scores` tool. The backend validates schema, score bounds, and evidence IDs, but does not enforce a fixed formula range.
- Start score history at city level. Add district-level score history after the city-level flow works.
- Generate one final report at the end of a run. During the run, show polished activity summaries, not draft report sections.
- The activity log should be production-readable: high-level steps, source names, short query summaries, links opened, evidence IDs, timestamps, and status. Raw JSON can remain hidden behind deeper debugging views.
- Use "Response Plan" as the product language. Avoid user-facing "lobbying strategy" framing.
- Miro is completely last and should not block the core dashboard, data, agent, MCP, or skill work.
- Use Exa as the preferred web research API when configured. Secondary web research should stay bounded to live official public pages.
- Use the native OpenAI API as the primary LLM provider. The target MVP model is `gpt-5.4-mini` because it is faster and cheaper than the frontier model while still supporting reasoning, function calling, structured outputs, and the Responses API.
- Use medium reasoning effort for Augur analysis and report synthesis by default. Keep the provider wrapper clean enough to move later to `gpt-5.5` or another stronger OpenAI model without rewriting the agent runtime.
- Native OpenAI is the only MVP model path. Legacy provider code should not complicate the OpenAI path.

## 20.2 Current canonical architecture

This is the latest working architecture for implementation. If an older section in this document implies a heavier monorepo or a local development stack, this section wins.

```txt
User browser
→ Vercel / Next.js frontend
→ Supabase Auth and Supabase Postgres
→ agent_runs row created by the app
→ Railway worker claims/runs the job
→ shared Augur tools query public data and Supabase
→ agent_tool_calls, evidence_items, signal_scores, and reports are written back to Supabase
→ frontend polls for updated run status and renders the dashboard/report/activity log
```

The agent does not get a general-purpose terminal, sandbox, shell, or mini-PC. Augur is not a coding agent. It is a bounded tool-using analyst. The model can only act through Augur-defined tools, and those tools are implemented in TypeScript, logged, validated, and connected to real public data.

The reason this is the correct production design is that Augur's job is to analyze public records, not mutate an arbitrary filesystem. A terminal would increase complexity without adding meaningful product value. The controlled tool layer gives the model enough power to investigate while keeping outputs evidence-backed and reproducible.

## 20.3 Runtime ownership

`frontend` owns:

- Next.js App Router dashboard.
- Basic sign-up/login/onboarding screens.
- Overview-first user experience.
- Route handlers/server actions that create agent runs and read Supabase state.
- Markdown report viewer.
- Texas map and city/council-district interactions.
- Polling UI for active runs.

`shared` owns:

- Supabase clients and typed data-access helpers.
- Source registry helpers.
- Public-data connectors.
- Normalization logic.
- Evidence creation helpers.
- Agent tool implementations.
- Provider wrapper for native OpenAI API calls.
- Report and score validation schemas.

`workers` owns:

- Railway-running agent worker.
- Job claiming and status transitions.
- Live monitor job.
- Replay monitor job.
- TLO RSS/FTP ingestion.
- OpenStates sync.
- TEC lobbying and campaign-finance importers.
- City data refresh jobs.

`mcp` owns:

- Custom Augur MCP server.
- MCP tools wrapping `shared` functions.
- MCP resources for source registry, schema, company profile, scoring model, and latest report.
- MCP prompts if time allows.

`backend` owns:

- Nothing by default.
- It is reserved for a separate HTTP service only if a capability clearly does not belong in Vercel route handlers or Railway workers.
- It should not duplicate the frontend route handlers, worker job logic, or shared data layer.

## 20.4 Auth and company model

Auth should be basic and fast:

- Use Supabase email/password auth.
- Enforce email uniqueness through Supabase Auth.
- On first login/sign-up, the user creates a company profile.
- For the MVP, one user email maps directly to one primary company profile.
- The schema can still support multiple companies over time, but the UI should not overbuild account/team management.
- Seed LoneStar Retail Group as the demo company.
- The demo account/company should be easy to load for judging and development.

The company profile should capture enough to guide the agent:

```json
{
  "name": "LoneStar Retail Group",
  "vertical": "retail landlord / strip-mall developer",
  "target_cities": ["Austin", "Dallas", "Houston", "San Antonio"],
  "business_goal": "Develop or expand retail centers across Texas",
  "risk_sensitivities": [
    "permitting timelines",
    "zoning and land use",
    "commercial property tax",
    "development incentives",
    "parking and signage rules",
    "certificates of occupancy",
    "code violations",
    "retail tenant opening friction"
  ],
  "preferred_output": "decisive, source-backed business recommendation with Response Plan"
}
```

## 20.5 Agent runtime flow

Ask Mode should run like this:

```txt
1. User clicks Ask Mode / Run analysis from the dashboard.
2. Vercel creates an agent_runs row with mode = ask and status = queued.
3. Railway worker claims the queued run and sets status = running.
4. Worker loads company profile, source registry, prior scores, and user prompt.
5. Worker calls OpenAI through the provider abstraction.
6. Model chooses bounded tools.
7. Each tool writes an agent_tool_calls row with a production-readable summary.
8. Tool outputs return compact summaries, evidence IDs, and source links, not massive raw datasets.
9. Model continues the observe-act-observe loop until it has enough evidence.
10. Model calls update_signal_scores with evidence-backed numeric scores.
11. Model calls save_markdown_report with the final report.
12. Worker marks the run completed or failed.
13. Frontend polling renders status, activity, scores, evidence, and report.
```

Live Monitor should follow the same pipeline, but the prompt and data window are generated by the scheduled monitor job. Replay Monitor should also follow the same pipeline, but with a historical window over real cached records.

The frontend should poll every few seconds for run progress. Supabase Realtime is optional later. It should not be a dependency for the MVP.

## 20.6 LLM provider strategy

The primary LLM provider is now the native OpenAI API. The MVP target model is `gpt-5.4-mini` with medium reasoning effort.

Reason for the switch:

- Legacy provider experiments worked for basic chat, but report generation and long synthesis repeatedly timed out or forced backup generation.
- Native OpenAI support gives Augur the API behavior the product actually needs: reliable reasoning controls, function calling, structured outputs, and stronger long-form synthesis.
- `gpt-5.4-mini` is the right starting point for hackathon speed/cost. It can later be swapped to `gpt-5.5` for higher-quality production output if needed.

Implementation rules:

- Add `OPENAI_API_KEY` and `OPENAI_MODEL`.
- Default `OPENAI_MODEL` to `gpt-5.4-mini`.
- Default reasoning effort to `medium`.
- Use OpenAI's current recommended API surface after checking official docs before implementation.
- Prefer the Responses API if it gives the cleanest reasoning/tool/structured-output behavior.
- Chat Completions is acceptable only if it is simpler and still supports the needed tools and structured outputs.
- Keep a small provider abstraction, but do not let provider abstraction slow the MVP.
- Legacy provider code should not remain on the critical path.
- Legacy provider code should stay out of the MVP runtime after the native OpenAI path works.

The OpenAI provider verification script or diagnostics route must test:

```txt
basic chat completion
tool calling
multi-step tool calling
medium reasoning configuration
structured JSON output
full markdown report generation
max token behavior
error format
timeout behavior
```

The report path should restore full output quality:

- Do not shrink the report into a tiny synthesis just to avoid provider timeouts.
- Keep all required report sections.
- Let `gpt-5.4-mini` write the full memo from the evidence packet.
- A successful report should save `summary_json.generated_by` as `openai_gpt_5_4_mini` or `openai_model_repaired`.
- If report generation fails validation after one repair call, fail the run visibly with the exact error/warning.

## 20.7 Data-source priority and depth

The data-source order should be:

1. Supabase schema and source registry.
2. Austin permits and zoning data.
3. OpenStates Texas bills.
4. TLO RSS and official document fetch/cache.
5. Dallas permits/code/occupancy data.
6. San Antonio permits and land-use data.
7. TEC lobbying records.
8. TEC campaign-finance data.
9. Exa-powered web research for official contacts/context.
10. Houston connector if clean enough to support confident output.

Austin is the deepest first city. The first deep geo unit is Austin council district. Dallas and San Antonio should be comparable at city level and lighter district/geo depth. Houston should be shown if real data is clean; otherwise it can be watchlisted with lower confidence and an explicit reason.

Campaign finance is in scope, but it must not derail the core product. The first pass should import the cleanest public files and expose enough for policy-risk context. User-facing language should stay professional: public influence context, stakeholder awareness, and Response Plan. Avoid implying deceptive lobbying, targeting, or legal advice.

## 20.8 Web research and contact paths

Exa should be the preferred web research provider once configured. Web research should be bounded and source-biased:

- Prefer official government, agency, committee, city, county, legislature, and public organization pages.
- Use contact pages and office pages as sources for Response Plan contact paths.
- Record URLs opened or searched in `agent_tool_calls`.
- Create `contact_paths` rows when the report recommends a contact path.
- Store why the office/contact matters, not just a name.
- Do not send messages or automate outreach.

Fallback web research should still use live official pages. It should not fabricate contacts or rely on stale hardcoded contact lists.

## 20.9 Score ownership

The model assigns scores using the `update_signal_scores` tool. The backend validates:

- Required fields exist.
- Numeric scores are between 0 and 100.
- Evidence IDs exist and belong to the current run or relevant cached source set.
- City and geo fields are valid.
- Reasoning summary is present.

The backend should not force a fixed formula range in the MVP. Formula examples in this plan are rubrics and explanation anchors, not strict gatekeepers. Later, rubric pre-scores can be added as inputs to the model, but the final MVP score write is agent-assigned and evidence-validated.

Start with city-level score history. Add council-district score history once city-level flow works end to end.

## 20.10 Activity-log standard

The activity log should feel like a professional agent transcript, not a raw JSON dump. Surface-level entries should look like:

```txt
Loaded LoneStar Retail Group profile
Queried Austin construction permits for recent commercial activity
Found elevated commercial permit activity in Austin District 3
Searched Texas bills for permitting, zoning, land use, property tax, parking, and signage
Retrieved official TLO documents for 2 relevant bills
Searched TEC lobbying records for development-related subject activity
Updated city-level signal scores
Generated final report
```

Expanded entries may show:

```txt
tool name
short input summary
source names
links opened
record counts
evidence IDs
timestamp
status
error message if failed
```

Raw input/output JSON should be hidden behind a deeper debug view, if exposed at all.

## 20.11 Production-only setup

This project should be wired directly to the cloud services:

- Supabase cloud project for database/auth/storage.
- Vercel production deployment for frontend.
- Railway production services for workers and MCP.
- No local Supabase stack.
- No Docker requirement for the app path.
- No fake local-only services.

The browser must use the Supabase anon key. Server-only code should use the service role key when needed. This is not about overbuilding enterprise security; exposing a service role key to the browser would let any browser user mutate the database directly and would break the basic architecture.

## 20.12 Environment variables

Expected environment variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
OPENAI_MODEL
OPENAI_REASONING_EFFORT
OPENSTATES_API_KEY
EXA_API_KEY
SOCRATA_APP_TOKEN
RAILWAY_ENVIRONMENT
APP_BASE_URL
```

Optional or later:

```txt
APIFY_API_KEY
SOCRATA_API_KEY_ID
SOCRATA_API_KEY_SECRET
MIRO_CLIENT_ID
MIRO_CLIENT_SECRET
MIRO_ACCESS_TOKEN
```

Vercel should receive frontend-safe variables and server route variables. Railway should receive service-role and ingestion/worker variables. Secrets should not be committed.

`OPENAI_MODEL` should default to `gpt-5.4-mini`. `OPENAI_REASONING_EFFORT` should default to `medium`.

## 20.13 MVP acceptance criteria

The MVP is real only when all of this works:

```txt
User can sign up/login with email and password.
User can create or load a company profile.
Overview dashboard is the first screen.
Texas map shows Austin, Dallas, Houston, and San Antonio.
LoneStar Retail Group demo profile exists.
Ask Mode creates an agent run.
Railway worker executes the run.
Agent calls real tools backed by real public/cached public data.
Activity log updates while the run progresses.
Scores are updated through update_signal_scores.
Report is saved as markdown and rendered in the dashboard.
Evidence drawer links claims to public source URLs or cached public records.
Failed sources are visible and lower confidence instead of silently disappearing.
Replay Mode uses real historical cached public records.
MCP server exposes Augur tools.
Augur skill exists and explains safe/source-backed usage.
No hardcoded fake recommendation, fake bill, fake alert, or fake replay fixture exists.
```

## 20.14 Agent depth requirements

The current MVP direction requires a much deeper agent than a shallow markdown generator. Augur must feel like a bounded professional analyst that can inspect records, keep state across the run, explain uncertainty, and produce consultant-grade deliverables.

Important distinction:

- Augur does not need a terminal or general sandbox.
- Augur does need a rich, explicit tool surface.
- The worker owns tool execution.
- The LLM chooses requested actions and writes analysis.
- The application validates tool requests, bounds score writes, persists evidence, and keeps the full run history.

Every agent run must have a mode-specific prompt. The Analysis Runner and Live Monitor cannot share a tiny generic system prompt.

### Analysis Runner context

The first LLM call for Analysis Runner must include a full context packet, not just the user prompt. At minimum it should include:

```json
{
  "mode": "analysis_runner",
  "company": {
    "profile": "business profile, vertical, size, operating model, expansion goals",
    "constraints": "capital limits, location constraints, timing, risk tolerance",
    "demo_context": "LoneStar Retail Group when applicable"
  },
  "user_objective": "the exact user ask",
  "decision_frame": {
    "decision": "which market/product/location/policy move should the company make",
    "required_output": "recommendation, reasoning, risks, evidence, response plan"
  },
  "source_registry": "available public sources and what each source is useful for",
  "known_city_depth": "Austin deepest; Dallas and San Antonio lighter; Houston lower confidence if source coverage is messy",
  "prior_scores": "latest city/company signal scores when available",
  "prior_reports": "brief references to prior Augur reports when available",
  "tool_policy": "call tools before making claims; cite evidence IDs; log failures"
}
```

The report must be substantially complete. It should read like a professional consultant's expansion/risk memo, not a demo placeholder. It should include:

- executive recommendation;
- company-specific assumptions;
- city-by-city comparison;
- market and permitting signal interpretation;
- zoning and land-use implications;
- policy risks and near-term watch items;
- lobbying/response-plan section framed as lawful stakeholder outreach;
- contacts or contact paths when available from official/public sources or web research;
- draft emails/talking points where useful;
- suggested public messaging or social campaign concepts where useful;
- evidence table;
- confidence and uncertainty.

The Analysis Runner may draft artifacts but must not send emails, post social content, create accounts, buy ads, or automate engagement. Those actions can be represented as drafts, checklists, approval queues, or exportable recommendations only.

### Live Monitor context

The Live Monitor is not just the Analysis Runner on a schedule. It is a standing surveillance workflow for the company.

The first LLM call for a monitor run must include:

```json
{
  "mode": "live_monitor",
  "company": "full company dossier",
  "watchlist": "cities, districts, policy topics, source types, keywords",
  "last_run_summary": "what was last checked and what changed",
  "new_records": "records discovered by the scheduled ingestion pass",
  "source_failures": "sources that failed or degraded",
  "alert_thresholds": "when to produce a signal brief or score update",
  "required_output": "triage, evidence, impact, response plan, drafted next steps"
}
```

The monitor should:

- scan for new legislative, city, lobbying, campaign-finance, and web-research signals;
- identify what changed since the previous run;
- decide whether the change matters to the company;
- create an alert only when the signal clears a meaningful threshold;
- update signal scores through the bounded score tool;
- write an activity timeline;
- save a signal brief;
- draft recommended response assets when there is a real action path.

Monitor deliverables should include:

- signal title;
- severity;
- company relevance;
- affected cities or districts;
- policy/market interpretation;
- evidence;
- recommended response;
- outreach/contact path;
- draft email or talking points when useful;
- social/public messaging concept when useful;
- confidence and uncertainty;
- next monitor check.

### Run memory and stateless LLM requirement

LLMs are stateless. Augur must explicitly pass the relevant run state every time it calls the model.

For every multi-step agent call, messages should include:

```txt
system prompt
developer/application policy if used
initial context packet
user objective
assistant planning/tool request
tool result
assistant updated reasoning/action request
tool result
...
final report request
```

The worker must persist the run transcript in database rows or structured JSON so that every subsequent LLM call can include the important prior messages, tool calls, tool outputs, evidence IDs, failures, and score updates. Do not assume the model remembers anything not included in the current request.

### Tool-Calling And Report Failure

Native OpenAI is the primary path. `gpt-5.4-mini` should be used for the tool/action loop and final memo generation with medium reasoning effort.

Implementation rule:

- Prefer native tool calls when the provider returns valid `tool_calls`.
- If native tool calls are unreliable in a specific request, use structured JSON action output.
- Validate every model-requested action against local schemas before execution.
- Never let model text directly mutate database state.
- Keep model-requested tool execution bounded and validated. If report generation fails validation after one repair call, fail the run visibly.
- Keep the provider abstraction so the model can change from `gpt-5.4-mini` to `gpt-5.5` without rewriting the agent runtime.

### Required richer tool surface

The tool layer should grow beyond the initial probes. It should include both discovery tools and synthesis/drafting tools:

```txt
get_company_dossier
list_available_sources
search_texas_bills
get_texas_bill_documents
search_tlo_rss
search_lobby_activity
search_campaign_finance
query_city_dataset
inspect_city_record
web_research
find_public_contact_paths
update_signal_scores
draft_outreach_email
draft_talking_points
draft_social_campaign
suggest_visual_assets
save_markdown_report
finish_investigation
```

Drafting tools do not execute external actions. They create reviewed artifacts in the report or database.

## 20.15 Product and UI correction

Augur must not collapse the whole product into one page. The product needs clear, dedicated routes because auth, onboarding, dashboard, runs, and reports are separate mental models.

Required route behavior:

```txt
/login                 dedicated login page
/signup                dedicated signup page
/onboarding            dedicated company setup page
/dashboard             main overview dashboard after login
/runs                  analysis runner start/history
/runs/[id]             live run progress and activity
/reports/[id]          full report reader
/diagnostics           setup/API diagnostics
```

The dashboard is the first real product screen after auth. It should show the Texas map, city signal summary, latest run/report, monitor status, and evidence-backed signal cards. It should not be a marketing page, a giant form, or a single-page demo collage.

Desktop quality matters first. Mobile can be acceptable later, but the hackathon demo should feel like a serious desktop operations tool:

- restrained, dense, business-focused layout;
- readable tables and panels;
- no giant cheap hero UI inside the app;
- no cramped card-in-card dashboard;
- no decorative design that hides data;
- strong report reading experience;
- visible agent activity that summarizes tools, evidence, and progress.

The run detail page should show the agent doing real work:

- current status;
- step timeline;
- source calls;
- evidence found;
- score updates;
- failures/degraded sources;
- final report link.

The report page should be a polished intelligence memo, not raw markdown dumped into a narrow card.

[1]: https://miro.com/marketplace/miro-mcp-for-openai-codex/?utm_source=chatgpt.com "Miro MCP for OpenAI Codex"
[2]: https://docs.openstates.org/api-v3/?utm_source=chatgpt.com "API v3 Overview - Open States"
[3]: https://capitol.texas.gov/billlookup/filedownloads.aspx?utm_source=chatgpt.com "File Downloads | Texas Legislature Online"
[4]: https://capitol.texas.gov/MyTLO/RSS/RSSFeeds.aspx?utm_source=chatgpt.com "RSS Feeds"
[5]: https://www.ethics.state.tx.us/search/lobby/?utm_source=chatgpt.com "Texas Ethics Commission Search Lobby"
[6]: https://www.ethics.state.tx.us/search/lobby/loblistsREG2021-2025.php?utm_source=chatgpt.com "Lobby Registration Lists"
[7]: https://data.austintexas.gov/Building-and-Development/Issued-Construction-Permits/3syk-w9eu?utm_source=chatgpt.com "Issued Construction Permits | Open Data | City of Austin, Texas"
[8]: https://www.dallasopendata.com/Services/Building-Permits/e7gq-4sah?utm_source=chatgpt.com "Building Permits"
[9]: https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/Pages/certificate_occupancy.aspx?utm_source=chatgpt.com "Permitting & Inspections certificate_occupancy"
[10]: https://data.sanantonio.gov/dataset/building-permits?utm_source=chatgpt.com "Building Permits - Dataset - Open Data SA - City of San Antonio"
[11]: https://data.sanantonio.gov/dataset/building-permits/resource/c21106f9-3ef5-4f3a-8604-f992b4db7512?utm_source=chatgpt.com "Building Permits - PERMITS ISSUED - Open Data SA"
[12]: https://ckan.org/?utm_source=chatgpt.com "CKAN - The open source data management system"
[13]: https://dev.socrata.com/docs/endpoints.html?utm_source=chatgpt.com "API Endpoints - Socrata"
[14]: https://dev.socrata.com/docs/queries/?utm_source=chatgpt.com "Queries using SODA3 - Socrata"
[15]: https://docs.ckan.org/en/2.9/api/?utm_source=chatgpt.com "API guide — CKAN 2.9.11 documentation"
[16]: https://supabase.com/docs/guides/database/extensions/pgvector?utm_source=chatgpt.com "pgvector: Embeddings and vector similarity"
[17]: https://supabase.com/docs/guides/functions/schedule-functions?utm_source=chatgpt.com "Scheduling Edge Functions | Supabase Docs"
[18]: https://docs.railway.com/cron-jobs?utm_source=chatgpt.com "Cron Jobs | Railway Docs"
[19]: https://modelcontextprotocol.io/specification/2025-06-18/server/tools?utm_source=chatgpt.com "Tools"
[20]: https://developers.openai.com/api/docs/guides/tools-skills?utm_source=chatgpt.com "Skills | OpenAI API"
[21]: https://developers.openai.com/codex/skills?utm_source=chatgpt.com "Agent Skills – Codex"
[22]: https://modelcontextprotocol.io/specification/2025-06-18/server/resources?utm_source=chatgpt.com "Resources"
