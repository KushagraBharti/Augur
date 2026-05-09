-- Augur initial cloud schema.
-- This migration is the source-controlled database shape for the hosted
-- Supabase project. Do not use a local Supabase stack for this project.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  vertical text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  is_demo boolean not null default false,
  profile_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  primary_company_id uuid references public.companies(id) on delete set null,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create table public.company_geo_targets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  city text not null,
  geo_unit_type text not null,
  geo_unit_name text not null,
  priority integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique (company_id, city, geo_unit_type, geo_unit_name)
);

create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type text not null,
  source_domain text,
  city text,
  dataset_id text,
  access_method text not null,
  refresh_frequency text,
  citation_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger data_sources_set_updated_at
before update on public.data_sources
for each row execute function public.set_updated_at();

create table public.source_fetches (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.data_sources(id) on delete set null,
  fetch_type text not null,
  status text not null check (status in ('success', 'partial', 'failed')),
  query_json jsonb not null default '{}'::jsonb,
  source_url text,
  record_count integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  metadata_json jsonb not null default '{}'::jsonb
);

create table public.raw_records (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.data_sources(id) on delete set null,
  source_fetch_id uuid references public.source_fetches(id) on delete set null,
  external_id text,
  record_type text not null,
  payload jsonb,
  raw_text text,
  source_url text,
  fetched_at timestamptz not null default now(),
  record_date timestamptz,
  unique_hash text,
  metadata_json jsonb not null default '{}'::jsonb,
  unique (source_id, unique_hash)
);

create table public.city_records (
  id uuid primary key default gen_random_uuid(),
  raw_record_id uuid references public.raw_records(id) on delete set null,
  source_id uuid references public.data_sources(id) on delete set null,
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
  normalized_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (city, record_type, external_id)
);

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  jurisdiction text not null default 'tx',
  session text not null,
  bill_id text not null,
  title text,
  status text,
  sponsors jsonb not null default '[]'::jsonb,
  subjects jsonb not null default '[]'::jsonb,
  last_action text,
  last_action_date date,
  updated_at_source timestamptz,
  source_url text,
  raw_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session, bill_id)
);

create trigger bills_set_updated_at
before update on public.bills
for each row execute function public.set_updated_at();

create table public.bill_documents (
  id uuid primary key default gen_random_uuid(),
  bill_uuid uuid not null references public.bills(id) on delete cascade,
  document_type text not null,
  version text,
  source_url text,
  source_path text,
  raw_text text,
  parsed_json jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  unique (bill_uuid, document_type, version, source_url)
);

