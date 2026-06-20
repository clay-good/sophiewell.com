# v12 audit - peld-score

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: McDiarmid SV, Anand R, Lindblad AS; SPLIT Research Group. Transplantation. 2002;74(2):173-181 (re-fetched; coefficients, the raw-vs-UNOS x10 convention, and the 1.0 lab floor cross-read across Wikipedia/UNOS docs, OPTN policy, and MDCalc).

`lib/hep-v125.js peldScore()` computes 4.80 x ln(bilirubin) + 18.57 x ln(INR) - 6.87
x ln(albumin) + 4.36 (age < 1 yr) + 6.67 (growth failure), albumin g/dL and bilirubin
mg/dL, each lab floored at 1.0 before the log, rounded to an integer. Class A (fixed
2002 coefficients; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- albumin 3.0, bilirubin 4.0, INR 1.5, age < 1 -> 11.
- growth-failure bonus: base 7 -> 13 (+6.67).
- mild disease floored labs -> finite (can be negative in the raw form, never NaN).
- non-positive / missing -> valid:false (no ln(0)).

## Cross-implementation differential
- Reference: coefficients 4.80/18.57/-6.87/4.36/6.67 confirmed; the RAW McDiarmid
  form is used (no x10 -- that is the UNOS allocation presentation only); labs floored
  at 1.0 (OPTN convention). Match. PASS.

## Edge-input handling notes
- Three number inputs (albumin/bilirubin/INR) floored at 1.0, two checkboxes; ln
  guarded; a scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Three labeled number inputs + two labeled checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
