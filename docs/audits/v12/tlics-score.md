# v12 audit - tlics-score

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Vaccaro AR, Lehman RA Jr, Hurlbert RJ, et al. A new classification of thoracolumbar injuries. Spine. 2005;30(20):2325-2333 (cross-verified against PMC2779435, Scientific Reports s41598-020-76473-9, and the Radiology Assistant).

`lib/spine-v146.js tlicsScore()` consumes morphology, neurologic status, and
posterior-ligamentous-complex integrity and computes the total 0-10 with the
published operative/nonoperative triage. Class A.

## Source-governance notes
- Morphology (compression 1 / burst 2 / translational-rotational 3 / distraction
  4), neurology (intact 0 / nerve root 2 / complete cord 2 / incomplete cord 3 /
  cauda equina 3), PLC (intact 0 / indeterminate 2 / disrupted 3). Total 0-10.
- Triage: <= 3 nonoperative, 4 indeterminate (surgeon's discretion), >= 5
  operative.
- Incomplete cord (3) scores HIGHER than complete cord (2) by design -- it
  benefits more from decompression; not a transcription error. A unit test
  asserts incomplete > complete.
- A blank category renders the complete-the-fields fallback.

## Boundary worked examples added
- total 3 -> nonoperative; 4 -> indeterminate; 5 -> operative (4->5 flip).
- incomplete cord (3) > complete cord (2).
- ceiling 10.

## Edge-input handling notes
- Three required selects; unrecognized keys ignored. Total is a bounded integer
  0-10 -- no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Three labeled selects (leading blank placeholder); output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
