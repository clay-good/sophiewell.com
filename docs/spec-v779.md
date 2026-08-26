# spec-v779.md — Schofield basal metabolic rate equations

> Status: **SHIPPED (2026-08-26).** Builds the `schofield` tile. Catalog **1570 → 1571**, group E.

## Why

The predictive-energy family was five tiles deep — `mifflin-st-jeor`, `harris-benedict`,
`katch-mcardle`, `penn-state-ree`, `ireton-jones` — and missing the one that FAO, WHO and UNU
actually adopted as the reference standard, and that most UK dietetic practice starts from.
Schofield is also the only one of the six that needs **no height**, which matters when you are
estimating for someone who cannot stand.

## What it does

BMR in kcal/day from weight alone, with a separate coefficient and constant per sex and per
age band. **W = weight in kilograms.**

| Age band | Male | Female |
| --- | --- | --- |
| under 3 | 59.512 W − 30.4 | 58.317 W − 31.1 |
| 3–10 | 22.706 W + 504.3 | 20.315 W + 485.9 |
| 10–18 | 17.686 W + 658.2 | 13.384 W + 692.6 |
| 18–30 | 15.057 W + 692.2 | 14.818 W + 486.6 |
| 30–60 | 11.472 W + 873.1 | 8.126 W + 845.6 |
| over 60 | 11.711 W + 587.7 | 9.082 W + 658.5 |

Bands are **closed at the bottom and open at the top**, so an age of exactly 30 uses the
30-to-60 equation. A test pins 29 → 18–30, 30 → 30–60, 60 → over 60, because a boundary that
drifts silently changes the answer by hundreds of kcal.

**Worked example:** 70 kg male aged 40 → 11.472 × 70 + 873.1 = **1676 kcal/day**.

Weight uses the shared kg|lb toggle, canonical kg first so the documented example reproduces
byte-identically.

## Posture (spec-v97)

A regression estimate of the **basal** rate with a known error against indirect calorimetry,
not a measured value. Activity, stress and injury factors are applied to it separately by the
dietitian; this tile applies none of them, and the energy prescription stays with the
dietitian and local protocol.

## Files

- `lib/schofield-v779.js` — `schofield()`, `SCHOFIELD_NOTE`.
- `views/group-v779.js` (RV779) — weight (kg|lb), age, sex; a11y-checked.
- `mcp/adapters/schofield-v779.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, the full coefficient table, related (mifflin-st-jeor, harris-benedict, katch-mcardle).
- `test/unit/schofield.test.js` — 6 tests (worked example, male vs female coefficients, band boundaries, every band resolves, the negative under-3 constant, missing-input fallbacks).
- `docs/spec-v779.md` (this file).

## Sourcing (spec-v97)

Schofield WN. *Hum Nutr Clin Nutr.* 1985;39 Suppl 1:5-41 (PMID 4044297). All twelve
coefficient/constant pairs were confirmed digit-for-digit against two independent
reproductions of the kcal/day weight-only table, which agreed on every one. The tile ships
kcal/day only: the original is published in MJ/day, and converting the kcal form back would
produce values that differ slightly from the separately rounded published MJ equations.
