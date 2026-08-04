# spec-v649.md — Nottingham histologic grade for breast cancer

> Status: **SHIPPED (2026-08-03).** Builds the `nottingham-grade` tile. Catalog **1479 → 1480**, group G.

## Why

A **companion gap**. The catalog had the Nottingham Prognostic Index (`nottingham-prognostic-index`), but not
the histologic **grade** it depends on. The Nottingham grade (Elston-Ellis modification of Scarff-Bloom-
Richardson) is the standard breast-cancer grading system, and the grade is one of the three inputs to the NPI
(NPI = 0.2 × size + nodal stage + grade). This tile computes the grade; it does not compute the NPI.

## What it does

Three components, each scored **1–3**, summed to **3–9**.

| Component | 1 | 2 | 3 |
| --- | --- | --- | --- |
| Tubule / gland formation | > 75% | 10–75% | < 10% |
| Nuclear pleomorphism | small, uniform | moderate variation | marked variation |
| Mitotic count score | lowest tier | intermediate | highest tier |

| Total | Grade | Differentiation |
| --- | --- | --- |
| 3–5 | Grade 1 | Well differentiated |
| 6–7 | Grade 2 | Moderately differentiated |
| 8–9 | Grade 3 | Poorly differentiated |

## The mitotic score is entered directly

The mitotic **count** is scored 1–3, but the raw-count-to-score thresholds depend on the microscope's
high-power-field diameter (the sampled area) — e.g. the Elston-Ellis reference (0.59 mm field) uses ≤9 / 10–19
/ ≥20 mitoses per 10 HPF, while a ~1.5 mm² sampling area uses 0–5 / 6–10 / ≥11. Because the conversion needs
the operator's field size, the tile takes the pathologist's **1–3 mitotic score directly** rather than a raw
count.

## Scope (spec-v11 §5.3)

A pathologist's grading applied to a specimen, read with the full pathology report — the histologic grade, not
the prognostic index.

## Files

- `lib/nottingham-grade-v649.js` — `nottinghamGrade()`, `NOTTINGHAM_COMPONENTS`, `NOTTINGHAM_NOTE`.
- `views/group-v649.js` (RV649) — three 1–3 component selects; a11y-checked, no innerHTML, no network.
- `mcp/adapters/nottingham-grade-v649.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/nottingham-grade.test.js` — 5 tests (range, grade mapping, exact boundaries, example, required/range).
- `docs/spec-v649.md` (this file).

## Sourcing (spec-v97)

Elston CW, Ellis IO. Pathological prognostic factors in breast cancer. I. The value of histological grade in
breast cancer... *Histopathology.* 1991;19(5):403-410 (PMID 1757079). The three component definitions, the
1–3 scoring, and the 3-5/6-7/8-9 grade boundaries with their differentiation labels were confirmed consistent
across the primary paper, PathologyOutlines, breastcancer.org, and MDCalc; the mitotic count's field-diameter
dependence (the reason the score is entered directly) was confirmed and is documented above.
