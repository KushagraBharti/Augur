The project should become:

Texas Policy & Market Intelligence Agent
A Texas-only agentic dashboard that helps a business understand:

What Texas bills/regulations could affect us?

Where in Texas should we expand/build/lease/operate?

What public data supports that decision?

What should we do next?

Still inspired by the Fed10 style: surfaced threats, exposure, amendment alerts, committee intel, action briefs, and “match impact, not keywords” positioning. 


But now it is built for the BrainForge / Texas Open Data track.

Key framing
Do not make this “AI lobbyist for all companies.”

Make it:

An agentic Texas business intelligence dashboard powered by public data.

The agent watches Texas legislation + city open data, then turns it into business action.

Example:

“A real estate operator wants to expand in Austin, Dallas, Houston, or San Antonio. The agent monitors zoning, permits, code violations, construction activity, economic signals, and proposed state bills. It flags risk, recommends locations, drafts briefs, and updates a Miro command center.”

That fits the track much better.

Important architecture correction
You are right: we should not invent 12 fake agents.

There should be one main agent with tools.

Call it something like:

Texas Analyst Agent
It has:

Brain: LLM reasoning

Tools: public data APIs, legislative data, database queries, map tools, Miro MCP

Memory: company profile, past alerts, user preferences, watched regions

Planner: decides what to inspect next

Guardrails: citations, bounded queries, no legal advice, no fake lobbying, no unsupported claims

Everything else is a module/tool, not an agent.

Examples:

Good:
- bill_search_tool
- permit_query_tool
- zoning_lookup_tool
- risk_score_tool
- miro_update_tool

Bad:
- Zoning Agent
- Permit Agent
- Miro Agent
- Company Mapper Agent
The product is agentic because the main agent can:

notice new signal → decide relevance → query more datasets → compare cities → create recommendation → update Miro → monitor changes
Initial Texas data map
These are the best public-data categories for the app.

1. Texas legislation data
Use this as the “threat radar.”

Texas Legislature Online provides bill text, bill analyses, fiscal notes, reports, and bill witness lists through its file download / FTP system. 

Texas Legislature Online also exposes committee meeting pages where users can view hearing notices, minutes, and witness lists by date or committee. 

Use for:

proposed bills

bill text

bill status

fiscal notes

committee schedules

witness lists

hearings

amendment detection, if feasible

2. Texas lobbying / influence data
Texas Ethics Commission has lobby registration and activity report search tools, including lobby database search, activity reports CSV, registration lists, activity lists, expenditures, and compensation codes. 

TEC also has campaign finance search for filed reports. 

Use for:

who is already lobbying on similar issues

which industries are active around a bill

stakeholder map

public influence signals

“who else cares about this issue?”

3. Texas open data portals
Texas.gov describes data.texas.gov as the state open data portal with tools to search, filter, map, and visualize official state agency datasets. 

The Texas open data ecosystem appears to use Socrata-style APIs for many city/state datasets; Socrata’s developer docs say the Open Data API provides programmatic access to open data resources. 

Use for:

statewide datasets

city datasets

public dashboards

map overlays

bounded MCP query tools

4. Austin data
Austin has strong datasets for this project:

issued construction permits

issued building permits

zoning by address

zoning cases

zoning notices

Chapter 380 economic development agreements

Austin’s issued construction permits dataset covers building, electrical, mechanical, plumbing, and driveway/sidewalk permits. 
 Austin also has zoning-by-address and zoning case datasets. 

Use for:

development activity

construction heat

zoning risk

expansion feasibility

real estate intelligence

5. Dallas data
Dallas has datasets for:

building permits

commercial permit activity

zoning grid

certificates of occupancy

code violations

right-of-way permits

Dallas OpenData lists a Building Permits dataset, a zoning grid dataset, and code violation data. 

Use for:

permit volume

zoning constraints

code risk

business/site readiness

development friction

6. Houston data
Houston’s open data portal is CKAN-based and exposes datasets with resource APIs. Houston has building code enforcement violations, residential building permits, 311-related data, and planning/development datasets. 

Use for:

code enforcement risk

permit trend analysis

neighborhood issue signals

business operating environment

7. San Antonio data
San Antonio has datasets for building permits, zoning, future land use, master development plans, mandatory low-impact-development areas, and capital data. 

Use for:

site feasibility

zoning + land use

development planning

infrastructure/capital context

8. Miro integration
Miro MCP fits well because it lets AI assistants connect to Miro boards, read context, generate diagrams, and visualize complex logic on the board. 
 The marketplace listing specifically mentions OpenAI Codex and direct interaction with the canvas. 

Use Miro as the live board:

Texas Risk Map
Legislative Threats
City Comparison
Affected Sites
Evidence Cards
Recommended Actions
Agent Activity Log
Best MVP direction
I would narrow the demo to one business type:

Texas Expansion Intelligence for Real Estate / Retail / Infrastructure Companies
Why this is best:

public data is strong

maps are natural

zoning/permitting data is relevant

legislation still matters

easy to demo visually

BrainForge track examples mention housing, zoning, permits, economic indicators, transportation, infrastructure

Demo company:

LoneStar Storage Co. wants to open new self-storage / light industrial sites across Austin, Dallas, Houston, and San Antonio.

The agent monitors:

construction permits

zoning

code violations

economic development incentives

infrastructure signals

relevant Texas bills

Then it says:

Best city for next site: San Antonio

Why:
- high permit activity nearby
- fewer zoning conflicts
- lower code violation density
- relevant state bill has low impact
- Austin has higher zoning friction
- Dallas site has certificate-of-occupancy risk

Action:
- shortlist these 3 parcels/areas
- monitor this zoning notice
- flag this Texas bill
- brief legal/real estate team
This is much more demoable than a generic company dashboard.

The single-agent system
Main agent
Texas Analyst Agent
Goal:

Continuously monitor Texas public data and tell a business what matters.

It can run in two modes:

Mode 1 — Monitor mode
Always-on scan:

Check new bills
Check new city data
Check new permits/zoning notices
Check committee/hearing updates
Compare against company profile
Create alerts
Update Miro
Mode 2 — Ask mode
User asks:

“Where should we open our next Texas office?”
“What new Texas bills could affect us?”
“Which city has the least permitting friction?”
“What changed this week?”
Agent answers by calling tools, not guessing.

Tools the agent should have
Legislative tools
search_texas_bills(query, session, status)
get_bill_text(bill_id)
get_bill_analysis(bill_id)
get_fiscal_note(bill_id)
get_committee_schedule(bill_id)
get_witness_lists(bill_id)
search_lobby_activity(topic_or_client)
search_campaign_finance(officeholder_or_pac)
City data tools
query_austin_permits(filters)
query_austin_zoning(address_or_area)
query_dallas_building_permits(filters)
query_dallas_code_violations(area)
query_houston_code_enforcement(area)
query_houston_permit_trends(area)
query_san_antonio_permits(filters)
query_san_antonio_zoning(area)
Analysis tools
score_legislative_threat(bill, company_profile)
score_site_friction(city, area, business_type)
compare_cities(metric_set)
generate_evidence_pack(alert_id)
draft_business_brief(alert_id)
Miro tools
create_miro_board(company)
upsert_threat_card(alert)
update_city_map(city_scores)
create_evidence_cards(sources)
update_action_timeline(tasks)
Memory tools
get_company_profile()
update_company_profile()
store_user_feedback(alert_id, verdict)
retrieve_prior_alerts(company_id)
What counts as the “agent”
The agent is not the classifier.

The agent is the loop:

1. Observes new Texas signal
2. Decides whether it matters
3. Calls more tools to investigate
4. Compares against company profile
5. Produces a recommendation
6. Updates dashboard + Miro
7. Stores memory
8. Keeps monitoring
That is enough. Do not overcomplicate it.

Questions to lock this down
Product scope
Are we building for all Texas businesses, or should we pick one vertical for the demo?

real estate / development

retail expansion

logistics

healthcare

energy

tech / data privacy

Should the product be framed as:

Texas regulatory threat dashboard

Texas expansion intelligence dashboard

Texas policy + market intelligence dashboard

Texas business risk command center

Do you want the lobbying/action part to be central, or should it be one tab called Response Plan?

Demo company
What fake company should we use?

real estate developer

self-storage operator

logistics startup

healthcare company

AI camera / surveillance company

energy infrastructure company

Do we want the demo to show a company choosing where to expand, or a company responding to a dangerous bill?

Best demo may combine both:

“We want to expand in Texas. Agent says San Antonio is strongest, but flags a state bill and Austin zoning issue that could change the decision.”

Data depth
Which city should be the main star?

Austin, because hackathon is in Austin

Dallas, because data is clean and business-oriented

Houston, because regulatory/code/enforcement data is interesting

San Antonio, because zoning/building permit data is accessible

Should we support all four cities in the demo, or go deep on Austin + one comparison city?

Do we need parcel-level/address-level analysis, or is city/neighborhood-level enough for the hackathon?

Agent behavior
Should the agent run:

on button click only

scheduled every few minutes for demo

“always-on” simulated feed

What should the agent be allowed to do automatically?

create alerts

update Miro

draft briefs

draft emails

create tasks

never send anything externally

Do we want one visible “agent activity log” showing every tool call?

I think yes. Judges need to see it act.

Miro
Should Miro be:

a live command center

just generated diagrams

the main demo surface

What should the Miro board contain?

Texas map

city comparison

threat cards

evidence cards

response timeline

action checklist

agent log

MCP / skill requirement
Are we shipping:

custom MCP server only

agent skill only

both

Best answer for winning:

both.

Should the MCP server expose Texas data tools like:

search_texas_bills
query_city_permits
compare_city_risk
summarize_public_dataset
Should the agent skill be called something like:

texas-business-risk-analyst.skill.md
and explain safe usage, citation requirements, and bounded queries?

Final vibe
Is the name still Tripwire, or do we want a more Texas/open-data name?

Should the UI feel more like:

Fed10-style dark/serious threat dashboard

clean civic data explorer

executive command center

map-first intelligence product

My recommendation
Build:

Tripwire Texas
An agentic Texas public-data dashboard that helps businesses detect policy and market risk before making expansion decisions.

Demo:

“LoneStar Storage wants to expand across Texas. Tripwire scans Texas bills, city permits, zoning, code violations, and public datasets. It recommends San Antonio as the lowest-friction expansion market, flags an Austin zoning notice and a Texas bill that could affect operations, drafts the business brief, and updates the Miro command center.”

That hits:

Texas public data

visual dashboard

agent workflow

business utility

Miro integration

MCP/skill requirement

open-source track alignment


Yep this looks very good. I'm going to walk through it and kind of give you my thoughts about everything and then we'll go from there, yeah sounds good? So, key framing, then I'll make this AI lobbyist for all companies, yes. I think we should do an agentic Texas business intelligence dashboard powered by public data. Architecture correction, yes. Let's just do one main agent that just has access to all the tools and just a long running like iterative loop that just you know find some things run around like some checks does a little bit more checking there's a little bit more checking etc etc right and then we just give it access to a shit ton of tools give it access to company profile and memory and we'll kind of you know set up the system prompt in a way that kind of takes care of that as well. And then, yeah planner decides what to inspect next, yep exactly what I'm thinking guard rails citations no bounded queries no legal advice no fake lobbying yep exactly that is the plan and that will all just be achieved through you know testing and things like that so don't worry too much about it. NSL Texas data map these are the best public data categories for the app Texas legislation data yes. We definitely want this and we would most likely like 100 be using this um is there an API way to do this or you know I guess a web scraper um where to do this without us having to like you know manually download the files um that would be my only question for the hackathon itself for now we can keep it to just downloading the files but give me both options for that Texas lobbying and influence data again um this is something we definitely want to use right so this is exactly the kind of like depth that we want to add right who's already lobbying on similar issues that gives us very clear insights on like who we can team up with as well as what like senator what like people are they targeting right maybe we can target the same people or maybe we strategically target different people right which industries are active around the bill yep you know gauge interest figure out who exactly has the most to win most to lose from this bill kind of thing right so we want to create like a very thorough map of everything then we have Texas open data portals so these uh yeah so Texas has strong data sets for this project right so issued construction permits building permits zoning by address zoning cases zoning notices and then economic development agreements so I think that's very interesting that all of it is very much focused towards land and real estate so yeah I think your idea of maybe making this a Texas expansion intelligence for real estate retail and infrastructure companies is definitely one that we can focus on in terms of a niche right then we have Miro integration Miro miss mcp fits really well because it lets AI assistants connect to mirror boards yep this is exactly what we're thinking right um so the Miro board basically as the agent works through its loop right so the main agent loop that it has um they okay yeah the Asian loop where it observes new Texas signals decides whether what matters calls more tools to investigate compares against company profile I think the main goal is that we should output everything into Miro um it's basically just like a oh look you know Miro's gonna do this we're just gonna do this we're just gonna do that kind of thing right and we'll just use the MCP server properly there um I think let's not do the mirror integration right away I think we build the rest of the app and add Miro at the very end at the very last so for now when it's doing the outputs of everything we can just output it to a dot md file for now and we'll just keep it as that right or I guess if we're gonna deploy the app uh we'll use price like I guess super base um so whatever super base allowed in terms of you know storing that data if we're just storing it as dot md file we can either store it as an actual dot md file um where you know we use super based buckets to store it or we could also just store it as just plain text and then you know recognize that it's a dot md file and then we just render it when necessary um so yeah I think that's definitely the goal um I'm okay with your Texas expansion intelligence for real estate retail and infrastructure because there's so much data there right yeah and then I think for the demo we want something a little bit stronger um and we want to demo both use cases right so specifically the two use cases that we talked about is like monitor mode and then ask mode right so we kind of do want to demo both and then I f*cking love love the tools that we have given the agent access to um and we can kind of talk a little bit more about it so I think I've asked a lot of questions throughout this as well right so try and answer my questions as well now for me to answer your question next we'll do what we'll do real estate development and retail expansion um as the main two verticals to go down on um just for our product scope just to keep things simple right and because there's so much data in real estate already that we have access to that we just found very cleanly right so that way we don't have to think too much else should the product be framed as Texas regulatory threat dashboard uh Texas expansion in texas we'll do a texas expansion intelligence dashboard um or just a texas intelligent dashboard for businesses right um what fake company should we do I think we could do like a real estate developer that also does like I don't know some other thing um do we want a demo to show a company choosing where to expand or company responding to it both we want the demo to do both um yeah yeah data depth in which shitty should be the main star I think we do the Austin because the hackathon is in Austin everything is Austin so we'll like really focus in on making sure the Austin part works first and then we can kind of make sure everything else also works but in reality if we're making the app properly everything should just work right um go deep on Austin plus one person city um we'll decide that in a bit I mean if we're creating the app properly we should just you know once we implement Austin properly it should also implement Dallas properly right as long as we implement the app correctly um but yeah we'll start with Austin for now um do any parcel level address level analysis or city level neighborhood level enough for the hackathon I think city and neighborhood level are not city but neighborhood level is definitely enough for the hackathon agent behavior should the agent run on click button scheduled every few minutes always on I think the agent should run so the obviously manual mode just runs when the prompt is sent right and then the automatic always on monitoring mode maybe we just set up like a cron job that basically just says once a day at like 8 00 am the agent runs scans through all the new bills that have been proposed throughout you know the last 24 hours flags any doesn't flag any and then creates like a final report if it does flag some then it goes deeper obviously and creates the you know creates an ongoing report that's updated throughout and then if it doesn't go any longer than you know it kind of just does its own thing I guess if it doesn't go too much longer than it just says oh there's these were the builds that were passed this is this but nothing crazy happened what should the agent be allowed to do automatically everything just nothing like sending emails but drafting everything right yeah do we want one visible agent activity log showing every tool call I'm uh yeah I think similar to like Codex and Claude code um you know they show all the tool calls very neatly without it looking like a fucking transcript pretty much uh the Miro stuff I think we just do last like I think we genuinely save Miro last um MCP skill requirement yeah so we can ship a custom MCP server or an agent skill or we can do both I don't know what do you think is the best I guess the MCP needs to be on top of our app and then the agent skill needs to also be on top of our app specifically is the name still tripwire no so which means the name to auger so AUG yeah so we change the name to auger AUG you are and that'll just be the new name should the UI feel more like I think it should feel a lot more like the fed 10 dashboard that I gave you or it's just a map of Texas and then we could like highlight a city highlight Austin as a city highlight Dallas as a city highlight whatever else is a city and that map of Texas is very like you know interactive so that we're able to see directly of like okay here like you know when I hover over Austin like something happens if I hover over Dallas something happens right yeah so we'll just do change the name to auger and it'll stay on agent tech Texas public dashboard. that helps business businesses detect policy and market risk before make making expansion decisions and I think that honestly looks and feels perfect and that's just the exact route that we should go down 

Thought for 40s
Yes. This is locked.

The project is now:

Augur
A Texas business intelligence dashboard powered by public data and one long-running agent.

Augur helps real estate, development, and retail-expansion teams answer:

“Where should we expand in Texas, what public signals support that move, and what policy risks could screw us before we act?”

The Fed10 reference is still useful for the feel: surfaced threats, impact-first matching, exposure, action cards, committee/lobbying context, and the idea that the product should brief the user rather than just search documents. 


Core product framing
Not this
“AI lobbyist for every company.”

This
A Texas expansion intelligence dashboard for businesses, powered by public data and an always-on agent.

The dashboard combines:

Texas bills / regulations

lobbying and influence data

Austin/Dallas/Houston/San Antonio open data

permits

zoning

code violations

certificates of occupancy

economic development signals

company profile + memory

agent-generated briefs

later: Miro command center

Name
Use Augur, not Auger.

Augur = someone who interprets early signs.

Auger = drilling tool.

Brand it as lowercase if you want it to feel cooler:

augur
Texas public data intelligence for business decisions.

Answering the big data question
Texas legislation: API vs scraping vs downloads
There is no clean official modern JSON API from Texas Legislature Online that gives everything we want.

Best approach:

Option A — reliable hackathon approach
Use Open States API for structured bill metadata/status/search, then use Texas Legislature Online for official documents.

Open States provides a JSON API for programmatic access to state legislative information. 