create table public.lobby_records (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.data_sources(id) on delete set null,
  year integer not null,
  lobbyist_name text,
  client_name text,
  subject_matter text,
  compensation_band text,
  activity_type text,
  raw_record_id uuid references public.raw_records(id) on delete set null,
  normalized_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.campaign_finance_records (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.data_sources(id) on delete set null,
  raw_record_id uuid references public.raw_records(id) on delete set null,
  year integer,
  filing_date date,
  filer_name text,
  filer_type text,
  contributor_name text,
  recipient_name text,
  office text,
  transaction_type text,
  amount numeric,
  subject_matter text,
  source_url text,
  normalized_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete set null,
  mode text not null check (mode in ('ask', 'live_monitor', 'replay_monitor', 'manual_ingest', 'provider_verification')),
  status text not null check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  user_prompt text,
  signal_window_start timestamptz,
  signal_window_end timestamptz,
  replay_label text,
  started_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz,
  final_summary text,
  error_message text,
  metadata_json jsonb not null default '{}'::jsonb
);

create table public.agent_tool_calls (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  step_index integer not null,
  tool_name text not null,
  input_json jsonb,
  output_json jsonb,
  output_summary text,
  status text not null check (status in ('queued', 'running', 'success', 'failed', 'skipped')),
  evidence_ids uuid[] not null default '{}'::uuid[],
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  unique (run_id, step_index)
);

create table public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.agent_runs(id) on delete cascade,
  source_id uuid references public.data_sources(id) on delete set null,
  raw_record_id uuid references public.raw_records(id) on delete set null,
  city_record_id uuid references public.city_records(id) on delete set null,
  bill_id uuid references public.bills(id) on delete set null,
  bill_document_id uuid references public.bill_documents(id) on delete set null,
  lobby_record_id uuid references public.lobby_records(id) on delete set null,
  campaign_finance_record_id uuid references public.campaign_finance_records(id) on delete set null,
  title text not null,
  evidence_type text not null,
  source_url text,
  excerpt text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.signal_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  city text not null,
  geo_unit_type text,
  geo_unit_name text,
  development_momentum numeric not null check (development_momentum >= 0 and development_momentum <= 100),
  zoning_friction numeric not null check (zoning_friction >= 0 and zoning_friction <= 100),
  code_occupancy_risk numeric not null check (code_occupancy_risk >= 0 and code_occupancy_risk <= 100),
  policy_risk numeric not null check (policy_risk >= 0 and policy_risk <= 100),
  confidence numeric not null check (confidence >= 0 and confidence <= 100),
  score_window_start date,
  score_window_end date,
  evidence_ids uuid[] not null default '{}'::uuid[],
  reasoning_summary text not null,
  updated_by_run_id uuid references public.agent_runs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  title text not null,
  report_type text not null check (report_type in ('daily_monitor', 'expansion_brief', 'policy_alert', 'city_comparison', 'replay_monitor', 'provider_verification')),
  markdown_content text not null,
  summary_json jsonb not null default '{}'::jsonb,
  evidence_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create table public.contact_paths (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.agent_runs(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  policy_issue text not null,
  contact_name text,
  office_or_org text,
  role text,
  contact_type text,
  public_contact_info jsonb not null default '{}'::jsonb,
  why_relevant text,
  source_url text,
  talking_points text,
  created_at timestamptz not null default now()
);

create index companies_owner_user_id_idx on public.companies(owner_user_id);
create index companies_profile_json_gin_idx on public.companies using gin(profile_json);
create index user_profiles_primary_company_id_idx on public.user_profiles(primary_company_id);
create index company_memberships_user_id_idx on public.company_memberships(user_id);
create index company_geo_targets_company_id_idx on public.company_geo_targets(company_id);
create index data_sources_city_idx on public.data_sources(city);
create index raw_records_source_id_record_type_idx on public.raw_records(source_id, record_type);
create index raw_records_record_date_idx on public.raw_records(record_date);
create index raw_records_payload_gin_idx on public.raw_records using gin(payload);
create index source_fetches_source_id_started_at_idx on public.source_fetches(source_id, started_at desc);
create index city_records_city_type_date_idx on public.city_records(city, record_type, record_date desc);
create index city_records_geo_idx on public.city_records(city, geo_unit_type, geo_unit_name);
create index bills_session_bill_id_idx on public.bills(session, bill_id);
create index bills_subjects_gin_idx on public.bills using gin(subjects);
create index bill_documents_bill_uuid_idx on public.bill_documents(bill_uuid);
create index lobby_records_year_subject_idx on public.lobby_records(year, subject_matter);
create index lobby_records_client_idx on public.lobby_records(client_name);
create index campaign_finance_year_filer_idx on public.campaign_finance_records(year, filer_name);
create index campaign_finance_recipient_idx on public.campaign_finance_records(recipient_name);
create index agent_runs_company_status_idx on public.agent_runs(company_id, status, started_at desc);
create index agent_tool_calls_run_step_idx on public.agent_tool_calls(run_id, step_index);
create index evidence_items_run_id_idx on public.evidence_items(run_id);
create index signal_scores_company_city_created_idx on public.signal_scores(company_id, city, created_at desc);
create index reports_company_created_idx on public.reports(company_id, created_at desc);
create index contact_paths_company_id_idx on public.contact_paths(company_id);

alter table public.companies enable row level security;
alter table public.user_profiles enable row level security;
alter table public.company_memberships enable row level security;
alter table public.company_geo_targets enable row level security;
alter table public.data_sources enable row level security;
alter table public.source_fetches enable row level security;
alter table public.raw_records enable row level security;
alter table public.city_records enable row level security;
alter table public.bills enable row level security;
alter table public.bill_documents enable row level security;
alter table public.lobby_records enable row level security;
alter table public.campaign_finance_records enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_tool_calls enable row level security;
alter table public.evidence_items enable row level security;
alter table public.signal_scores enable row level security;
alter table public.reports enable row level security;
alter table public.contact_paths enable row level security;

create policy "profiles select own"
on public.user_profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles insert own"
on public.user_profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles update own"
on public.user_profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "companies select accessible"
on public.companies for select
to authenticated
using (
  is_demo
  or owner_user_id = auth.uid()
  or exists (
    select 1 from public.company_memberships memberships
    where memberships.company_id = companies.id
      and memberships.user_id = auth.uid()
  )
);

create policy "companies insert own"
on public.companies for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "companies update owner"
on public.companies for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "memberships select own or company owner"
on public.company_memberships for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.companies company
    where company.id = company_memberships.company_id
      and company.owner_user_id = auth.uid()
  )
);

