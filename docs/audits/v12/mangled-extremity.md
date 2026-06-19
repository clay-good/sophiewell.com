# v12 audit - mangled-extremity

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Johansen K, Daines M, Howey T, Helfet D, Hansen ST Jr. J Trauma. 1990;30(5):568-573.

`lib/traumaclass-v109.js mangledExtremity()` sums skeletal energy (1-4), limb
ischemia (1-3, doubled when ischemia time > 6 h), shock (0-2), and age (0-2),
rendering the ischemia-time doubling when it applied. Class A.

## Boundary worked examples added
- missing skeletal or ischemia -> fallback.
- sums all four components.
- band flip: ischemia-time doubling pushes the total across 7.
- maximal score is bounded to 14.
- shock and age default to 0 when omitted.

## Cross-implementation differential
- Reference: the four component point sets and the ischemia-time doubling rule
  (raising the ceiling from 11 to 14) cross-verified against Wheelessonline, the
  EAST landmark-paper summary, and the Johansen 1990 paper. The >= 7 amputation
  threshold is the published cut. Match. PASS.

## Edge-input handling notes
- the score informs, never dictates, salvage vs amputation; total clamped to 0-14.

## A11y / keyboard notes
- Labeled selects for each component + an ischemia-time checkbox; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