Use it for:

search bills
bill metadata
sponsors
actions
versions
basic status
Then use Texas Legislature Online for official source documents.

Texas Legislature Online provides anonymous FTP downloads for bill text, bill analyses, fiscal notes, reports, and bill witness lists. 

Use it for:

bill text
bill analysis
fiscal notes
witness lists
official PDF/text sources
Option B — monitoring approach
Use Texas Legislature Online RSS feeds for “new things today.”

TLO has RSS feeds for upcoming committee meetings, calendars, today’s bill text, fiscal notes, bill analyses, today’s filed bills, and passed bills. 

Use this for the daily monitor:

8 AM cron
→ fetch RSS
→ identify new/changed bills
→ pull official docs
→ run agent if relevant
Option C — secondary scraper path
Scrape TLO bill lookup/search/committee pages only for data not available via Open States, RSS, or FTP.

TLO committee pages expose schedules, minutes, witness lists, and bills in/out/referred to committee. 

Use scraper for:

committee schedules
hearing notices
witness lists
bill-specific page fields
Recommendation
Use all three, but in this order:

1. Open States API for structured bill metadata
2. TLO RSS for “what changed today”
3. TLO FTP for official docs
4. Scrape only when needed
That is strong, defensible, and buildable.

Texas lobbying / influence data
This is worth including because it gives the “depth” layer.

Texas Ethics Commission has lobby registration/activity search tools, including custom lobby database search, lobby activity report CSVs, registration lists, activity lists, lobby expenditures, and compensation codes. 

It also publishes lobby registration lists in PDF/Excel form, including registered lobbyists with clients and subject-matter lists. 

Use it for:

who is lobbying on similar issues
which clients care about a subject
which industries are active
which lobbyists appear around a topic
who may be coalition targets
Do not overbuild this for MVP. For hackathon:

Download current lobby registration Excel/CSV
Normalize:
- lobbyist
- client
- subject area
- compensation band if available
- year
Then agent can say:

“This bill appears near real estate/development interests. Existing lobby activity suggests these industry groups may already be active.”

Do not claim vote-buying or hidden influence. Keep it as public activity signals.

City open data: strongest datasets
Austin first
Austin should be the star because the hackathon is in Austin.

Use:

Austin construction permits
Austin’s issued construction permits dataset includes building, electrical, mechanical, plumbing, driveway/sidewalk permits, issue date, location, council district, expiration date, description of work, square footage, valuation, and units. 

Use for:

development velocity
commercial activity
construction heat map
neighborhood growth
competitive intensity
Austin zoning
Austin has zoning-by-address and zoning cases datasets. Zoning-by-address gives zoning for addresses within Austin city limits, and zoning cases include zoning case review data. 

Use for:

site feasibility
zoning friction
rezoning signals
development risk
Dallas second
Dallas is good for business/property operational risk.

Dallas has building permits, certificates of occupancy, and code violations datasets. 

Use for:

permit activity
certificate-of-occupancy friction
code violation density
operating risk
Houston third
Houston open data is CKAN-based and exposes datasets such as building code enforcement violations and residential building permits. 

Use for:

building/code risk
permit trends
neighborhood enforcement signals
San Antonio fourth
San Antonio has building permits and future land use datasets. The building permits dataset covers commercial and residential development, including new construction, remodels, additions, and related work. 

Use for:

development activity
land-use fit
expansion feasibility
Product scope
Lock this:

Primary verticals
Real estate development

Retail expansion

These are correct because the public data naturally supports them:

permits
zoning
land use
code violations
certificate of occupancy
city growth signals
legislation
lobbying data
Do not try to serve healthcare, logistics, energy, AI, and real estate all at once.

Demo company
Use:

LoneStar Retail Group
A Texas retail operator planning to open new locations across Austin, Dallas, Houston, and San Antonio.

Why this is better than a pure real estate developer:

retail expansion is easy for judges to understand

permits/zoning/code violations matter

city comparison matters

policy risk matters

neighborhood analysis matters

public data is relevant

Company profile:

Company: LoneStar Retail Group
Business: small-format grocery + convenience retail
Goal: open 3 new Texas locations in 12 months
Target cities: Austin, Dallas, Houston, San Antonio
Site preferences:
- high development activity
- low permitting friction
- commercial zoning compatibility
- low code-enforcement risk
- near growing neighborhoods
Policy sensitivities:
- permitting delays
- zoning restrictions
- retail alcohol/tobacco restrictions
- minimum parking changes
- signage rules
- labor/employment rules
This lets the demo cover both:

Where should we expand?
What bills or local policy signals could affect us?
The one-agent architecture
Main agent
Call it:

Augur Analyst
It is one agent with tools.

Not:

Zoning Agent
Permit Agent
Miro Agent
Bill Agent
Company Agent
But:

Augur Analyst
- has tools
- has memory
- has planner
- has guardrails
- loops until it has a useful brief
Agent loop
Observe
→ detect new Texas signal
→ decide if it matters
→ query more datasets
→ compare against company profile
→ compute risk/opportunity
→ draft brief
→ store report
→ update dashboard
→ later update Miro
→ monitor follow-up
The agent’s system goal
“You are Augur Analyst, a Texas public-data business intelligence agent. Your job is to monitor Texas legislation and city open data, identify signals that affect the company’s expansion and operating risk, investigate using tools, cite every source, and produce concise action briefs. You may draft recommendations and internal artifacts, but you may not send external communications, provide legal advice, or invent unsupported claims.”

Tool architecture
Legislative tools
searchTexasBills({
  query,
  session,
  chamber,
  status,
  updatedSince
})
getTexasBillDetails({
  billId
})
getTexasBillDocuments({
  billId,
  types: ["text", "analysis", "fiscal_note", "witness_list"]
})
getTexasLegislativeUpdates({
  since
})
Lobbying tools
searchTexasLobbyRegistrations({
  clientName?,
  lobbyistName?,
  subject?,
  year
})
findInfluenceSignals({
  topic,
  industry,
  year
})
Austin tools
queryAustinPermits({
  startDate,
  endDate,
  permitType?,
  councilDistrict?,
  zip?,
  commercialOnly?
})
queryAustinZoning({
  address?,
  area?,
  zoningCode?
})
queryAustinZoningCases({
  startDate,
  endDate,
  area?,
  status?
})
Dallas tools
queryDallasBuildingPermits({
  startDate,
  endDate,
  zip?,
  permitType?
})
queryDallasCodeViolations({
  startDate,
  endDate,
  area?,
  violationType?
})
queryDallasCertificatesOfOccupancy({
  startDate,
  endDate,
  zip?,
  businessType?
})
Houston tools
queryHoustonCodeEnforcement({
  startDate,
  endDate,
  area?,
  violationType?
})
queryHoustonPermitTrends({
  startDate,
  endDate,
  area?
})
San Antonio tools
querySanAntonioPermits({
  startDate,
  endDate,
  area?,
  permitType?
})
querySanAntonioLandUse({
  area?,
  landUseType?
})
Analysis tools
scoreExpansionOpportunity({
  city,
  neighborhood,
  companyProfile,
  datasets
})
scorePolicyRisk({
  bill,
  companyProfile,
  evidence
})
generateExpansionBrief({
  companyId,
  cityComparisons,
  policyRisks,
  evidence
})
Report tools
saveMarkdownReport({
  companyId,
  title,
  markdown,
  reportType
})
getReportHistory({
  companyId
})
Later Miro tools
syncReportToMiro({
  reportId,
  boardId
})
updateMiroTexasMap({
  boardId,
  cityScores,
  threats
})
Storage decision
For now, do not overcomplicate report files.

Use Supabase tables first.

reports table
id
company_id
title
type
markdown_content
json_summary
created_at
updated_at
Render markdown_content directly in the app.

Only use Supabase Storage if you need downloadable .md artifacts later.

This is cleaner for the hackathon.

Monitor mode
Daily 8 AM cron
1. Fetch new/updated bills from Open States + TLO RSS
2. Pull official docs from TLO FTP when needed
3. Fetch latest Austin/Dallas/Houston/San Antonio dataset deltas
4. Compare against company profile
5. If nothing material changed:
   - create short daily digest
6. If something matters:
   - investigate deeper
   - generate alert
   - generate brief
   - update dashboard
Example output:

Daily Texas Signal Brief — May 9

Scanned:
- 42 new/updated bills
- 184 Austin construction permits
- 51 Dallas code violations
- 28 Houston enforcement records
- 37 San Antonio permits

Material alerts:
1. Austin commercial permit activity increased near East Riverside.
2. HB 1482 could affect retail alcohol permitting timelines.
3. Dallas CO delays remain elevated in two target ZIP codes.

Recommended action:
Prioritize Austin East Riverside and San Antonio Northwest for deeper site review.
Ask mode
User asks:

“Where should we expand next in Texas?”

Agent does:

1. Read company profile
2. Query Austin/Dallas/Houston/San Antonio datasets
3. Compare permit activity, zoning fit, code risk, land-use fit
4. Check relevant Texas bills
5. Generate ranked city/neighborhood recommendation
Output:

Recommendation:
1. Austin — East Riverside
2. San Antonio — Northwest
3. Dallas — Bishop Arts / Oak Cliff
4. Houston — hold for now due to code-enforcement uncertainty

Why:
- Austin shows strong commercial permit velocity
- San Antonio has cleaner land-use fit
- Dallas has moderate CO/code risk
- Houston needs deeper parcel-level review

Policy watch:
HB 1482 may change retail permitting timelines.
Dashboard UI
Make it close to the Fed10 visual language, but Texas/open-data.

Main screen
Left sidebar:
- Overview
- Texas Map
- Bills
- City Signals
- Reports
- Agent Log

Main canvas:
- Texas map
- city cards
- surfaced risks
- opportunity scores
- latest report

Right panel:
- active agent run
- tool calls
- evidence
- next actions
Texas map
Cities:

Austin
Dallas
Houston
San Antonio
Each city has:

Opportunity score
Risk score
Permit activity
Zoning friction
Code risk
Policy risk
Last updated
Hover behavior:

Austin
Opportunity: 84
Risk: 41
Commercial permits: +18% this quarter
Zoning cases: 12 active
Policy alerts: 2
Recommended: Watch East Riverside / Highland
Surfaced alerts
Cards like:

AUSTIN-PERMIT-SPIKE
Commercial permit activity +22%
Potential expansion opportunity

TX-HB-1482
Retail permitting timelines
Potential operating risk

DALLAS-CO-DELAY
Certificate of Occupancy delays
Site-opening risk
Agent log
Keep it Codex-style, not transcript-style.

✓ Fetched 42 updated Texas bills
✓ Pulled 13 bill analyses
✓ Queried Austin permits since Apr 1
✓ Compared 4 target cities
✓ Escalated HB 1482 as medium policy risk
✓ Generated expansion brief
MCP / Skill decision
Do both.

Why both
The track says teams must ship either:

custom MCP server, or

proper agent skill.

Teams that ship both are more competitive.

The MCP server is your technical artifact. The skill doc is cheap and makes the project feel polished.

MCP server
Expose bounded Texas public data tools:

search_texas_bills
get_bill_documents
query_austin_permits
query_austin_zoning_cases
query_dallas_permits
query_dallas_code_violations
query_houston_code_enforcement
query_san_antonio_permits
compare_city_expansion_signals
generate_texas_business_brief
Agent skill
Create:

augur-texas-business-intelligence.skill.md
It explains:

Purpose
Supported datasets
How to query safely
Citation requirements
No legal advice policy
Recommended workflow
Example prompts
Failure modes
This is easy to demo:

“We didn’t just build a dashboard. We shipped an MCP server and an agent skill so other agents can safely query Texas public data.”

That directly targets BrainForge’s requirement.

Demo plan
Demo title
“Where should LoneStar Retail expand next?”

Demo part 1 — Ask mode
User asks:

“We want to open 3 new stores in Texas this year. Compare Austin, Dallas, Houston, and San Antonio. Find the best expansion target and flag policy risks.”

Agent runs.

Dashboard shows tool calls:

✓ Loaded LoneStar Retail profile
✓ Queried Austin permits
✓ Queried Austin zoning cases
✓ Queried Dallas permits
✓ Queried Dallas code violations
✓ Queried Houston code enforcement
✓ Queried San Antonio permits
✓ Searched Texas bills for retail/permitting/zoning
✓ Generated expansion brief
Output:

Top recommendation: Austin East Riverside

Why:
- strong commercial permit activity
- growth signal from nearby mixed-use development
- manageable zoning friction
- better near-term retail fit than Dallas/Houston targets

Watch:
- TX-HB-1482 could affect retail permitting timelines
- Austin zoning case activity suggests local process risk
Demo part 2 — Monitor mode
Click:

“Run daily monitor.”

Agent says:

Scanned 42 updated Texas bills and 300+ city records.
Found 2 material signals.
Signals:

1. TX-HB-1482 — retail permitting risk
2. Austin commercial permit spike near target region
It creates a daily brief.

Demo part 3 — Evidence view
Show each recommendation has sources:

Austin permit records
Austin zoning cases
Dallas code violations
Texas bill data
Lobby registration subject signals
Demo part 4 — Miro, if done
Click:

“Sync to Miro.”

Miro board gets:

Texas map
city comparison
policy alert card
evidence cards
action checklist
If Miro is not ready, no issue. The core app still wins.

MVP build order
Phase 1 — Core app
Next.js dashboard
Supabase database
Company profile
Report renderer
Agent run log
Phase 2 — Austin data
Austin permits
Austin zoning cases
Austin dashboard cards
Phase 3 — Legislation
Open States API
TLO RSS
TLO document download
Bill relevance scoring
Phase 4 — Agent loop
Ask mode
Monitor mode
Tool calling
Markdown report generation
Phase 5 — More cities
Dallas permits/code violations
San Antonio permits/land use
Houston code enforcement
Phase 6 — MCP + skill
MCP server wrapping data tools
agent skill markdown file
Phase 7 — Miro
Sync report
Create board sections
Push cards/map/action plan
Final locked version
Augur
A Texas expansion intelligence dashboard for businesses.

Augur uses one long-running agent to monitor Texas public data, including legislation, lobbying records, permits, zoning, land use, and code-enforcement signals. It compares those signals against a company profile, flags market and policy risks, ranks expansion opportunities, drafts business briefs, and creates an auditable report trail.

For the hackathon, the demo focuses on real estate development and retail expansion, starting with Austin and expanding to Dallas, Houston, and San Antonio where data is available.

The winning angle:

Augur turns Texas public data into business decisions.


Okay, I'm just gonna talk through everything again auger yep the project is now real etc etc Yeah, okay, sorry core product framing yep Yep Yep use auger yes exactly a u g u r um, yep Yep, exactly um texas legislation versus api versus scraping versus downloads. Okay, so um Option a reliable hackathon use open states api for structured build metadata status search then use texas legislator online for official documents open say as a state that just said search for bills build metadata sponsors then you say for official source documents Use it for bill tax bill analysis fiscal financial notch. Yes I think Option a looks pretty good Each for new things today TLO This is okay at best scrape or fall back Scrape, okay So I guess I don't know it seems a little bit scattered all three options to see them a little bit scattered So I think we use the open states api especially specifically if it has belt bill metadata And like I guess what the bill results in Does it right? So I guess that's that's the main thing right is like I don't know what the open states api gives us so I guess what I'd want to see is like what does each api give us access to and then from there we can make An informed decision ideally like I guess in my eyes The ideal situation is the open states api gives us access to like some high level information on the bill And then the agent is able to call The Texas legislator online thing Directly to get the latest like bill text the bill analysis the fiscal notes the report The bill witness lists right and it Seems that we're able to use Not really sure how exactly this works but hopefully we can just do it all programmatically is that a possibility The monitoring approach I again. I really don't know what you mean by monitoring approach We're doing this like monitoring approach is not an approach It's a feature of the app right So the RSS feed Is Cool For example build text published an appearance of a build made Introduction to a new version existing version I don't know this isn't really giving me that much information so I don't really know what the RSS thing does Bill is filed in house Bill is filed on 916 but then it doesn't actually give me the house Like bills that were filed does it Yeah I guess it does Oh no bills have been filed today I see I wish a bill was filed today so that I could see it No bills have been passed today either fuck so I can't really inspect it unfortunately. I Wish there was a way we could file house bills, for example, okay, this is very much readable and understandable Wow this stuff is out of date, but we'll see Okay, I don't know. I think there's a couple things in terms of the API that we gotta figure out But yeah, I guess I'm a little bit confused so you're gonna ask me more questions So you can understand my intent better and then I can hopefully answer your question So we can kind of come up with like the best possible solution for this Texas lobbying and influence data. Yep. This is worth including because it gives depth. Yep exactly User for who is lobbying do not build download current lobby Excel data normalize it And then the agent can say ok, that's fine So basically don't keep alive Is what you're saying? Okay city open data strongest datasets Austin first Yep use awesome construction permits zoning permits Dallas second Houston third and San Antonio fourth Yep all looks good product scope real estate development and retail expansion. Yep those are the two verticals that we should focus on and Because you know the data That publicly supports it is very much relevant to the two things The demo company is a Texas realtor group Retail operator planning to open new locations there Why this better than a pure real estate developer retail expansion easy for judges to expand? Yeah, it looks good company profile Sure, this looks good So the SLIMMED demo lets us cover both where should we add expand and what bill should we? Do yep that looks good Yep. The one agent one tool thing. This is perfect tool architecture, right? Tool architecture will obviously all be written in JSON format. So I think that's one thing you definitely have to kind of redo And then you know what? We'll we'll figure this out. We'll figure out the tool stuff with a little bit more detail on what exactly the API is they're gonna be able to call or the scrapers that they're gonna be able to call or the data that they're Going to be able to call or whatever else right? There's there's so many different things obviously there needs to be like a generic web search API to write So we'll just use XF for that excess seems pretty good Yeah, we'll use super base for everything and then we'll just yeah, the reports table looks great Great, honestly It's cleaner for a hackathon. It's very doable Yep pulls yeah a fetch list against Austin. Yep compared against company profile. I have nothing materially changed. Yep Exactly this looks good Scan this this this material large recognize. Yeah, nothing again As mode where should we expand next in Texas reads the company profile does that? Yep, that looks good the dashboard UI make it feel like the Fed 10 Visual Language left sidebar Are we talking about the left sidebar does not have the Texas map the middle has a Texas map Okay, you did say that Yeah, this looks cool The agent runner on the right panel Yeah, that should be fine For now Texas map Each city has hover behavior. Yep surface alerts. Yep This all looks good agent log MCP decision Do both Okay sure That looks fine. I'm cool with that We can do both And specifically work on shipping it right and Yeah, so demo plan where should it expand run daily monitor it found something new Obviously, we're gonna have to do the monitor mode Demo that will have to hardcode not hard code but basically like show like oh You know if it just says no new bills were passed today. It's like oh That can't be the entire demo right so we can either be like oh We went in the past and then at this date the thing found this or something like that great Evidence view show each recommendation has sources Yeah Exactly any people order? Yeah, this all looks good Definitely need to get this all done and up and mining Let's also really focus on Getting everything down perfectly right so I want you to go in and I mean the fate of core app like I'm sure you understand Austin data and data in general. I got want you to go deep deep deep deep very very fucking deep into research Right go find out the exact data sets and how to use them if we need to scrape if there's an API if there's some other like Method that we could do so like get all of that latest data or if we should just use the just download the latest data set as a Right now and then use that for the rest of the hackathon right so do we want live data or just like the current data? That's already there Like in terms of work Like I don't mind doing live data as long as it's not like a stupid amount of work right like if I'm gonna spend hours Debugging the live data, then it's not worth it, but if it's just like a clear like okay This is the API and then I have to debug it for a little while then I don't mind it at all right Then it's The restore award is definitely there Legislation again same thing. How do we get that data? Right? So let's figure all of that stuff out Like go really deep deep deep and tell me exactly how that data like fetching works both like scrapers apis some other things like anything basically For this specifically you can also kind of Ask me questions too right like you can ask me the exact behavior that I'm expecting Out of the app and like throughout everything You know, please ask me more questions the agent loop. Yep That's exactly and then yep markdown report generating for now tool calling will define the exact tool calling I want you to go online and actually research how tool calling works Right. How do these agents work? Right? How like that image that I sent you right obviously give you a little bit of context But I want you to go online and actually learn how these things work more cities We'll do that all like should be very doable phase 6 MCP and skill, right? Like obviously we've not talked about adding an MCP and a skill, right? But now we need to go online and go online and be like, okay It's our thought process correct. Like are we thinking about MCP is correctly are we thinking about skills correctly? Like how exactly is everything used right? So Again this needs to be extremely extremely fucking thorough in terms of okay. This is exactly how MCP works and this is exactly how we're gonna implement it into this project and then same thing with the skill Right the agent skill markdown fault same exact thing then phase seven we do Miro integration. That all looks good. But yeah That's my last little chunk Ask me questions please like feel free to just Like ask me as many questions as needed so that we're all on the same page basically, but yeah Hopefully I answered some of your questions. Let me know if you have more We can keep talking through this until we get an extremely thorough project plan 