create policy "memberships insert company owner"
on public.company_memberships for insert
to authenticated
with check (
  exists (
    select 1 from public.companies company
    where company.id = company_memberships.company_id
      and company.owner_user_id = auth.uid()
  )
);

create policy "memberships update company owner"
on public.company_memberships for update
to authenticated
using (
  exists (
    select 1 from public.companies company
    where company.id = company_memberships.company_id
      and company.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.companies company
    where company.id = company_memberships.company_id
      and company.owner_user_id = auth.uid()
  )
);

create policy "company geo targets select accessible"
on public.company_geo_targets for select
to authenticated
using (
  exists (
    select 1 from public.companies company
    where company.id = company_geo_targets.company_id
      and (
        company.is_demo
        or company.owner_user_id = auth.uid()
        or exists (
          select 1 from public.company_memberships memberships
          where memberships.company_id = company.id
            and memberships.user_id = auth.uid()
        )
      )
  )
);

create policy "company geo targets write owner"
on public.company_geo_targets for all
to authenticated
using (
  exists (
    select 1 from public.companies company
    where company.id = company_geo_targets.company_id
      and company.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.companies company
    where company.id = company_geo_targets.company_id
      and company.owner_user_id = auth.uid()
  )
);

create policy "public source registry readable"
on public.data_sources for select
to anon, authenticated
using (is_active);

create policy "authenticated source fetches readable"
on public.source_fetches for select
to authenticated
using (true);

create policy "authenticated public raw records readable"
on public.raw_records for select
to authenticated
using (true);

create policy "authenticated city records readable"
on public.city_records for select
to authenticated
using (true);

create policy "authenticated bills readable"
on public.bills for select
to authenticated
using (true);

create policy "authenticated bill documents readable"
on public.bill_documents for select
to authenticated
using (true);

create policy "authenticated lobby records readable"
on public.lobby_records for select
to authenticated
using (true);

create policy "authenticated campaign finance records readable"
on public.campaign_finance_records for select
to authenticated
using (true);

create policy "agent runs select accessible"
on public.agent_runs for select
to authenticated
using (
  exists (
    select 1 from public.companies company
    where company.id = agent_runs.company_id
      and (
        company.is_demo
        or company.owner_user_id = auth.uid()
        or exists (
          select 1 from public.company_memberships memberships
          where memberships.company_id = company.id
            and memberships.user_id = auth.uid()
        )
      )
  )
);

create policy "agent runs insert accessible company"
on public.agent_runs for insert
to authenticated
with check (
  created_by_user_id = auth.uid()
  and exists (
    select 1 from public.companies company
    where company.id = agent_runs.company_id
      and (
        company.is_demo
        or company.owner_user_id = auth.uid()
        or exists (
          select 1 from public.company_memberships memberships
          where memberships.company_id = company.id
            and memberships.user_id = auth.uid()
        )
      )
  )
);

create policy "agent runs update own queued"
on public.agent_runs for update
to authenticated
using (created_by_user_id = auth.uid() and status in ('queued', 'running'))
with check (created_by_user_id = auth.uid());

