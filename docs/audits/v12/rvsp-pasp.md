# v12 audit - rvsp-pasp

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Yock PG, Popp RL. Noninvasive estimation of right ventricular systolic pressure by Doppler ultrasound in patients with tricuspid regurgitation. Circulation. 1984;70(4):657-662 (cross-verified against the ASE 2015 RAP-estimation table and the POCUS101 right-ventricle reference; ≥ 2 sources, spec-v97).

`lib/echo-v158.js rvspPasp()` computes RV systolic pressure / PASP from the
tricuspid-regurgitation jet. Group E, Class A.

## Source-governance notes
- RVSP = 4·(TR Vmax)² + RAP, TR Vmax in m/s (simplified Bernoulli); equals PASP
  absent pulmonic stenosis / RVOT obstruction.
- RAP from the IVC (ASE 2015): small/collapsing 3, intermediate 8,
  dilated/non-collapsing 15 mmHg — a fixed three-value select.
- A resting PASP above ≈ 35 mmHg is flagged for further PH evaluation.

## Boundary worked examples added
- the tile example (TR 2.8 + RAP 8 → 39.4 mmHg, elevated); a low-normal 19 mmHg
  not flagged; a high jet with dilated IVC (79 mmHg); RAP outside {3,8,15} or a
  blank TR → valid:false.

## Edge-input handling notes
- The square term is exercised at edge values by the spec-v59 fuzz harness with
  no overflow-to-Infinity leak; RAP is restricted to the three published values.

## A11y / keyboard notes
- One labelled number input + a RAP select; output aria-live. 320px sweep, no
  horizontal scroll.

## Defects opened
- none

## Status
- PASS