Thought for 2m 32s
Yes. I understand the intent now.

Augur is not a legal chatbot, not a general lobbying platform, and not a swarm of fake sub-agents.

It is:

A Texas expansion intelligence dashboard for businesses, powered by public data and one long-running agent.

The Fed10 reference gives us the correct UX feel: surfaced threats, exposure cards, action cards, committee/lobbying context, and “impact matching, not keyword matching.” 


Now the work is to make Augur use Texas public data deeply enough to win the BrainForge / Vicinity track.

1. Locked product direction
Name
Augur

Use A-U-G-U-R, not “Auger.”

One-line pitch
Augur turns Texas public data into expansion decisions for real estate, development, and retail teams.

Real pitch
Augur is an agentic Texas business intelligence dashboard. It monitors Texas legislation, lobbying signals, city permits, zoning, land use, code violations, and public development data. Then it compares those signals against a company profile, flags risks and opportunities, drafts a business brief, and keeps an auditable action log.

Main demo question
“Where should LoneStar Retail Group expand next in Texas, and what policy or market risks should they watch?”

2. Main system decision
We should build one main agent, not a fake multi-agent army.

The agent
Call it:

Augur Analyst

It has:

brain: LLM

tools: APIs, database queries, web search, report writer, later Miro

memory: company profile, past reports, watched cities, prior user feedback

planner: decides what to inspect next

guardrails: citations, no legal advice, bounded queries, no external outreach

OpenAI’s function/tool calling is the right primitive here: tools are application functions exposed to the model, and the model can decide when it needs to call one to get data or perform an action. 
 The Agents SDK framing also matches what we are building: an agent app that plans, calls tools, owns state, and completes multi-step work. 

3. Data fetching plan
Your instinct is right: the data layer is the thing we need to nail.

The answer is not one source. It is:

OpenStates = structured legislative metadata
TLO FTP = official Texas bill documents
TLO RSS = change detection feed
TEC = lobbying / influence snapshot
Socrata / CKAN / ArcGIS = city open data
Exa = bounded secondary web research
Supabase = our normalized cache
4. Texas legislation data
What OpenStates gives us
OpenStates API v3 gives us a JSON API for state legislative information. It requires an API key and exposes endpoints for jurisdictions, people, bill search, bill detail, committees, and events. 

Useful OpenStates endpoints:

GET /bills
GET /bills/{jurisdiction}/{session}/{id}
GET /bills/ocd-bill/{uuid}
GET /committees
GET /events
GET /people
The OpenStates bill data model generally includes identifiers, titles, subjects, actions, sponsorships, related bills, versions, documents, votes, sources, createdAt, and updatedAt. 

What OpenStates probably does not fully solve
OpenStates gives us metadata and links. It may give us abstracts/documents, but it will not reliably give the full business meaning of the bill.

So the agent still needs to do:

OpenStates bill metadata
→ fetch official TLO bill text / analysis / fiscal note
→ extract obligations
→ compare to company profile
→ score risk/opportunity
What Texas Legislature Online gives us
Texas Legislature Online provides official file downloads through anonymous FTP for:

bill text

bill analyses

fiscal notes

reports

bill witness lists

It also documents the FTP folder structure and naming conventions for bill text, bill analyses, fiscal notes, witness lists, bill history XML, and reports. 

Important: we should not scrape TLO aggressively. TLO explicitly says the FTP site is meant as the alternative to mining the public web pages, and says legislative data services should stop data mining the capitol site so the public does not compete for access. 

What TLO RSS does
The RSS feeds are not “the data source.” They are the change detector.

TLO has RSS feeds for:

upcoming House/Senate committee meetings

calendars

today’s bill text

today’s fiscal notes

today’s bill analyses

today’s bills filed in House/Senate

today’s passed bills

RSS is for monitoring updates; it gives titles/descriptions/URLs when new content appears. 

So the architecture is:

Daily monitor
→ check TLO RSS
→ if RSS says bill text/fiscal note/analysis changed
→ fetch official document from TLO FTP
→ run agent analysis
Recommended legislation pipeline
Use this:

1. OpenStates API
   - discover/search bills
   - get metadata, sponsors, actions, status, updatedAt

2. TLO RSS
   - detect what changed today
   - trigger monitor mode

3. TLO FTP
   - fetch official bill text, fiscal notes, bill analyses, witness lists

4. TLO web page scraping
   - only if absolutely needed for one-off fields
   - not primary ingestion
This is the cleanest version.

Deployment warning
TLO uses FTP, not just HTTP. Vercel/serverless environments may be annoying for FTP. Build a separate ingestion worker/script that runs locally or in a backend worker, downloads official docs, and stores normalized text in Supabase.

For the hackathon, the safe move:

Run ingestion script manually or via cron
→ cache official docs in Supabase
→ app queries Supabase
5. Texas lobbying / influence data
This should be included, but as a snapshot layer, not live streaming.

Texas Ethics Commission has public search for lobby registrations/activity reports, CSV database downloads, lobby registration lists, lobby activity lists, lobby expenditures, and compensation codes. 

The registration lists are available in PDF/Excel formats, including registered lobbyists with clients and subject-matter lists. 

MVP usage
Download and normalize:

2025 Registered Lobbyists with Clients
2025 Subject Matter List
2025 Lobby Activities CSV, if usable
Then the agent can answer:

Who else is active around this subject?
Which industries show lobbying activity?
Which clients/lobbyists appear near real estate, retail, zoning, development, permitting?
Guardrail
Do not say:

“This person is targeting this senator.”

Say:

“Public lobby records suggest these entities are active around this subject area.”

That keeps it neutral and defensible.

6. City open data plan
Austin: primary city
Austin is the first city because the hackathon is in Austin and the data is useful.

Austin construction permits
Austin’s issued construction permits dataset covers building, electrical, mechanical, plumbing, and driveway/sidewalk permits, with details such as issue date, location, council district, expiration date, description, square footage, valuation, and units. 

Dataset ID:

3syk-w9eu
Use for:

commercial development velocity
permit volume by neighborhood
construction heat
valuation trends
retail expansion signal
Austin zoning cases
Austin’s zoning cases dataset contains zoning cases submitted for city review, including case status, case number, proposed use, applicant, owner, and location. 

Dataset ID:

edir-dcnf
Use for:

zoning friction
rezoning activity
nearby land-use changes
development risk
Austin zoning by address
Austin also has a zoning-by-address dataset intended to answer questions like which addresses have a particular zoning designation. 

Dataset ID:

nbzi-qabm
Use for:

site feasibility
commercial zoning checks
address-level lookup if we add it later
Dallas: second city
Dallas OpenData has building permits, code violations, and certificates of occupancy datasets. Dallas’s building permits dataset is Socrata-backed, with API documentation available through the Socrata Foundry. 

Core IDs:

building permits: e7gq-4sah
code violations: xrzj-c8ez or x9pz-kdq9
certificates of occupancy: 9qet-qt9e
Use for:

opening friction
certificate-of-occupancy risk
commercial activity
neighborhood operating risk
Dallas CO is especially useful because retail expansion depends on whether you can legally occupy/use a site. Dallas’s own permitting page notes that if code violations exist, a new CO may require inspections and multi-tenant approval. 

Houston: third city
Houston’s open data portal is CKAN-based. It lists building code enforcement violations and residential building permit datasets, and the Houston pages expose resource APIs / CKAN API access. 

Use for:

code enforcement density
construction trends
operational risk
neighborhood friction
Note: Houston pages were partially blocked in this browsing environment, so implementation should directly test the CKAN API/resource endpoints early.

San Antonio: fourth city
San Antonio’s Open Data SA has building permits and land-use datasets. The building permit dataset includes permits issued from 2020–2024 and provides CSV/JSON/XML/Data API options. 

San Antonio also has future land-use and GIS datasets, and its GIS catalog lists zoning, future land use, master development plans, mandatory LID areas, preliminary plats, recorded plats, inclusive growth areas, TIRZ, and other expansion-relevant datasets. 

Core IDs/resources:

building permits: c21106f9-3ef5-4f3a-8604-f992b4db7512
permits issued 2020-2024: c22b1ef2-dcf8-4d77-be1a-ee3638092aab
future land use: 55edb3a137444b2cb48035e57cf18087
Use for:

land-use fit
permit activity
growth-area matching
retail/development feasibility
7. Socrata / CKAN implementation
Socrata cities
Austin and Dallas are Socrata/Tyler open-data portals.

Socrata datasets have unique IDs and can be queried via API endpoints. Socrata’s current SODA3 docs say query endpoints follow the pattern /api/v3/views/IDENTIFIER/query.json, and export endpoints follow /api/v3/views/IDENTIFIER/export.csv. 

Socrata uses SoQL for filtering/querying, and current docs say requests must be authenticated or marked with an application token. 

Implementation:

Preferred:
POST /api/v3/views/{datasetId}/query.json
with X-App-Token

Fallback:
export CSV
or legacy /resource/{datasetId}.json if still enabled
CKAN cities
Houston and San Antonio are CKAN-style portals.

CKAN’s Action API exposes datasets, resources, metadata, and rows through API endpoints like package_list, package_show, and datastore/resource operations. CKAN docs say the Action API exposes site functionality to external code and returns JSON representations of datasets/resources. 

Implementation:

GET /api/3/action/package_show?id=building-permits
GET /api/3/action/datastore_search?resource_id=...
Backup source: TryOpenData
TryOpenData may be useful as a backup/unified data layer. It describes itself as public data unified into one queryable API, with search and dataset query endpoints. Its quickstart shows search, dataset queries, filters, pagination, and JavaScript/Python usage. 

Use it if city APIs get annoying.

8. Live data vs snapshot
Use this split:

Live
Use live/API for:

OpenStates bills
TLO RSS
Austin permits
Austin zoning cases
Dallas permits
Dallas code violations
San Antonio permits
Snapshot/cache
Use cached snapshot for:

TLO official documents after download
Texas Ethics Commission lobby Excel/CSV
Houston resources if CKAN blocks or slows us
historical demo bills
Demo mode
Monitor mode cannot depend on “something new happened today.”

So build:

Monitor Mode:
- default: check last 24 hours
- demo: replay date range / seed event
This is not fake-hardcoding. It is historical replay.

Demo button:

Run Daily Monitor: May 9 Replay
It can say:

Scanned 42 updated bills and 318 city records from the replay window.
Found 2 material signals.
9. Tool architecture in JSON
You are right that tools should be JSON-schema defined.

Here is the shape.

[
  {
    "type": "function",
    "name": "search_texas_bills",
    "description": "Search Texas bills using OpenStates metadata and optional keyword filters.",
    "parameters": {
      "type": "object",
      "properties": {
        "query": { "type": "string" },
        "session": { "type": "string", "description": "Texas legislative session identifier, e.g. 89R after validation." },
        "updated_since": { "type": "string", "format": "date" },
        "subjects": {
          "type": "array",
          "items": { "type": "string" }
        },
        "limit": { "type": "integer", "default": 25 }
      },
      "required": ["query"]
    }
  },
  {
    "type": "function",
    "name": "get_texas_bill_documents",
    "description": "Fetch official Texas Legislature Online documents for a bill, including text, fiscal notes, analyses, and witness lists when available.",
    "parameters": {
      "type": "object",
      "properties": {
        "bill_id": { "type": "string", "description": "Example: HB 1482" },
        "session": { "type": "string", "description": "Example: 89R" },
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
  },
  {
    "type": "function",
    "name": "query_city_dataset",
    "description": "Query a bounded city open-data dataset for permits, zoning, code violations, or occupancy records.",
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
        "area": { "type": "string" },
        "limit": { "type": "integer", "default": 100 }
      },
      "required": ["city", "dataset", "limit"]
    }
  },
  {
    "type": "function",
    "name": "search_lobby_activity",
    "description": "Search normalized Texas Ethics Commission lobby registration and activity data for subject/client/lobbyist signals.",
    "parameters": {
      "type": "object",
      "properties": {
        "topic": { "type": "string" },
        "industry": { "type": "string" },
        "year": { "type": "integer" },
        "limit": { "type": "integer", "default": 25 }
      },
      "required": ["topic", "year"]
    }
  },
  {
    "type": "function",
    "name": "save_markdown_report",
    "description": "Save a source-backed business intelligence report in Supabase for rendering in the Augur dashboard.",
    "parameters": {
      "type": "object",
      "properties": {
        "company_id": { "type": "string" },
        "title": { "type": "string" },
        "report_type": {
          "type": "string",
          "enum": ["daily_monitor", "expansion_brief", "policy_alert", "city_comparison"]
        },
        "markdown": { "type": "string" },
        "summary_json": { "type": "object" }
      },
      "required": ["company_id", "title", "report_type", "markdown"]
    }
  }
]
Use function calling when the model needs to reach external data/actions, and use structured outputs when we need the model’s final analysis to fit a schema for the UI. OpenAI’s docs specifically distinguish function calling for connecting models to tools/data from structured response formats for shaping final output. 

10. Agent loop
The agent’s actual loop:

1. Read company profile
2. Decide whether this is ask mode or monitor mode
3. Search relevant datasets
4. Inspect results
5. Decide if more evidence is needed
6. Query deeper
7. Score opportunity/risk
8. Generate report
9. Save report
10. Update dashboard state
11. Later: sync to Miro
This is agentic because the agent is not just running a fixed workflow. It can decide:

Austin permits look promising → check zoning cases
Bill mentions permitting → fetch TLO bill analysis
Lobby data shows activity → include stakeholder context
Data is insufficient → lower confidence and say why
11. Supabase schema
Keep this clean.

companies (
  id uuid primary key,
  name text,
  description text,
  vertical text,
  profile_json jsonb,
  created_at timestamptz
);

data_sources (
  id uuid primary key,
  name text,
  source_type text,
  city text,
  dataset_id text,
  access_method text,
  refresh_frequency text,
  citation_url text
);

raw_records (
  id uuid primary key,
  source_id uuid,
  external_id text,
  payload jsonb,
  fetched_at timestamptz
);

bills (
  id uuid primary key,
  source text,
  bill_id text,
  session text,
  title text,
  status text,
  last_action text,
  updated_at timestamptz,
  raw_json jsonb
);

reports (
  id uuid primary key,
  company_id uuid,
  title text,
  report_type text,
  markdown_content text,
  summary_json jsonb,
  created_at timestamptz,
  updated_at timestamptz
);

agent_runs (
  id uuid primary key,
  company_id uuid,
  mode text,
  status text,
  user_prompt text,
  started_at timestamptz,
  completed_at timestamptz
);

agent_tool_calls (
  id uuid primary key,
  run_id uuid,
  tool_name text,
  input_json jsonb,
  output_json jsonb,
  status text,
  created_at timestamptz
);
No need for Supabase Storage yet. Store markdown as plain text in reports.markdown_content.

12. MCP server
We should ship an MCP server because the track explicitly rewards it.

MCP is an open protocol that lets LLM apps connect to external data sources and tools. The spec defines hosts, clients, and servers, with servers exposing resources, prompts, and tools. 
 MCP tools are model-invokable functions with names, descriptions, and input schemas, which matches our bounded Texas data tools. 

