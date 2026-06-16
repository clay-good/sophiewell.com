# v12 audit - gap-ipf

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Ley B, Ryerson CJ, Vittinghoff E, et al. A multidimensional index and staging system for idiopathic pulmonary fibrosis. Ann Intern Med. 2012;156(10):684-691.

`lib/pulm-v91.js gapIpf()` sums Gender (male = 1), Age (> 65 = 2, > 60 = 1, <= 60 = 0), FVC% (> 75 = 0, 50-75 = 1, < 50 = 2) and DLCO% (> 55 = 0, 36-55 = 1, <= 35 = 2, cannot perform = 3), mapping the total to GAP stage I (0-3), II (4-5), III (6-8), each with the cited 1/2/3-year mortality. The "cannot perform" DLCO option is the source's explicit highest-risk physiology limb, surfaced as a selectable state (3 points), never a blank.

## Boundary worked examples added
- male 68, FVC 60%, DLCO 40% -> 1+2+1+1 = 5, stage II (1-yr 16.2%).
- stage edge 3 -> 4: female 62 FVC 80 DLCO 30 = 3 (I) vs male 62 = 4 (II).
- stage edge 5 -> 6: FVC 60 (II) vs FVC 45 (III).
- cannot-perform DLCO: male 70, FVC 45, cannot perform = 8 points, stage III (3-yr 76.8%).

## Cross-implementation differential
- Reference: Ley 2012 Table 2 point system + Table 3 stage mortality. The point weights and the stage mortality estimates (I 5.6/10.9/16.3, II 16.2/29.3/42.1, III 39.2/62.1/76.8) match. PASS.

## Edge-input handling notes
- "cannot perform" satisfies the DLCO field (3 points) so an unmeasurable DLCO never reads as missing input; partial input otherwise yields "(complete all fields)". The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Two labeled <select> (sex, DLCO cannot-perform) + three labeled numeric inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
