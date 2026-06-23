# v12 audit - corrected-age

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Engle WA; American Academy of Pediatrics Committee on Fetus and Newborn. Age terminology during the perinatal period. Pediatrics. 2004;114(5):1362-1364. Definition cross-verified across independent reproductions.

`lib/peds-growth-v141.js correctedAge()` computes corrected (adjusted) gestational
age = chronological age - (40 - gestational age at birth in weeks). Class A
(Clinical Math & Conversions, Group E).

## Source-governance notes
- Uses a 40-week term reference. No correction for births at or beyond 40 weeks.
- Conventionally applied through about 24 months; the band adds that note beyond
  24 months chronological.
- Reports the corrected age; the developmental interpretation stays with the
  clinician.

## Boundary worked examples added
- 28-week preemie at 6 mo chronological -> 3.2 mo corrected (12 wk prematurity).
- term birth at 40 wk -> no correction.
- 30 mo chronological -> the >24-month convention note.
- a small chronological age never yields a corrected age below 0.
- missing input / GA outside 22-42 wk -> valid:false.

## Edge-input handling notes
- Weeks-to-months conversion uses 365.25/12/7 (~4.348 weeks per calendar month).
  A negative chronological age or an implausible GA surfaces a complete-the-fields
  fallback; corrected age is floored at 0.

## A11y / keyboard notes
- Two labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