create policy "agent tool calls select via run"
on public.agent_tool_calls for select
to authenticated
using (
  exists (
    select 1 from public.agent_runs run
    join public.companies company on company.id = run.company_id
    where run.id = agent_tool_calls.run_id
      and (
        company.is_demo
        or company.owner_user_id = auth.uid()
        or exists (
          select 1 from public.company_memberships memberships
          where memberships.company_id = company.id
            and memberships.user_id = auth.uid()
        )
      )
  )
);

create policy "evidence select via run or public cached"
on public.evidence_items for select
to authenticated
using (
  run_id is null
  or exists (
    select 1 from public.agent_runs run
    join public.companies company on company.id = run.company_id
    where run.id = evidence_items.run_id
      and (
        company.is_demo
        or company.owner_user_id = auth.uid()
        or exists (
          select 1 from public.company_memberships memberships
          where memberships.company_id = company.id
            and memberships.user_id = auth.uid()
        )
      )
  )
);

create policy "signal scores select accessible"
on public.signal_scores for select
to authenticated
using (
  exists (
    select 1 from public.companies company
    where company.id = signal_scores.company_id
      and (
        company.is_demo
        or company.owner_user_id = auth.uid()
        or exists (
          select 1 from public.company_memberships memberships
          where memberships.company_id = company.id
            and memberships.user_id = auth.uid()
        )
      )
  )
);

create policy "reports select accessible"
on public.reports for select
to authenticated
using (
  exists (
    select 1 from public.companies company
    where company.id = reports.company_id
      and (
        company.is_demo
        or company.owner_user_id = auth.uid()
        or exists (
          select 1 from public.company_memberships memberships
          where memberships.company_id = company.id
            and memberships.user_id = auth.uid()
        )
      )
  )
);

create policy "contact paths select accessible"
on public.contact_paths for select
to authenticated
using (
  company_id is null
  or exists (
    select 1 from public.companies company
    where company.id = contact_paths.company_id
      and (
        company.is_demo
        or company.owner_user_id = auth.uid()
        or exists (
          select 1 from public.company_memberships memberships
          where memberships.company_id = company.id
            and memberships.user_id = auth.uid()
        )
      )
  )
);

insert into public.companies (slug, name, description, vertical, is_demo, profile_json)
values (
  'lonestar-retail-group',
  'LoneStar Retail Group',
  'Demo retail landlord and strip-mall developer evaluating Texas development expansion.',
  'retail landlord / strip-mall developer',
  true,
  '{
    "business_model": "Retail landlord and strip-mall developer",
    "goal": "Develop or expand retail centers across Texas",
    "target_cities": ["Austin", "Dallas", "Houston", "San Antonio"],
    "current_priority": "Identify the best Texas market or corridor for next development",
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
  }'::jsonb
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  vertical = excluded.vertical,
  is_demo = excluded.is_demo,
  profile_json = excluded.profile_json;

insert into public.company_geo_targets (company_id, city, geo_unit_type, geo_unit_name, priority, notes)
select id, city, geo_unit_type, geo_unit_name, priority, notes
from public.companies company
cross join (
  values
    ('Austin', 'council_district', 'citywide', 100, 'Austin is the deepest first city; drill into council districts during analysis.'),
    ('Dallas', 'city', 'citywide', 80, 'Solid comparison city for permits and occupancy/code friction.'),
    ('San Antonio', 'city', 'citywide', 70, 'Solid but lighter comparison city.'),
    ('Houston', 'city', 'citywide', 50, 'Watchlisted if connector quality is weaker.')
) as targets(city, geo_unit_type, geo_unit_name, priority, notes)
where company.slug = 'lonestar-retail-group'
on conflict (company_id, city, geo_unit_type, geo_unit_name) do update set
  priority = excluded.priority,
  notes = excluded.notes;

