# spec-v717.md — Pederson Difficulty Index (impacted third molar)

> Status: **SHIPPED (2026-08-13).** Builds the `pederson-difficulty` tile. Catalog **1547 → 1548**, group G.

## Why

Third tile in the dentistry vein (oral-surgery). The Pederson index is the standard predictor of
surgical difficulty for impacted lower wisdom-tooth removal and a clean deterministic sum.

## What it does

Three radiographic parameters summed (3–10):

| Parameter | Values |
| --- | --- |
| Angulation (Winter) | mesioangular 1 / horizontal 2 / vertical 3 / distoangular 4 |
| Depth (Pell & Gregory) | Level A 1 / Level B 2 / Level C 3 |
| Ramus relationship / space (Pell & Gregory) | Class I 1 / Class II 2 / Class III 3 |

**Bands:** 3–4 slightly difficult; 5–6 moderately difficult; 7–10 very difficult.

## Posture (spec-v97)

Predicts difficulty to guide planning; it does not dictate technique or referral. Some sources
overlap the moderate/very-difficult boundary at 7 — a non-overlapping cut is used and the
ambiguity is disclosed. It supports rather than replaces the surgical assessment.

## Files

- `lib/pederson-difficulty-v717.js` — `pedersonDifficulty()`, `PEDERSON_NOTE`.
- `views/group-v717.js` (RV717) — three selects; a11y-checked, no innerHTML.
- `mcp/adapters/pederson-difficulty-v717.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, points + bands, related (dmft-caries).
- `test/unit/pederson-difficulty.test.js` — 5 tests (min 3, max 10, worked example 5, bands,
  validation).
- `docs/spec-v717.md` (this file).

## Sourcing (spec-v97)

Pederson GW. *Oral Surgery.* WB Saunders; 1988. The three-parameter point table (Winter
angulation + Pell & Gregory depth/ramus) and the 3–4 / 5–6 / 7–10 bands were confirmed against a
J Maxillofac Oral Surg meta-analysis (PMC8313603) and a Pederson-index reference; the point table
is universally agreed, and the moderate/very-difficult boundary ambiguity at 7 is disclosed
(non-overlapping cut used).
