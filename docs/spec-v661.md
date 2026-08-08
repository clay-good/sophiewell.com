# spec-v661.md — International Prognostic Score (IPS) for advanced Hodgkin lymphoma

> Status: **SHIPPED (2026-08-07).** Builds the `ips-hodgkin` tile. Catalog **1491 → 1492**, group G.

## Why

A companion gap in the lymphoma prognostic-index vein. The catalog had FLIPI (`flipi`), the NCCN-IPI, R-IPI,
CLL-IPI, and MIPI for other lymphomas, but not the IPS — the standard prognostic score for advanced-stage
Hodgkin lymphoma.

## What it does

Seven adverse prognostic factors, each 1 point, summed to **0–7**:

| Factor | Threshold |
| --- | --- |
| Serum albumin | < 4 g/dL |
| Hemoglobin | < 10.5 g/dL |
| Sex | male |
| Age | ≥ 45 years |
| Ann Arbor stage | IV |
| Leukocytosis (WBC) | ≥ 15,000/mm³ |
| Lymphocytopenia | lymphocytes < 600/mm³ **and/or** < 8% of WBC |

Higher score = lower 5-year freedom from progression and overall survival. The lymphocytopenia factor fires on
either arm (absolute < 600 or percentage < 8) but scores at most 1 point — the percentage arm can qualify even
when the absolute count is ≥ 600.

## Scope (spec-v11 §5.3)

Estimates prognosis in advanced-stage disease and supports the treatment discussion; read with the full
clinical picture and the treating team.

## Files

- `lib/ips-hodgkin-v661.js` — `ipsHodgkin()`, `IPS_NOTE`.
- `views/group-v661.js` (RV661) — five numeric labs/age + an optional lymphocyte percentage + two checkboxes
  (male, stage IV); a11y-checked, no innerHTML, no network.
- `mcp/adapters/ips-hodgkin-v661.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/ips-hodgkin.test.js` — 7 tests (0 and 7 extremes, each numeric boundary, the percentage-arm of
  lymphocytopenia, the booleans, example, required inputs).
- `docs/spec-v661.md` (this file).

## Sourcing (spec-v97)

Hasenclever D, Diehl V. A prognostic score for advanced Hodgkin's disease. International Prognostic Factors
Project on Advanced Hodgkin's Disease. *N Engl J Med.* 1998;339(21):1506-1514 (PMID 9819449). A
source-verification subagent confirmed all seven factors and their exact thresholds, the 1-point-each 0–7
range, and the inclusive-OR lymphocytopenia criterion (either arm qualifies, one point only; the 8% arm can
fire when the absolute count is ≥ 600).