insert into public.data_sources (name, source_type, source_domain, city, dataset_id, access_method, refresh_frequency, citation_url, notes)
values
  ('OpenStates Texas Bills', 'legislation', 'openstates.org', null, null, 'api', 'daily', 'https://v3.openstates.org/', 'Texas bill metadata via OpenStates API.'),
  ('Texas Legislature Online RSS', 'legislation_change_feed', 'capitol.texas.gov', null, null, 'rss', 'daily', 'https://capitol.texas.gov/MyTLO/RSS/RSSFeeds.aspx', 'TLO RSS feeds for change detection.'),
  ('Texas Legislature Online File Downloads', 'legislation_documents', 'capitol.texas.gov', null, null, 'ftp', 'daily', 'https://capitol.texas.gov/billlookup/filedownloads.aspx', 'Official bill text, analyses, fiscal notes, history, and related documents.'),
  ('Texas Ethics Commission Lobby Records', 'lobbying', 'ethics.state.tx.us', null, null, 'download', 'periodic', 'https://www.ethics.state.tx.us/search/lobby/', 'Public Texas lobby registration/activity context.'),
  ('Texas Ethics Commission Campaign Finance', 'campaign_finance', 'ethics.state.tx.us', null, null, 'download', 'periodic', 'https://www.ethics.state.tx.us/search/cf/', 'Public campaign-finance context where clean downloads are practical.'),
  ('Austin Issued Construction Permits', 'city_permits', 'data.austintexas.gov', 'Austin', '3syk-w9eu', 'socrata', 'daily', 'https://data.austintexas.gov/Building-and-Development/Issued-Construction-Permits/3syk-w9eu', 'Primary Austin development momentum dataset.'),
  ('Austin Zoning Cases', 'city_zoning', 'data.austintexas.gov', 'Austin', 'edir-dcnf', 'socrata', 'daily', 'https://data.austintexas.gov/', 'Austin zoning and land-use friction dataset.'),
  ('Austin Zoning By Address', 'city_zoning', 'data.austintexas.gov', 'Austin', 'nbzi-qabm', 'socrata', 'later', 'https://data.austintexas.gov/', 'Use later if address-level lookup becomes necessary.'),
  ('Dallas Building Permits', 'city_permits', 'dallasopendata.com', 'Dallas', 'e7gq-4sah', 'socrata', 'daily', 'https://www.dallasopendata.com/Services/Building-Permits/e7gq-4sah', 'Dallas development comparison dataset.'),
  ('Dallas Certificates of Occupancy', 'city_occupancy', 'dallasopendata.com', 'Dallas', '9qet-qt9e', 'socrata', 'daily', 'https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/Pages/certificate_occupancy.aspx', 'Dallas occupancy/opening-friction context.'),
  ('Dallas Code Violations', 'city_code', 'dallasopendata.com', 'Dallas', null, 'socrata', 'daily', 'https://www.dallasopendata.com/', 'Dallas code/operational risk context.'),
  ('San Antonio Building Permits', 'city_permits', 'data.sanantonio.gov', 'San Antonio', 'c21106f9-3ef5-4f3a-8604-f992b4db7512', 'ckan', 'daily', 'https://data.sanantonio.gov/dataset/building-permits', 'San Antonio development comparison dataset.'),
  ('San Antonio Future Land Use', 'city_land_use', 'data.sanantonio.gov', 'San Antonio', '55edb3a137444b2cb48035e57cf18087', 'ckan', 'later', 'https://data.sanantonio.gov/', 'San Antonio land-use context if clean.'),
  ('Houston Open Data', 'city_mixed', 'houston', 'Houston', null, 'ckan_or_download', 'later', 'https://cohgis-mycity.opendata.arcgis.com/', 'Houston is included if connector quality is clean enough.'),
  ('Exa Web Research', 'web_research', 'exa.ai', null, null, 'api', 'on_demand', 'https://exa.ai/', 'Bounded official-source web research and contact-path discovery.')
on conflict (name) do update set
  source_type = excluded.source_type,
  source_domain = excluded.source_domain,
  city = excluded.city,
  dataset_id = excluded.dataset_id,
  access_method = excluded.access_method,
  refresh_frequency = excluded.refresh_frequency,
  citation_url = excluded.citation_url,
  notes = excluded.notes,
  is_active = true;