Our MCP server should expose
augur.search_texas_bills
augur.get_bill_documents
augur.query_city_dataset
augur.compare_expansion_signals
augur.search_lobby_activity
augur.generate_business_brief
This is not the main app. It is the agent-access layer over our data.

MCP implementation shape
/apps/web
/packages/augur-core
/packages/augur-mcp
augur-core contains reusable data functions.

augur-mcp wraps those functions as MCP tools.

This prevents duplicate logic.

13. Agent skill
We should also ship a proper agent skill.

Codex skills are directories with a SKILL.md file plus optional scripts, references, and assets; the SKILL.md must include name and description. Codex uses the skill description to decide when to load the full instructions. 
 Skills are meant for reusable workflows, review rules, scripts, and repeatable processes rather than repasting long prompts. 

Create:

.agents/skills/augur-texas-business-intelligence/
  SKILL.md
  references/
    data-sources.md
    safety-policy.md
    scoring-model.md
  scripts/
    run-demo-query.ts
Example SKILL.md:

---
name: augur-texas-business-intelligence
description: Use this skill when analyzing Texas public data for business expansion, permitting, zoning, legislative, lobbying, or market-risk questions. Do not use for legal advice or partisan persuasion.
---

# Augur Texas Business Intelligence Skill

Use this workflow to help agents safely query Texas public datasets through the Augur MCP server.

## Workflow

1. Identify the company profile and business goal.
2. Use bounded queries against Augur MCP tools.
3. Prefer official public datasets and cite every factual claim.
4. Compare signals across cities or neighborhoods.
5. Separate facts, assumptions, and recommendations.
6. Never provide legal advice.
7. Never recommend deceptive outreach or political manipulation.
8. Produce a business brief with:
   - recommendation
   - supporting evidence
   - risks
   - confidence
   - source list
   - next actions

## Required tools

- augur.search_texas_bills
- augur.get_bill_documents
- augur.query_city_dataset
- augur.search_lobby_activity
- augur.compare_expansion_signals
- augur.generate_business_brief

## Output format

Return:
- executive summary
- ranked expansion options
- policy risks
- public-data evidence
- uncertainty
- next actions
This satisfies the skill requirement and makes the project look mature.

14. Miro integration
Save this for the end, as you said.

Miro MCP lets compatible AI tools connect to Miro boards, query data, trigger actions, and access real-time board context. 
 The Miro marketplace specifically says the Codex MCP integration lets Codex create diagrams, create code from board context, and interact with the canvas. 

Two possible paths
Path A — easiest demo path
Use the generated markdown report and ask Codex + Miro MCP to create/update the board.

Good for sponsor alignment.

Path B — product path
Use Miro REST API directly from the app.

Good if we want one-click “Sync to Miro.”

For hackathon, build Path A first. If there is time, add Path B.

15. Demo structure
Demo company
LoneStar Retail Group

Business:
Small-format grocery/convenience retail operator

Goal:
Open 3 Texas locations in 12 months

Target cities:
Austin, Dallas, Houston, San Antonio

Priorities:
- high commercial development velocity
- compatible zoning / land use
- manageable permitting friction
- low code violation risk
- policy risk awareness

Sensitive topics:
- retail permitting timelines
- certificates of occupancy
- parking/signage restrictions
- zoning changes
- alcohol/tobacco retail restrictions
Demo 1 — Ask mode
User prompt:

“We want to open three new stores in Texas this year. Compare Austin, Dallas, Houston, and San Antonio. Recommend where to start and flag policy risks.”

Expected agent log:

✓ Loaded LoneStar Retail Group profile
✓ Queried Austin construction permits
✓ Queried Austin zoning cases
✓ Queried Dallas building permits
✓ Queried Dallas code violations
✓ Queried San Antonio building permits
✓ Searched Texas bills for retail, permitting, zoning, and development
✓ Checked lobbying subject signals
✓ Generated expansion brief
Expected result:

Top expansion target: Austin East Riverside / Highland watch area

Why:
- strong commercial permit activity
- visible development momentum
- manageable zoning signal
- relevant but not blocking policy risk

Watch:
- Texas bill affecting permitting timelines
- active Austin zoning cases near target area
- Dallas CO/code friction in selected ZIPs
Demo 2 — Monitor mode
Button:

Run Daily Monitor

For demo reliability:

Mode: historical replay / seeded signal window
Output:

Daily Texas Signal Brief

Scanned:
- 42 updated Texas bills
- 184 Austin permits
- 51 Dallas code violations
- 37 San Antonio permits

Material signals:
1. Austin commercial permit spike near target corridor
2. TX bill could affect local retail permitting process

Action:
Create expansion brief and monitor the bill’s next committee movement.
Demo 3 — Evidence view
Every major claim expands into evidence:

Claim:
Austin has stronger commercial permit momentum.

Evidence:
- Austin permit records
- issue dates
- valuation / description
- council district / location
- trend window
Demo 4 — MCP / skill proof
Show:

Custom Augur MCP server running
Agent skill folder included
Tool call from MCP returns Texas data summary
Demo 5 — Miro, if finished
Click/say:

Sync this brief to Miro.

Miro board gets:

Texas map
city comparison
policy alert card
evidence cards
next actions
16. Exact build order
Phase 1 — Data foundation
Build these first:

Supabase schema
company profile
Austin permits connector
Austin zoning cases connector
OpenStates bill connector
report saving
agent run log
Phase 2 — Ask mode
User prompt
→ agent calls tools
→ report saved
→ UI renders markdown
Phase 3 — Dashboard
Texas map
city cards
surfaced alerts
agent activity log
report viewer
Phase 4 — Monitor mode
daily cron shell
historical replay mode
new signal detection
daily report
Phase 5 — More data
Dallas permits/code violations
San Antonio permits/land use
TEC lobby snapshot
Houston if time
Phase 6 — MCP + skill
MCP server around core data tools
SKILL.md + references
README demo instructions
Phase 7 — Miro
report → Miro board
map/brief/action plan cards
17. My recommendation on source priority
Build in this order:

1. Austin permits
2. Austin zoning cases
3. OpenStates bills
4. TLO official documents
5. Dallas permits / code violations
6. TEC lobby snapshot
7. San Antonio permits
8. Miro
9. Houston
Houston is useful, but less critical for the demo.

Austin + Texas bills + TEC + one comparison city is enough if polished.

18. Key open questions
Answer these next and we can turn this into a full project brief/build spec.

Demo company: Are we locking LoneStar Retail Group, or do you want something more like Austin-based retail developer / self-storage operator / commercial real estate firm?

Primary demo result: Should the final recommendation be city-level, like “Austin first,” or neighborhood-level, like “East Riverside / Highland first”?

Data priority: For v1, are these the must-have datasets?

Austin permits

Austin zoning cases

OpenStates/TLO bills

Dallas permits/code violations

TEC lobby snapshot

Policy angle: Should the policy alert be framed as:

“business risk to monitor”

“draft internal policy brief”

“who to contact / what to say”

I recommend keeping “who to contact” softer for this track.

Monitor mode: Are you okay with a historical replay mode for demo reliability?

Miro: Do we want Miro to be a sponsor flex only, or a real product feature in the demo?

Deployment: Are we assuming Vercel + Supabase? If yes, TLO FTP ingestion should be a separate script/worker, not a serverless API route.

OpenStates: Can you get an API key before the hackathon? That should happen early because OpenStates v3 requires a key.


Okay, everything looks good. One important thing that I will note is the demo, right? You specifically said demo one is this ask mode. That's very straightforward. Demo two is we're basically setting a mode called historical replay and seated signal window, right? We have to be really careful to also build in functionality of the real thing while also having support for the demo mode. We don't want to just compromise the real thing and not have support for the real demo mode, so we want both.
To answer your key open questions:
- demo companies: we can lock in Lone Star Retail Group. They're basically just a retail group that owns real estate as well as leases their real estate out to companies who are doing retail stuff or something like that. I don't know, some weird company that does a little bit of a hybrid of both.
- final recommended city level or Austin. Why are we doing Austin first? Or neighborhood level like East Riverside or Highland first? It should be, technically, Austin first, but it should support everything, like all neighborhoods, but it should also have neighborhood-level depth. I should be able to go into the neighborhood and be like, "Oh, this neighborhood has this" or something. I guess I don't know if that is too complicated.
- answer my questions first data priority: yes, all must-haves. We're not, bro. Can we not do the whole fucking "we're going to build this one version at a time"? No, let's just build the entire fucking thing properly. Okay, let's not fucking try to get caught up with all these different versioning of "oh, this version doesn't have this live thing, this version lets build the entire fucking thing". Okay.
- policy angle: should the policy alert be framed as business risk to monitor? Draft internal policy brief. Who to connect, what to say. I recommend keeping who to contact softer for this track. The policy should be monitoring the business risk. It should draft the internal policy brief, and it should tell us exactly who to contact and what to say to them and why. All of that should be done, and then, on top of that, it should also tell us, like, "Okay, this person is like, you know." It should really come with a lot of fucking research of, like, "Okay, let's say person A is pretty heavily invested into zoning laws for whatever reason." It should be like, "Okay, this person is invested into zoning laws. That's why he's the correct person to go after, right?" This person has a history of accepting donations or has a history of accepting this or something like that, right? We really want to go deep into that research mode, monitor mode. Yes, I'm okay with the historical replay mode for demo reliability, but we should still build the real functionality as well. I don't half-ass it, right?
- Do we want mirror to be a sponsor flex only or a real product feature? It's a sponsor flex only, so that's the last thing that we're going to do, basically. Don't even worry about Miro right now.
- Are we assuming versell and super base? Yeah, we can.
- The tlo FTP ingestion should be a separate script worker. I agree it can obviously not be a serverless API route. What are our options there? Right, we have versell railway and super base, so we can split our entire stack across those three services to get the absolute best out of this.
- Can you get an API key before the hackathon? Yes, bro. Yes, we should get the hat. I'm going to ask you to tell me all the API keys and everything to download in literally a second, but yes, we should obviously get the fucking API key before the hackathon. We're not doing a fucking bum-ass fake demo, right? We're doing the full fucking thing, like this entire thing that we've been talking about. We're building the entire fucking thing. Like, we're not doing some bullshit demo, bro.

Thought for 50s
Yes. We are building the real thing plus a demo replay mode that uses the same pipeline. No separate fake path.

Locked product
Augur
A Texas expansion intelligence dashboard for real estate, development, and retail teams.

Augur uses one long-running agent to monitor Texas public data, investigate relevant signals, and produce business-ready briefs.

Core user question:

“Where should LoneStar Retail Group expand in Texas, and what policy or market risks should we watch before committing capital?”

The product should still visually borrow from the Fed10-style “surfaced threats / exposure / action / intel” dashboard, but Texas-only and public-data-first. 


Critical demo architecture decision
Real mode and demo mode must share the same code path
Do not build one real thing and one hardcoded demo.

Build this abstraction:

type RunMode = "live" | "replay";

type SignalWindow = {
  mode: RunMode;
  from: string;
  to: string;
  seedDataset?: string;
};
Then both flows do the same thing:

load company profile
→ fetch signals for time window
→ normalize records
→ agent decides what matters
→ agent calls deeper tools
→ score city/policy risk
→ save markdown report
→ update dashboard
→ optionally sync Miro
Only the input window changes.

Live mode
mode = live
from = now - 24h
to = now
Uses latest data.

Replay mode
mode = replay
from = known historical date
to = known historical date + N days
Uses historical records and/or seeded records, but the agent still analyzes them normally.

This gives you a reliable demo without compromising the real product.

Data source plan, properly clarified
1. Texas bills / legislation
Use OpenStates + Texas Legislature Online, not one or the other.

OpenStates role
OpenStates is the structured metadata layer.

Use it for:

bill search
bill ID
title
session
jurisdiction
sponsors
actions
versions
documents
sources
updatedAt
status-like metadata
OpenStates API v3 requires an API key and exposes /bills, /people, /committees, /events, and jurisdiction endpoints. It uses https://v3.openstates.org/ as the root URL, and keys can be passed via X-API-KEY or query parameter. 

TLO role
Texas Legislature Online is the official document layer.

Use it for:

official bill text
bill analysis
fiscal notes
committee reports
witness lists
bill history XML
Texas Legislature Online explicitly provides anonymous FTP downloads for bill text, bill analyses, fiscal notes, reports, and witness lists. It also documents the FTP folder structure and naming conventions. 

RSS role
TLO RSS is the change detector, not the full data source.

Use it for:

today’s filed bills
today’s bill text updates
today’s fiscal notes
today’s bill analyses
committee meeting updates
passed bills
TLO says RSS feeds summarize and index web publications with title, description, and URL, and can be monitored by a newsreader for new content. 

Final legislative ingestion flow
OpenStates:
  discover/search bills and metadata

TLO RSS:
  detect what changed today

TLO FTP:
  fetch official source docs for bills that matter

Supabase:
  cache normalized bill records + parsed docs

Agent:
  decide relevance and produce policy brief
This is clean.

2. Texas lobbying / influence data
Use Texas Ethics Commission as a snapshot layer.

TEC exposes:

custom lobby database search
lobby activity report CSV
lobby registration lists
lobby activity lists
lobby expenditures
client compensation codes
The lobby search page lists these exact data products, and the current-year lists are updated daily. 

Use it for:

which industries are active around a subject
which clients/lobbyists show up in public records
which subject areas have lobbying activity
which coalitions may already exist
Guardrail:

Do not say:

“This official takes money, target them.”

Say:

“Public records show these industries/entities are active around this subject. The relevant contact path is based on official role, committee assignment, or public responsibility.”

You can still show deep context. Just keep it evidence-based and non-sketchy.

3. City open data
Austin: main city
Use these first.

Austin issued construction permits
Dataset ID:

3syk-w9eu
Austin’s issued construction permits dataset includes building, electrical, mechanical, plumbing, driveway/sidewalk permits, issue date, location, council district, expiration date, description of work, square footage, valuation, and units. 

Use for:

commercial development velocity
permit heat by neighborhood
construction momentum
growth signals
retail expansion opportunity
Austin zoning cases
Dataset ID:

edir-dcnf
Austin’s zoning cases dataset contains zoning cases submitted for city review and includes case status, case number, proposed use, applicant, owner, and location. 

Use for:

zoning friction
rezoning activity
development uncertainty
local land-use change
Austin zoning by address
Dataset ID:

nbzi-qabm
Use later for address/site lookup. For the hackathon, neighborhood-level is enough.

Dallas: comparison city
Use:

building permits: e7gq-4sah
certificates of occupancy: 9qet-qt9e
code violations: x9pz-kdq9 / xrzj-c8ez
Dallas building permits are available through Dallas OpenData and the Socrata API Foundry. 

Dallas CO data matters because retail expansion needs occupancy approval; Dallas notes that existing code violations can require a new CO, inspections, and code compliance approval. 

Use for:

retail opening friction
certificate-of-occupancy risk
code violation density
development velocity
San Antonio: comparison city
Use:

building permits
future land use / GIS layers
San Antonio’s building permit dataset covers commercial and residential development, including new construction, commercial construction, remodels, additions, and related work. 

The permit resource exposes downloadable formats and a Data API. 

Use for:

permit velocity
commercial construction activity
land-use fit
retail feasibility
Houston: optional but useful
Houston is CKAN-based. Use if implementation is smooth.

Use for:

code enforcement
permit trends
operational friction
neighborhood risk
If Houston is annoying, do not let it block the demo. Austin + Dallas + San Antonio + legislation + lobbying is already strong.

Socrata / CKAN implementation
Austin and Dallas
Austin and Dallas are Socrata-style portals.

Socrata datasets use unique dataset identifiers and query endpoints like:

/api/v3/views/{IDENTIFIER}/query.json
Socrata’s docs say each dataset has an identifier and can be queried through the /api/v3/views/IDENTIFIER/query.json endpoint. 

Use SoQL filters for bounded queries. Socrata’s docs describe SoQL as the query language for rich filtering/querying. 

Example query shape:

POST https://data.austintexas.gov/api/v3/views/3syk-w9eu/query.json

{
  "query": {
    "where": "issued_date between '2025-01-01' and '2025-12-31'",
    "limit": 500
  }
}
Fallback if v3 causes friction:

https://data.austintexas.gov/resource/3syk-w9eu.json?$limit=500
Use the simplest endpoint that works.

San Antonio / Houston
Use CKAN API where possible.

CKAN exposes JSON APIs like:

/api/3/action/package_show?id=...
/api/3/action/datastore_search?resource_id=...
CKAN’s docs describe the Action API as JSON endpoints for accessing datasets/resources programmatically. 

If San Antonio’s CKAN resource API is clean, use it. If not, download JSON/CSV once and cache it.

Live vs snapshot policy
Build the real system. But cache aggressively.

Live / API-backed
Use live API calls for:

OpenStates bills
Austin permits
Austin zoning cases
Dallas permits
Dallas code violations
San Antonio permits
Snapshot-backed
Use snapshots for:

TLO official FTP docs after ingest
Texas Ethics Commission lobby lists
historical replay windows
large city datasets if API is slow
This is not half-assing. This is how real data products work: live fetch where cheap, cached source-of-truth where large or brittle.

Infrastructure recommendation
You have Vercel, Railway, and Supabase. Use all three cleanly.

Vercel
Use for:

Next.js frontend
dashboard UI
API routes for lightweight reads
auth if needed
report rendering
Do not use Vercel for heavy ingestion.

Vercel Cron exists, but Hobby cron is limited to once per day and may invoke within the specified hour, so it is not ideal for repeated or heavier ingestion. 

Supabase
Use for:

Postgres
pgvector if needed
company profiles
normalized records
reports
agent runs
tool calls
storage if needed later
Supabase supports scheduled Edge Functions through pg_cron + pg_net, but those are best for invoking lightweight functions or remote workers. 

Use Supabase as the database and scheduler trigger if helpful, not as the heavy worker.

Railway
Use for:

long-running ingestion worker
TLO FTP downloader
OpenStates sync
city data sync
agent monitor jobs
MCP server
Railway cron jobs can start a service on a crontab schedule; the service is expected to run the task and terminate. 

This is perfect for:

