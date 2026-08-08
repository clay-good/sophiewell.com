# spec-v673.md — Heckerling clinical prediction rule for pneumonia

> Status: **SHIPPED (2026-08-08).** Builds the `heckerling-pneumonia` tile. Catalog **1503 → 1504**, group G.

## Why

The catalog's pneumonia cluster (`psi`, `curb-65`, `corb-score`, `scap-score`, …) grades the **severity** of
*diagnosed* pneumonia. Heckerling answers the upstream question: in an adult with acute respiratory symptoms,
how likely is a radiographic infiltrate — i.e., should a chest radiograph be obtained at all? It is a
bedside, lab-free rule that complements the severity tools.

## What it does

Counts five clinical predictors, each 1 point (total 0–5):

| # | Predictor |
| --- | --- |
| 1 | Temperature > 37.8 °C (100 °F) |
| 2 | Heart rate > 100 /min |
| 3 | Crackles (rales) |
| 4 | Decreased breath sounds |
| 5 | **Absence** of asthma |

More points → higher probability of a radiographic infiltrate: **0–1 low**, **2–3 intermediate**, **4–5 high**.

## Posture (spec-v97)

The original paper expresses probability through a **prevalence-dependent nomogram**, not a fixed score→%
table. The tile therefore leads with the score and a qualitative band, and labels the per-score percentages
(~3/4/14/25/60/81% at 0–5, pooled observed frequencies) as **approximate and prevalence-dependent**. It was
derived in adults with acute respiratory illness, is not for immunocompromised patients, and guides imaging
rather than diagnosing pneumonia. Note the point-scoring condition is the **absence** of asthma.

## Files

- `lib/heckerling-pneumonia-v673.js` — `heckerlingPneumonia()`, `HECKERLING_NOTE`.
- `views/group-v673.js` (RV673) — five predictor checkboxes; a11y-checked, no innerHTML, no network.
- `mcp/adapters/heckerling-pneumonia-v673.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation bands, specialties, related.
- `test/unit/heckerling-pneumonia.test.js` — 6 tests (5/5 high, 0/5 low, band boundaries, abnormal ≥ 2,
  absence-of-asthma semantics, worked 3/5 example).
- `docs/spec-v673.md` (this file).

## Sourcing (spec-v97)

Heckerling PS, Tape TG, Wigton RS, et al. Clinical prediction rule for pulmonary infiltrates. *Ann Intern
Med.* 1990;113(9):664-670 (PMID 2221647). A source-verification subagent confirmed the five predictors
(including that the **absence** of asthma scores the point), the 0–5 range, and that the original rule is
nomogram/prevalence-based; the pooled per-score frequencies come from a systematic review (PMC7422644) and are
treated as approximate. The subagent also flagged that MDCalc does not host this rule and that a same-titled
6-variable rule (Al-Mulhim 1998) and the Diehr point rule are distinct — those numbers were not used.
