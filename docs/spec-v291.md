# spec-v291.md — v13 synonym batch: cross-domain gap sweep

> Status: **BUILT (2026-07-10).** Follow-on to the [spec-v285](spec-v285.md)–[v290](spec-v290.md)
> ranker program, using its golden-set methodology to find and fix routing gaps. One data file
> (`data/synonyms.json`, v12 → v13) + five golden-set probes. No code, no catalog change.

## Why

The ranker program closed every *mechanism* gap the golden set recorded, but the set only
covered the domains its probes named. A wider sweep — 40 nurse-phrased queries across
electrolytes, tox, renal, heme, OB, acid-base, and screening — surfaced five queries where the
right tile existed in the catalog but the query mis-routed (the rest were either already
correct or genuine catalog gaps, not routing gaps).

## What shipped

Five synonym fixes (v12 → v13), each vetted to route the tile first and pinned by a new
golden-set probe:

| Query | Now routes to | Fix |
|---|---|---|
| "serum osmolality calculation" | osmolal-gap | added phrases (the tile computes calculated serum osmolality) |
| "acute kidney injury staging" / "aki staging" | kdigo-aki | new entry (tile had no synonym) |
| "heparin induced thrombocytopenia 4t" | four-ts | new entry (tile had no synonym) |
| "gestational diabetes screen" | iadpsg | new entry; carpenter-coustan stays an accepted alternate the ranker still surfaces |
| "metabolic acidosis compensation" | winters | added phrase to the existing winters entry |

GDM routes to the single-step IADPSG 75-g criteria (the current screening standard); the
Carpenter-Coustan 100-g tile remains in the ranked list below and is an accepted answer in the
probe — the synonym picks a sensible lead, it does not hide the alternate.

## Non-gaps the sweep confirmed

Several apparent misses were wrong test-guesses, not product gaps: `nigrovic` already leads
"bacterial meningitis score", `pass-asthma`/`pram-asthma` lead asthma severity,
`mehran-cin` leads contrast nephropathy, `wells-dvt-caprini` leads Caprini, `phq2-gad2` leads
the depression/anxiety screens. Genuine *catalog* gaps (no tile exists) were noted, not forced
into synonyms: peri-procedural anticoagulation bridging and a standalone tPA-eligibility
checklist.

## Verification

Golden set 80 → 85, all top-3; the 59-probe marquee canary set unchanged; synonym guards green
on v13 (74 → 78 entries); unit 7,573; `test:mcp` 158; lint; build; 30-test chromium smoke sweep.
