# spec-v652.md — USC/Van Nuys Prognostic Index (VNPI) for DCIS

> Status: **SHIPPED (2026-08-07).** Builds the `van-nuys-vnpi` tile. Catalog **1482 → 1483**, group G.

## Why

A companion gap in the breast-cancer grading vein. The catalog had the Nottingham grade (`nottingham-grade`)
and the Nottingham Prognostic Index (`nottingham-prognostic-index`) for invasive breast cancer, but nothing
for ductal carcinoma in situ (DCIS). The USC/Van Nuys Prognostic Index is the standard prognostic score for
DCIS, summarizing local-recurrence risk to support the treatment discussion.

## What it does

Four factors, each scored **1–3**, summed to **4–12**. This is the **4-factor 2003 USC/VNPI update** (the
original 1996 VNPI had three factors and ranged 3–9; the 2003 paper added age).

| Factor | 1 | 2 | 3 |
| --- | --- | --- | --- |
| Size | ≤ 15 mm | 16–40 mm | ≥ 41 mm |
| Margin width | ≥ 10 mm | 1 to < 10 mm | < 1 mm |
| Pathologic classification | non-high grade, no necrosis | non-high grade, with necrosis | high grade (NG 3), ± necrosis |
| Age | > 60 y | 40–60 y | < 40 y |

| Total | Risk |
| --- | --- |
| 4–6 | Low |
| 7–9 | Intermediate |
| 10–12 | High |

Size, margin, and age are entered as raw values and binned; the pathologic classification is entered as a 1–3
score. The 40 and 60 age endpoints belong to the middle band.

## Scope (spec-v11 §5.3)

The index summarizes local-recurrence risk to support the treatment discussion; it is decision support, not a
treatment order, and is read with the full pathology report and the patient.

## Files

- `lib/van-nuys-vnpi-v652.js` — `vanNuysVnpi()`, `VNPI_NOTE`.
- `views/group-v652.js` (RV652) — three raw number inputs (size, margin, age) + one 1–3 classification select;
  a11y-checked, no innerHTML, no network.
- `mcp/adapters/van-nuys-vnpi-v652.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/van-nuys-vnpi.test.js` — 7 tests (range, each factor's binning, risk-band boundaries, example,
  required/range validation).
- `docs/spec-v652.md` (this file).

## Sourcing (spec-v97)

Silverstein MJ. The University of Southern California/Van Nuys prognostic index for ductal carcinoma in situ of
the breast. *Am J Surg.* 2003;186(4):337-343 (PMID 14553846). The four factor cutoffs (including the exact
inclusive/exclusive boundaries — 15/16/40/41 mm size, ≥10 / 1–9 / <1 mm margin, >60 / 40–60 / <40 y age), the
1–3 scoring, and the 4-6 / 7-9 / 10-12 risk bands ("4, 5, or 6 versus 7, 8, or 9 versus 10, 11, or 12") were
confirmed consistent across the primary paper, the USC/VNPI scoring table, and the 15-year assessment (PMC8608918).
The 4-factor-with-age version is the 2003 update, not the 3-factor 1996 original.
