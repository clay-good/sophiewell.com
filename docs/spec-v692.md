# spec-v692.md — Conley Fall Risk Scale

> Status: **SHIPPED (2026-08-10).** Builds the `conley-fall-risk` tile. Catalog **1522 → 1523**, group G.

## Why

The catalog had Morse, STRATIFY, Hendrich II, and Downton, but not the **Conley scale** — a
distinct, widely used general-hospital nursing fall-risk tool that pairs a brief patient
interview with nurse observation. Cluster gap.

## What it does

Six items, total **0–10**:

| Part | Item | Points |
| --- | --- | --- |
| Interview | Fallen in the last 3 months | 2 |
| Interview | Dizziness or vertigo | 1 |
| Interview | Urgency / incontinence on the way to the bathroom | 1 |
| Observation | Impaired judgment / lack of safety awareness | 3 |
| Observation | Agitation | 2 |
| Observation | Impaired gait (shuffling, wide base, unsteady) | 1 |

**≥ 2 (or any fall during the stay) → initiate fall-prevention strategies.**

## Posture (spec-v97)

A screening aid to prompt prevention, not a prediction of any individual fall. It supports
rather than replaces clinical judgment.

## Files

- `lib/conley-fall-risk-v692.js` — `conleyFallRisk()`, `CONLEY_NOTE`.
- `views/group-v692.js` (RV692) — six checkboxes; a11y-checked, no innerHTML.
- `mcp/adapters/conley-fall-risk-v692.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, point table + cutoff, related (morse-falls, downton-fall-risk,
  hendrich-ii).
- `test/unit/conley-fall-risk.test.js` — 5 tests (baseline 0, each weight, max 10, worked example 5,
  ≥ 2 cutoff).
- `docs/spec-v692.md` (this file).

## Sourcing (spec-v97)

Conley D, Schultz AA, Selvin R. The challenge of predicting patients at risk for falling:
development of the Conley Scale. *Medsurg Nurs.* 1999;8(6):348-354. The six item weights
(2/1/1 interview + 3/2/1 observation) and the ≥ 2 cut were confirmed against the Conley
development description and Guzzo AS, et al. (J Prev Med Hyg. 2015;56(2):E77-E81, PMC4718351),
which report the point table identically.
