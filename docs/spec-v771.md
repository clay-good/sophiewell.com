# spec-v771 — every calculator reachable by its own name

## The audit

The standing goal is that every tool is wired for both surfaces. Measured per tile
across the whole catalog:

| | result |
|---|---|
| tiles in catalog | 1564 |
| exposed to MCP | 1540 (24 unexposed, all documented waivers, 0 undocumented) |
| publish an input schema | 1540 / 1540 |
| ship an example that round-trips | 1540 / 1540 |
| **reachable at rank 1 by their own name** | **1478 / 1540** |

## What was wrong

`find_calculator` is how an agent looks a calculator up, and it ranked on the token
ranker alone. That scores on overlap, so a SHORTER sibling whose name is contained
in a longer one wins the longer one's name:

    "TIMI Risk Score for STEMI (Morrow)"  ->  timi
    "CHADS2 Score (AF stroke risk)"       ->  chads
    "Glasgow Coma Scale - Pupils (GCS-P)" ->  gcs
    "RIFLE criteria (AKI staging)"        ->  kdigo-aki

62 calculators could not be reached at rank 1 by their own exact name. `answer_query`
already weighed `nameMatch` (spec-v762); the discovery path never did.

## What it does now

`find_calculator` reorders within its ranked set when the query **names a calculator
in full** — every distinctive word of that name is present. **1538 / 1540.**

Reordering happens strictly inside the ranked candidates, so a group / specialty
prefilter can never be bypassed by a promotion.

## Why "in full" and not something looser

Two weaker rules were tried and both broke a curated route, each caught by the MCP
suite on the first run after the change:

- **`strong` alone** (one rare word) put *Therapy Units* over CHA2DS2-VASc for
  "antithrombotic therapy not recommended" — the same failure spec-v766 hit on the
  website, which is why the website passes `minHits: 2`.
- **two matched words** put *Cockcroft-Gault* over the synonym-routed eGFR for
  "creatinine clearance".

Naming a calculator outright is a different act from describing what you want, and
only the first should outrank the ranker.

## The two that remain

`timi-risk-index` ("TIMI Risk Index") and `carpenter-coustan` ("Carpenter-Coustan GDM
Criteria") reduce to a SINGLE distinctive token once noise words are dropped, so the
two-word guard declines to promote them. Both still return at rank 2 with the right
tile plainly named. Loosening the guard to reach them is exactly what broke the two
routes above.

`test/mcp/mcp-find-by-name.test.js` pins all of it: the whole-catalog sweep, the two
named exceptions (which must still be reachable), the curated routes, and the filter.
