# v12 audit - slic-score

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Vaccaro AR, Hulbert RJ, Patel AA, et al. The subaxial cervical spine injury classification system. Spine. 2007;32(21):2365-2374 (cross-verified against PMC7491911 (Classification in Brief), UW Emergency Radiology, and an e-neurospine review).

`lib/spine-v146.js slicScore()` consumes morphology, disco-ligamentous-complex
integrity, and neurologic status, plus a +1 continuous-cord-compression
modifier, and computes the total 0-10 with the published operative/nonoperative
triage. Class A.

## Source-governance notes
- Morphology (none 0 / compression 1 / burst 2 / distraction 3 / rotation-
  translation 4), DLC (intact 0 / indeterminate 1 / disrupted 2), neurology
  (intact 0 / root 1 / complete cord 2 / incomplete cord 3). Total 0-10.
- The +1 modifier for continuous cord compression with an ongoing deficit is
  ADDITIVE on top of the neuro status, not a fifth neuro option -- it is what
  lets the score reach 10. Implemented as a separate checkbox.
- Triage: <= 3 nonoperative, 4 indeterminate, >= 5 operative.
- Incomplete cord (3) scores HIGHER than complete cord (2); a unit test asserts
  it.
- A blank category renders the complete-the-fields fallback.

## Boundary worked examples added
- total 3 -> nonoperative; +1 modifier -> 4 indeterminate (3->4 flip).
- 4 -> indeterminate; 5 -> operative (4->5 flip).
- incomplete cord (3) > complete cord (2); ceiling 10 with modifier.

## Edge-input handling notes
- Three required selects + one checkbox coerced through onFlag(); unrecognized
  keys ignored. Total is a bounded integer 0-10 -- no non-finite path. Covered
  by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Three labeled selects (leading blank placeholder) + one labeled checkbox;
  output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
