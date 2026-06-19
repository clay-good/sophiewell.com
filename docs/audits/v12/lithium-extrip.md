# v12 audit - lithium-extrip

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Decker BS, Goldfarb DS, Dargan PI, et al; EXTRIP Workgroup. Clin J Am Soc Nephrol. 2015;10(5):875-887.

`lib/tox-v110.js lithiumExtrip()` walks the EXTRIP decision tree: ECTR recommended
for life-threatening features (any level) or impaired renal function with level
> 4.0 mmol/L; suggested for level > 5.0 mmol/L, confusion, or slow clearance.
It names the firing limb and returns the strongest recommendation. Class B
(docs/citation-staleness.md row).

## Boundary worked examples added
- band flip: level crosses 4.0 with renal impairment into the recommended limb.
- life-threatening features recommend ECTR irrespective of level.
- level > 5.0 alone is suggested, not recommended.
- renal impairment alone at a low level is not indicated.
- confusion and slow clearance are suggested limbs.

## Cross-implementation differential
- Reference: the recommended / suggested limbs cross-verified against the EXTRIP
  2015 recommendations. NOTE: the spec draft conflated the "expected time > 36 h"
  limb into the recommended set; the source places it (with level > 5.0 and
  confusion) in the SUGGESTED set, and the implementation follows the source
  (spec-v97 lesson: source governs over spec wording). PASS.

## Edge-input handling notes
- a decision aid, not a dialysis prescription; blank / negative level returns a
  surfaced fallback. The time-to-level limb is a clinician-entered flag, not a
  modeled kinetic (spec-v110 §7: no pharmacokinetic modeling).

## A11y / keyboard notes
- Labeled level input + six feature checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
