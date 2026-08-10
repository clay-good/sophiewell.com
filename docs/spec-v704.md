# spec-v704.md — Caton-Deschamps index (patellar height)

> Status: **SHIPPED (2026-08-10).** Builds the `caton-deschamps` tile. Catalog **1534 → 1535**, group G.

## Why

The catalog had the Insall-Salvati ratio for patellar height but not the **Caton-Deschamps
index**, its standard companion (which uses the patellar articular surface rather than the
tendon, so it is less affected by patellar-tendon abnormalities). Companion gap.

## What it does

```
Caton-Deschamps index (CDI) = A / B
  A = inferior patellar articular surface → anterosuperior tibial plateau (mm)
  B = patellar articular surface length (mm)
```

(Lateral knee radiograph at ~30° flexion.)

| CDI | Reading |
| --- | --- |
| ~0.6–1.2 | normal |
| < 0.6 | patella baja (infera) |
| > 1.2 | patella alta |

## Posture (spec-v97)

A radiographic measurement; it supports rather than replaces the full clinical and imaging
assessment.

## Files

- `lib/caton-deschamps-v704.js` — `catonDeschamps()`, `CATON_DESCHAMPS_NOTE`.
- `views/group-v704.js` (RV704) — two millimetre number inputs; a11y-checked.
- `mcp/adapters/caton-deschamps-v704.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + thresholds, related (insall-salvati-ratio,
  reimers-migration-percentage).
- `test/unit/caton-deschamps.test.js` — 4 tests (worked example 1.5 alta, formula, bands,
  validation).
- `docs/spec-v704.md` (this file).

## Sourcing (spec-v97)

Caton J, Deschamps G, Chambat P, Lerat JL, Dejour H. Patella infera. *Rev Chir Orthop.*
1982;68(5):317-325. The A/B definition and the < 0.6 / 0.6–1.2 / > 1.2 thresholds were confirmed
against a radiology reference (Radsource) and a peripheral review, which report the same
definition and cut-points.