daily 8 AM monitor
hourly city-data refresh if needed
TLO FTP sync
TEC snapshot importer
Final infra split
Vercel:
  web app

Supabase:
  database + reports + agent logs + cached data

Railway:
  ingestion worker + daily monitor + MCP server
TLO FTP implementation
Use a Railway worker.

Why:

FTP may be annoying in serverless
documents can be large
we need retries
we need caching
we need background jobs
Use Node package:

basic-ftp
basic-ftp is a Node FTP client with Promise-based APIs, FTPS support, and directory/file operations. 

Worker job:

1. Read bill IDs that matter from Supabase
2. Derive TLO FTP path
3. List remote directory
4. Download bill text / analysis / fiscal notes / witness lists
5. Extract text
6. Store raw doc + parsed text in Supabase
7. Mark document version/date
Agent design
One agent
Augur Analyst
No “zoning agent,” “Miro agent,” etc.

Brain
OpenAI model.

Use tool calling for data access. OpenAI function calling lets models connect to external systems using tools defined with JSON schema. 

Use structured outputs for final report metadata. Structured outputs ensure the model follows a supplied JSON schema. 

Tools
The agent gets tools like:

search_texas_bills
get_texas_bill_documents
query_city_dataset
search_lobby_activity
web_research
save_markdown_report
Memory
Supabase-backed:

company profile
watched cities
watched neighborhoods
past reports
past alerts
prior user feedback
known false positives
risk preferences
Planner
The planner is not a separate agent. It is the main agent’s loop:

What do I know?
What do I need?
Which tool should I call next?
Is evidence sufficient?
Should I go deeper?
Should I generate a report?
Guardrails
System prompt + validation:

cite every factual claim
no legal advice
no fake lobbying
no external sending
no unsupported influence claims
distinguish facts vs assumptions
flag uncertainty
bounded queries only
Tool schemas, updated
Use JSON schema like this.

