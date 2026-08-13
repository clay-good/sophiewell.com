# spec-v722.md — Löe-Silness Gingival Index (GI)

> Status: **SHIPPED (2026-08-13).** Builds the `loe-silness-gingival-index` tile. Catalog **1552 → 1553**, group G.

## Why

Dentistry vein. The Löe-Silness Gingival Index is the standard index of gingival inflammation
and a clean weighted mean. Pairs with the Plaque Control Record.

## What it does

Each surface is scored 0–3:

| Score | Finding |
| --- | --- |
| 0 | normal gingiva |
| 1 | mild inflammation; **no** bleeding on probing |
| 2 | moderate inflammation; **bleeds on probing** |
| 3 | severe inflammation; spontaneous bleeding |

**GI = mean of the surface scores.** The tile aggregates by the count of surfaces at each score.

| GI | Band |
| --- | --- |
| 0 | healthy |
| 0.1–1.0 | mild gingivitis |
| 1.1–2.0 | moderate gingivitis |
| 2.1–3.0 | severe gingivitis |

## Posture (spec-v97)

Grades gingival inflammation to guide oral-hygiene instruction; it does not diagnose
periodontitis. It supports rather than replaces the clinical periodontal examination.

## Files

- `lib/loe-silness-gingival-index-v722.js` — `loeSilnessGingivalIndex()`, `GINGIVAL_INDEX_NOTE`.
- `views/group-v722.js` (RV722) — four surface-count inputs; a11y-checked.
- `mcp/adapters/loe-silness-gingival-index-v722.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, per-surface scores + bands, related (plaque-control-record, bewe).
- `test/unit/loe-silness-gingival-index.test.js` — 5 tests (worked example 1.3, weighted mean,
  all-zero, bands, ≥1-surface validation).
- `docs/spec-v722.md` (this file).

## Sourcing (spec-v97)

Löe H, Silness J. Periodontal disease in pregnancy. I. *Acta Odontol Scand.* 1963;21:533-551
(PMID 14121956). The per-surface 0–3 criteria (with the bleeding-on-probing distinction at 2)
and the mild/moderate/severe bands were confirmed across two independent index references, which
agree.
