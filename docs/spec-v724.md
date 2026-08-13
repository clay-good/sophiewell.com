# spec-v724.md — Miller classification of gingival recession

> Status: **SHIPPED (2026-08-13).** Builds the `miller-gingival-recession` tile. Catalog **1554 → 1555**, group G.

## Why

Dentistry vein (periodontology). The Miller classification predicts the achievable root coverage
of a gingival-recession defect — a clean decision-logic code classifier.

## What it does

By the interdental loss and (for no loss) whether recession reaches the mucogingival junction
(MGJ):

| Class | Situation | Coverage |
| --- | --- | --- |
| I | recession **not** to the MGJ, no interdental loss | 100% |
| II | recession **to/beyond** the MGJ, no interdental loss | 100% |
| III | interdental loss **coronal** to the recession apex | partial |
| IV | interdental bone loss **apical** to the recession | none |

Returns the class code and the anticipated root coverage.

## Posture (spec-v97)

Predicts achievable root coverage to guide the surgical plan; it does not prescribe a technique.
It supports rather than replaces the periodontal assessment.

## Files

- `lib/miller-gingival-recession-v724.js` — `millerGingivalRecession()`, `MILLER_RECESSION_NOTE`.
- `views/group-v724.js` (RV724) — an interdental-loss select + a recession-extent select; a11y-checked.
- `mcp/adapters/miller-gingival-recession-v724.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, classes + use, related (loe-silness-gingival-index).
- `test/unit/miller-gingival-recession.test.js` — 5 tests (Class I/II/III/IV, conditional
  required recession-extent).
- `docs/spec-v724.md` (this file).

## Sourcing (spec-v97)

Miller PD Jr. A classification of marginal tissue recession. *Int J Periodontics Restorative
Dent.* 1985;5(2):8-13 (PMID 3858267). The four class definitions (MGJ relationship + interdental
loss coronal/apical to the recession) and the 100%/100%/partial/none coverage prognoses were
confirmed against an OHI-S reference and a Kumar & Masamatti comparison paper (PMC4645544).