{
  "type": "function",
  "name": "search_texas_bills",
  "description": "Search Texas bills using OpenStates metadata and cached Texas Legislature Online records.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "session": { "type": "string", "description": "Example: 89R" },
      "updated_since": { "type": "string", "format": "date" },
      "limit": { "type": "integer", "minimum": 1, "maximum": 50 }
    },
    "required": ["query"]
  }
}
{
  "type": "function",
  "name": "get_texas_bill_documents",
  "description": "Fetch official Texas bill documents from cached TLO FTP data or trigger ingestion if missing.",
  "parameters": {
    "type": "object",
    "properties": {
      "bill_id": { "type": "string", "description": "Example: HB 1482" },
      "session": { "type": "string", "description": "Example: 89R" },
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
{
  "type": "function",
  "name": "query_city_dataset",
  "description": "Query bounded Texas city open-data records for expansion analysis.",
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
      "area": { "type": "string" },
      "limit": { "type": "integer", "minimum": 1, "maximum": 1000 }
    },
    "required": ["city", "dataset", "limit"]
  }
}
{
  "type": "function",
  "name": "search_lobby_activity",
  "description": "Search normalized Texas Ethics Commission lobby data for public subject/client/lobbyist signals.",
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
{
  "type": "function",
  "name": "save_markdown_report",
  "description": "Save a source-backed business intelligence report to Supabase.",
  "parameters": {
    "type": "object",
    "properties": {
      "company_id": { "type": "string" },
      "title": { "type": "string" },
      "report_type": {
        "type": "string",
        "enum": ["daily_monitor", "expansion_brief", "policy_alert", "city_comparison"]
      },
      "markdown": { "type": "string" },
      "summary_json": { "type": "object" }
    },
    "required": ["company_id", "title", "report_type", "markdown"]
  }
}
MCP plan
MCP is worth doing.

MCP lets servers expose tools that language models can invoke, such as querying databases, calling APIs, or performing computations. Each tool has a name and schema metadata. 

Our MCP server
Run it on Railway.

Expose:

augur.search_texas_bills
augur.get_texas_bill_documents
augur.query_city_dataset
augur.search_lobby_activity
augur.compare_expansion_signals
augur.generate_business_brief
Internally, these call the same augur-core functions used by the app.

Repo structure:

apps/web
packages/augur-core
packages/augur-mcp
workers/ingest
skills/augur-texas-business-intelligence
Important: MCP is not the product. It is the agent-access layer that satisfies the track and makes the system reusable.

Agent skill plan
Also ship the skill.

Codex skills package instructions, resources, and optional scripts so Codex can follow a workflow reliably; Codex loads the skill description first and the full SKILL.md only when relevant. 

Create:

skills/augur-texas-business-intelligence/
  SKILL.md
  references/
    data-sources.md
    safety-policy.md
    scoring-model.md
  scripts/
    run-demo-query.ts
The skill tells any agent:

Use Augur MCP tools
Run bounded Texas public-data queries
Cite every factual claim
Separate facts from assumptions
Do not provide legal advice
Do not recommend deceptive outreach
Produce business briefs
This is low effort and makes the submission much stronger.

Policy / influence behavior
You want deeper research. Good. But frame it correctly.

The policy alert should include:

1. business risk
2. affected company operations
3. source-backed bill summary
4. official procedural status
5. public lobbying activity around the subject
6. relevant official/committee/staff contact path
7. recommended message
8. why that message fits the official’s public role or committee responsibility
9. internal policy brief
10. action checklist
It should not say:

“Target this person because donations show they can be influenced.”
It can say:

“Public campaign/lobbying records show this sector is active around the issue. The recommended contact is based on committee jurisdiction and public procedural responsibility.”
That keeps the product serious and safe.

Dashboard
Main layout
Left nav:
  Overview
  Texas Map
  City Signals
  Bills
  Lobby Signals
  Reports
  Agent Runs

Center:
  interactive Texas map
  city risk/opportunity cards
  surfaced alerts
  selected report

Right:
  Augur Analyst run log
  tool calls
  evidence
  next actions
Map behavior
Texas map with:

Austin
Dallas
Houston
San Antonio
Hover/click city:

Austin
Opportunity: 84
Risk: 41
Commercial permits: +18%
Zoning cases: 12 active
Policy alerts: 2
Top neighborhoods: East Riverside, Highland, South Congress
Neighborhood depth
Yes, support neighborhood-level depth.

Keep it practical:

city → area/neighborhood labels → permit/zoning/code signals
Do not do parcel-level in the main demo unless it falls out naturally.

For Austin:

East Riverside
Highland
South Congress
North Burnet
Mueller
For each:

permit count
permit valuation
active zoning cases
recent commercial activity
policy watch items
recommendation
Demo, final version
Demo company
LoneStar Retail Group

Hybrid retail + real estate operator.

Owns and leases retail properties
Also operates small-format grocery/convenience stores
Wants to open 3 Texas locations in 12 months
Focus cities: Austin, Dallas, Houston, San Antonio
Cares about permits, zoning, code risk, occupancy, and policy changes
Demo 1 — Ask mode
Prompt:

“We want to open three new stores in Texas this year. Compare Austin, Dallas, Houston, and San Antonio, recommend where to start, and flag policy risks.”

Show agent log:

✓ Loaded LoneStar Retail Group profile
✓ Queried Austin construction permits
✓ Queried Austin zoning cases
✓ Queried Dallas building permits
✓ Queried Dallas code violations
✓ Queried San Antonio building permits
✓ Searched Texas bills for retail, zoning, development, permitting
✓ Checked public lobbying activity by subject
✓ Generated expansion brief
Output:

Recommendation:
Start with Austin, specifically East Riverside / Highland watch areas.

Why:
- stronger commercial permit momentum
- visible mixed-use development activity
- manageable zoning friction
- better near-term retail fit than Dallas/Houston targets

Watch:
- Texas bill affecting local permitting timelines
- active Austin zoning cases near target corridors
- Dallas CO/code risk in selected commercial areas
Demo 2 — Live monitor mode
Button:

Run Live Daily Monitor

It checks the real last 24 hours.

If nothing material appears, that is okay. It still produces:

Live Texas Signal Brief
No high-severity new signals found.
Scanned X bills and Y city records.
Low-priority changes: ...
Demo 3 — Replay monitor mode
Button:

Run Replay Monitor

Same code path, known historical/seeded window.

It finds:

2 material signals:
1. Austin commercial permit spike near target corridor
2. Texas bill creating possible retail permitting risk
This gives the judges the “wow” moment without faking the pipeline.

Demo 4 — Evidence view
Every recommendation expands into:

Source
Dataset
Record count
Date window
Why it matters
Confidence
Demo 5 — MCP/skill proof
Show:

MCP server running
augur.query_city_dataset called
augur.search_texas_bills called
SKILL.md included
Demo 6 — Miro, if time
Last step only:

Sync report to Miro
Creates:

Texas map
city comparison
policy alert
evidence cards
action checklist
API keys / accounts to get before hackathon
Required:

OpenAI API key
OpenStates API key
Supabase project URL + anon key + service role key
Railway account/project
Vercel account/project
Strongly recommended:

Socrata app token
Exa API key
Apify API key
Miro sandbox access + Miro MCP connection
Probably no key needed:

Texas Legislature Online FTP
Texas Legislature Online RSS
Texas Ethics Commission downloads
Austin open data basic access
Dallas open data basic access
San Antonio CKAN/basic downloads
Houston CKAN/basic downloads
Map optional:

Mapbox token if using Mapbox
No key if using simple SVG/GeoJSON Texas map
Recommendation: use a static Texas SVG/GeoJSON map first. Do not burn time on map tile APIs.

Build plan, not “MVP versions”
This is not product versioning. This is dependency order.

Data foundation
Supabase schema
data source registry
Austin connector
Dallas connector
San Antonio connector
OpenStates connector
TLO RSS parser
TLO FTP worker
TEC snapshot importer
Agent foundation
tool registry
tool call logger
Augur Analyst system prompt
ask mode
monitor mode
replay mode
markdown report generator
structured summary output
Dashboard
Texas map
city cards
alerts
agent run log
report viewer
evidence drawer
Track requirements
MCP server
agent skill
README
source attribution
safe usage documentation
Sponsor flex
Miro sync
Final architecture
Vercel Web App
  ↓
Supabase
  - company profiles
  - normalized public data
  - reports
  - agent runs
  - tool calls

Railway Workers
  - ingestion cron
  - TLO FTP downloader
  - TEC importer
  - monitor runner
  - MCP server

Augur Analyst
  - one agent
  - tool calling
  - long-running loop
  - citations
  - report generation

Optional Miro
  - sync selected report
  - sponsor demo board
Remaining decisions I need from you
Should the demo recommendation be Austin East Riverside / Highland, or do you want a different Austin target area?

Should LoneStar Retail Group be more like:

convenience/grocery retail,

coffee/food retail,

mixed-use retail landlord,

self-storage/light industrial?

Should the policy alert focus on:

permitting timelines,

zoning/local land-use,

retail alcohol/tobacco,

parking/signage,

commercial property tax/development incentives?

My recommendation: mixed-use retail landlord + small-format grocery, with the policy alert focused on permitting/zoning timelines. That matches the data and keeps the demo clean.


Sure, we can keep the demo recommendation: Austin East Side/Highland or whatever. That looks fine.
Should loan store retail group be more? No, I think they should be a fucking retail landlord, bro. That way they can do both the real estate stuff. That way they're looking at both real estate documents as well as expansion documents, right? It's not just a coffee retail business. It's a fucking landlord, and they own, I guess, strip malls or something, and then they rent those out to businesses. They obviously still own the strip malls, so they need to figure out where exactly is the best next place to expand and where exactly are zoning laws and things like that affecting their strip mall business?
For example, the policy alert should focus on fucking everything, bro, like everything that's relevant:
- Permitting timelines
- Zoning and local land use
- Commercial property tax and development incentives
- Yes, all of that parking signage
- Yes, retail alcohol and tobacco
That's not really relevant, but for our specific use case it should focus on everything that is relevant.
We can send highly very significant prompts to Codex and things like that, too.
You have any more questions after this? Do not just repeat everything. Just tell me you understand these if you have more questions. Ask me the more questions now, and then we'll finally create the full final brief document.

Thought for 11s
Understood.

Final locked changes:

LoneStar Retail Group = retail landlord / strip mall operator, not a retail store brand.

They care about where to acquire/build/lease retail centers and how Texas public data affects that decision.

Policy risk should cover every relevant landlord/development issue: permitting timelines, zoning, land use, commercial property tax, development incentives, parking, signage, occupancy, code risk, and local/state bills.

Before I write the full final brief, I need a few final answers.

Should Augur support specific property addresses in the demo?
Example: “Analyze this address in East Austin.”
Or should we keep it to neighborhood/corridor level only?

Should the main recommendation be acquisition-focused or development-focused?
Acquisition: “buy existing strip centers here.”
Development: “build new retail centers here.”
Hybrid is possible, but the scoring changes.

What should the main dashboard score be called?
Options:

Expansion Score

Site Readiness Score

Market Signal Score

Opportunity Score

Augur Score

For policy alerts, do you want aggressive language or conservative language?
Aggressive: “Call this office, say this, push this change.”
Conservative: “Recommended contact path, suggested talking points, human review required.”
I recommend strong but compliance-safe.

For lobbying/influence data, what exact line should we not cross?
We can use public records to say “these entities are active on this issue.”
Should we avoid any language around donations/campaign finance, or include it carefully as context?

Should the agent produce one final markdown report per run, or multiple artifacts?
Option A: one complete report.
Option B: separate artifacts: expansion brief, policy memo, contact brief, data appendix.

Do you want the final brief to include a literal Codex build plan/prompts?
Example: “Prompt Codex with this to build the Austin connector,” “Prompt Codex with this to implement the agent loop.”

Do you want the final brief as a structured product spec only, or also a pitch deck narrative?
Product spec = architecture, tools, schema, agent loop, demo.
Pitch narrative = what to say to judges.

My recommendation for defaults:

neighborhood/corridor level, not address-level

hybrid acquisition + development

score name: Site Readiness Score

strong but compliance-safe policy language

include lobbying/campaign records only as sourced public context, not as “influence targeting”

multiple artifacts per run

include Codex build prompts

include both product spec and pitch narrative


No, we don't want specific property addresses. I feel like that's doing too much.

Should the main recommendation be acquisition-focused or development-focused? Both, I guess. Hybrid, I don't know. What do you think is easier? I guess development's probably easier. We can probably go development.

What should the main dashboard score be called? What the fuck is the main dashboard score? Like, what was the score, bro? Like, what are you talking about? We've never talked about this before.

For policy alerts, do we want aggressive language or conservative? Call this office, say this, push this change. Recommended contact path, suggested talking points, human review required. I think we go with recommended contact path, suggested talking points. Here's what to say. Don't do the fucking human review required, though.

For lobbying influence data, what exact line should we not cross? We can use public records to say these entities are active in this issue. We should avoid any language around donation, campaign finance, or included carefully as context. We should include it as context into the LLM, so the agent basically should always get the raw data of, like, okay, this person is very involved in lobbying. That should be very thorough and very clear in terms of understanding, like, okay, this person is very active on this issue. It should just codex should get the raw thing when we're telling the user. For example, we can be like, "Oh, this person is active," but in the real, for codex, it should get the raw prompt or the raw details and the raw data.

Should the agent produce one final markdown or more? It should create an ongoing markdown file, so it should have a tool that is like an update markdown file, and that is like the main bread and butter. It can update the markdown file and then add to it or remove it or add more to it or edit it and things like that. Maybe, if that's too complicated, maybe we just do one final complete report at the very end. I feel like that might be easier. For now, we'll just do one final complete report at the end.

Do we want the final brief to include a literal codex to build a plan prompt, prompt codex with this to build the Austin connector? What prompt, codex with this to implement? What are we talking about? What does that have anything to do with what we are doing, bro? What are you talking about? Explain yourself. Do not fucking not explain yourself. I'm, you better fucking explain yourself about what you're talking about here.

Do you want the final brief as a structured product or only a pitch deck? Negative narrative? I'll tell you later. We're not worried about that right now. We're first worried about making sure we're on the same page. Again, I ask you, do you have any more questions? Do you have any other details that you want answers to? Everything should be answered right now. Fucking stop trying to go right into it. Really think about things really thoroughly. 

Thought for 12s
Got it. I understand the corrections.

Clarifications
1. Property addresses
No address-level demo. We keep it at:

city → neighborhood/corridor → public-data signals

That is enough depth without making the product feel like a parcel underwriting tool.

2. Development vs acquisition
Use development-focused.

Reason: the public datasets line up better with development:

permits

zoning cases

land use

code/occupancy friction

construction activity

policy changes around development

Acquisition can exist as a secondary implication, but the demo should say:

“Where should a retail landlord develop or expand next?”

3. Dashboard score
You are right. I introduced “score” too casually.

What I meant was: the dashboard probably needs some compact way to compare cities/neighborhoods. But it does not need to be one magic score.

Better: no single “Augur Score” for now.

Use separate visible indicators:

Development Momentum
Zoning Friction
Permitting Activity
Code / Occupancy Risk
Policy Risk
Confidence
Then the agent writes the recommendation in plain English.

No vague composite score unless we define the formula later.

4. Policy alerts
Locked:

recommended contact path + suggested talking points + why that contact matters

No “human review required” language in the user-facing demo.

Still, the app should not actually send emails/calls. It drafts and recommends.

5. Lobbying / influence data
Locked:

Internally, the agent can receive raw public records context.

User-facing output should say things like:

“public records show this entity is active on this issue”

“this committee/person is relevant because of public role, jurisdiction, or issue history”

“these groups may be useful coalition/context signals”

Avoid framing like:

“target this person because donations show they can be influenced”

“pressure this person”

“exploit this relationship”

So the data can be deep internally, but the output stays professional and source-grounded.

6. Reports
For now:

one final complete markdown report at the end of each run

No live-editing markdown file yet. That adds complexity and does not help the demo enough.

Later we can add “update report section” as a tool, but not now.

7. Codex build prompts — explanation
When I asked about “Codex build prompts,” I was not talking about the Augur product itself.

I meant: since this is a Codex hackathon, we may want a separate internal build plan for your team, with ready-to-use prompts like:

“Implement the Austin Socrata connector using this dataset ID and return normalized permit records.”
That would just help your team build faster during the hackathon. It is not a user-facing feature, not part of Augur, and not something judges need to see.

So we can ignore that for now. It was a build-process suggestion, not product architecture.

Current locked version
Augur is:

A Texas public-data intelligence dashboard for retail landlords and real estate development teams.

The demo company is:

LoneStar Retail Group, a retail landlord / strip-mall operator deciding where to develop or expand next in Texas.

The agent:

is one main long-running agent

uses tools to query Texas legislation, city datasets, lobbying records, and web search

compares findings against the company profile

produces one complete markdown report

shows an agent activity log

supports live mode and replay mode through the same pipeline

eventually syncs to Miro as sponsor polish

Final questions before the full brief
What should the first dashboard tab be called?
Options: Overview, Command Center, Texas Radar, Expansion Radar, Signals.

Should the main report title be more business-y or more threat-y?
Business-y: Texas Expansion Brief
Threat-y: Texas Risk & Opportunity Brief
My lean: Texas Expansion Brief.

Do we want the agent to use Exa/web search in the core demo, or only as bounded secondary research?
Core demo with web search looks deeper, but can be less scripted. Secondary source use is safer.

Should the dashboard show raw datasets visibly, or hide them behind evidence drawers?
My lean: evidence drawers. Keep the main dashboard clean.

For the policy/contact output, should we call it Contact Path, Stakeholder Map, or Response Plan?
My lean: Response Plan, with a Stakeholder Map section inside it.

Those are the last product-shape questions I need.


Okay, property addresses. Yeah, that sounds good. Development versus acquisition, development sounds good. Dashboard scores. Again, you didn't fucking explain what a fucking score is. The dashboard probably needs some comeback way to compare cities, but it does not have to be one magic score. Better, no single. Again, you just never explained what that score is. I told you to fucking explain it to me. I didn't tell you to remove it. I told you to explain it. I don't know why you're so fucking hesitant on making actions such as explaining things.

Policy alerts, locked. Recommended contact path, suggested talking why that contact matters. Yeah, that sounds good. Lobbying and influence data, locked internally. The agent can receive public records contacts and things like that. Reports, one final complete markdown file at the end of each run. Yep, that looks good.

Yeah, this looks good. Codex builds prompts. Explanation when I asked about it. Since this, don't worry about that. You don't need to worry about the codex building prompts part. The current locked version, yeah, that looks good. Everything looks good.

What should the first command dashboard tab be called? It should just be called the overview. Just call it the overview. Should the main report title be more businessy or more thread? What? A report? What? We'll do. It will just create a custom title name, bro, for each thing. I don't know what the fuck you're doing. Do you want an agent? Yes. Yes, yes, yes, there should be no scripted backup generation ever for anything. I don't know why you are so adamant on building scripted backup paths. I want them to have live fucking data. Okay, live web search data. There should be no scripted backup generation, absolutely zero. Everything should be no hard-coding, anything, no fucking bullshit. Okay, we want only fucking live data, only fucking the downloaded data or the live data.

Okay, I don't want no scripted backup generation of, like, okay, this is, we're in a hard code this, like, no fucking hard coding this bullshit.

Should the dashboard show raw data, such as visible your height? Behind evidence stores. Should the dashboard show raw data sets simply or hide them behind evidence stores? For the policy contact output, should it be called contact stakeholder map response plan? Response plan, I guess. Yeah, hopefully that answers the rest of your questions. Let me know if you have any other questions. Again, tell me if you have any other questions first before we do anything else. 

Thought for 20s
Understood. Here is the missing explanation on “score.”

What I meant by “score”
A score is just a compressed comparison metric for the dashboard.

Instead of showing judges 500 raw permit records, zoning cases, bills, and code violations, the dashboard needs quick indicators like:

Austin
Development Momentum: High
Zoning Friction: Medium
Policy Risk: Medium
Confidence: High
or numerically:

Austin
Development Momentum: 82 / 100
Zoning Friction: 41 / 100
Policy Risk: 58 / 100
Confidence: 76 / 100
It is not magic. It is not the agent “vibing.” It is a calculated signal from public data.

Example:

Development Momentum
Measures whether an area looks commercially active.

Could use:

commercial permit count
commercial permit valuation
recent permit growth
new construction / remodel permits
mixed-use development signals
Zoning Friction
Measures how messy the land-use environment looks.

Could use:

active zoning cases
rezoning frequency
pending land-use changes
case status
zoning conflict with retail development
Code / Occupancy Risk
Measures how painful opening/operating there might be.

Could use:

code violations
certificate of occupancy friction
inspection-related public records
recent enforcement density
Policy Risk
Measures whether Texas bills or local policy activity could affect retail landlords.

Could use:

bill relevance to permitting/zoning/property tax/signage/parking/development
bill status
committee activity
fiscal/legal analysis
lobbying activity around the topic
Confidence
Measures how much the system trusts the analysis.

Could use:

freshness of data
number of supporting datasets
source quality
geographic specificity
whether evidence is complete or partial
So the dashboard does not need one main score. Better version:

show several transparent signal indicators, then the agent writes the actual recommendation.

That keeps it explainable.

Locked based on your answers
Dashboard first tab: Overview

Report title: generated dynamically per run

No hardcoded fake demo path

Data must come from live APIs, downloaded public datasets, or cached copies of real public records

Replay mode, if used, should replay real historical public data through the same pipeline

Raw datasets stay behind evidence drawers

Policy output section: Response Plan

Policy recommendations include:

who to contact

what to say

why that contact matters

source-backed context

LoneStar Retail Group = retail landlord / strip-mall developer

Focus = development, not individual property addresses

Remaining questions
Replay mode clarification
Is this acceptable: replay mode uses a past date range of real public records already fetched into Supabase, not hardcoded fake data?

Neighborhood/corridor unit
For Austin, should we use named areas like East Riverside, Highland, North Burnet, etc., or use cleaner public-data units like council district, ZIP code, or census tract?

Contact data depth
Should the demo show actual public official/staff contact info if available, or just contact path like “House Land & Resource Management Committee staff / sponsor office / city planning department”?

Houston
Is Houston mandatory for the final demo, or should we include it only if the connector is clean? Austin + Dallas + San Antonio + Texas legislation + lobbying is already enough for a strong version.

UI tone
Should Augur look more like:

dark Fed10-style threat dashboard

clean civic data dashboard

enterprise command center

Final recommendation format
Should the agent say one clear winner, like “Start with Austin,” or give a ranked list with tradeoffs? My recommendation is ranked list, with a clear top pick.


See, how hard was it to explain the score? I think numerically showing the scores of development, momentum, zoning, friction, policy risk, and confidence is probably the best move. That just gets updated once a day with the cron job or whatever at the end. The agent should just be able to update it directly. That's like another tool that the agent has, right? Just being able to update those fucking things or just respond in a proper JSON format, and we just parse that JSON format.
Remaining questions:
- Replay mode clarification: Is this acceptable?
- Replay mode uses past data range of public affixed into our hard-coded fake data. Yes, it should use the past public records. No hardcoding anything. I swear to God we're not hardcoding anything, bro.
- For Austin, could we use named cities and areas like this, or use cleaner public data units? Whatever is easiest, bro, that's fine. Just do council district if that's an actual data unit, like if that's easiest, we'll just go with that.
- Should the demo show actual public official staff and contact info, or just contact path? Yes, it should show the official. Yes, it should show the official fucking data and the staff and the contact info and everything. Everything should be shown.
- Is Houston mandatory for the final demo, or should we give a ranked list for trade-offs? No, the agent should basically give a transcript of its work, right? Like, okay, I started here and then I moved to this and I did more research into this and I did more research into this and I did more research into this and etc. etc. etc. That's another thing, right? When we're doing the agent, we need to be very thorough about managing its context, making sure that we're using the full context that we have available, basically. Yeah, let's just do all that.

Thought for 9s
Understood. No hardcoded fake data. Replay mode = real historical public records cached into Supabase, run through the same agent pipeline.

Here is what is now locked.

Locked decisions
Scores
We will show numeric indicators:

Development Momentum: 0–100
Zoning Friction: 0–100
Code / Occupancy Risk: 0–100
Policy Risk: 0–100
Confidence: 0–100
These get updated by the daily monitor job and can also be updated after an agent run.

Implementation options:

Option A:
Agent returns structured JSON → app parses it → updates city/neighborhood scores.

Option B:
Agent calls update_signal_scores tool directly.
Best version: do both. The final agent output includes structured JSON, and the backend validates it before updating Supabase.

Example tool:

{
  "name": "update_signal_scores",
  "description": "Update public-data signal scores for a city or district.",
  "parameters": {
    "type": "object",
    "properties": {
      "company_id": { "type": "string" },
      "geo_unit": { "type": "string", "description": "Austin council district, city, or neighborhood label" },
      "development_momentum": { "type": "number" },
      "zoning_friction": { "type": "number" },
      "code_occupancy_risk": { "type": "number" },
      "policy_risk": { "type": "number" },
      "confidence": { "type": "number" },
      "evidence_ids": {
        "type": "array",
        "items": { "type": "string" }
      },
      "reasoning_summary": { "type": "string" }
    },
    "required": [
      "company_id",
      "geo_unit",
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
Replay mode
Replay mode uses:

real past public records
real source URLs / IDs
real cached records in Supabase
same tool pipeline
same agent loop
same scoring/report generation
No fake seeded bill. No hardcoded “demo alert.” If we need reliability, we pick a historical date range where real records produce an interesting result.

Austin geography
Use the easiest real public-data unit first.

For Austin, likely:

council district
ZIP code
or dataset-provided location fields
If council district is cleanly available in the permit dataset, use council district. Then we can display friendly labels like:

Austin District 3 — East / Southeast Austin corridor
Austin District 4 — Highland / North Central corridor
The backend stays data-grounded; the UI can use readable labels.

Contacts / officials
Show actual public contact data when available.

Policy output should include:

official / office / committee
public role
why they matter
contact path
suggested talking points
source-backed context
But the wording stays professional:

“Contact this office because it has jurisdiction / sponsorship / committee relevance.”
Not:

“Target this person because they can be influenced.”
Agent transcript / activity log
Yes. The dashboard needs a visible Codex-style work trace.

Not a messy raw transcript. More like:

✓ Loaded LoneStar Retail Group profile
✓ Queried Austin permits by council district
✓ Found elevated commercial permit activity in District 3
✓ Queried Austin zoning cases near the same corridor
✓ Searched Texas bills for zoning, permitting, land use, property tax
✓ Found 3 relevant bills
✓ Pulled bill text and public records context
✓ Updated Development Momentum and Policy Risk scores
✓ Generated final expansion brief
Each step can expand to show:

tool name
input
output summary
source records
status
timestamp
This satisfies the “agent did work” requirement.

Context management
The agent should not carry every raw record in context.

Use this structure:

1. Tools fetch raw data.
2. Backend stores raw records in Supabase.
3. Tools return compact summaries + record IDs.
4. Agent decides what to inspect deeper.
5. Agent can retrieve specific evidence records by ID.
6. Final report cites evidence IDs/source URLs.
This prevents context blowup while still letting the agent use full data when needed.

The agent sees:

summary statistics
top records
source IDs
open questions
prior tool results
The database stores:

raw public records
normalized records
tool outputs
agent run logs
reports
scores
evidence links
Default decisions I’m taking unless you override
Houston stays in scope, but if the connector is messy, it gets lower priority than Austin/Dallas/San Antonio.

UI tone: dark Fed10-style command center.

Final recommendation: ranked list with a clear top pick.

Main first tab: Overview.

Report title: generated dynamically by the agent per run.

No more major product-shape questions from me. The next step is the full final project brief/spec.


Anymore questions at all?

Thought for 8s
No blocking questions.

I have enough to write the full final brief/spec. The remaining details can be set as defaults instead of asking you more:

Geo unit: use whatever the dataset supports cleanly; Austin council district first.

Scores: numeric 0–100 for Development Momentum, Zoning Friction, Code/Occupancy Risk, Policy Risk, Confidence.

Mode: live mode and replay mode use the same pipeline; replay only uses real historical public records cached in Supabase.

Company: LoneStar Retail Group = retail landlord / strip mall developer.

Core focus: development expansion, not address-level property analysis.

Policy output: Response Plan with contact path, suggested talking points, why each contact matters, and source-backed context.

Agent: one main Augur Analyst with tools, memory, planner loop, guardrails, and visible activity log.

Data: OpenStates, TLO, TEC, Austin/Dallas/San Antonio/Houston public data, Exa/web search.

Miro: last-mile sponsor flex, not core dependency.

No hardcoded fake demo data.

Next step: full final project brief with product spec, data architecture, agent architecture, tools, schema, scoring model, UI, demo flow, MCP/skill plan, and build plan.


Okay, now is where you create the full, complete project, not brief, like the most detailed report on the project, basically, right?
- Product spec
- Data architecture
- Agent architecture
- Tools
- Schema
- Scoring model
- UI demo flow
- MCP skill plan and build plan (the phased build plan)
We also more specifically want extremely clear definitions throughout everything, right? Use paragraphs, use bullet points, use paragraphs more, because you have a horrible job of not using paragraphs and just very shortly writing everything in bullet points. Use paragraphs to really explain the product really fucking well.
Use the entire chat context that we have above, specifically all the back and forths that we've had, to create the full and fucking final, most thorough fucking possible response to this. Okay, I want the most thorough product spec, like someone should be able to read it and get the exact, like, how everything quite literally works, right? That's the goal: just be stupidly thorough, stupidly in depth, just ensure absolute fucking perfection, okay? I need you to be so fucking detailed and just ridiculously thorough and detailed and complete, and just making sure that you're just the most thorough person possible.

Thought for 43s
Augur — Full Project Specification
0. The product in one sentence
Augur is a Texas public-data intelligence dashboard for retail landlords and real estate development teams. It uses one long-running agent to monitor legislation, lobbying records, permits, zoning, code/occupancy risk, and city development data, then turns those signals into expansion recommendations, policy alerts, response plans, and source-backed reports.

The entire product is built around one clean question:

“Where should LoneStar Retail Group develop next in Texas, and what public-data signals or policy risks could affect that decision?”

This is not a legal chatbot. It is not a generic lobbyist. It is not a map with a few filters. Augur is an agentic public-data operating layer for business decisions in Texas.

The project fits the BrainForge / Vicinity Texas Open Data track because it takes raw Texas public data and makes it usable through a visual interface, bounded data tools, citations, an agent workflow, and a proper MCP/skill layer. It also keeps the original Fed10-style inspiration: surfaced threats, impact-first matching, “what this means for you,” relevant contacts, and action-oriented intelligence rather than generic search. The Fed10 reference material emphasizes “reads every bill,” “matches impact,” “surfaces threats,” “flags exposure,” and provides contact/action intelligence; Augur narrows that idea to Texas public data and retail-development decisions. 


1. Product identity
1.1 Name
The name is Augur.

An augur was an interpreter of early signs. That is exactly the product metaphor: Augur watches weak public signals before they become expensive business problems. It sees a zoning case, a permit spike, a bill movement, a lobby-registration pattern, a committee hearing, or a code/occupancy friction point, and it converts that scattered signal into a concrete business recommendation.

The name should be written as:

Augur
Not “Auger.” An auger is a drill. Augur is the signal-reader.

1.2 Category
The category is:

Texas expansion intelligence for retail landlords and real estate development teams.

The product sits between civic open-data dashboards, regulatory-intelligence tools, and business expansion software. It has a map, but it is not “just a map.” It has policy alerts, but it is not “just bill tracking.” It has an agent, but it is not “just chat with data.” The wedge is that the agent can move across multiple public-data surfaces, form an opinion, cite evidence, update structured scores, and generate a report.

1.3 Target customer
The demo customer is LoneStar Retail Group, a Texas retail landlord and strip-mall developer.

LoneStar Retail Group owns and develops retail properties. It leases spaces to restaurants, convenience stores, local retailers, service businesses, and small-format commercial tenants. The company is deciding where to develop or expand its next retail centers across Texas. It needs to know which cities and corridors show commercial development momentum, which areas have zoning or permitting friction, where code/occupancy issues may slow openings, and which state or local policy changes could affect retail development.

The company is not a coffee shop. It is not a pure retail operating brand. It is a retail landlord/developer, so it naturally cares about both real estate signals and expansion signals.

1.4 What Augur produces
Each meaningful agent run should produce four types of outputs.

First, it produces dashboard updates. These are numeric indicators and surfaced alerts that update the main Augur interface. The dashboard should show Development Momentum, Zoning Friction, Code/Occupancy Risk, Policy Risk, and Confidence for each supported city or area.

Second, it produces a final markdown report. For now, each run produces one complete report at the end. We are not doing live-updating markdown during the run. The report should include the recommendation, analysis, evidence, policy concerns, response plan, and source list.

Third, it produces an agent activity trace. This is not a raw transcript. It is a Codex-style sequence of meaningful actions: loaded company profile, queried Austin permits, found elevated commercial permit activity, checked Texas bills, pulled bill documents, searched lobby activity, updated scores, generated report.

Fourth, it optionally produces Miro output at the end. Miro is a sponsor flex, not a core dependency. The base product works without it. If completed, Miro receives the final report, city comparison, risk map, evidence cards, and response plan. Miro’s MCP integration is specifically positioned to let Codex interact with boards and create diagrams / code from board context, which makes it a good final integration once the core product is working. 

2. Core problem
Retail landlords and real estate developers make expensive decisions with fragmented public information.

A company deciding where to build or expand in Texas needs to understand permits, zoning, land use, certificates of occupancy, code violations, construction activity, economic development incentives, legislative changes, local policy changes, and stakeholder activity. That information is public, but it lives across different systems: city open-data portals, Texas Legislature Online, OpenStates, Texas Ethics Commission data, PDFs, FTP folders, RSS feeds, Socrata APIs, CKAN portals, and miscellaneous web pages.

The actual pain is not “can I find a dataset?” The pain is:

“Does this public signal matter to my business, and what should I do because of it?”

A permit spike is not useful unless it is interpreted as development momentum. A zoning case is not useful unless it is mapped to development friction. A bill title is not useful unless it is connected to permitting, zoning, signage, property tax, land use, or development incentives. Lobbying records are not useful unless they help explain who else is active in the same policy space. A city dashboard is not useful unless it helps the company decide where to spend capital.

Augur solves the interpretation layer.

3. Core solution
Augur combines a dashboard, a public-data ingestion layer, a single long-running agent, an MCP server, and an agent skill.

The dashboard gives the user a clean overview of Texas expansion signals. The ingestion layer pulls public data from Texas legislative sources, Texas lobbying sources, and city open-data portals. The agent reasons over that data using the company profile and decides what matters. The MCP server exposes the same data capabilities to other agents. The skill document explains how agents should use Augur safely and effectively.

The core workflow is:

Company profile
→ live or replay signal window
→ public data fetch
→ normalization and caching
→ agent investigation
→ score update
→ final markdown report
→ dashboard update
→ optional Miro sync
The important design principle is that live mode and replay mode use the same pipeline. Replay mode is not a hardcoded fake demo. Replay mode simply runs the pipeline over a historical date range of real public records already cached in Supabase. That gives demo reliability without compromising the real system.

4. System principles
4.1 One agent, many tools
Augur should have one main agent, called Augur Analyst.

We are not creating fake sub-agents like “Zoning Agent,” “Permit Agent,” “Miro Agent,” “Company Agent,” or “Policy Agent.” Those are tools, modules, or functions. The actual agent is the thing that plans, chooses tools, observes results, decides whether to go deeper, updates scores, and writes the report.

This mirrors how serious coding agents feel. Codex does not expose “file reading agent,” “editing agent,” “testing agent,” and “review agent” as separate products. It has one agent with tools. Augur should feel the same.

4.2 Live data only, plus real historical replay
There should be no hardcoded fake alert. No fake bill. No synthetic demo signal pretending to be live.

Data can come from:

live APIs
official public downloads
cached copies of real public records
historical public records replayed through the real pipeline
Data should not come from:

hardcoded fake records
manually written fake bill payloads
custom if-statements that force a demo result
The demo can use a replay window, but the replay window must reference real records fetched into Supabase.

4.3 Source-backed outputs
Every factual claim in the report should connect to an evidence item. The report should distinguish between public-record facts, model-generated interpretations, assumptions, and recommendations. This matters because the product deals with policy, development, and business decisions.

The user-facing output should never imply legal advice. It can say “this may create permitting risk” or “this bill appears relevant to retail development,” but it should not say “you are legally required to do X” without proper sourced context and review language.

4.4 Professional policy response, not sketchy lobbying
Augur can recommend who to contact, what to say, and why that contact matters. It can use public records to identify offices, committees, agencies, and public lobbying activity. It can produce talking points.

It should not say things like “target this person because donations show they can be influenced.” The internal model can use raw public context, including lobby and campaign/public activity records if available, but the output should frame the recommendation around official responsibility, jurisdiction, committee relevance, public role, and issue history.

A good phrasing is:

“This office is relevant because it is connected to the committee or procedural path for the issue. Public records also show active industry interest around this subject.”

A bad phrasing is:

“This person is influenceable; pressure them.”

4.5 Explainable scores, not magic scores
Augur should show numeric signal indicators, but they must be transparent. A score is simply a dashboard compression of underlying public data. It helps users compare cities and districts without reading hundreds of raw records.

Scores should not replace explanation. The agent still writes the recommendation in plain English and cites the evidence.

5. Product modes
5.1 Ask Mode
Ask Mode is triggered by a user prompt.

Example prompt:

“We want to develop three new retail centers in Texas this year. Compare Austin, Dallas, Houston, and San Antonio. Recommend where to start and flag policy risks.”

The agent reads the company profile, decides what information it needs, calls data tools, compares the cities, checks Texas bills and public lobbying records, updates scores, and writes a report.

Ask Mode is useful when the user wants a specific investigation.

5.2 Live Monitor Mode
Live Monitor Mode is scheduled. It should run once per day, likely around 8 AM.

It checks what changed in the last 24 hours across legislation and supported city datasets. It then decides whether anything matters to LoneStar Retail Group. If nothing material changed, it still creates a short daily signal digest. If something matters, it goes deeper, updates scores, and creates a report.

Live Monitor Mode should use real live data from APIs or official public sources.

5.3 Replay Monitor Mode
Replay Monitor Mode is for demo reliability and historical analysis.

It accepts a date range, pulls real historical public records already cached into Supabase, and runs the same pipeline as Live Monitor Mode. The only difference is the signal window.

Replay Mode exists because live public data may not produce a dramatic alert on the morning of the demo. Replay Mode solves that without hardcoding anything.

The mode abstraction should look like this:

type RunMode = "live" | "replay";

type SignalWindow = {
  mode: RunMode;
  from: string;
  to: string;
  source: "live_fetch" | "cached_public_records";
};
The execution pipeline is identical:

load company profile
→ fetch signal window records
→ normalize records
→ agent investigates
→ update scores
→ save final report
→ update dashboard
6. Data architecture
6.1 Data source philosophy
Augur’s data architecture should use each source for what it is best at.

OpenStates is best for structured bill metadata. Texas Legislature Online is best for official Texas documents. TLO RSS is best for change detection. Texas Ethics Commission is best for lobbying/influence snapshots. Socrata-style city portals are best for Austin and Dallas datasets. CKAN-style portals are useful for San Antonio and Houston. Exa/web search is a bounded secondary research tool when structured public data is incomplete.

This is intentionally not “scrape everything.” The hierarchy is:

official API first
official download second
official FTP/RSS third
light scraper only when no structured source exists
web search for context, not as source of truth
6.2 Legislative data
OpenStates
OpenStates API v3 provides a JSON API for programmatic access to state legislative information, and exposes endpoints for jurisdictions, people, bills, committees, and events. It requires an API key. 

In Augur, OpenStates is used for discovery and metadata. It should answer questions like:

What Texas bills match “zoning,” “permitting,” “property tax,” “land use,” or “development incentives”?
Who sponsored the bill?
What actions have occurred?
What documents or versions are linked?
When was the bill updated?
What session is it in?
OpenStates should not be treated as the final official-text source. It can link to sources and provide bill records, but Augur should fetch official bill text and analyses from Texas Legislature Online when a bill becomes relevant.

Texas Legislature Online FTP
Texas Legislature Online provides anonymous FTP downloads for bill text, bill analyses, fiscal notes, reports, and bill witness lists. Its file-download page documents the FTP file availability and folder structure. 

This is important because it gives Augur official source material, not just metadata.

In Augur, TLO FTP is used after the agent decides a bill is relevant enough to inspect deeply. The flow is:

OpenStates finds candidate bill
→ agent decides bill might matter
→ get_texas_bill_documents retrieves TLO official docs
→ parser extracts relevant provisions, fiscal notes, analyses, and witness records
→ report cites the official source
TLO also explicitly positions FTP as an alternative to downloading documents through a browser, so the implementation should prefer FTP over aggressive web-page scraping. 

Texas Legislature Online RSS
TLO RSS feeds cover upcoming House and Senate committee meetings, calendars, today’s bill text, fiscal notes, bill analyses, bills filed in House/Senate, and passed bills. 

In Augur, RSS is not the data source for deep analysis. It is the change detector. The daily monitor should read the RSS feeds to identify what changed today, then fetch richer data from OpenStates and TLO FTP.

The monitor pipeline is:

Read RSS feeds
→ identify new/changed bill IDs or document URLs
→ fetch metadata via OpenStates
→ fetch official docs via TLO FTP if relevant
→ run policy-risk analysis
6.3 Lobbying and influence data
Texas Ethics Commission provides public tools for lobby registration and activity reports, including custom lobby database search, activity report CSVs, lobby registration lists, lobby activity lists, lobby expenditures, and client compensation codes. 

TEC also publishes registration lists with current-year registered lobbyists, clients, and subject-matter lists in PDF/Excel formats. 

In Augur, TEC data is initially a snapshot layer. We download the current Excel/CSV files, normalize them, and store them in Supabase. The agent can then search public records for entities active around subjects like real estate, zoning, taxation, development, retail, land use, property, and construction.

This layer is not used to make manipulative claims. It is used to add context:

Which entities are publicly active around this topic?
Which industries appear in lobby registrations?
Which subject areas have activity?
Who might be useful context or coalition signal?
The user-facing report should phrase this professionally:

“Public lobby records show activity from entities in real estate/development-related subject areas. This suggests the issue is already active among industry stakeholders.”

6.4 Austin data
Austin is the primary city for the demo.

The most important Austin dataset is Issued Construction Permits, dataset ID 3syk-w9eu. It includes building, electrical, mechanical, plumbing, and driveway/sidewalk permits, with details such as issue date, location, council district, expiration date, description of work, square footage, valuation, and units. 

Augur uses this dataset to estimate Development Momentum. For a retail landlord, the relevant signals include commercial permit volume, permit valuation, issue-date trends, work descriptions, and council-district concentration.

Austin zoning cases are also important. The Austin Zoning Cases dataset includes zoning cases submitted for city review, with case status, case number, proposed use, applicant, owner, and location. 

Augur uses zoning cases to estimate Zoning Friction. A high volume of active zoning cases can mean neighborhood change, but it can also mean process complexity or uncertainty. The agent should not assume “zoning cases = bad.” It should interpret zoning activity in context.

Austin zoning-by-address exists and can be used later for specific site analysis, but the hackathon demo should not use property addresses. We stay at city/council-district/corridor level.

6.5 Dallas data
Dallas is the second major comparison city.

Dallas OpenData has a Building Permits dataset with dataset ID e7gq-4sah. 

Dallas also has certificate-of-occupancy and code-violation datasets. The Dallas Certificate of Occupancy data matters because retail landlords care about whether tenants can legally occupy and use a space. Dallas city documentation says that if code violations exist, a new certificate of occupancy may require inspections and code compliance approval. 

Augur uses Dallas data primarily for Code/Occupancy Risk and development comparison.

6.6 San Antonio data
San Antonio should be included as a comparison city.

Open Data SA has a building permits dataset. The dataset covers commercial and residential development, including new single-family homes, commercial construction, remodels, additions, and related work. 

The San Antonio permit resource exposes downloadable formats and a Data API. 

Augur uses San Antonio data for permit activity, development momentum, and comparison against Austin/Dallas.

6.7 Houston data
Houston remains in scope but should not block the demo.

Houston’s open-data portal is CKAN-based. CKAN is an open-source data management system used to publish, share, and use open data, and its Action API exposes core dataset functionality to external code. 

If Houston’s APIs are clean during implementation, include Houston. If Houston is time-consuming, include it as partially supported. Austin + Dallas + San Antonio + Texas legislation + TEC lobbying data is already strong enough.

6.8 Socrata implementation
Austin and Dallas are Socrata-style portals. Socrata’s SODA API gives each dataset an endpoint, and every Socrata dataset has a built-in open-data API. 

Socrata supports SoQL, the Socrata Query Language, for rich filtering and querying. 

For implementation, use the simplest reliable endpoint first:

https://data.austintexas.gov/resource/3syk-w9eu.json?$limit=500
Then add filters:

$where=issued_date between '2025-01-01T00:00:00' and '2025-12-31T23:59:59'
For Dallas:

https://www.dallasopendata.com/resource/e7gq-4sah.json?$limit=500
The exact field names should be inspected from Socrata API Foundry before coding filters. The connector should not assume field names until verified.

6.9 CKAN implementation
San Antonio and Houston may expose CKAN-style APIs. CKAN’s Action API lets external code access dataset metadata and resources, including actions such as package lookup and datastore access. 

The typical implementation pattern is:

GET /api/3/action/package_show?id=<dataset_name>
GET /api/3/action/datastore_search?resource_id=<resource_id>
If the datastore endpoint is not enabled or is inconvenient, the worker can download the JSON/CSV resource and cache it in Supabase.

6.10 Exa/web research
Exa or another web-search API should be available to the agent as bounded secondary research. It should not replace official data sources. It should be used when the agent needs context, public official pages, committee pages, agency descriptions, or news/background context.

The agent should treat web results as lower-confidence unless they are official sources.

7. Infrastructure architecture
The stack should be split across Vercel, Supabase, and Railway.

7.1 Vercel
Vercel hosts the Next.js web app. It should handle the dashboard, report viewer, evidence drawer, map UI, and lightweight API routes.

Do not use Vercel for heavy ingestion or FTP downloads. Vercel Cron exists, but heavy data ingestion and FTP work are better on Railway. Vercel’s cron documentation includes plan-specific limits; for example, the usage page notes Hobby scheduling limits around daily execution. 

7.2 Supabase
Supabase is the main database and storage layer.

It stores company profiles, normalized data, raw public records, reports, score snapshots, agent runs, tool calls, evidence items, and contact records. If vector search becomes useful, Supabase supports pgvector for storing embeddings and vector similarity search. 

Supabase can also schedule Edge Functions through pg_cron and pg_net, but for this project it is cleaner to use Supabase as the state store and Railway as the heavy worker layer. Supabase docs describe scheduled Edge Functions using pg_cron and pg_net. 

7.3 Railway
Railway should run the ingestion worker, daily monitor, TLO FTP downloader, TEC importer, and MCP server.

Railway cron jobs can start a service based on a crontab expression, and Railway expects cron-job services to perform the task and terminate. 

This is exactly what Augur needs:

daily 8 AM monitor
TLO FTP sync worker
TEC lobby snapshot importer
city dataset refresh
MCP server process
7.4 Repo layout
The repo should be structured like this:

augur/
  apps/
    web/
      app/
      components/
      lib/
      api/
  packages/
    augur-core/
      data-sources/
      scoring/
      agent/
      reports/
      schemas/
    augur-mcp/
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
The shared augur-core package matters because the web app, worker jobs, and MCP server should not duplicate business logic.

8. Data architecture in detail
8.1 Data flow
The data flow should be:

Public source
→ connector
→ raw record storage
→ normalization
→ evidence indexing
→ agent tool access
→ score/report generation
→ dashboard rendering
Raw records should never be discarded. Normalized records can be regenerated if the normalization logic changes. Reports should cite evidence items, and evidence items should point back to raw records and public URLs.

8.2 Raw vs normalized data
Raw records are the original payloads from APIs, RSS feeds, FTP downloads, Excel files, CSV downloads, or CKAN resources. They are stored as JSON or text with source metadata.

Normalized records are Augur’s internal shape. For example, Austin permits and Dallas permits may have different field names, but Augur normalizes them into a common city_records structure:

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
This makes the agent tools simple.

8.3 Evidence items
Every important conclusion in a report should cite evidence items.

An evidence item is not necessarily the entire raw record. It is a claim-supporting reference. For example:

Evidence item:
Austin issued construction permit record
Dataset: Issued Construction Permits
Record ID: <external_id>
Date: 2025-04-12
Fields used: issue date, council district, permit type, valuation, description
Source URL: data.austintexas.gov dataset page or API endpoint
The report should cite evidence by source name and preferably link to the public source or dataset page.

8.4 Cached live data
“Live data” does not mean every UI hover calls the city API. Live data means Augur’s data came from real live public sources, not fake records. The system should cache public records in Supabase for performance, reproducibility, replay, and evidence tracking.

The ingestion process should record:

when fetched
which source
which query
how many records
source URL/API endpoint
hash or version if possible
This makes the replay mode legitimate.

9. Supabase schema
Below is a detailed schema. It is intentionally more complete than the first implementation might need, but it gives the project a real structure.

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  vertical text not null,
  profile_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
The companies table stores LoneStar Retail Group and later any other company profile. profile_json contains the operational facts that the agent uses: business model, target cities, risk sensitivities, development strategy, watched subjects, and preferred output style.

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
This stores watched areas. For Austin, geo_unit_type might be council_district or corridor. For the demo, we can use Austin council districts and display readable labels.

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
This table is the source registry. Every connector should register itself here.

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
This table stores raw data exactly as fetched.

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
This is the normalized city-data table. Permits, zoning cases, code violations, and occupancy records all become city records.

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
This stores legislative metadata from OpenStates/TLO.

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
This stores bill text, fiscal notes, analyses, witness lists, or other official docs.

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
This stores TEC lobby data. It does not need to be perfect at first; the key is that the agent can search by topic/industry/client.

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
This table stores the dashboard scores. Scores are time-specific snapshots. The dashboard should read the latest score per city/geo unit.

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
This stores every agent run.

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
This powers the Codex-style activity log.

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
This links report claims to source records.

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
This stores the final markdown report.

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
This stores official/stakeholder contact recommendations for the Response Plan.

10. Scoring model
10.1 What scores are
Scores are a compact dashboard representation of public-data signals. They let the user compare cities or districts quickly.

They are not magic. They are not final decisions. They are not “the AI’s gut.” Each score is calculated from evidence, and the agent explains the score in the report.

The dashboard should show:

Development Momentum: 0–100
Zoning Friction: 0–100
Code / Occupancy Risk: 0–100
Policy Risk: 0–100
Confidence: 0–100
The scores update after the daily monitor job and after relevant agent runs.

10.2 Development Momentum
Development Momentum measures whether an area appears commercially active and suitable for development expansion.

Inputs include:

commercial permit count
recent permit growth
permit valuation
new construction permits
remodel permits
mixed-use or commercial descriptions
permit density by council district / city
A high Development Momentum score means public records show strong development activity or commercial construction activity. It does not automatically mean the area is cheap or easy. It means the area is active.

Example formula:

Development Momentum =
0.35 × normalized commercial permit count
+ 0.25 × normalized permit valuation
+ 0.20 × recent growth rate
+ 0.10 × new construction share
+ 0.10 × retail/commercial keyword relevance
10.3 Zoning Friction
Zoning Friction measures local land-use complexity.

Inputs include:

active zoning cases
rezoning frequency
pending zoning status
proposed use changes
case concentration near target areas
commercial incompatibility signals
A high Zoning Friction score means the area may require more land-use review, rezoning work, or local process management. It is a risk score, so high is not necessarily good. It can also indicate a transforming area, so the agent should explain whether the friction is opportunity-related or delay-related.

Example formula:

Zoning Friction =
0.40 × active zoning case density
+ 0.25 × pending / unresolved case share
+ 0.20 × commercial-use conflict indicators
+ 0.15 × recent zoning-change volatility
10.4 Code / Occupancy Risk
Code/Occupancy Risk measures whether development or tenant openings may face operational friction.

Inputs include:

code violations
certificate of occupancy records
inspection-related constraints
violation density
unresolved enforcement signals
This score matters for a retail landlord because a tenant cannot operate smoothly if occupancy approvals, inspections, or code issues slow down opening.

Example formula:

Code / Occupancy Risk =
0.40 × code violation density
+ 0.25 × unresolved/active violation share
+ 0.25 × certificate-of-occupancy friction indicators
+ 0.10 × recency weighting
10.5 Policy Risk
Policy Risk measures whether Texas bills, local policy activity, or public lobbying records indicate a possible threat to the company’s development strategy.

Inputs include:

bill relevance to retail/development/permitting/zoning/property tax/signage/parking
bill status and recency
official documents available
committee or hearing activity
public lobby activity around the subject
policy-topic match to company sensitivities
A high Policy Risk score means the agent found relevant public policy movement that could affect LoneStar Retail Group’s development or leasing business.

Example formula:

Policy Risk =
0.35 × bill relevance
+ 0.20 × bill/action recency
+ 0.15 × procedural importance
+ 0.15 × public lobbying subject activity
+ 0.15 × company sensitivity match
10.6 Confidence
Confidence measures the quality and completeness of evidence behind the analysis.

Inputs include:

number of supporting datasets
freshness of data
official-source coverage
geographic specificity
record completeness
availability of source URLs
agreement across independent sources
A high confidence score means the agent had enough current, official, geographically specific data to support its recommendation.

Example formula:

Confidence =
0.30 × source freshness
+ 0.25 × number of supporting datasets
+ 0.20 × official-source weight
+ 0.15 × geographic specificity
+ 0.10 × record completeness
10.7 Score update process
Scores should be updated through a tool and validated before database write.

The agent can either call update_signal_scores directly or return structured JSON that the backend validates and writes. The best design is both: the final response includes structured score JSON, and the backend saves it through a controlled function.

Example score payload:

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
11. Agent architecture
11.1 Augur Analyst
Augur Analyst is the one main agent.

It follows the agent structure from the diagram we discussed:

Brain
Tools
Memory
Planner / Logic
Guardrails
Observe → Act → Observe loop
The agent receives a goal, observes company context and public-data signals, decides what it needs, calls tools, evaluates outputs, decides whether to continue, and finally writes a report.

11.2 Brain
The brain is the LLM.

The model’s job is not to memorize Texas data. Its job is to decide which tools to use, interpret the returned data, compare it to the company profile, and write a source-backed business recommendation.

OpenAI’s tool/function calling is the right pattern because tools let the model interact with external systems and data sources through JSON-schema-defined functions. 

Structured outputs should be used for final report metadata and score payloads so the app can reliably parse and render them. OpenAI’s documentation distinguishes function calling for invoking tools from structured outputs for producing schema-constrained model output. 

11.3 Tools
Tools are the agent’s action surface. They query public datasets, fetch bill documents, search lobby records, retrieve evidence, update scores, and save reports.

The model should not directly call arbitrary APIs. It should call Augur’s controlled tools. This keeps queries bounded, logged, and safe.

11.4 Memory
Memory lives in Supabase.

Short-term memory is the current run: prompt, tool outputs, open questions, evidence IDs, intermediate conclusions, score drafts, and report outline.

Long-term memory is the company profile and prior history: watched cities, watched areas, policy sensitivities, past reports, prior score history, false positives, and user feedback.

The agent should not stuff every raw record into context. Instead, tools return compact summaries and record IDs. If the agent needs deeper detail, it calls a retrieval tool for specific records.

The context flow should be:

raw data in Supabase
→ tool returns summary + IDs
→ agent decides what to inspect
→ retrieval tool returns selected evidence
→ final report cites evidence
11.5 Planner
The planner is not separate. It is the reasoning loop inside Augur Analyst.

At each step, the agent asks:

What do I know?
What do I still need?
Which tool should I call?
Is the result enough?
Do I need city data, policy data, lobby data, or web context?
Should I update scores yet?
Is the report ready?
This is what makes it agentic. A fixed workflow would always run the same sequence. Augur Analyst can branch. If Austin looks promising, it checks zoning cases. If a bill looks relevant, it fetches official bill documents. If a policy issue appears active, it searches lobbying records. If data is weak, it lowers confidence.

11.6 Guardrails
Guardrails are implemented through system prompt rules, tool boundaries, report validators, and citation checks.

Core guardrails:

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
The product can recommend a Response Plan, but it should not actually send emails, file comments, call officials, or automate outreach during the demo.

12. Tool definitions
Below are the core tools. In the real implementation, each tool should log its inputs and outputs to agent_tool_calls.

12.1 search_texas_bills
This tool searches Texas bills using OpenStates metadata and cached TLO records.

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
12.2 get_texas_bill_documents
This tool fetches official TLO documents from cache or triggers ingestion if missing.

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
12.3 query_city_dataset
This is the generic city data tool. It keeps the agent from needing separate tool names for every dataset.

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
12.4 search_lobby_activity
This tool searches normalized Texas Ethics Commission public lobby data.

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
12.5 web_research
This tool performs bounded web research for official pages, public contact paths, committee information, and context.

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
12.6 update_signal_scores
This tool updates numeric dashboard indicators.

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
12.7 save_markdown_report
This tool saves the final report.

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
13. Report format
Each run produces one complete markdown report.

The title should be generated dynamically based on the run. It should not always be “Texas Expansion Brief.” Examples:

Austin Retail Development Brief — LoneStar Retail Group
Texas Expansion Risk & Opportunity Report — May 9 Replay
Policy Alert: Texas Land-Use and Retail Development Signals
The report should include these sections:

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
The report should be written for a business operator, not a lawyer. It should be decisive but careful. It should say what the public data suggests and what Augur recommends doing next.

The Response Plan should include:

who to contact
why that office/contact matters
what to say
which source supports the recommendation
what internal owner should handle it
what to monitor next
14. UI specification
14.1 Overall visual style
The UI should feel like a dark, serious command center. The Fed10 reference is useful here: surfaced threats, clean cards, sharp typography, activity signals, and a feeling that the product is reading the world in real time. 


It should not look like a civic hackathon map from 2014. It should look like a serious intelligence dashboard.

14.2 Layout
The main dashboard has three regions.

The left sidebar contains navigation:

Overview
Texas Map
City Signals
Bills
Lobby Signals
Reports
Agent Runs
The center panel contains the main work surface. On the Overview tab, this is the Texas map and surfaced cards. On Reports, it is the markdown report viewer. On Agent Runs, it is the run trace.

The right panel contains the active Augur Analyst run: current step, tool calls, evidence found, and next actions.

14.3 Overview tab
The Overview tab is the first screen.

It should show:

Texas map
city cards
latest surfaced signals
latest report
agent status
The Texas map should show at least:

Austin
Dallas
Houston
San Antonio
Each city should display the five numeric indicators:

Development Momentum
Zoning Friction
Code / Occupancy Risk
Policy Risk
Confidence
The scores should be visually distinct. Risk metrics should not be confused with opportunity metrics. Development Momentum being high is generally good. Zoning Friction, Code/Occupancy Risk, and Policy Risk being high are generally warning signals.

14.4 City detail panel
Clicking Austin should show a city detail panel.

For Austin, use council districts or the easiest supported public-data unit. The UI can display readable labels like:

District 3 — East / Southeast Austin corridor
District 4 — Highland / North Central corridor
The detail panel should show:

recent commercial permits
permit valuation trend
active zoning cases
policy alerts
score history
evidence links
agent explanation
No individual property addresses are required.

14.5 Surfaced signals
Surfaced signals are cards such as:

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
Each card should expand into evidence.

14.6 Evidence drawer
Raw datasets should not clutter the dashboard. They should live behind evidence drawers.

An evidence drawer should show:

source name
dataset
record count
date window
query used
sample records
source URL
why this evidence matters
This is how the product stays readable while remaining transparent.

14.7 Agent activity log
The activity log should be visible and polished.

It should look like:

✓ Loaded LoneStar Retail Group profile
✓ Queried Austin construction permits for recent commercial activity
✓ Found elevated commercial permits in Austin target districts
✓ Queried Austin zoning cases for same geography
✓ Searched Texas bills for permitting, zoning, land use, property tax
✓ Retrieved official bill documents for 2 relevant bills
✓ Searched TEC lobby records for real estate/development subject activity
✓ Updated Austin and Dallas signal scores
✓ Generated final report
Each line should expand to show:

tool name
input JSON
output summary
evidence IDs
timestamp
status
The log should prove the agent did real work without dumping raw LLM text.

15. Demo flow
15.1 Demo company
The demo company is:

LoneStar Retail Group
Profile:

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
15.2 Demo 1 — Ask Mode
The user prompt:

“We want to develop three new retail centers in Texas this year. Compare Austin, Dallas, Houston, and San Antonio. Recommend where to start and flag policy or market risks.”

The UI should show Augur Analyst working.

Expected activity log:

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
Expected result:

Recommendation:
Start with Austin, with the strongest near-term signal around the East / Highland-adjacent corridors depending on district-level evidence.

Why:
Austin shows stronger development momentum in recent commercial permit records. Zoning activity indicates some friction, but also signals active land-use transformation. Dallas shows useful development activity but higher occupancy/code friction in selected public records. San Antonio is promising but currently lower-confidence depending on available permit/land-use data. Houston remains watchlisted unless connector quality supports confident analysis.

Policy watch:
The agent identifies Texas bills or official policy movement relevant to permitting, zoning, land use, property tax, development incentives, signage, parking, or occupancy risk.

Response Plan:
The report recommends the official/office/contact path, why each contact matters, and suggested talking points.
15.3 Demo 2 — Live Monitor Mode
Click:

Run Live Daily Monitor
The system scans the last 24 hours.

If no major event exists, that is still valid:

Live Texas Signal Brief
Scanned recent Texas bill updates and city records.
No high-severity new signal found.
Low-priority changes are listed below.
This demonstrates the real product.

15.4 Demo 3 — Replay Monitor Mode
Click:

Run Replay Monitor
Replay Mode uses a selected historical date range of real public data already cached into Supabase. The same agent pipeline runs.

Expected result:

Replay Texas Signal Brief
Scanned historical public records from selected window.
Found material development and policy signals.
Updated scores.
Generated report.
This gives the judges the dramatic result without fake data.

15.5 Demo 4 — Evidence view
Open the evidence drawer for the recommendation.

Show:

Austin construction permit records
Austin zoning cases
Texas bill metadata
TLO official documents
TEC public lobby records
Dallas occupancy/code context
The point is to show Augur is grounded in public data, not hallucinating.

15.6 Demo 5 — MCP and skill proof
Show the MCP server exposing tools like:

augur.search_texas_bills
augur.get_texas_bill_documents
augur.query_city_dataset
augur.search_lobby_activity
augur.compare_expansion_signals
augur.generate_business_brief
MCP tools are model-invokable functions exposed by a server so language models can query external systems, call APIs, or perform computations. 

Then show the skill folder with SKILL.md. Codex skills are directories with a SKILL.md file plus optional scripts, references, and assets; the SKILL.md must include a name and description. 

15.7 Demo 6 — Miro sync, if done
At the very end, show:

Sync report to Miro
Miro receives:

Texas map
city comparison
policy alert
evidence cards
response plan
This is optional. It should not be on the critical path.

16. MCP plan
16.1 Purpose
The MCP server is the agent-access layer for Augur’s Texas public-data tools.

The BrainForge / Texas Open Data track asks for either a custom MCP server or a proper agent skill. Shipping both makes the submission stronger.

16.2 MCP server package
Location:

packages/augur-mcp
It imports functions from:

packages/augur-core
The server should expose tools, not raw database tables.

16.3 MCP tools
The core MCP tools:

augur.search_texas_bills
augur.get_texas_bill_documents
augur.query_city_dataset
augur.search_lobby_activity
augur.compare_expansion_signals
augur.generate_business_brief
16.4 MCP resources
MCP resources can expose contextual data such as source documentation, schema descriptions, or company profiles. MCP resources are designed to provide contextual data to language models, such as files, schemas, or application-specific information. 

Possible Augur resources:

augur://sources
augur://schema
augur://company/lonestar-retail-group
augur://latest-report
augur://scoring-model
16.5 MCP prompts
MCP prompts can be used as reusable request templates. For Augur, useful prompts include:

Analyze Texas expansion risk
Compare city development signals
Generate policy response plan
Summarize daily monitor
The prompt layer is not required for MVP, but it is useful if time allows.

17. Agent skill plan
17.1 Purpose
The skill explains how another agent should safely use Augur.

Location:

skills/augur-texas-business-intelligence/
Structure:

SKILL.md
references/
  data-sources.md
  safety-policy.md
  scoring-model.md
scripts/
  run-demo-query.ts
17.2 SKILL.md
The skill should look like this:

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
17.3 References
data-sources.md should list every source, dataset ID, source URL, access method, and refresh frequency.

safety-policy.md should define how to discuss lobbying, contact paths, and public records responsibly.

scoring-model.md should define Development Momentum, Zoning Friction, Code/Occupancy Risk, Policy Risk, and Confidence.

18. Build plan
This is phased by dependency order, not by watered-down product versions. The goal is still to build the full thing.

Phase 0 — Pre-hackathon setup
Before the hackathon, get:

OpenAI API key
OpenStates API key
Supabase project
Vercel project
Railway project
Socrata app token if possible
Exa API key
Apify API key if useful
Miro sandbox / MCP access
Also inspect field names for the core datasets:

Austin permits: 3syk-w9eu
Austin zoning cases
Dallas permits: e7gq-4sah
Dallas certificates of occupancy: 9qet-qt9e
Dallas code violations
San Antonio permits
TEC lobby lists
TLO RSS/FTP structure
Phase 1 — Core repo and database
Build the monorepo and Supabase schema.

Deliverables:

Next.js app boots
Supabase connection works
tables created
company profile seeded
source registry seeded
basic report viewer works
agent run table works
Phase 2 — Data connectors
Build connectors in augur-core.

Deliverables:

OpenStates connector
TLO RSS parser
TLO FTP worker skeleton
Austin Socrata connector
Dallas Socrata connector
San Antonio connector
TEC importer
The connectors should all write raw records to Supabase and normalize where possible.

Phase 3 — Agent tool registry
Build tool wrappers around the core data functions.

Deliverables:

search_texas_bills
get_texas_bill_documents
query_city_dataset
search_lobby_activity
update_signal_scores
save_markdown_report
Every tool call must write to agent_tool_calls.

Phase 4 — Ask Mode
Implement the main user prompt flow.

Deliverables:

user enters prompt
agent loads company profile
agent calls tools
agent updates scores
agent saves report
dashboard shows report and activity log
This is the first full end-to-end product moment.

Phase 5 — Live Monitor Mode
Implement daily monitor logic.

Deliverables:

signal window last 24 hours
TLO RSS scan
OpenStates updates
city dataset deltas
agent report
score updates
Run it manually first, then schedule on Railway.

Phase 6 — Replay Monitor Mode
Implement replay using real cached public records.

Deliverables:

select historical date range
fetch cached records from Supabase
run same monitor pipeline
generate report
update scores
No fake records.

Phase 7 — Dashboard polish
Build the full UI.

Deliverables:

Overview tab
Texas map
city cards
signal scores
surfaced alerts
evidence drawer
agent run log
report viewer
Phase 8 — MCP server
Build the MCP server around Augur core functions.

Deliverables:

Railway MCP server running
tools listed
tools callable
README showing usage
Phase 9 — Agent skill
Build the skill folder.

Deliverables:

SKILL.md
data-sources.md
safety-policy.md
scoring-model.md
demo script
Phase 10 — Miro sponsor flex
Add optional Miro output.

Deliverables:

report-to-Miro sync
city comparison board
policy alert card
response plan cards
evidence cards
19. Implementation details that matter
19.1 Context management
The agent must not receive thousands of raw records.

The correct pattern is:

Tool returns aggregate summary + top records + evidence IDs.
Agent decides if more detail is needed.
Agent retrieves specific evidence records.
Report cites evidence IDs.
Example city query return:

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
This gives the agent enough to reason without blowing context.

19.2 Source attribution
Each source should have a citation URL and a data-source ID. Reports should not cite raw internal tables alone. They should cite the original public source wherever possible.

19.3 Error handling
If a source fails, the run should not silently collapse. The agent log should show:

Austin permits query succeeded
Dallas permits query failed due to API timeout
San Antonio permits query succeeded
Confidence lowered because Dallas data was incomplete
The report should say when evidence is incomplete.

19.4 No hardcoded data
The implementation can seed the database with real public records for replay. It cannot seed fake policy cards.

Acceptable:

downloaded Austin permits from real public dataset
cached TLO bill records from real public source
historical OpenStates bill records
TEC lobby Excel imported
Not acceptable:

manually written fake bill
manually written fake alert
if demo_mode then return “Austin is best”
20. Final product definition
Augur is a Texas public-data intelligence dashboard for retail landlords and real estate development teams. It uses one long-running agent, Augur Analyst, to investigate live and historical public data across Texas legislation, city permits, zoning cases, code/occupancy data, and public lobbying records. It compares those signals against a company profile, updates transparent numeric indicators, produces a complete markdown report, and gives a response plan with source-backed contact paths and talking points.

The dashboard starts with LoneStar Retail Group, a retail landlord and strip-mall developer deciding where to develop next. The first strong recommendation should likely focus on Austin, with Austin council district or corridor-level depth, and compare it against Dallas, San Antonio, and Houston where data permits.

The project’s winning point is not that it has an agent. The winning point is that the agent does real work over real Texas public data:

reads company context
queries official sources
pulls public records
investigates deeper when needed
updates scores
writes an evidence-backed report
shows its work
ships MCP tools
ships a proper agent skill
The final demo should make one thing obvious:

Augur turns Texas public data into business decisions.
