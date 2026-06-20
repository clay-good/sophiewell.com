# v12 audit - rifle-aki

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Bellomo R, Ronco C, Kellum JA, et al; ADQI. Crit Care. 2004;8(4):R204-R212 (re-fetched; thresholds cross-read across the Oxford CKJ review Table 1, Deranged Physiology, and MDCalc).

`lib/nephro-v127.js rifleAki()` returns the worst of the creatinine/GFR criterion
(x1.5 Risk / x2 Injury / x3 Failure, or creatinine >= 4 mg/dL with an acute rise > 0.5)
and the urine-output criterion (selected category). Class A (fixed ADQI consensus
criteria; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- creatinine x2.2 -> Injury (governed by creatinine/GFR).
- worst-of: urine-output Failure overrides a mild creatinine.
- x1.5 -> Risk; x3 -> Failure.
- no criteria met handled; nothing entered -> valid:false.

## Cross-implementation differential
- Reference: x1.5/x2/x3 and the UO durations confirmed; the Failure acute-rise limb is
  STRICT > 0.5 mg/dL (RIFLE), deliberately distinct from AKIN's >= 0.5. The class is the
  worst of the two criteria. Match. PASS.

## Edge-input handling notes
- Baseline/current creatinine number inputs (ratio needs a positive baseline) + a
  urine-output select; a scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Two labeled number inputs + one labeled select; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none
