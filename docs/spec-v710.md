# spec-v710.md — G8 (Geriatric 8) screening tool

> Status: **SHIPPED (2026-08-10).** Builds the `g8-geriatric` tile. Catalog **1540 → 1541**, group G.

## Why

The catalog had frailty tools (Edmonton Frail Scale, ECOG/Karnofsky) but not the **G8** — the
standard short screen used in geriatric oncology to decide who needs a full comprehensive
geriatric assessment (CGA). Axis gap.

## What it does

Eight items summed to **0–17** (higher = better; neutral labels only, as several items derive
from the copyrighted MNA):

| Item | Range |
| --- | --- |
| Food-intake decline (3 mo) | 0–2 |
| Weight loss (3 mo) | 0–3 |
| Mobility | 0–2 |
| Neuropsychological problems | 0–2 |
| Body mass index | 0–3 |
| > 3 medications/day | 0–1 |
| Self-rated health vs peers | 0 / 0.5 / 1 / 2 |
| Age | 0–2 |

**A total ≤ 14 is a positive screen** (~90% sensitive, ~60% specific) and warrants a full CGA.

## Posture (spec-v97)

Decides who needs a deeper assessment; it is not a diagnosis. Only neutral item labels are used
(no copyrighted MNA wording). It supports rather than replaces clinical judgment.

## Files

- `lib/g8-geriatric-v710.js` — `g8Geriatric()`, `G8_NOTE`.
- `views/group-v710.js` (RV710) — eight per-item selects (one carries 0.5); a11y-checked.
- `mcp/adapters/g8-geriatric-v710.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + cut-point, related (edmonton-frail-scale, ecog-karnofsky).
- `test/unit/g8-geriatric.test.js` — 5 tests (max 17, worked example 13, the 14 cut, the 0.5
  half-point, per-item value-set enforcement).
- `docs/spec-v710.md` (this file).

## Sourcing (spec-v97)

Bellera CA, Rainfray M, Mathoulin-Pelissier S, et al. Screening older cancer patients: first
evaluation of the G-8 geriatric screening tool. *Ann Oncol.* 2012;23(8):2166-2172 (PMID
22250183). The eight items, per-item point values (including the 0.5 self-rated-health option),
and the ≤ 14 cut-point were taken verbatim from the eviQ/Cancer Institute NSW G8 reproduction and
cross-checked against the ONCODAGE description, which agree.
