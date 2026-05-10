# Augur Scoring Model

Augur shows transparent 0-100 signal indicators, not a single magic score.

Scores are dashboard compressions of evidence. They do not replace the memo. Every score should have a reasoning summary and evidence IDs when written by an Augur run.

## Development Momentum

Inputs: commercial permit count, recent permit growth, permit valuation, new construction share, remodel activity, mixed-use/commercial descriptions, and permit density by supported geography.

## Zoning Friction

Inputs: active zoning cases, pending or unresolved case share, proposed use changes, rezoning frequency, case concentration near watched areas, and commercial-use conflict indicators.

## Code / Occupancy Risk

Inputs: code violations, certificate-of-occupancy records, inspection-related constraints, violation density, unresolved enforcement signals, and recency.

## Policy Risk

Inputs: bill relevance, bill/action recency, procedural importance, official documents available, committee or hearing activity, public lobbying subject activity, and company sensitivity match.

## Confidence

Inputs: source freshness, number of supporting datasets, official-source coverage, geographic specificity, record completeness, source URLs, and agreement across independent sources.

## Interpretation Rules

- High Development Momentum can be good or bad depending on saturation, corridor fit, and permitting pressure.
- High Zoning Friction means more process risk, not automatically a bad market.
- High Code / Occupancy Risk should be tied to certificate-of-occupancy, inspection, or violation evidence.
- High Policy Risk should distinguish a live bill/action from general policy background.
- Low Confidence should be explicit when Houston coverage is weak, Dallas code data is stale, TEC records are only reachability-verified, or a source failed.

## Suggested Bands

| Score | Meaning |
| --- | --- |
| 0-24 | weak signal or very low confidence |
| 25-49 | early or mixed signal |
| 50-74 | material signal requiring review |
| 75-100 | strong signal with clear evidence |

Confidence is not attractiveness. A city can have high confidence and high risk at the same time.
