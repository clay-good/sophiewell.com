# spec-v776.md — PFIQ-7 (Pelvic Floor Impact Questionnaire)

> Status: **SHIPPED (2026-08-26).** Builds the `pfiq7` tile. Catalog **1567 → 1568**, group G.

## Why

spec-v775 shipped the PFDI-20, which measures how much pelvic floor symptoms *bother* a
patient. The PFIQ-7 is its companion from the same 2005 paper and measures the other half:
how much those symptoms *interfere with her life*. The two are reported together in
essentially every pelvic floor trial, so shipping one without the other left the pair broken.

## What it does

The same seven everyday-life questions are asked three times, once per organ system — 21
items, each rated 0 (not at all) to 3 (quite a bit):

| Scale | Asks about |
| --- | --- |
| UIQ-7 | bladder or urine symptoms |
| CRAIQ-7 | bowel or rectal symptoms |
| POPIQ-7 | vaginal or pelvic symptoms |

Each scale = **mean of its answered items × 100/3** → 0–100. Summary = the three added
together → 0–300. Higher is more interference.

**Worked example:** every item rated 1 → each scale **33.33**, summary **99.99 of 300**.

Because 100/3 does not terminate, the tile shows two decimals everywhere so the three parts
visibly add up to the summary. Item wording is copyrighted, so only neutral topic labels ship.

## Posture (spec-v97)

Interference with daily life as the patient reports it. A way to follow change over time, not
a diagnosis, an examination, or a prolapse stage. **No severity band is asserted** — the 2005
source publishes no cutoff, the same ruling as spec-v775.

## Files

- `lib/pfiq7-v776.js` — `pfiq7()`, `PFIQ7_NOTE`.
- `views/group-v776.js` (RV776) — twenty-one 0–3 selects under three h2 sections; a11y-checked.
- `mcp/adapters/pfiq7-v776.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, scales + scoring, related (pfdi20, popq-staging, ipss).
- `test/unit/pfiq7.test.js` — 6 tests (floor, ceiling, worked example, scale independence, blank-item denominator, invalid input).
- `docs/spec-v776.md` (this file).

## Sourcing (spec-v97)

Barber MD, Walters MD, Bump RC. *Am J Obstet Gynecol.* 2005;193(1):103-113 (PMID 16021067).
The three scales, their names, the 0–3 item range and the 0–300 summary range were confirmed
against two independent validation papers. The mean × 100/3 normalization is stated in the
published scoring guidance and is also entailed by the two confirmed facts, since it is the
only mapping from a 0–3 mean onto the confirmed 0–100 scale range.
