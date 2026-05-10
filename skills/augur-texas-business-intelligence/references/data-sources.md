# Augur Data Sources

Use official APIs/downloads first, cached public records second, and bounded web research only for official context/contact paths. Reports should cite the public URL or stored evidence ID for every factual claim.

## Source Priority

1. Supabase source registry and cached evidence rows.
2. Official live APIs and official public downloads.
3. Cached public records for replay mode.
4. Bounded official web research for contact paths/context.

## Core Sources

| Source | Use | Access | Refresh expectation | Citation |
| --- | --- | --- | --- | --- |
| OpenStates Texas bills | Bill discovery, bill metadata, actions, sponsors, subjects | API v3, `OPENSTATES_API_KEY` | Live per run / monitor | OpenStates URL plus evidence ID |
| Texas Legislature Online RSS | Change detection for meetings, bill text, fiscal notes, analyses, filed/passed bills | Public RSS | Live monitor / daily | RSS item URL plus evidence ID |
| Texas Legislature Online documents | Official bill text and document paths | Official HTML/download paths | Fetch when relevant | TLO document URL plus evidence ID |
| Texas Ethics Commission lobby data | Public lobby registration/activity context | Public search/download pages and CSV package reachability | Snapshot/live reachability | TEC page/package URL plus evidence ID |
| Texas Ethics Commission campaign finance | Public campaign-finance context only | Public search/download pages and CSV package reachability | Snapshot/live reachability | TEC page/package URL plus evidence ID |
| Exa official web research | Official contact paths, agency pages, context pages | API, `EXA_API_KEY` | Live per run | Official result URL plus evidence ID |

## City Sources

| City | Dataset | ID / URL | Use | Depth |
| --- | --- | --- | --- | --- |
| Austin | Issued Construction Permits | `3syk-w9eu`, `data.austintexas.gov` | Development momentum, commercial permit activity, council-district signals | Deepest; council district first |
| Austin | Zoning Cases | `edir-dcnf`, `data.austintexas.gov` | Zoning friction, rezoning activity, case status | Deep |
| Austin | Zoning by Address | `nbzi-qabm`, `data.austintexas.gov` | Future site-specific zoning context | Supporting |
| Dallas | Building Permits | `e7gq-4sah`, `dallasopendata.com` | Development comparison | City-level |
| Dallas | Certificates of Occupancy | `9qet-qt9e`, `dallasopendata.com` | Tenant opening / occupancy friction | City-level |
| Dallas | Code violations | Dallas public data / city pages | Code/occupancy risk; stale if dataset is unavailable | Lower confidence if stale |
| San Antonio | Building permits | `data.sanantonio.gov/dataset/building-permits` | Development comparison | City-level |
| Houston | Open data / planning sources | CKAN or official pages when clean | Watchlist and lower-confidence comparison | Use only when source quality is clear |

Replay mode must use real cached public records in Supabase. Never add fake replay records, fake bills, fake alerts, or hardcoded recommendation paths.
