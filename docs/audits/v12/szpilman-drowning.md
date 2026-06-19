# v12 audit - szpilman-drowning

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Szpilman D. Chest. 1997;112(3):660-665 (re-fetched, cross-read with Szpilman's own reproduced classification table and StatPearls NBK430833).

`lib/enviro-v111.js szpilmanDrowning()` walks the published decision tree on
cough, auscultation, pulmonary edema, hypotension, and respiratory/cardiac arrest
and returns a single grade (Rescue, 1-6, or Dead) with the original-series
mortality and disposition. Class B (revisable decision tree; docs/citation-staleness.md row).

## Boundary worked examples added
- breathing, normal auscultation, no cough -> Rescue (~0%).
- band flip: adding a cough moves Rescue -> grade 1.
- band flip: rales in some fields -> grade 2 (~0.6%).
- pulmonary edema: hypotension flips grade 3 (~5.2%) -> grade 4 (~19.4%).
- arrest limbs: respiratory arrest -> grade 5 (~44%), cardiac arrest -> grade 6
  (~93%), deceased -> Dead.

## Cross-implementation differential
- Reference: the six grade limbs, the Rescue (no-cough) limb above grade 1, the
  Dead limb (submersion > 1 h / postmortem signs), and the original 1,831-case
  mortality (0 / 0.6 / 5.2 / 19.4 / 44 / 93%) cross-verified against the 1997
  paper and Szpilman's reproduced table. The 2020 reappraisal's different figures
  were deliberately NOT substituted. Match. PASS.

## Edge-input handling notes
- a triage / disposition aid carrying the spec-v50 §3 posture note; a missing
  status or (for a breathing victim) a missing auscultation finding returns a
  complete-the-fields fallback.

## A11y / keyboard notes
- Status select + auscultation select + two checkboxes, all labeled; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
