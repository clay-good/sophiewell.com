# spec-v689.md — Elderly Mobility Scale (EMS)

> Status: **SHIPPED (2026-08-10).** Builds the `elderly-mobility-scale` tile. Catalog **1519 → 1520**, group G.

## Why

The catalog had TUG, Berg Balance, Tinetti, functional reach, and gait speed, but not the
**Elderly Mobility Scale** — a seven-item performance measure of functional mobility used in
rehabilitation to gauge safety for independent living. Cluster gap.

## What it does

Seven items summed to a maximum of **20**:

| Item | Top score |
| --- | --- |
| Lying to sitting | 2 |
| Sitting to lying | 2 |
| Sit to stand (independent < 3 s = 3) | 3 |
| Standing (and reach within arm's length) | 3 |
| Gait (independent incl. sticks = 3) | 3 |
| Timed 6 m walk (< 15 s = 3 / 16–30 s = 2 / > 30 s = 1) | 3 |
| Functional reach (> 20 cm = 4 / 10–20 cm = 2 / < 10 cm = 0) | 4 |

**Bands:** 14–20 independent in basic ADLs (generally safe for home); 10–13 borderline (needs
some help with maneuvers); < 10 dependent (needs help with basic ADLs). The functional-reach
item scores **0/2/4** (not 0/1/2) — the version that sums to 20.

## Posture (spec-v97)

A functional-mobility measure to guide rehabilitation and discharge planning. It supports rather
than replaces clinical judgment.

## Files

- `lib/elderly-mobility-scale-v689.js` — `elderlyMobilityScale()`, `EMS_NOTE`.
- `views/group-v689.js` (RV689) — seven per-item selects; a11y-checked, no innerHTML.
- `mcp/adapters/elderly-mobility-scale-v689.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, item table + bands, related (tug, berg-balance, tinetti-poma).
- `test/unit/elderly-mobility-scale.test.js` — 5 tests (max 20, worked example 14, bands, per-item
  point-set enforcement, validation).
- `docs/spec-v689.md` (this file).

## Sourcing (spec-v97)

Smith R. Validation and reliability of the Elderly Mobility Scale. *Physiotherapy.*
1994;80(11):744-747 (with the 1994 correction); further validation Prosser L, Canby A. *Clin
Rehabil.* 1997;11(4):338-343. Item points and bands cross-checked against the APTA EMS form and
the SRAlab Rehabilitation Measures database, which resolve the common secondary-source error on
functional reach (0/2/4, the version that sums to the published maximum of 20).
