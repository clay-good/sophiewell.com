# v12 audit - fatty-liver-index

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Bedogni G, Bellentani S, Miglioli L, et al. The Fatty Liver Index: a simple and accurate predictor of hepatic steatosis in the general population. BMC Gastroenterol. 2006;6:33 (re-fetched; all five coefficients and units cross-read across the original PMC1636651 and the BMC full text).

`lib/hep-v124.js fattyLiverIndex()` computes y = 0.953 x ln(TG mg/dL) + 0.139 x BMI +
0.718 x ln(GGT U/L) + 0.053 x waist cm - 15.745, then FLI = 100 / (1 + e^-y) via an
overflow-safe sigmoid. Below 30 rules steatosis out; 60 or above rules it in. Class A
(fixed 2006 coefficients; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- TG 150, BMI 30, GGT 60, waist 100 -> FLI 80.84, ruled in.
- a lean profile -> FLI < 30, ruled out.
- extreme inputs cap FLI at 100 (overflow-safe), never Infinity.
- non-positive / missing -> valid:false (no ln(0)).

## Cross-implementation differential
- Reference: coefficients 0.953 / 0.139 / 0.718 / 0.053 / -15.745 and units (TG mg/dL,
  GGT U/L, waist cm, BMI kg/m2) confirmed; thresholds 30 / 60 confirmed. Match. PASS.

## Edge-input handling notes
- Four number inputs; TG and GGT must be strictly positive (ln guards); the logistic
  uses an overflow-safe 1/(1+e^-y) so extreme y returns 0 or 100, not Infinity.

## A11y / keyboard notes
- Four labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
