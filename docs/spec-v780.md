# spec-v780.md — Copenhagen Burnout Inventory (CBI)

> Status: **SHIPPED (2026-08-26).** Builds the `cbi` tile. Catalog **1571 → 1572**, group G.

## Why

The catalog is aimed at healthcare workers and contained **zero** tiles about the health of
the healthcare worker. A sweep for `burnout`, `moral injury`, `compassion fatigue`,
`shift work` and `occupational exposure` returned nothing at all.

The CBI is the right first tile in that gap: it is free to use, it comes with a published
scoring form from the Danish National Research Centre for the Working Environment, and unlike
the Maslach inventory it is not license-gated.

## What it does

Three **independent** scales — never summed into one number:

| Scale | Items | Response wording |
| --- | --- | --- |
| Personal burnout | 6 | frequency throughout |
| Work-related burnout | 7 | 3 degree, then 4 frequency |
| Client-related burnout | 6 | 4 degree, then 2 frequency |

Every item scores **100 / 75 / 50 / 25 / 0** from the most to the least burnt-out answer, and
each scale is the **average of the items answered**, so each runs 0–100.

Two details that calculators routinely drop, and that this tile enforces:

- **The last work-related item is reverse scored.** It asks whether you have energy left for
  family and friends, so "Always" is the *least* burnt-out answer. A test pins six items at 75
  plus a reversed 75 → 475/7 = 67.86, so it cannot silently become 75.
- **The published non-responder minimums.** A scale is not reported until at least three items
  are answered, or **four** on the work-related scale. Under that, the tile says "too few items
  answered" instead of averaging one answer into a score.

A clinician with no direct client contact can legitimately leave the third scale blank, so an
unanswered scale reports as **not answered** rather than as an error or a zero.

**Worked example:** personal all 75, work all 75, client all 50 → personal **75.0**,
work-related **67.9**, client-related **50.0**.

## Posture (spec-v97)

A self-report measure of how work is affecting you. Not a clinical diagnosis and not an
occupational-health determination. The widely used "50 or more means burnout" threshold is
shipped as **common practice, explicitly labeled as such** — the 2005 source publishes no
cutoff of its own.

## Files

- `lib/cbi-v780.js` — `cbi()`, `CBI_NOTE`.
- `views/group-v780.js` (RV780) — nineteen selects under three h2 sections, with the two published response wordings; a11y-checked.
- `mcp/adapters/cbi-v780.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, scales, reverse item, non-responder rule, related (fss, k6, phq9).
- `test/unit/cbi.test.js` — 7 tests (floor, the reverse item, worked example, unanswered scale, both non-responder minimums, scale independence, invalid input).
- `docs/spec-v780.md` (this file).

## Sourcing (spec-v97)

Kristensen TS, Borritz M, Villadsen E, Christensen KB. *Work & Stress.* 2005;19(3):192-207.
The item counts, both response wordings, the 100/75/50/25/0 values, the average-of-answered
rule, the reverse-scored last work item, and all three non-responder minimums were read
directly off the NRCWE-published English PUMA-study form, and cross-checked against an
independent scoring summary that agreed on every point.
