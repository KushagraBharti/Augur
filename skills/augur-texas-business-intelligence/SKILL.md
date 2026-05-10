---
name: augur-texas-business-intelligence
description: Use this skill when analyzing Texas public data for real estate development, retail landlord expansion, permitting, zoning, land use, code/occupancy risk, Texas legislation, lobbying records, or business response planning.
---

# Augur Texas Business Intelligence Skill

Use this skill to query Augur's MCP tools and produce source-backed business intelligence reports from Texas public data.

Before analysis, prefer the Augur MCP server when available. Use the reference files in this skill for source priority, safety boundaries, and score interpretation:

- `references/data-sources.md`
- `references/safety-policy.md`
- `references/scoring-model.md`

## Core Workflow

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

## MCP Tools

Use these Augur tools when available:

- `augur.compare_expansion_signals`
- `augur.generate_business_brief`
- `augur.search_texas_bills`
- `augur.get_texas_bill_documents`
- `augur.query_city_dataset`
- `augur.search_lobby_activity`

Useful resources:

- `augur://sources`
- `augur://schema`
- `augur://company/lonestar-retail-group`
- `augur://latest-report`
- `augur://scoring-model`

## Required Output

Every analysis should include:
- recommendation
- supporting evidence
- signal scores
- policy risks
- response plan
- uncertainty
- source list
- next actions

Do not invent missing data. If a connector is stale, degraded, or unavailable, say that plainly and lower confidence.
