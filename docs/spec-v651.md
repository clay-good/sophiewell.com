# spec-v651.md — FNCLCC histologic grade for soft-tissue sarcoma

> Status: **SHIPPED (2026-08-07).** Builds the `fnclcc-grade` tile. Catalog **1481 → 1482**, group G.

## Why

A companion gap. The catalog had oncologic staging/grading for musculoskeletal sarcoma (`enneking`) and
prostate (`gleason-grade-group`), but not the FNCLCC system — the standard histologic grade for adult
soft-tissue sarcomas and the grade used in AJCC staging, the CAP protocol, and the WHO classification.

## What it does

Three components summed to **2–8**.

| Component | Score |
| --- | --- |
| Tumor differentiation | 1 = resembles normal adult mesenchyme · 2 = histologic typing certain · 3 = embryonal/undifferentiated, synovial, doubtful-type |
| Mitotic count (per 10 HPF) | 0–9 → 1 · 10–19 → 2 · ≥ 20 → 3 |
| Tumor necrosis | none → 0 · < 50% → 1 · ≥ 50% → 2 |

| Total | Grade |
| --- | --- |
| 2–3 | Grade 1 (low) |
| 4–5 | Grade 2 (intermediate) |
| 6–8 | Grade 3 (high) |

The mitotic **count** is entered as a raw number of mitoses per 10 high-power fields and binned to its 1–3
score; the other two components are entered directly as scores.

## Scope (spec-v11 §5.3)

A pathologist's grade applied to a resection or biopsy specimen, read with the full pathology report.
Core-biopsy grading can underestimate the resection grade.

## Files

- `lib/fnclcc-grade-v651.js` — `fnclccGrade()`, `FNCLCC_NOTE`.
- `views/group-v651.js` (RV651) — one differentiation select, one raw mitotic-count number input, one necrosis
  select; a11y-checked, no innerHTML, no network.
- `mcp/adapters/fnclcc-grade-v651.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/fnclcc-grade.test.js` — 6 tests (range, mitotic binning, grade mapping, exact boundaries,
  example, required/range validation).
- `docs/spec-v651.md` (this file).

## Sourcing (spec-v97)

Trojani M, Coindre JM, Bui NB, et al. Soft-tissue sarcomas of adults; study of pathological prognostic
variables and definition of a histopathological grading system. *Int J Cancer.* 1984;33(1):37-42 (PMID
6693192). Coindre JM. Grading of soft tissue sarcomas: review and update. *Arch Pathol Lab Med.*
2006;130(10):1448-1453 (PMID 17090186). The three component scores, the mitotic-count thresholds
(0–9 / 10–19 / ≥20), the necrosis cutoff (< 50% vs ≥ 50%), and the 2-3 / 4-5 / 6-8 grade boundaries were
confirmed consistent across the primary papers, the CAP protocol, RCPA structured reporting, and
PathologyOutlines.
