# spec-v694.md — Cobb angle (scoliosis severity)

> Status: **SHIPPED (2026-08-10).** Builds the `cobb-angle` tile. Catalog **1524 → 1525**, group G.

## Why

The catalog ships the Risser sign (skeletal maturity) but not the **Cobb angle** — the single most-used
radiographic measure of scoliosis curve magnitude and the number that anchors every scoliosis management
decision. The two are read together (maturity + curve size drive the bracing question), so this completes a
natural pair.

## What it does

Interprets a measured Cobb angle (degrees):

| Cobb angle | Category |
| --- | --- |
| < 10° | not scoliosis (minor spinal asymmetry) |
| 10–24° | mild scoliosis |
| 25–44° | moderate scoliosis |
| ≥ 45° | severe scoliosis |

A curve of **≥ 10°** defines scoliosis (Scoliosis Research Society). Management context is surfaced as advisory:
bracing is typically considered for ~25–40° curves in a skeletally immature patient, surgery for ~45–50°+.

## Posture (spec-v97)

The severity bands are agreed, but **management cut-points are maturity- and guideline-dependent, not a fixed
function of the angle** — so the tile reports the band and states the bracing/surgery thresholds as advisory,
pointing to the Risser sign for the skeletal-maturity input. It interprets the measured angle; it does not
decide treatment.

## Files

- `lib/cobb-angle-v694.js` — `cobbAngle()`, `COBB_NOTE`.
- `views/group-v694.js` (RV694) — one angle number input; a11y-checked, no innerHTML, no network.
- `mcp/adapters/cobb-angle-v694.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, definition/severity/management bands, related (`risser-sign`).
- `test/unit/cobb-angle.test.js` — 7 tests (bands, exact 10/25/45 boundaries, scoliosis flag, abnormal ≥ 25,
  bracing/surgery detail, worked 30° example, required 0–180 input).
- `docs/spec-v694.md` (this file).

## Sourcing (spec-v97)

Cobb JR. Outline for the study of scoliosis. *Instr Course Lect.* 1948;5:261-275. The ≥ 10° scoliosis
definition and the mild/moderate/severe bands follow Scoliosis Research Society usage; the bracing (~25–40° in
skeletally immature patients) and surgery (~45–50°+) thresholds are widely taught but guideline- and
maturity-dependent, so they are presented as advisory rather than as fixed cut-offs.
