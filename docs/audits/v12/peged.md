# v12 audit - peged

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Kearon C, de Wit K, Parpia S, et al. N Engl J Med. 2019;381(22):2125-2134.

`lib/vte-v106.js peged()` sets the clinical pretest probability by the three-tier
Wells categorization and applies the probability-graduated D-dimer threshold (ng/mL
FEU): low excluded if < 1000, moderate if < 500, high always images. Class A (fixed
2019 rule).

## Boundary worked examples added
- low C-PTP, D-dimer 600 < 1000 -> PE excluded; 1000 -> imaging (band flip).
- moderate C-PTP threshold is 500 (499 excluded, 500 imaging).
- high C-PTP always images, no D-dimer needed (threshold null).
- partial input (tier without D-dimer, or D-dimer without tier) -> surfaced
  complete-the-fields fallback, never a verdict from a missing value.

## Cross-implementation differential
- Reference: the NEJM PEGeD rule cross-checked against MDCalc and REBEL EM. The
  derivation reported 0/1325 low/moderate-C-PTP rule-outs with VTE at 90 days.
  Match. PASS.

## Edge-input handling notes
- only 'low' | 'moderate' | 'high' are accepted tiers; anything else -> fallback.
- a negative D-dimer is rejected (treated as missing).

## A11y / keyboard notes
- Labeled select + number input; output aria-live="polite". 320px sweep passes with
  no horizontal scroll. Decision support, not an imaging order.

## Defects opened
- none

## Status
- PASS
