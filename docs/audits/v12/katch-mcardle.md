# v12 audit - katch-mcardle

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Katch FI, McArdle WD. Nutrition, Weight Control, and Exercise (lean-body-mass BMR equation), cross-verified against two independent calculator/physiology references (Omni Calculator, Medicine LibreTexts); ≥ 2 sources, spec-v97.

`lib/nutrition-energy-v152.js katchMcArdle()` computes BMR = 370 + 21.6·LBM(kg);
LBM is entered directly or derived from weight and body-fat %. Class A.

## Source-governance notes
- Constants 370 and 21.6 confirmed across two sources.
- Body-fat → LBM path range-guarded 0 < BF% < 100; the direct-LBM input is offered
  to avoid the derivation entirely. A non-positive LBM surfaces a fallback.

## Boundary worked examples added
- 80 kg / 20% fat → LBM 64 → BMR 1752; direct-LBM path matches; activity → TDEE;
  body-fat out-of-range (0, 100, −5) guarded; blank input → valid:false.

## Edge-input handling notes
- The body-fat derivation is finite-checked and range-guarded; covered by the
  spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- LBM, weight, body-fat inputs + activity select; output aria-live. 320px sweep,
  no hscroll.

## Defects opened
- none

## Status
- PASS
