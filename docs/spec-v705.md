# spec-v705.md — PI-LL mismatch (spinopelvic sagittal alignment)

> Status: **SHIPPED (2026-08-10).** Builds the `pi-ll-mismatch` tile. Catalog **1535 → 1536**, group G.

## Why

The catalog had spine tiles (Cobb angle, Meyerding) but not the **PI-LL mismatch** — the core
spinopelvic sagittal-alignment parameter and an SRS-Schwab classification modifier that anchors
adult-spinal-deformity surgical planning. Whole-concept gap.

## What it does

```
PI-LL mismatch = pelvic incidence (PI) − lumbar lordosis (LL)   [degrees]
```

SRS-Schwab sagittal modifier (by absolute mismatch):

| |PI−LL| | Modifier |
| --- | --- |
| < 10° | 0 (well aligned) |
| 10–20° | + (moderate) |
| > 20° | ++ (marked) |

Surgical realignment generally targets PI-LL within about ±10°.

## Posture (spec-v97)

One sagittal-alignment parameter among several (with SVA and pelvic tilt); an **age-adjusted**
target allows a larger acceptable mismatch in older patients. It supports rather than replaces the
full deformity assessment and surgical planning.

## Files

- `lib/pi-ll-mismatch-v705.js` — `piLlMismatch()`, `PI_LL_NOTE`.
- `views/group-v705.js` (RV705) — two degree number inputs; a11y-checked.
- `mcp/adapters/pi-ll-mismatch-v705.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + modifier bands, related (cobb-angle,
  meyerding-spondylolisthesis).
- `test/unit/pi-ll-mismatch.test.js` — 5 tests (worked example 25°/++, well-aligned 0, modifier
  bands, negative mismatch, validation).
- `docs/spec-v705.md` (this file).

## Sourcing (spec-v97)

Schwab F, Ungar B, Blondel B, et al. Scoliosis Research Society-Schwab adult spinal deformity
classification: a validation study. *Spine.* 2012;37(12):1077-1082 (PMID 22045006). The PI−LL
definition and the 0 / + / ++ modifier cut-points (< 10 / 10–20 / > 20°) were confirmed against
the SRS-Schwab classification and an independent reproduction, which agree.
