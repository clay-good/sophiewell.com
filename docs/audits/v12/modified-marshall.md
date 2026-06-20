# v12 audit - modified-marshall

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Banks PA, Bollen TL, Dervenis C, et al; Acute Pancreatitis Classification Working Group. Gut. 2013;62(1):102-111 (re-fetched; organ thresholds cross-read across PMC4760067 reproducing Banks Table 2, MSD/Merck, and GPnotebook).

`lib/gi-v126.js modifiedMarshall()` scores three organ systems 0-4: respiratory by
PaO2/FiO2 (> 400 = 0, 301-400 = 1, 201-300 = 2, 101-200 = 3, <= 101 = 4), renal by
creatinine mg/dL (< 1.4 = 0, 1.4-1.8 = 1, 1.9-3.6 = 2, 3.6-4.9 = 3, > 4.9 = 4), and
cardiovascular by a pre-banded SBP/fluid/pH selection. Organ failure is a score >= 2
in any assessed system. **Class B** -- the Revised Atlanta definition is revisable, so
a documentation-only docs/citation-staleness.md row is carried (on-publication
cadence); the Banks 2013 citation names the working group + journal, NOT an issuer
acronym, so the row is not gate-forced.

## Boundary worked examples added
- PaO2 200 / FiO2 100% + creatinine 2.0 -> respiratory 3, renal 2, organ failure.
- all assessed systems < 2 -> no organ failure.
- PaO2/FiO2 banding: 200 -> respiratory 3 (101-200).
- a blank system is not assessed (not scored 0).
- FiO2 = 0 guard and no-system-entered -> valid:false.

## Cross-implementation differential
- Reference: respiratory and renal bands confirmed; cardiovascular SBP/fluid/pH bands
  confirmed; organ-failure threshold >= 2 (Revised Atlanta) confirmed. The respiratory
  score-4 boundary uses <= 101 (the dominant Banks 2013 / MSD rendering). A blank
  system is reported not-assessed (the v93 glasgow-imrie blank-handling pattern), not
  scored 0. Match. PASS.

## Edge-input handling notes
- Respiratory needs both PaO2 and a positive FiO2 (ratio denominator guarded); renal
  needs a positive creatinine; cardiovascular is a 0-4 select with a not-assessed
  option. At least one assessed system required or valid:false.

## A11y / keyboard notes
- Three labeled number inputs + one labeled select; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none
