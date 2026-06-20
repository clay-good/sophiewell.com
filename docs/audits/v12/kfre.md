# v12 audit - kfre

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Tangri N, Stevens LA, Griffith J, et al. JAMA. 2011;305(15):1553-1559 (re-fetched; all coefficients, centering means, S0 values, and the mg/mmol ACR unit cross-read across the Ramspek JSN 2022 SDC verbatim eAppendix, PMC7395750, and PMC6894117).

`lib/nephro-v127.js kfre()` computes risk = 1 - S0^exp(sum of centered terms). The
4-variable North American model: age -0.2201 (age/10, mean 7.036), male +0.2467 (mean
0.5642), eGFR -0.5567 (eGFR/5, mean 7.222), ln(ACR mg/mmol) +0.4510 (mean 5.137); S0
2-yr 0.9750, 5-yr 0.9240. The 8-variable model re-estimates those four and adds albumin
/ phosphate / bicarbonate / calcium; S0 2-yr 0.9780, 5-yr 0.9301. Class A (fixed 2011
coefficients; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- 4-variable: age 60, male, eGFR 30, ACR 300 mg/g -> 3.3% 2-yr / 10% 5-yr.
- 8-variable mode uses the re-estimated coefficients + 4 extra labs.
- 8-variable missing an extra lab -> valid:false.
- risk bounded 0-1 under extreme inputs (overflow-safe).
- non-positive / missing / scalar -> valid:false (no ln(0)).

## Cross-implementation differential
- Reference: every 4-variable number verified exactly, including the POSITIVE sex
  coefficient (+0.2467, male=1), the divisors (age/10, eGFR/5), the centering constants,
  and the NORTH AMERICAN S0 pair (2-yr 0.9750, 5-yr 0.9240 -- NOT the 0.9365 non-NA
  value). ACR is in mg/mmol: a US spot UACR in mg/g is divided by 8.84 before the log
  (several libraries mislabel this -- the tile converts explicitly). Match. PASS.

## Edge-input handling notes
- A mode select (4/8); age/eGFR/ACR required positive; 8-var also needs the four extra
  labs. The pow(S0, exp(lp)) is overflow-safe (extreme lp -> probability 0 or 1, never
  NaN); risk clamped 0-1.

## A11y / keyboard notes
- One select + number inputs each labeled; output aria-live="polite". 320px sweep, no
  hscroll.

## Defects opened
- none
