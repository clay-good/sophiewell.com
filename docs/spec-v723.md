# spec-v723.md — Silness-Löe Plaque Index (PlI)

> Status: **SHIPPED (2026-08-13).** Builds the `silness-loe-plaque-index` tile. Catalog **1553 → 1554**, group G.

## Why

Dentistry vein. The Silness-Löe Plaque Index is the companion to the Gingival Index (same
authors, adjacent papers) and grades plaque thickness at the gingival margin — a clean weighted
mean.

## What it does

Each surface is scored 0–3:

| Score | Finding |
| --- | --- |
| 0 | no plaque |
| 1 | film of plaque, recognized only after disclosing or by running a probe |
| 2 | moderate deposits, visible to the naked eye |
| 3 | abundance of soft matter |

**PlI = mean of the surface scores** (aggregated by the count of surfaces at each score).

Advisory bands (vary by source): 0 excellent; 0.1–0.9 good; 1.0–1.9 fair; 2.0–3.0 poor.

## Posture (spec-v97)

Measures plaque to guide oral-hygiene instruction; it does not diagnose periodontal disease, and
the interpretation bands are advisory. It supports rather than replaces the clinical dental and
periodontal examination.

## Files

- `lib/silness-loe-plaque-index-v723.js` — `silnessLoePlaqueIndex()`, `PLAQUE_INDEX_NOTE`.
- `views/group-v723.js` (RV723) — four surface-count inputs; a11y-checked.
- `mcp/adapters/silness-loe-plaque-index-v723.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, per-surface scores + bands, related (loe-silness-gingival-index,
  plaque-control-record).
- `test/unit/silness-loe-plaque-index.test.js` — 5 tests (worked example 1.3, weighted mean,
  all-zero, bands, validation).
- `docs/spec-v723.md` (this file).

## Sourcing (spec-v97)

Silness J, Löe H. Periodontal disease in pregnancy. II. *Acta Odontol Scand.* 1964;22:121-135
(PMID 14158464). The per-surface 0–3 criteria were confirmed across two independent index
references; the interpretation bands vary by source and are presented as advisory.
