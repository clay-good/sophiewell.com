# v12 audit - cisne

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Carmona-Bayonas A, et al. J Clin Oncol. 2015;33(5):465-471. Cross-read against MDCalc CISNE and secondary calculators; all agree on the six weighted items and the 0 / 1-2 / >= 3 bands.

`lib/heme-v132.js cisne()` sums six weighted items to a 0-8 serious-complication risk for CLINICALLY STABLE febrile-neutropenia outpatients (the subgroup MASCC does not refine). Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- ECOG performance status >= 2 = 2; stress-induced hyperglycemia = 2; COPD = 1; chronic cardiovascular disease = 1; NCI mucositis grade >= 2 = 1; monocytes < 200/uL = 1.
- Bands: 0 low (~1.1%), 1-2 intermediate (~6.2%), >= 3 high (~36%). CISNE applies only to the stable subgroup; an unstable patient is high-risk by definition.

## Boundary worked examples added
- Crossing the >= 3 high band; 0 low vs 1 intermediate; the weighted ECOG/hyperglycemia items each = 2 (ECOG 1 does not score); max 8.

## Edge-input handling notes
- ECOG and mucositis are graded selects (0-4); monocytes a finite-guarded number; the rest yes/no. Any blank required field -> valid:false. abnormal = total >= 1.

## A11y / keyboard notes
- Two graded selects + three No/Yes selects + one number input; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
