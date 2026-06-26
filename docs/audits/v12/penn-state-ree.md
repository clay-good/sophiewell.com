# v12 audit - penn-state-ree

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Frankenfield D, Smith JS, Cooney RN. JPEN J Parenter Enteral Nutr. 2004;28(4):259-264; modified form Frankenfield DC et al. J Am Diet Assoc. 2009;109(9):1564-1569 (both forms, multipliers, constants, and the branch rule cross-verified against the PMC reprint Table 1 and the Academy of Nutrition & Dietetics Evidence Analysis Library; ≥ 2 sources, spec-v97).

`lib/nutrition-energy-v152.js pennStateRee()` consumes weight, height, age, sex,
Tmax (°C), and ventilator minute ventilation (L/min), computes the Mifflin-St Jeor
REE internally, and applies the Penn State weighting. Class A.

## Source-governance notes
- Standard (2003b): RMR = Mifflin·0.96 + Tmax·167 + Ve·31 − 6212.
- Modified (2010): RMR = Mifflin·0.71 + Tmax·85 + Ve·64 − 3085 — applies ONLY when
  BMI ≥ 30 AND age ≥ 60. This is a THREE-way split: an obese patient under 60 still
  uses the standard form (a routing trap, unit-tested on both sides).
- Mifflin is computed from ACTUAL body weight; Tmax = max temperature prior 24 h.

## Boundary worked examples added
- standard branch 70/175/40 → RMR 2031; modified branch 100/165/65 → 2000;
  obese-but-young (100/165/45) routes to standard; blank input → valid:false.

## Edge-input handling notes
- All five inputs finite-checked; a blank value surfaces a complete-the-fields
  fallback rather than NaN; covered by the spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Six labeled inputs/selects; output aria-live. 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
