# spec-v725.md — Glickman furcation involvement grade

> Status: **SHIPPED (2026-08-13).** Builds the `glickman-furcation` tile. Catalog **1555 → 1556**, group G.

## Why

Dentistry vein (periodontology). The Glickman furcation classification grades interradicular
bone loss in multi-rooted teeth — a clean decision-logic code classifier. Pairs with Miller
recession.

## What it does

| Grade | Finding |
| --- | --- |
| I | incipient; suprabony soft-tissue pocket, **interradicular bone intact** |
| II | partial / cul-de-sac; horizontal bone loss into the furcation, **not** through-and-through |
| III | **through-and-through** defect, but occluded by gingiva (**not** clinically visible) |
| IV | through-and-through defect with gingiva receded, **clinically visible** |

Returns the grade code.

## Posture (spec-v97)

Grades the defect to guide prognosis and the treatment plan; it does not prescribe a procedure.
It supports rather than replaces the periodontal examination.

## Files

- `lib/glickman-furcation-v725.js` — `glickmanFurcation()`, `GLICKMAN_NOTE`.
- `views/group-v725.js` (RV725) — one select (furcation finding); a11y-checked, no innerHTML.
- `mcp/adapters/glickman-furcation-v725.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, grades + use, related (miller-gingival-recession).
- `test/unit/glickman-furcation.test.js` — 5 tests (Grade I/II/III/IV, required+validated finding).
- `docs/spec-v725.md` (this file).

## Sourcing (spec-v97)

Glickman I. *Clinical Periodontology.* WB Saunders; 1953. The four grade definitions
(incipient / partial cul-de-sac / through-and-through occluded / through-and-through visible)
were confirmed against a comprehensive furcation review (PMC6162379) and an OHI-S/periodontology
reference, which agree.
