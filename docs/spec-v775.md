# spec-v775.md — PFDI-20 (Pelvic Floor Distress Inventory)

> Status: **SHIPPED (2026-08-26).** Builds the `pfdi20` tile. Catalog **1566 → 1567**, group G.

## Why

The catalog could **stage** pelvic organ prolapse (`popq-staging`, `baden-walker`) but had no
way to record what the patient actually reports. Pelvic floor patient-reported outcomes were
entirely absent. The PFDI-20 is the standard symptom-bother measure in this field and the one
used to judge whether treatment helped.

## What it does

Twenty items, each 0 (symptom absent) or a bother rating 1 (not at all) to 4 (quite a bit),
in three subscales:

| Subscale | Items | Covers |
| --- | --- | --- |
| POPDI-6 | 1–6 | pelvic organ prolapse |
| CRADI-8 | 7–14 | colorectal and anal symptoms |
| UDI-6 | 15–20 | urinary symptoms |

Each subscale = **mean of its answered items × 25** → 0–100. Summary = the three added
together → 0–300. Higher is more distress on every scale.

A blank item drops out of its own subscale's denominator rather than counting as a zero, which
is the published rule; the tile reports how many items each subscale actually used.

**Worked example:** all twenty items rated 2 → POPDI-6 **50.0**, CRADI-8 **50.0**, UDI-6
**50.0**, summary **150.0 of 300**.

Item wording is copyrighted, so the tile shows neutral symptom-topic labels only. Scoring is
positional, so the labels carry no weight.

## Posture (spec-v97)

Symptom bother reported by the patient — a way to follow change over time, not a diagnosis, a
physical examination, or a prolapse stage. **The tile asserts no severity band.** The 2005
source publishes no cutoff, and the one classification study that proposes bands
(0–50 / 51–150 / 151–300) sits behind a paywall and could not be verified against its own
tables, so it is deliberately not shipped.

## Files

- `lib/pfdi20-v775.js` — `pfdi20()`, `PFDI20_NOTE`.
- `views/group-v775.js` (RV775) — twenty 0–4 selects under three h2 sections; a11y-checked.
- `mcp/adapters/pfdi20-v775.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, subscales + scoring, related (popq-staging, baden-walker, ipss).
- `test/unit/pfdi20.test.js` — 6 tests (floor, ceiling, worked example, subscale independence, blank-item denominator, invalid input).
- `docs/spec-v775.md` (this file).

## Sourcing (spec-v97)

Barber MD, Walters MD, Bump RC. *Am J Obstet Gynecol.* 2005;193(1):103-113 (PMID 16021067).
The three-subscale split, the 6/8/6 item counts, the 0–4 item range, mean × 25 per subscale,
and the 0–300 summary were confirmed against the Shirley Ryan AbilityLab RehabMeasures entry
and an independent scoring guide, which agreed on every element.
