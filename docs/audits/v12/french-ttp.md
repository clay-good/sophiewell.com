# v12 audit - french-ttp

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Coppo P, et al. PLoS One. 2010;5(4):e10208. Cross-read against MDCalc and the PLASMIC-cohort cross-application; all agree on the three 1-point variables.

`lib/heme-v132.js frenchTtp()` sums three 1-point variables to a 0-3 pretest rule for severe acquired ADAMTS13 deficiency. Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- 1 point each: platelet < 30 x10^9/L; creatinine <= 2.26 mg/dL (<= 200 umol/L); ANA positive.
- The creatinine boundary is INCLUSIVE (<= 200 umol/L) in the source; this governs over the spec draft's strict "<". A creatinine of exactly 2.26 mg/dL scores the point (boundary test added).
- Score 0 makes severe deficiency very unlikely; 2-3 makes it highly likely.

## Boundary worked examples added
- 0 vs 2 probability flip; the inclusive 2.26 boundary (2.26 scores, 2.27 does not); a single criterion = intermediate; all three = max 3.

## Edge-input handling notes
- Numeric thresholds with finite guards; ANA an explicit yes/no. Any blank -> valid:false. abnormal = total >= 2.

## A11y / keyboard notes
- Two labeled number inputs + one No/Yes select; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
