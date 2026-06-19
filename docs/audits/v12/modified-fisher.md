# v12 audit - modified-fisher

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Frontera JA, Claassen J, Schmidt JM, et al. Prediction of symptomatic vasospasm after subarachnoid hemorrhage: the modified Fisher scale. Neurosurgery. 2006;59(1):21-27 (re-fetched; the original Table 1 grade criteria and Table 2 vasospasm percentages read directly, cross-checked with Deranged Physiology, MDCalc, and Radiopaedia).

`lib/neuro-v118.js modifiedFisher()` grades the radiographic blood burden after
aneurysmal SAH as grade 0-4 from cisternal SAH thickness (none/thin/thick) and
the presence of intraventricular hemorrhage: 0 = no SAH or IVH, 1 = thin SAH no
IVH, 2 = thin SAH + IVH, 3 = thick SAH no IVH, 4 = thick SAH + IVH. Class A
(fixed grading rule; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- no SAH, no IVH -> grade 0, the reference grade.
- thin SAH, no IVH -> grade 1, ~24%.
- thin SAH with IVH -> grade 2, ~33%.
- thick SAH, no IVH -> grade 3, ~33% (abnormal band).
- thick SAH with IVH -> grade 4, ~40% (vasospasm-band case).
- isolated IVH with no SAH -> grade 0 with the out-of-scope note.

## Cross-implementation differential
- Reference: Frontera 2006 Table 2 symptomatic-vasospasm incidence is 24% (g1),
  33% (g2 and g3, OR 1.58 vs 1.59 -- essentially equal), 40% (g4); grade 0
  (n=20, 2% of the cohort) is the reference stratum with no standalone published
  rate, so the tile labels it the lowest/reference grade and invents no
  percentage. Frontera deliberately applied a subjective thin/thick visual read
  ("Explicit criteria for classifying blood as thick or thin ... were not
  applied"); the < 1 mm / >= 1 mm convention is surfaced as a downstream
  calculator convention in the renderer text, not hard-coded as a measurement.
  Match. PASS.

## Edge-input handling notes
- An unknown SAH key defaults to none (grade 0); isolated IVH with no SAH falls
  outside the modified-Fisher SAH grading, so it reports grade 0 with a note
  rather than inventing a grade. A scalar / non-object fuzz arg yields a valid
  grade 0, never a NaN.

## A11y / keyboard notes
- One labeled select + one labeled checkbox; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
