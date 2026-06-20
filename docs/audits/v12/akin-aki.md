# v12 audit - akin-aki

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Mehta RL, Kellum JA, Shah SV, et al; AKIN. Crit Care. 2007;11(2):R31 (re-fetched; stages cross-read across the Oxford CKJ review Table 3, ClinCaseQuest, and MDCalc).

`lib/nephro-v127.js akinAki()` returns the worse of the creatinine criterion (stage 1
rise >= 0.3 mg/dL or x1.5-2; stage 2 x2-3; stage 3 x3, or creatinine >= 4.0 with a rise
>= 0.5, or RRT) and the urine-output criterion. RRT initiation forces stage 3. Class A
(fixed AKIN criteria; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- creatinine x3.5 -> stage 3.
- RRT initiation forces stage 3 (governed by renal replacement therapy).
- absolute rise >= 0.3 mg/dL -> stage 1.
- x2 -> stage 2.
- nothing entered / scalar -> valid:false.

## Cross-implementation differential
- Reference: the 48-hour window, the >= 0.3 mg/dL absolute-rise stage-1 limb, and the
  fold-increase bands confirmed; the stage-3 acute-rise limb is >= 0.5 (AKIN), distinct
  from RIFLE's > 0.5; RRT forces stage 3. The stage is the worse of the creatinine and
  urine-output criteria. Match. PASS.

## Edge-input handling notes
- Baseline/current creatinine number inputs + an RRT checkbox + a urine-output select; a
  scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Two labeled number inputs + one labeled checkbox + one labeled select; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
