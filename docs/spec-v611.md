# spec-v611 — Fried frailty phenotype

**Status:** shipped. Catalog 1460 -> 1461. MCP wave 436, 1397 -> 1398 adapters.

## Why this tile

A **predecessor gap** of the clearest kind. The catalog already carried four instruments derived from or
simplified out of this one — `frail-scale`, `sof-frailty-index`, `prisma-7` and
`groningen-frailty-indicator` — and the original was missing. Every slug spelling returned zero; the `fried`
prose hits were all "Friedman" and "Friedewald".

## What it does for the reader

Answer five criteria and get robust / pre-frail / frail, with the cut-point tables printed beside the
questions — because three of the five are measurements whose thresholds move with sex, BMI or height.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **The grip cut-point rises with BMI.** Man at BMI ≤24: weak at ≤29 kg. Above 28: weak at ≤32 kg. | A heavier person must squeeze *harder* to avoid being called weak. It reads backwards and is correct — grip scales with body mass. A single fixed threshold misreads both ends. |
| **The men's table has four BMI bands but only three distinct cut-points** (24.1–26 and 26.1–28 both cut at 30 kg). | Not a transcription slip. The women's table, by contrast, has four distinct values. |
| **Slowness is a time over 15 feet, not a speed**, and sex enters *only* through the height threshold. | The times are identical for both sexes (7 s if shorter, 6 s if taller); only the boundary moves — 173 cm men, 159 cm women. Published m/s conversions of the same 6 s disagree by rounding, so no conversion is offered. |
| **Weight loss has two alternative definitions**, either of which satisfies it. | >10 lb unintentional in a year, **or** a measured loss of ≥5%. |
| **The activity cut-offs are cohort-specific.** | The criterion is the lowest quintile by sex; 383 and 270 kcal/week are that quintile in the derivation cohort, not universal constants. |
| **Three of five criteria need equipment or a questionnaire.** | Dynamometer, timed walk, Minnesota questionnaire. Not a bedside checklist — which is exactly why the simplified derivatives exist. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled. **All eight grip cut-points, both height thresholds and
both walk times matched exactly across two independent sources**, as did the weight-loss threshold, the two
CES-D exhaustion statements, and the robust / pre-frail / frail classification.

The activity criterion is stated both ways in the literature — as the lowest quintile by sex (the
definition) and as <383 / <270 kcal/week (that quintile's values in the derivation cohort). Both are
reported, with the cohort-specific status of the numbers made explicit rather than presenting them as fixed
law.

## Posture (spec-v11 §5.3)

Classifies a **phenotype**. It does not diagnose any disease, does not measure disability or comorbidity —
the original work is explicit that those are distinct from frailty — does not decide whether someone can
have an operation, and does not set a care plan.

## Files

`lib/fried-frailty-v611.js`, `views/group-v611.js`, `mcp/adapters/fried-frailty-v611.js`,
`test/unit/fried-frailty.test.js`. Registered in `app.js` (tile + RV611), `mcp/catalog.js`,
`test/unit/fuzz-tools.test.js`, `test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`,
`lib/meta.js`, `docs/mcp-coverage.md`.
