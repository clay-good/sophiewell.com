# spec-v712.md — MNA-SF (Mini Nutritional Assessment Short Form)

> Status: **SHIPPED (2026-08-10).** Builds the `mna-sf` tile. Catalog **1542 → 1543**, group G.

## Why

The catalog had MUST and NRS-2002 nutritional-risk screens but not the **MNA-SF** — the standard
six-item malnutrition screen for older adults. Cluster gap.

## What it does

Six items summed to **0–14** (neutral labels only — the MNA is a trademark with copyrighted item
wording):

| Item | Range |
| --- | --- |
| Food-intake decline (3 mo) | 0–2 |
| Weight loss (3 mo) | 0–3 |
| Mobility | 0–2 |
| Psychological stress or acute disease (3 mo) | 0 / 2 |
| Neuropsychological problems | 0–2 |
| BMI (or calf circumference if BMI unavailable) | 0–3 |

**Bands:** 12–14 normal nutritional status; 8–11 at risk of malnutrition; 0–7 malnourished.

## Posture (spec-v97)

A screening aid to flag nutritional risk and prompt fuller assessment, not a diagnosis. Only
neutral item labels are used. It supports rather than replaces clinical and dietetic judgment.

## Files

- `lib/mna-sf-v712.js` — `mnaSf()`, `MNA_SF_NOTE`.
- `views/group-v712.js` (RV712) — six per-item selects; a11y-checked, no innerHTML.
- `mcp/adapters/mna-sf-v712.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + bands, related (must-nutrition, nrs2002).
- `test/unit/mna-sf.test.js` — 5 tests (max 14, worked example 11, bands, acute-stress 0/2 only,
  validation).
- `docs/spec-v712.md` (this file).

## Sourcing (spec-v97)

Kaiser MJ, Bauer JM, Ramsch C, et al. Validation of the Mini Nutritional Assessment Short-Form
(MNA-SF). *J Nutr Health Aging.* 2009;13(9):782-788 (PMID 19812868). The six items, per-item
point values (including the BMI-or-calf item F), and the 12–14 / 8–11 / 0–7 bands were confirmed
against the Nestlé MNA form and a Hartford Institute "Try This" reproduction, which agree; only
the scoring method is implemented, with neutral labels.
