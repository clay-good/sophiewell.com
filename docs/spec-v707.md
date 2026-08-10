# spec-v707.md — Amsler-Krumeich keratoconus classification

> Status: **SHIPPED (2026-08-10).** Builds the `amsler-krumeich` tile. Catalog **1537 → 1538**, group G.

## Why

The catalog had ophthalmic conversion tools (visual acuity, spherical equivalent) but no
**keratoconus staging**. The Amsler-Krumeich classification is the classic four-stage severity
grade. Whole-concept gap.

## What it does

A decision rule: the stage is the **most advanced** single parameter (worst-parameter-wins).

| Parameter | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
| --- | --- | --- | --- | --- |
| Mean central K (D) | < 48 | 48–53 | 54–55 | > 55 |
| Thinnest thickness (µm) | > 500 | 400–500 | 200–400 | < 200 |
| Myopia + astigmatism (D) | < 5 | 5–<8 | 8–10 | > 10 / not measurable |
| Central scarring | — | — | — | present |

Overall stage = the maximum single-parameter stage (1 mild → 4 advanced). Mean K and thinnest
thickness are required; refraction is optional (it is "not measurable" in stage 4).

## Posture (spec-v97)

Grades severity to guide management; it does not by itself select a treatment. It supports rather
than replaces the full corneal-tomography assessment and clinical judgment.

## Files

- `lib/amsler-krumeich-v707.js` — `amslerKrumeich()`, `AMSLER_KRUMEICH_NOTE`.
- `views/group-v707.js` (RV707) — two required numbers, an optional refraction, a scar checkbox.
- `mcp/adapters/amsler-krumeich-v707.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, per-parameter bands, related (visual-acuity-converter,
  spherical-equivalent).
- `test/unit/amsler-krumeich.test.js` — 6 tests (worked example stage 2, worst-parameter-wins,
  K bands, thickness bands, scar→4, validation).
- `docs/spec-v707.md` (this file).

## Sourcing (spec-v97)

Krumeich JH, Daniel J, Knulle A. Live-epikeratophakia for keratoconus. *J Cataract Refract Surg.*
1998;24(4):456-463; the numeric stage boundaries were taken verbatim from Kamiya K, et al. (*Sci
Rep.* 2018;8:12852) and a keratoconus-classification reference, which report identical thresholds
(K < 48 / 48–53 / 54–55 / > 55; thinnest ≥ 500 / 400–500 / 200–400 / < 200 µm; etc.).
